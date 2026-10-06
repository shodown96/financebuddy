import { APP_NAME, APP_URL } from "@/lib/constants/app";
import type { Candle } from "@/lib/indicators";

// Server-only. Daily OHLCV per market, cached so each ticker costs at most
// a few provider calls per day. Swap providers here without touching the UI.

export type Market = "US" | "NGX";

export const MARKETS: Record<Market, { label: string; currency: string; source: string }> = {
  US: { label: "US", currency: "USD", source: "Massive (Polygon.io)" },
  NGX: { label: "NGX", currency: "NGN", source: "EODHD" },
};

// End-of-day data only changes once a day
const REVALIDATE_SECONDS = 60 * 60 * 6;
const DAY_MS = 24 * 60 * 60 * 1000;

export class MarketDataError extends Error {}

const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function normalizeSymbol(input: string): string | null {
  const s = input.trim().toUpperCase().replace(/\.(XNSA|US)$/, "");
  return /^[A-Z0-9][A-Z0-9.\-]{0,14}$/.test(s) ? s : null;
}

// Free tier: 5 calls/min, 2 years of daily bars, split-adjusted
async function fetchUs(symbol: string): Promise<Candle[]> {
  const key = process.env.POLYGON_API_KEY;
  if (!key) throw new MarketDataError("US market data is not configured.");

  const to = isoDate(Date.now());
  const from = isoDate(Date.now() - 730 * DAY_MS);
  const url =
    `https://api.massive.com/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${from}/${to}` +
    `?adjusted=true&sort=asc&limit=50000&apiKey=${key}`;

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (res.status === 429) throw new MarketDataError("Too many requests. Try again in a minute.");
  if (!res.ok) throw new MarketDataError(`Could not load ${symbol}.`);

  const json = (await res.json()) as {
    results?: { t: number; o: number; h: number; l: number; c: number; v: number }[];
  };
  return (json.results ?? []).map((r) => ({
    time: Math.floor(r.t / 1000),
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
  }));
}

// Free tier: 20 calls/day (404s count too), 1 year of history
async function fetchNgx(symbol: string): Promise<Candle[]> {
  const key = process.env.EODHD_API_KEY;
  if (!key) throw new MarketDataError("NGX market data is not configured.");

  const from = isoDate(Date.now() - 365 * DAY_MS);
  const url = `https://eodhd.com/api/eod/${encodeURIComponent(symbol)}.XNSA?api_token=${key}&fmt=json&period=d&from=${from}`;

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (res.status === 404) throw new MarketDataError(`${symbol} was not found on NGX.`);
  if (res.status === 402 || res.status === 429) {
    throw new MarketDataError("Daily NGX data limit reached. Try again tomorrow.");
  }
  if (!res.ok) throw new MarketDataError(`Could not load ${symbol}.`);

  const rows = (await res.json()) as {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjusted_close: number;
    volume: number;
  }[];

  return rows
    .filter((r) => r.close > 0)
    .map((r) => {
      // Apply the split/dividend adjustment to the whole bar so it lines up with adjusted_close
      const f = r.adjusted_close / r.close;
      return {
        time: Date.parse(`${r.date}T00:00:00Z`) / 1000,
        open: r.open * f,
        high: r.high * f,
        low: r.low * f,
        close: r.adjusted_close,
        volume: r.volume,
      };
    });
}

export async function getDailyCandles(symbol: string, market: Market): Promise<Candle[]> {
  const candles = market === "US" ? await fetchUs(symbol) : await fetchNgx(symbol);
  if (candles.length === 0) throw new MarketDataError(`No price data found for ${symbol} on ${market}.`);
  return candles;
}

export interface SymbolMatch {
  symbol: string;
  name: string;
}

const LIST_REVALIDATE_SECONDS = 60 * 60 * 24;

// SEC asks automated clients to identify themselves in the User-Agent
const SEC_USER_AGENT = `${APP_NAME} ${APP_URL}`;

// Free, no key. Ordered roughly by market cap, which makes a good default ranking.
async function listUs(): Promise<SymbolMatch[]> {
  const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": SEC_USER_AGENT },
    next: { revalidate: LIST_REVALIDATE_SECONDS },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as Record<string, { ticker: string; title: string }>;
  return Object.values(json).map((r) => ({ symbol: r.ticker.toUpperCase(), name: r.title }));
}

// Costs 1 EODHD call per day once cached
async function listNgx(): Promise<SymbolMatch[]> {
  const key = process.env.EODHD_API_KEY;
  if (!key) return [];
  const res = await fetch(`https://eodhd.com/api/exchange-symbol-list/XNSA?api_token=${key}&fmt=json`, {
    next: { revalidate: LIST_REVALIDATE_SECONDS },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as { Code: string; Name: string; Type: string }[];
  return rows
    .filter((r) => r.Type === "Common Stock" || r.Type === "ETF")
    .map((r) => ({ symbol: r.Code.toUpperCase(), name: r.Name }));
}

// Parsed lists kept in memory so each keystroke doesn't re-parse the SEC file
const listMemo = new Map<Market, { expires: number; list: Promise<SymbolMatch[]> }>();

// Failed loads retry after a short wait instead of on every keystroke,
// since failed EODHD requests still count against the daily limit
const RETRY_AFTER_MS = 10 * 60 * 1000;

function getSymbolList(market: Market): Promise<SymbolMatch[]> {
  const hit = listMemo.get(market);
  if (hit && Date.now() < hit.expires) return hit.list;
  const list = (market === "US" ? listUs() : listNgx()).catch(() => [] as SymbolMatch[]);
  listMemo.set(market, { expires: Date.now() + LIST_REVALIDATE_SECONDS * 1000, list });
  list.then((l) => {
    if (l.length === 0) listMemo.set(market, { expires: Date.now() + RETRY_AFTER_MS, list });
  });
  return list;
}

export async function findSymbols(market: Market, query: string, limit = 8): Promise<SymbolMatch[]> {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const list = await getSymbolList(market);

  const rank = (m: SymbolMatch) => {
    if (m.symbol === q) return 0;
    if (m.symbol.startsWith(q)) return 1;
    const name = m.name.toUpperCase();
    if (name.startsWith(q) || name.includes(` ${q}`)) return 2;
    if (name.includes(q)) return 3;
    return -1;
  };

  // List order breaks ties, so bigger US companies come first
  return list
    .map((m, i) => ({ m, i, r: rank(m) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.m);
}
