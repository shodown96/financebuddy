"use client";

import { useEffect, useState } from "react";
import { explainTechnicals, getTechnicals, type TechnicalsResult } from "@/actions/technical-analysis";
import InfoTip from "@/components/custom/info-tip";
import PriceChart from "@/components/custom/price-chart";
import SymbolSearch from "@/components/custom/symbol-search";
import { GLOSSARY, type GlossaryKey } from "@/lib/constants/technical-glossary";
import type { Interval, Tone, VolumeProfile } from "@/lib/indicators";
import type { Market } from "@/lib/market-data";
import type { Explanation } from "@/lib/validations/technicals";

const STORAGE_KEY = "financebuddy:technical-analysis";

const MARKET_INFO: Record<Market, { currency: string; source: string; history: string; examples: string[] }> = {
  NGX: {
    currency: "NGN",
    source: "EODHD",
    history: "1 year",
    examples: ["MTNN", "DANGCEM", "GTCO", "ZENITHBANK", "AIRTELAFRI", "SEPLAT"],
  },
  US: {
    currency: "USD",
    source: "Massive (Polygon.io)",
    history: "2 years",
    examples: ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "GOOGL"],
  },
};

const INPUT_CLS =
  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const CARD_CLS =
  "rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50";

const TONE_STYLE: Record<Tone, string> = {
  bullish: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  bearish: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  neutral: "bg-stone-100 text-stone-600 dark:bg-stone-700/50 dark:text-stone-300",
};

type Loaded = Extract<TechnicalsResult, { ok: true }>;

const LEGEND: { term: GlossaryKey; label: string; mark?: string; swatch?: string }[] = [
  { term: "candles", label: "Candles" },
  { term: "volumeBars", label: "Volume bars" },
  { term: "sma50", label: "SMA 50", mark: "━", swatch: "text-amber-500" },
  { term: "sma200", label: "SMA 200", mark: "━", swatch: "text-violet-500" },
  { term: "bollinger", label: "Bollinger Bands", mark: "┅", swatch: "text-stone-400" },
  { term: "poc", label: "POC", mark: "┈", swatch: "text-sky-500" },
  { term: "momentum", label: "Middle pane: MACD" },
  { term: "rsi", label: "Bottom pane: RSI" },
];

const MOOD_STYLE: Record<Explanation["mood"], { label: string; cls: string }> = {
  positive: { label: "Looking positive", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  negative: { label: "Looking weak", cls: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  mixed: { label: "Mixed signals", cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  unclear: { label: "No clear picture", cls: "bg-stone-100 text-stone-600 dark:bg-stone-700/50 dark:text-stone-300" },
};

function ExplanationView({ explanation: e }: { explanation: Explanation }) {
  const mood = MOOD_STYLE[e.mood];
  const section = (title: string, body: string) => (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{body}</p>
    </div>
  );
  return (
    <div className="mt-3 space-y-4">
      <div>
        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${mood.cls}`}>{mood.label}</span>
        <p className="mt-2 text-base font-semibold text-stone-900 dark:text-stone-50">{e.headline}</p>
      </div>
      {section("What's happening", e.whatsHappening)}
      <div className="grid gap-4 sm:grid-cols-2">
        {section("If you're thinking of buying", e.ifBuying)}
        {section("If you already own it", e.ifHolding)}
      </div>
      {e.watchFor.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Prices to watch</div>
          <ul className="mt-1 space-y-1 text-sm text-stone-700 dark:text-stone-300">
            {e.watchFor.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="rounded-lg bg-stone-50 p-3 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        Charts only show how the price has behaved. They say nothing about whether the company is making money, so check
        its results too (try our Fundamental Analysis tool). This is educational, not financial advice.
      </p>
    </div>
  );
}

function Toggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-stone-200 p-0.5 dark:border-stone-700/60">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === o.value
              ? "bg-teal-700 text-white dark:bg-teal-600"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function TechnicalAnalysis() {
  const [market, setMarket] = useState<Market>("NGX");
  const [interval, setBarInterval] = useState<Interval>("1D");
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Restore the last market and interval; localStorage isn't available during SSR
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (saved.market === "US" || saved.market === "NGX") setMarket(saved.market);
      if (saved.interval === "1D" || saved.interval === "1W") setBarInterval(saved.interval);
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const load = async (sym: string, mkt = market, iv = interval) => {
    if (!sym.trim()) return;
    setLoading(true);
    setError(null);
    setExplanation(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ market: mkt, interval: iv }));
    } catch {
      // ignore write failures
    }
    try {
      const res = await getTechnicals(sym, mkt, iv);
      if (res.ok) {
        setData(res);
        setSymbol(res.symbol);
      } else {
        setError(res.error);
      }
    } catch (e) {
      console.log("load error", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const explain = async () => {
    if (!data) return;
    setAiLoading(true);
    try {
      const res = await explainTechnicals(data.symbol, market, interval);
      if (res.ok) setExplanation(res.explanation);
      else setError(res.error);
    } catch (e) {
      console.log("explain error", e);
      setError("Could not generate the explanation. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const info = MARKET_INFO[market];
  const money = new Intl.NumberFormat("en", { style: "currency", currency: info.currency, maximumFractionDigits: 2 });

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">Technical Analysis</h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Price chart with moving averages, Bollinger Bands, MACD, RSI and a volume profile for NGX and US stocks.
      </p>

      {/* Controls */}
      <div className={CARD_CLS + " mt-5 space-y-4"}>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle
            value={market}
            options={[
              { value: "NGX", label: "NGX" },
              { value: "US", label: "US" },
            ]}
            onChange={(m) => {
              setMarket(m);
              setData(null);
              setSymbol("");
              setError(null);
            }}
          />
          <Toggle
            value={interval}
            options={[
              { value: "1D", label: "Daily" },
              { value: "1W", label: "Weekly" },
            ]}
            onChange={(iv) => {
              setBarInterval(iv);
              if (data) load(data.symbol, market, iv);
            }}
          />
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load(symbol);
          }}
        >
          <SymbolSearch
            market={market}
            value={symbol}
            onChange={setSymbol}
            onSelect={(sym) => load(sym)}
            placeholder={market === "NGX" ? "Search company or ticker, e.g. MTN or Dangote" : "Search company or ticker, e.g. Apple or AAPL"}
            className={INPUT_CLS}
          />
          <button
            type="submit"
            disabled={loading || !symbol.trim()}
            className="shrink-0 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            {loading ? "Loading…" : "Load"}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {info.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setSymbol(ex);
                load(ex);
              }}
              className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:border-teal-400 hover:text-teal-700 dark:border-stone-700/60 dark:text-stone-400 dark:hover:border-teal-600 dark:hover:text-teal-400"
            >
              {ex}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {data && (
        <div className="mt-5 space-y-5">
          {/* Header + chart */}
          <div className={CARD_CLS}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-lg font-extrabold text-stone-900 dark:text-stone-50">{data.symbol}</span>
                <span className="ml-2 text-xs text-stone-400 dark:text-stone-500">
                  {market} · {interval === "1D" ? "Daily" : "Weekly"} · as of{" "}
                  {new Date(data.summary.lastTime * 1000).toLocaleDateString(undefined, { timeZone: "UTC" })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold tabular-nums text-stone-900 dark:text-stone-50">
                  {money.format(data.summary.lastClose)}
                </span>
                {data.summary.changePct !== null && (
                  <span
                    className={`ml-2 text-sm font-semibold tabular-nums ${
                      data.summary.changePct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {data.summary.changePct >= 0 ? "+" : ""}
                    {data.summary.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <PriceChart candles={data.candles} indicators={data.indicators} />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500 dark:text-stone-400">
              {LEGEND.map((l) => (
                <span key={l.term} className="inline-flex items-center gap-1">
                  {l.swatch && <span className={l.swatch}>{l.mark}</span>}
                  {l.label}
                  <InfoTip entry={GLOSSARY[l.term]} />
                </span>
              ))}
            </div>
          </div>

          {/* Signals */}
          <div className="grid gap-3 sm:grid-cols-2">
            {data.summary.signals.map((s) => (
              <div key={s.key} className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700/50 dark:bg-stone-800/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-stone-900 dark:text-stone-50">
                    {s.label}
                    <InfoTip entry={GLOSSARY[s.key]} />
                  </span>
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold capitalize ${TONE_STYLE[s.tone]}`}>{s.tone}</span>
                </div>
                <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">{s.detail}</p>
              </div>
            ))}
          </div>

          {data.indicators.profile && (
            <ProfileCard profile={data.indicators.profile} lastClose={data.summary.lastClose} format={(n) => money.format(n)} />
          )}

          {/* AI read */}
          <div className={CARD_CLS}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">What does this mean for me?</div>
              {!explanation && (
                <button
                  onClick={explain}
                  disabled={aiLoading}
                  className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
                >
                  {aiLoading ? "Thinking…" : "Explain in plain English"}
                </button>
              )}
            </div>
            {explanation ? (
              <ExplanationView explanation={explanation} />
            ) : (
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                Get a beginner-friendly explanation of what this chart is showing, written without jargon. Sends the
                calculated numbers (not the chart) to OpenAI.
              </p>
            )}
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500">
            End-of-day data from {info.source}, {info.history} of history. Indicators describe past price action and do not
            predict future prices. This is not investment advice.
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileCard({
  profile,
  lastClose,
  format,
}: {
  profile: VolumeProfile;
  lastClose: number;
  format: (n: number) => string;
}) {
  const max = Math.max(...profile.bins.map((b) => b.volume));
  // Highest price at the top, like the chart's price axis
  const bins = [...profile.bins].reverse();

  return (
    <div className={CARD_CLS}>
      <div className="inline-flex items-center gap-1 text-sm font-semibold text-stone-900 dark:text-stone-50">
        Volume profile
        <InfoTip entry={GLOSSARY.levels} />
      </div>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
        Volume traded at each price level over the chart range. Shaded rows are the value area (70% of volume).
      </p>
      <div className="mt-3 space-y-px">
        {bins.map((b, i) => {
          const inValue = b.low >= profile.valueAreaLow - 1e-9 && b.high <= profile.valueAreaHigh + 1e-9;
          const isPoc = profile.poc >= b.low && profile.poc <= b.high;
          const hasPrice = lastClose >= b.low && lastClose <= b.high;
          return (
            <div key={i} className="flex items-center gap-2 text-[11px] tabular-nums">
              <span className={`w-24 shrink-0 text-right ${hasPrice ? "font-bold text-teal-700 dark:text-teal-400" : "text-stone-400 dark:text-stone-500"}`}>
                {format((b.low + b.high) / 2)}
              </span>
              <div className={`h-3 flex-1 rounded-sm ${inValue ? "bg-stone-100 dark:bg-stone-700/40" : ""}`}>
                <div
                  className={`h-full rounded-sm ${isPoc ? "bg-sky-500" : "bg-teal-500/60 dark:bg-teal-400/50"}`}
                  style={{ width: `${max > 0 ? (b.volume / max) * 100 : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
        <span className="inline-flex items-center gap-1">
          POC {format(profile.poc)}
          <InfoTip entry={GLOSSARY.poc} />
        </span>
        <span className="inline-flex items-center gap-1">
          Value area {format(profile.valueAreaLow)} to {format(profile.valueAreaHigh)}
          <InfoTip entry={GLOSSARY.valueArea} />
        </span>
      </div>
    </div>
  );
}
