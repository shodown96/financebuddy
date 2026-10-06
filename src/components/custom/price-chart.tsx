"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle, Indicators } from "@/lib/indicators";

const UP = "#0d9488";
const DOWN = "#dc2626";

function themeOptions(dark: boolean) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: dark ? "#a8a29e" : "#57534e",
      panes: { separatorColor: dark ? "#44403c" : "#e7e5e4" },
    },
    grid: {
      vertLines: { color: dark ? "#29252480" : "#f5f5f4" },
      horzLines: { color: dark ? "#29252480" : "#f5f5f4" },
    },
  };
}

const t = (time: number) => time as UTCTimestamp;

function line(candles: Candle[], values: (number | null)[]) {
  return values.flatMap((v, i) => (v === null ? [] : [{ time: t(candles[i].time), value: v }]));
}

export default function PriceChart({ candles, indicators }: { candles: Candle[]; indicators: Indicators }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const chart: IChartApi = createChart(el, {
      autoSize: true,
      ...themeOptions(media.matches),
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    // Pane 0: price, moving averages, Bollinger Bands, volume
    const price = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
    });
    price.setData(candles.map((c) => ({ time: t(c.time), open: c.open, high: c.high, low: c.low, close: c.close })));

    const thin = { lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false } as const;
    chart.addSeries(LineSeries, { ...thin, color: "#f59e0b", title: "SMA 50" }).setData(line(candles, indicators.sma50));
    chart.addSeries(LineSeries, { ...thin, color: "#8b5cf6", title: "SMA 200" }).setData(line(candles, indicators.sma200));
    const band = { ...thin, color: "#78716c80", lineStyle: LineStyle.Dashed };
    chart.addSeries(LineSeries, band).setData(line(candles, indicators.bollinger.upper));
    chart.addSeries(LineSeries, band).setData(line(candles, indicators.bollinger.lower));

    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      priceLineVisible: false,
      lastValueVisible: false,
    });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volume.setData(
      candles.map((c, i) => ({
        time: t(c.time),
        value: c.volume,
        color: i > 0 && c.close < candles[i - 1].close ? `${DOWN}40` : `${UP}40`,
      })),
    );

    if (indicators.profile) {
      price.createPriceLine({
        price: indicators.profile.poc,
        color: "#0ea5e9",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: "POC",
      });
    }

    // Pane 1: MACD
    chart
      .addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false }, 1)
      .setData(
        indicators.macd.histogram.flatMap((v, i) =>
          v === null ? [] : [{ time: t(candles[i].time), value: v, color: v >= 0 ? `${UP}99` : `${DOWN}99` }],
        ),
      );
    chart.addSeries(LineSeries, { ...thin, color: "#2563eb", title: "MACD" }, 1).setData(line(candles, indicators.macd.line));
    chart.addSeries(LineSeries, { ...thin, color: "#f97316", title: "Signal" }, 1).setData(line(candles, indicators.macd.signal));

    // Pane 2: RSI with 70/30 guides
    const rsi = chart.addSeries(LineSeries, { ...thin, color: "#a855f7", title: "RSI 14", lastValueVisible: true }, 2);
    rsi.setData(line(candles, indicators.rsi));
    for (const level of [70, 30]) {
      rsi.createPriceLine({ price: level, color: "#78716c", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
    }

    const panes = chart.panes();
    panes[0]?.setStretchFactor(3);
    panes[1]?.setStretchFactor(1);
    panes[2]?.setStretchFactor(1);
    chart.timeScale().fitContent();

    const onTheme = (e: MediaQueryListEvent) => chart.applyOptions(themeOptions(e.matches));
    media.addEventListener("change", onTheme);

    return () => {
      media.removeEventListener("change", onTheme);
      chart.remove();
    };
  }, [candles, indicators]);

  return <div ref={containerRef} className="h-[520px] w-full sm:h-[600px]" />;
}
