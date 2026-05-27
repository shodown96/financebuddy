"use client";

import { addCommas, stripToDigits } from "@/lib/utils";
import React, { useMemo, useState } from "react";

type IncomeMode = "annual" | "monthly";

// Rwanda PAYE monthly bands (RRA, effective November 2022)
// Verified against RRA official worked examples and PwC Tax Summaries
const MONTHLY_BANDS = [
  { limit: 60_000, rate: 0, label: "Tax-free band" },
  { limit: 100_000, rate: 0.10, label: "10% band" },
  { limit: 200_000, rate: 0.20, label: "20% band" },
  { limit: Infinity, rate: 0.30, label: "30% band" },
];

// RSSB employee contribution rates (2025)
// Pension doubled from 3% to 6% in January 2025 (total 12%, split 6/6)
const PENSION_RATE = 0.06;    // employee share
const MATERNITY_RATE = 0.003; // 0.3% employee share
const CBHI_RATE = 0.005;      // 0.5% of net after PAYE + pension + maternity

function calcMonthlyPAYE(monthlyGross: number) {
  let tax = 0;
  let prev = 0;

  const bands: Array<{
    label: string;
    from: number;
    to: number;
    rate: number;
    taxable: number;
    tax: number;
  }> = [];

  for (const band of MONTHLY_BANDS) {
    if (monthlyGross <= prev) break;
    const top = Math.min(monthlyGross, band.limit);
    const taxable = Math.max(0, top - prev);
    const bandTax = taxable * band.rate;
    bands.push({ label: band.label, from: prev, to: top, rate: band.rate, taxable, tax: bandTax });
    tax += bandTax;
    prev = band.limit;
  }

  return { tax, bands };
}

const INPUT_CLS =
  "mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

export default function RwandaTaxCalculator() {
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("6,000,000");

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(v);

  const digits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);
  const entered = useMemo(() => (digits ? Number(digits) : 0), [digits]);
  const annualIncome = useMemo(() => (mode === "monthly" ? entered * 12 : entered), [entered, mode]);
  const monthlyIncome = annualIncome / 12;

  // PAYE is computed on monthly gross then scaled to annual
  const { tax: monthlyPAYE, bands: monthlyBands } = useMemo(
    () => calcMonthlyPAYE(monthlyIncome),
    [monthlyIncome]
  );
  const annualPAYE = monthlyPAYE * 12;

  // RSSB deductions (applied after PAYE, on gross)
  const annualPension = annualIncome * PENSION_RATE;
  const annualMaternity = annualIncome * MATERNITY_RATE;

  // CBHI is calculated on net after PAYE + pension + maternity
  const netBeforeCBHI = annualIncome - annualPAYE - annualPension - annualMaternity;
  const annualCBHI = Math.max(0, netBeforeCBHI) * CBHI_RATE;

  const totalDeductions = annualPAYE + annualPension + annualMaternity + annualCBHI;
  const netAnnual = annualIncome - totalDeductions;
  const effectivePAYE = annualIncome > 0 ? (annualPAYE / annualIncome) * 100 : 0;
  const effectiveTotal = annualIncome > 0 ? (totalDeductions / annualIncome) * 100 : 0;

  const radioBase = "flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer";
  const radioAccent = "accent-teal-600 dark:accent-teal-400";

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Rwanda Income Tax Calculator (2025)
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        PAYE based on RRA progressive monthly bands. Includes employee RSSB deductions:
        pension (6%), maternity (0.3%), and CBHI (0.5%). Benefits-in-kind and casual
        labour are not modelled.
      </p>

      {/* Mode */}
      <div className="mt-5">
        <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Income period</div>
        <div className="mt-2 flex gap-4">
          {(["annual", "monthly"] as IncomeMode[]).map((m) => (
            <label key={m} className={radioBase}>
              <input
                type="radio"
                className={radioAccent}
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Input */}
      <label className="mt-4 block text-sm font-semibold text-stone-900 dark:text-stone-50">
        {mode === "monthly" ? "Monthly gross income (RWF)" : "Annual gross income (RWF)"}
      </label>
      <input
        value={incomeInput}
        onChange={(e) => setIncomeInput(addCommas(stripToDigits(e.target.value)))}
        inputMode="numeric"
        placeholder={mode === "monthly" ? "e.g. 500,000" : "e.g. 6,000,000"}
        className={INPUT_CLS}
      />
      <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
        Monthly gross used for PAYE calculation:{" "}
        <span className="font-semibold">{fmt(monthlyIncome)}</span>
      </p>

      {/* Monthly-mode notice */}
      {mode === "monthly" && (
        <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-700 dark:border-teal-800/50 dark:bg-teal-900/20 dark:text-teal-400">
          You entered a monthly income of <strong>{fmt(entered)}</strong>. Rwanda PAYE
          is computed on your monthly gross. The Annual column below is each monthly
          figure multiplied by 12. The Monthly column divides annual amounts by 12.
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
              { label: "PAYE income tax", annual: annualPAYE, monthly: annualPAYE / 12 },
              { label: "Pension (RSSB 6%)", annual: annualPension, monthly: annualPension / 12 },
              { label: "Maternity (RSSB 0.3%)", annual: annualMaternity, monthly: annualMaternity / 12 },
              { label: "CBHI (0.5% of net)", annual: annualCBHI, monthly: annualCBHI / 12 },
              { label: "Total deductions", annual: totalDeductions, monthly: totalDeductions / 12, subtotal: true },
            ].map((row) => (
              <tr
                key={row.label}
                className={`border-b border-stone-100 dark:border-stone-700/30 ${"subtotal" in row && row.subtotal ? "bg-stone-50 dark:bg-stone-800/30 font-medium" : ""}`}
              >
                <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">{row.label}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">{fmt(row.annual)}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">{fmt(row.monthly)}</td>
              </tr>
            ))}
            <tr className="bg-teal-50 dark:bg-teal-900/20">
              <td className="px-4 py-3 font-bold text-teal-800 dark:text-teal-300">Net income (take-home)</td>
              <td className="px-4 py-3 text-right font-bold text-teal-800 dark:text-teal-300">{fmt(netAnnual)}</td>
              <td className="px-4 py-3 text-right font-bold text-teal-800 dark:text-teal-300">{fmt(netAnnual / 12)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Effective rates */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
        <span>
          Effective PAYE rate:{" "}
          <strong className="text-stone-800 dark:text-stone-200">{effectivePAYE.toFixed(2)}%</strong>
        </span>
        <span>
          Combined effective rate (PAYE + RSSB):{" "}
          <strong className="text-stone-800 dark:text-stone-200">{effectiveTotal.toFixed(2)}%</strong>
        </span>
      </div>

      {/* PAYE band breakdown */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">
        PAYE band breakdown (monthly)
      </h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Band", "Rate", "Monthly range", "Taxable", "Monthly tax", "Annual tax"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlyBands.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-xs text-stone-400">
                  Enter an income above RWF 0 to see the breakdown.
                </td>
              </tr>
            )}
            {monthlyBands.map((row, i) => (
              <tr key={i} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{row.label}</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{(row.rate * 100).toFixed(0)}%</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                  {fmt(row.from)} – {fmt(Math.min(row.to, monthlyIncome))}
                </td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{fmt(row.taxable)}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">{fmt(row.tax)}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">{fmt(row.tax * 12)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RSSB breakdown */}
      <h3 className="mt-5 text-sm font-semibold text-stone-900 dark:text-stone-50">RSSB deductions breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Contribution", "Rate", "Base", "Monthly", "Annual"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Pension",
                rate: "6%",
                base: "Gross income",
                monthly: annualPension / 12,
                annual: annualPension,
              },
              {
                label: "Maternity",
                rate: "0.3%",
                base: "Gross income",
                monthly: annualMaternity / 12,
                annual: annualMaternity,
              },
              {
                label: "CBHI",
                rate: "0.5%",
                base: "Net after PAYE + pension + maternity",
                monthly: annualCBHI / 12,
                annual: annualCBHI,
              },
            ].map((row) => (
              <tr key={row.label} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{row.label}</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{row.rate}</td>
                <td className="px-3 py-2 text-stone-500 dark:text-stone-400 text-xs">{row.base}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">{fmt(row.monthly)}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">{fmt(row.annual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
        PAYE bands effective November 2022 (RRA). RSSB pension rate reflects the January 2025
        increase from 3% to 6% (employee share). The employer contributes a matching 6% pension,
        plus 0.3% maternity and 2% occupational hazard (employer-only). CBHI is calculated on
        net pay after PAYE, pension, and maternity. Maternity base simplified to full gross
        (actual calculations exclude transport allowances).
      </p>
    </div>
  );
}
