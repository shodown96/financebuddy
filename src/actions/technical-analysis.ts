"use server";

import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import {
  computeIndicators,
  resample,
  summarize,
  type Candle,
  type Indicators,
  type Interval,
  type TechnicalSummary,
} from "@/lib/indicators";
import {
  findSymbols,
  getDailyCandles,
  MarketDataError,
  normalizeSymbol,
  type Market,
  type SymbolMatch,
} from "@/lib/market-data";
import { ExplanationSchema, type Explanation } from "@/lib/validations/technicals";

const ANALYSIS_MODEL = "gpt-4.1-mini";

export type TechnicalsResult =
  | { ok: true; symbol: string; candles: Candle[]; indicators: Indicators; summary: TechnicalSummary }
  | { ok: false; error: string };

const INSTRUCTIONS = `You help complete beginners understand what a stock's price chart is saying, so they can make their own decision.
The reader has never studied charts. Write like a knowledgeable friend explaining over coffee.

Rules:
- No jargon. Never name an indicator (no MACD, RSI, Bollinger, moving average, SMA, POC, value area, golden cross, overbought, momentum, support, resistance). Describe what it shows instead, e.g. "the price has been climbing steadily for months", "the rise has been losing steam over the last couple of weeks", "it has run up fast and stocks often pause after moves like this", "lots of people bought around NGN 250, so that price has acted like a floor".
- Short sentences. Use real prices with the currency so levels are concrete.
- Be balanced and honest. Say what looks encouraging and what looks risky. If the signals disagree, say so plainly.
- Help them think about a decision without telling them what to do. You may describe what a cautious person might wait for, or what would change the picture. Never say "buy" or "sell" as an instruction. No price predictions or targets.
- Use only the facts provided. Do not invent numbers, patterns or news.`;

async function load(rawSymbol: string, market: Market, interval: Interval) {
  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol) throw new MarketDataError("Enter a valid ticker, e.g. AAPL or MTNN.");
  const daily = await getDailyCandles(symbol, market);
  const candles = resample(daily, interval);
  if (candles.length < 30) throw new MarketDataError(`Not enough price history for ${symbol}.`);
  const indicators = computeIndicators(candles);
  // A weekly bar is complete once Friday's session is in
  const lastDay = new Date(daily[daily.length - 1].time * 1000).getUTCDay();
  const partial = interval === "1W" && lastDay !== 5;
  return { symbol, candles, indicators, summary: summarize(candles, indicators, partial) };
}

const errorMessage = (error: unknown) =>
  error instanceof MarketDataError ? error.message : "Something went wrong. Please try again.";

export async function getTechnicals(rawSymbol: string, market: Market, interval: Interval): Promise<TechnicalsResult> {
  try {
    return { ok: true, ...(await load(rawSymbol, market, interval)) };
  } catch (error) {
    console.log("getTechnicals error", error);
    return { ok: false, error: errorMessage(error) };
  }
}

export async function searchSymbols(market: Market, query: string): Promise<SymbolMatch[]> {
  try {
    return await findSymbols(market, query);
  } catch (error) {
    console.log("searchSymbols error", error);
    return [];
  }
}

const pct = (a: number, b: number | null | undefined) => (b ? Number((((a - b) / b) * 100).toFixed(1)) : null);
const lastOf = (s: (number | null)[]) => s[s.length - 1] ?? null;

// Plain facts for the model, worked out in code so it only has to explain them
function buildFacts(candles: Candle[], ind: Indicators, summary: TechnicalSummary, interval: Interval) {
  const close = summary.lastClose;
  const ago = (bars: number) => candles[candles.length - 1 - bars]?.close;
  const month = interval === "1D" ? 21 : 4;
  const quarter = interval === "1D" ? 63 : 13;
  const hist = ind.macd.histogram;
  const histNow = lastOf(hist);
  const histBefore = hist[hist.length - 4] ?? null;

  const levels = [
    { name: "most traded price over the period", price: ind.profile?.poc },
    { name: "bottom of the range where most trading happened", price: ind.profile?.valueAreaLow },
    { name: "top of the range where most trading happened", price: ind.profile?.valueAreaHigh },
    { name: "50-bar average price", price: lastOf(ind.sma50) },
    { name: "200-bar average price", price: lastOf(ind.sma200) },
    { name: "highest price in the period", price: summary.rangeHigh },
    { name: "lowest price in the period", price: summary.rangeLow },
  ].flatMap((l) =>
    typeof l.price === "number"
      ? [{ ...l, price: Number(l.price.toFixed(2)), position: l.price < close ? "below current price" : "above current price" }]
      : [],
  );

  const upper = lastOf(ind.bollinger.upper);
  const lower = lastOf(ind.bollinger.lower);

  return {
    barSize: interval === "1D" ? "daily" : "weekly",
    price: close,
    changePct: {
      lastBar: summary.changePct === null ? null : Number(summary.changePct.toFixed(2)),
      about1Month: pct(close, ago(month)),
      about3Months: pct(close, ago(quarter)),
      wholePeriod: pct(close, candles[0].close),
    },
    pctBelowPeriodHigh: Number((((summary.rangeHigh - close) / summary.rangeHigh) * 100).toFixed(1)),
    pctAbove50BarAverage: pct(close, lastOf(ind.sma50)),
    pctAbove200BarAverage: pct(close, lastOf(ind.sma200)),
    momentum:
      histNow === null || histBefore === null
        ? null
        : {
            direction: histNow > 0 ? "upward" : "downward",
            strength:
              Math.sign(histNow) !== Math.sign(histBefore)
                ? "just turned"
                : Math.abs(histNow) > Math.abs(histBefore)
                  ? "strengthening"
                  : "fading",
          },
    rsi0to100: lastOf(ind.rsi) === null ? null : Number(lastOf(ind.rsi)!.toFixed(1)),
    positionInRecentRange0to1:
      upper !== null && lower !== null && upper > lower ? Number(((close - lower) / (upper - lower)).toFixed(2)) : null,
    keyLevels: levels,
    technicalSignals: summary.signals.map(({ label, tone, detail }) => ({ label, tone, detail })),
  };
}

// Recomputes from the cached candles rather than trusting numbers from the client
export async function explainTechnicals(
  rawSymbol: string,
  market: Market,
  interval: Interval,
): Promise<{ ok: true; explanation: Explanation } | { ok: false; error: string }> {
  try {
    const { symbol, candles, indicators, summary } = await load(rawSymbol, market, interval);
    const match = (await findSymbols(market, symbol, 1))[0];
    const { output } = await generateText({
      model: openai(ANALYSIS_MODEL),
      instructions: INSTRUCTIONS,
      output: Output.object({ schema: ExplanationSchema }),
      prompt: JSON.stringify({
        stock: symbol,
        company: match?.symbol === symbol ? match.name : null,
        market,
        currency: market === "NGX" ? "NGN" : "USD",
        facts: buildFacts(candles, indicators, summary, interval),
      }),
    });
    return { ok: true, explanation: output };
  } catch (error) {
    console.log("explainTechnicals error", error);
    return { ok: false, error: errorMessage(error) };
  }
}
