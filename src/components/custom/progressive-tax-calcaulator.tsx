"use client";

import { addCommas, formatNGN, stripToDigits } from "@/lib/utils";
import type { Band, IncomeMode } from "@/types";
import React, { useMemo, useState } from "react";

const BANDS: Band[] = [
  { limit: 800_000, rate: 0 },
  { limit: 3_000_000, rate: 0.15 },
  { limit: 12_000_000, rate: 0.18 },
  { limit: 25_000_000, rate: 0.21 },
  { limit: 50_000_000, rate: 0.23 },
  { limit: Infinity, rate: 0.25 },
];

function calculateAnnualTax(income: number) {
  let tax = 0;
  let previousLimit = 0;

  const breakdown: Array<{ from: number; to: number; rate: number; taxable: number; tax: number }> = [];

  for (const band of BANDS) {
    if (income <= previousLimit) break;
    const bandTop = Math.min(income, band.limit);
    const taxableAmount = Math.max(0, bandTop - previousLimit);
    const bandTax = taxableAmount * band.rate;
    breakdown.push({ from: previousLimit, to: bandTop, rate: band.rate, taxable: taxableAmount, tax: bandTax });
    tax += bandTax;
    previousLimit = band.limit;
  }

  return { tax, breakdown };
}

const INPUT_CLS =
  "mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const CARD_CLS =
  "rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700/50 dark:bg-stone-800/50";

export default function ProgressiveTaxCalculator() {
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("15,000,000");

  const incomeDigits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);
  const incomeNumber = useMemo(() => {
    if (!incomeDigits) return 0;
    const n = Number(incomeDigits);
    return Number.isFinite(n) ? n : 0;
  }, [incomeDigits]);

  const annualIncome = useMemo(() => (mode === "monthly" ? incomeNumber * 12 : incomeNumber), [incomeNumber, mode]);
  const { tax, breakdown } = useMemo(() => calculateAnnualTax(annualIncome), [annualIncome]);

  const netAnnual = annualIncome - tax;
  const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;

  const radioBase = "flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer";
  const radioAccent = "accent-teal-600 dark:accent-teal-400";

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Nigeria Progressive Income Tax
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        PAYE progressive bands. Monthly input is annualised (×12) before tax is computed.
        CRA, pension, NHF, and other reliefs are not applied.
      </p>

      {/* Mode */}
      <div className="mt-5">
        <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Income period</div>
        <div className="mt-2 flex gap-4">
          {(["annual", "monthly"] as IncomeMode[]).map((m) => (
            <label key={m} className={radioBase}>
              <input type="radio" name="incomeMode" value={m} checked={mode === m} onChange={() => setMode(m)} className={radioAccent} />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Input */}
      <label className="mt-4 block text-sm font-semibold text-stone-900 dark:text-stone-50">
        {mode === "monthly" ? "Monthly income (₦)" : "Annual income (₦)"}
      </label>
      <input
        value={incomeInput}
        onChange={(e) => setIncomeInput(addCommas(stripToDigits(e.target.value)))}
        inputMode="numeric"
        placeholder={mode === "monthly" ? "e.g. 1,250,000" : "e.g. 15,000,000"}
        className={INPUT_CLS}
      />
      <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
        Annual income used: <span className="font-semibold">{formatNGN(annualIncome)}</span>
      </p>

      {/* Monthly-mode notice */}
      {mode === "monthly" && (
        <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-700 dark:border-teal-800/50 dark:bg-teal-900/20 dark:text-teal-400">
          You entered a monthly income of <strong>{formatNGN(incomeNumber)}</strong>. Tax is calculated on
          the annualised figure of <strong>{formatNGN(annualIncome)}</strong>. The Monthly column below
          shows each amount divided by 12.
        </div>
      )}

      {/* Summary table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700/50 dark:bg-stone-800/40">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300">Item</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-stone-600 dark:text-stone-300">Annual</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-stone-600 dark:text-stone-300">Monthly (avg)</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Gross income", annual: annualIncome, monthly: annualIncome / 12 },
              { label: "Income tax", annual: tax, monthly: tax / 12, subtotal: true },
            ].map((row) => (
              <tr
                key={row.label}
                className={`border-b border-stone-100 dark:border-stone-700/30 ${
                  row.subtotal ? "bg-stone-50 dark:bg-stone-800/30 font-medium" : ""
                }`}
              >
                <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">{row.label}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">{formatNGN(row.annual)}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">{formatNGN(row.monthly)}</td>
              </tr>
            ))}
            <tr className="bg-teal-50 dark:bg-teal-900/20">
              <td className="px-4 py-3 font-bold text-teal-800 dark:text-teal-300">Net income (take-home)</td>
              <td className="px-4 py-3 text-right font-bold text-teal-800 dark:text-teal-300">{formatNGN(netAnnual)}</td>
              <td className="px-4 py-3 text-right font-bold text-teal-800 dark:text-teal-300">{formatNGN(netAnnual / 12)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Effective rate */}
      <div className="mt-3 text-sm text-stone-500 dark:text-stone-400">
        Effective tax rate: <strong className="text-stone-800 dark:text-stone-200">{effectiveRate.toFixed(2)}%</strong>
      </div>

      {/* Breakdown */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">Band breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Band", "Rate", "Taxable in band", "Tax in band"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, idx) => (
              <tr key={idx} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="whitespace-nowrap px-3 py-2 text-stone-700 dark:text-stone-300">
                  {formatNGN(row.from)} – {formatNGN(row.to)}
                </td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{(row.rate * 100).toFixed(0)}%</td>
                <td className="whitespace-nowrap px-3 py-2 text-stone-700 dark:text-stone-300">{formatNGN(row.taxable)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{formatNGN(row.tax)}</td>
              </tr>
            ))}
            {annualIncome <= 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                  Enter an income above ₦0 to see the breakdown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
        Bands are based on the Nigerian PAYE chart. To account for reliefs (CRA, pension, NHF etc.),
        reduce your taxable income first, then enter the result here.
      </p>
    </div>
  );
}
