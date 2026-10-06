// Pure technical indicator math. Every series is aligned with the input
// candles and uses null where there is not enough history yet.

export interface Candle {
  // Unix seconds, UTC
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Interval = "1D" | "1W";
type Series = (number | null)[];

export function resample(candles: Candle[], interval: Interval): Candle[] {
  if (interval === "1D") return candles;

  const out: Candle[] = [];
  for (const c of candles) {
    // Bucket by the Monday of the candle's week
    const d = new Date(c.time * 1000);
    const monday = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)) / 1000;
    const last = out[out.length - 1];
    if (last && last.time === monday) {
      last.high = Math.max(last.high, c.high);
      last.low = Math.min(last.low, c.low);
      last.close = c.close;
      last.volume += c.volume;
    } else {
      out.push({ ...c, time: monday });
    }
  }
  return out;
}

export function sma(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

// Seeded with the SMA of the first `period` non-null values
export function ema(values: Series, period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  const start = values.findIndex((v) => v !== null);
  if (start < 0 || values.length - start < period) return out;

  let prev = 0;
  for (let i = start; i < start + period; i++) prev += values[i]!;
  prev /= period;
  out[start + period - 1] = prev;

  for (let i = start + period; i < values.length; i++) {
    prev = values[i]! * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function macd(closes: number[], fast = 12, slow = 26, signalPeriod = 9) {
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const line: Series = closes.map((_, i) =>
    fastEma[i] !== null && slowEma[i] !== null ? fastEma[i]! - slowEma[i]! : null,
  );
  const signal = ema(line, signalPeriod);
  const histogram: Series = line.map((v, i) => (v !== null && signal[i] !== null ? v - signal[i]! : null));
  return { line, signal, histogram };
}

// Wilder's smoothing
export function rsi(closes: number[], period = 14): Series {
  const out: Series = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;

  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);

  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function bollinger(closes: number[], period = 20, mult = 2) {
  const middle = sma(closes, period);
  const upper: Series = new Array(closes.length).fill(null);
  const lower: Series = new Array(closes.length).fill(null);
  for (let i = period - 1; i < closes.length; i++) {
    const mean = middle[i]!;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) variance += (closes[j] - mean) ** 2;
    const sd = Math.sqrt(variance / period);
    upper[i] = mean + mult * sd;
    lower[i] = mean - mult * sd;
  }
  return { upper, middle, lower };
}

export interface ProfileBin {
  low: number;
  high: number;
  volume: number;
}

export interface VolumeProfile {
  bins: ProfileBin[];
  // Point of control: price level with the most traded volume
  poc: number;
  valueAreaHigh: number;
  valueAreaLow: number;
}

// Spreads each candle's volume evenly across the price range it covered
export function volumeProfile(candles: Candle[], binCount = 24, valueAreaPct = 0.7): VolumeProfile | null {
  if (candles.length === 0) return null;
  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  if (max <= min) return null;

  const size = (max - min) / binCount;
  const bins: ProfileBin[] = Array.from({ length: binCount }, (_, i) => ({
    low: min + i * size,
    high: min + (i + 1) * size,
    volume: 0,
  }));

  for (const c of candles) {
    const first = Math.min(binCount - 1, Math.floor((c.low - min) / size));
    const last = Math.min(binCount - 1, Math.floor((c.high - min) / size));
    const share = c.volume / (last - first + 1);
    for (let i = first; i <= last; i++) bins[i].volume += share;
  }

  const pocIndex = bins.reduce((best, b, i) => (b.volume > bins[best].volume ? i : best), 0);

  // Grow the value area outward from the POC, taking the heavier neighbour each step
  const total = bins.reduce((n, b) => n + b.volume, 0);
  let lo = pocIndex;
  let hi = pocIndex;
  let covered = bins[pocIndex].volume;
  while (covered < total * valueAreaPct && (lo > 0 || hi < binCount - 1)) {
    const below = lo > 0 ? bins[lo - 1].volume : -1;
    const above = hi < binCount - 1 ? bins[hi + 1].volume : -1;
    if (above >= below) covered += bins[++hi].volume;
    else covered += bins[--lo].volume;
  }

  return {
    bins,
    poc: (bins[pocIndex].low + bins[pocIndex].high) / 2,
    valueAreaHigh: bins[hi].high,
    valueAreaLow: bins[lo].low,
  };
}

export interface Indicators {
  sma50: Series;
  sma200: Series;
  macd: ReturnType<typeof macd>;
  rsi: Series;
  bollinger: ReturnType<typeof bollinger>;
  volumeAvg20: Series;
  profile: VolumeProfile | null;
}

export function computeIndicators(candles: Candle[]): Indicators {
  const closes = candles.map((c) => c.close);
  return {
    sma50: sma(closes, 50),
    sma200: sma(closes, 200),
    macd: macd(closes),
    rsi: rsi(closes),
    bollinger: bollinger(closes),
    volumeAvg20: sma(candles.map((c) => c.volume), 20),
    profile: volumeProfile(candles),
  };
}

export type Tone = "bullish" | "bearish" | "neutral";

export interface Signal {
  key: "trend" | "momentum" | "rsi" | "bollinger" | "volume" | "levels";
  label: string;
  tone: Tone;
  detail: string;
}

export interface TechnicalSummary {
  lastClose: number;
  lastTime: number;
  changePct: number | null;
  rangeHigh: number;
  rangeLow: number;
  signals: Signal[];
}

const last = (s: Series) => s[s.length - 1] ?? null;
const fmt = (n: number) => (Math.abs(n) >= 100 ? n.toFixed(2) : n.toPrecision(4));

// Most recent crossing of series a over or under b within the last `lookback` bars
function lastCross(a: Series, b: Series, lookback: number): { dir: "up" | "down"; barsAgo: number } | null {
  for (let i = a.length - 1; i > 0 && i >= a.length - lookback; i--) {
    const [a0, a1, b0, b1] = [a[i - 1], a[i], b[i - 1], b[i]];
    if (a0 === null || a1 === null || b0 === null || b1 === null) return null;
    if (a0 <= b0 && a1 > b1) return { dir: "up", barsAgo: a.length - 1 - i };
    if (a0 >= b0 && a1 < b1) return { dir: "down", barsAgo: a.length - 1 - i };
  }
  return null;
}

// `partialLastBar` skips the volume comparison when the latest bar is still forming
export function summarize(candles: Candle[], ind: Indicators, partialLastBar = false): TechnicalSummary {
  const close = candles[candles.length - 1].close;
  const prev = candles[candles.length - 2]?.close;
  const signals: Signal[] = [];

  const s50 = last(ind.sma50);
  const s200 = last(ind.sma200);
  if (s50 !== null && s200 !== null) {
    const tone: Tone = close > s50 && s50 > s200 ? "bullish" : close < s50 && s50 < s200 ? "bearish" : "neutral";
    const cross = lastCross(ind.sma50, ind.sma200, 20);
    const crossText = cross ? ` A ${cross.dir === "up" ? "golden" : "death"} cross happened ${cross.barsAgo} bars ago.` : "";
    signals.push({
      key: "trend",
      label: "Trend",
      tone,
      detail: `Price ${fmt(close)} vs 50-bar avg ${fmt(s50)} and 200-bar avg ${fmt(s200)}.${crossText}`,
    });
  } else if (s50 !== null) {
    signals.push({
      key: "trend",
      label: "Trend",
      tone: close > s50 ? "bullish" : "bearish",
      detail: `Price is ${close > s50 ? "above" : "below"} the 50-bar average (${fmt(s50)}). Not enough history for the 200-bar average.`,
    });
  }

  const m = last(ind.macd.line);
  const sig = last(ind.macd.signal);
  const hist = last(ind.macd.histogram);
  if (m !== null && sig !== null && hist !== null) {
    const cross = lastCross(ind.macd.line, ind.macd.signal, 10);
    const crossText = cross
      ? ` ${cross.dir === "up" ? "Bullish" : "Bearish"} crossover ${cross.barsAgo === 0 ? "on the latest bar" : `${cross.barsAgo} bars ago`}.`
      : "";
    signals.push({
      key: "momentum",
      label: "MACD (12, 26, 9)",
      tone: hist > 0 ? "bullish" : hist < 0 ? "bearish" : "neutral",
      detail: `MACD ${fmt(m)} is ${m > sig ? "above" : "below"} its signal line ${fmt(sig)}.${crossText}`,
    });
  }

  const r = last(ind.rsi);
  if (r !== null) {
    const zone = r >= 70 ? "overbought" : r <= 30 ? "oversold" : r >= 50 ? "bullish side of 50" : "bearish side of 50";
    signals.push({
      key: "rsi",
      label: "RSI (14)",
      // Overbought and oversold read as possible reversal, so they are not bullish/bearish by themselves
      tone: r >= 70 || r <= 30 ? "neutral" : r >= 50 ? "bullish" : "bearish",
      detail: `RSI ${r.toFixed(1)}, ${zone}.`,
    });
  }

  const up = last(ind.bollinger.upper);
  const lo = last(ind.bollinger.lower);
  const mid = last(ind.bollinger.middle);
  if (up !== null && lo !== null && mid !== null && up > lo) {
    const pctB = (close - lo) / (up - lo);
    const width = ((up - lo) / mid) * 100;
    signals.push({
      key: "bollinger",
      label: "Bollinger Bands (20, 2)",
      tone: pctB > 1 || pctB < 0 ? "neutral" : pctB >= 0.5 ? "bullish" : "bearish",
      detail: `Price is ${pctB > 1 ? "above the upper band" : pctB < 0 ? "below the lower band" : `${(pctB * 100).toFixed(0)}% of the way up the bands`}. Band width ${width.toFixed(1)}% of price.`,
    });
  }

  const vAvg = last(ind.volumeAvg20);
  const vol = candles[candles.length - 1].volume;
  if (vAvg !== null && vAvg > 0 && !partialLastBar) {
    const ratio = vol / vAvg;
    const dirUp = prev !== undefined && close >= prev;
    signals.push({
      key: "volume",
      label: "Volume",
      tone: ratio >= 1.5 ? (dirUp ? "bullish" : "bearish") : "neutral",
      detail: `Latest bar volume is ${ratio.toFixed(1)}x the 20-bar average${ratio >= 1.5 ? ` on a ${dirUp ? "rising" : "falling"} bar` : ""}.`,
    });
  }

  if (ind.profile) {
    const { poc, valueAreaHigh, valueAreaLow } = ind.profile;
    const where =
      close > valueAreaHigh ? "above the value area" : close < valueAreaLow ? "below the value area" : "inside the value area";
    signals.push({
      key: "levels",
      label: "Volume profile",
      tone: close > valueAreaHigh ? "bullish" : close < valueAreaLow ? "bearish" : "neutral",
      detail: `Most traded price ${fmt(poc)}. 70% of volume traded between ${fmt(valueAreaLow)} and ${fmt(valueAreaHigh)}; price is ${where}.`,
    });
  }

  return {
    lastClose: close,
    lastTime: candles[candles.length - 1].time,
    changePct: prev ? ((close - prev) / prev) * 100 : null,
    rangeHigh: Math.max(...candles.map((c) => c.high)),
    rangeLow: Math.min(...candles.map((c) => c.low)),
    signals,
  };
}
