// Beginner explanations shown in the info popups on the technical analysis page

export interface GlossaryEntry {
  title: string;
  what: string;
  read: string[];
  tip?: string;
}

export type GlossaryKey =
  | "trend"
  | "momentum"
  | "rsi"
  | "bollinger"
  | "volume"
  | "levels"
  | "candles"
  | "sma50"
  | "sma200"
  | "poc"
  | "valueArea"
  | "volumeBars";

export const GLOSSARY: Record<GlossaryKey, GlossaryEntry> = {
  trend: {
    title: "Trend",
    what:
      "The general direction the price has been moving. We work it out by comparing today's price with its average over the last 50 bars (short to medium term) and 200 bars (long term).",
    read: [
      "Bullish: price is above the 50 average, and the 50 is above the 200. The stock has been climbing.",
      "Bearish: price is below the 50 average, and the 50 is below the 200. The stock has been falling.",
      "Neutral: the averages disagree, so there is no clear direction.",
      "Golden cross: the 50 average moves above the 200. Often seen as the start of an uptrend. A death cross is the opposite.",
    ],
    tip: "Trends tend to last longer than people expect. Buying against a strong downtrend is like swimming against the current.",
  },
  momentum: {
    title: "MACD (momentum)",
    what:
      "MACD (Moving Average Convergence Divergence) measures whether the price is speeding up or slowing down. It compares a fast average of the price with a slow one.",
    read: [
      "Blue line (MACD) above the orange line (signal): upward momentum is in control.",
      "Blue line below the orange line: downward momentum is in control.",
      "A crossover, when the blue line crosses the orange one, is often read as momentum changing direction.",
      "The bars show the gap between the two lines. Shrinking bars mean the current move is losing steam.",
    ],
    tip: "MACD reacts after the price moves, so it confirms a change rather than predicting it. It gives many false signals when the price is moving sideways.",
  },
  rsi: {
    title: "RSI (Relative Strength Index)",
    what:
      "A score from 0 to 100 that shows how strongly the price has risen or fallen over the last 14 bars. It tells you whether a move may have gone too far, too fast.",
    read: [
      "Above 70: overbought. The price has risen fast and may pause or pull back.",
      "Below 30: oversold. The price has fallen fast and may bounce.",
      "Above 50: buyers have had the upper hand recently. Below 50: sellers have.",
      "The dashed lines on the chart mark 70 and 30.",
    ],
    tip: "Overbought does not mean \"sell now\". Strong stocks can stay above 70 for weeks. Treat it as a reason to be patient, not a signal on its own.",
  },
  bollinger: {
    title: "Bollinger Bands",
    what:
      "Two dashed lines drawn above and below the 20-bar average price. Their distance from the average depends on how much the price has been swinging, so they widen when the price is jumpy and narrow when it is calm.",
    read: [
      "Most of the time the price stays between the bands.",
      "Price near the upper band: it is high compared with its recent range.",
      "Price near the lower band: it is low compared with its recent range.",
      "Bands squeezing tightly together often comes before a big move, in either direction.",
    ],
    tip: "Touching a band is not a reversal signal by itself. In a strong trend the price can ride along the band for a long time.",
  },
  volume: {
    title: "Volume",
    what:
      "How many shares changed hands. We compare the latest bar's volume with the average of the last 20 bars.",
    read: [
      "High volume on a rising day: many buyers are behind the move, so it is more convincing.",
      "High volume on a falling day: many sellers are behind the move. Worth paying attention to.",
      "Low volume: few people are trading, so the price move means less.",
    ],
    tip: "Volume confirms price. A breakout on low volume is more likely to fail.",
  },
  levels: {
    title: "Volume profile",
    what:
      "Shows how much trading happened at each price level over the whole chart. Price levels where lots of shares traded are where many investors bought or sold, so they often act as a floor or ceiling later.",
    read: [
      "POC (point of control): the single price where the most shares traded.",
      "Value area: the price range where 70% of all trading happened. Think of it as the price the market considered \"fair\" over this period.",
      "Price above the value area: buyers have pushed it above where most people traded. Bullish while it holds.",
      "Price below the value area: sellers have pushed it below. Bearish while it stays there.",
    ],
    tip: "Busy price levels below the current price can act as support (a floor). Busy levels above can act as resistance (a ceiling).",
  },
  candles: {
    title: "Candlesticks",
    what: "Each candle shows one day (or one week) of trading.",
    read: [
      "Teal (green) candle: the price closed higher than it opened. Red candle: it closed lower.",
      "The thick body runs from the opening price to the closing price.",
      "The thin wicks show the highest and lowest prices reached during that period.",
    ],
  },
  sma50: {
    title: "SMA 50 (amber line)",
    what:
      "The simple moving average of the last 50 closing prices. It smooths out daily noise to show the short to medium-term direction.",
    read: [
      "Price above the line: the recent trend is up.",
      "Price below the line: the recent trend is down.",
      "The line often acts as a floor in an uptrend and a ceiling in a downtrend.",
    ],
  },
  sma200: {
    title: "SMA 200 (purple line)",
    what:
      "The average of the last 200 closing prices, which is about a year of daily trading. Widely watched as the long-term trend line.",
    read: [
      "Price above it: many investors consider the stock in a long-term uptrend.",
      "Price below it: a long-term downtrend.",
    ],
    tip: "It needs 200 bars of history, so it may be missing on weekly charts or for recently listed stocks.",
  },
  poc: {
    title: "POC (dotted blue line)",
    what:
      "Point of control: the price level where the most shares traded over the chart's period. Lots of investors bought or sold here.",
    read: [
      "Price above the POC: it often acts as a floor if the price falls back to it.",
      "Price below the POC: it often acts as a ceiling if the price rises back to it.",
    ],
  },
  valueArea: {
    title: "Value area (shaded rows)",
    what:
      "The range of prices where 70% of all trading happened. It shows what the market treated as a \"normal\" price over this period.",
    read: [
      "Price inside it: the stock is trading where most people have traded.",
      "Price outside it: the stock has moved into less-traded territory, which can lead to faster moves.",
    ],
  },
  volumeBars: {
    title: "Volume bars",
    what: "The faint bars at the bottom of the price chart show how many shares traded in each period.",
    read: [
      "Teal (green) bar: the price closed up that period. Red bar: it closed down.",
      "Taller bars mean more trading and more conviction behind that day's move.",
    ],
  },
};
