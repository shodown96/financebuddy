"use client";

import { addCommas, stripToDigits } from "@/lib/utils";
import React, { useMemo, useState } from "react";

type IncomeMode = "annual" | "monthly";
type UKRegion = "england" | "scotland";

// 2024/25 tax year

// England / Wales / Northern Ireland income tax
const ENGLAND_BANDS = [
  { limit: 50_270, rate: 0.20, label: "Basic rate" },
  { limit: 125_140, rate: 0.40, label: "Higher rate" },
  { limit: Infinity, rate: 0.45, label: "Additional rate" },
];

// Scotland income tax 2024/25
const SCOTLAND_BANDS = [
  { limit: 14_876, rate: 0.19, label: "Starter rate" },
  { limit: 26_561, rate: 0.20, label: "Scottish basic rate" },
  { limit: 43_662, rate: 0.21, label: "Intermediate rate" },
  { limit: 75_000, rate: 0.42, label: "Higher rate" },
  { limit: 125_140, rate: 0.45, label: "Advanced rate" },
  { limit: Infinity, rate: 0.48, label: "Top rate" },
];

const PERSONAL_ALLOWANCE_BASE = 12_570;
const PA_TAPER_START = 100_000; // allowance tapers above this

// National Insurance (Employee Class 1, 2024/25)
const NI_PRIMARY_THRESHOLD = 12_570;
const NI_UPPER_THRESHOLD = 50_270;
const NI_LOWER_RATE = 0.08; // 8% between thresholds
const NI_UPPER_RATE = 0.02; // 2% above upper threshold

function calcPersonalAllowance(income: number): number {
  if (income <= PA_TAPER_START) return PERSONAL_ALLOWANCE_BASE;
  const reduction = Math.floor((income - PA_TAPER_START) / 2);
  return Math.max(0, PERSONAL_ALLOWANCE_BASE - reduction);
}

function calcIncomeTax(grossIncome: number, region: UKRegion) {
  const allowance = calcPersonalAllowance(grossIncome);
  const taxableIncome = Math.max(0, grossIncome - allowance);
  const bands = region === "scotland" ? SCOTLAND_BANDS : ENGLAND_BANDS;

  let tax = 0;
  let prev = 0;

  const breakdown: Array<{
    label: string;
    from: number;
    to: number;
    rate: number;
    taxable: number;
    tax: number;
  }> = [];

  for (const band of bands) {
    if (taxableIncome <= prev) break;

    const bandTop = Math.min(taxableIncome, band.limit - allowance);
    const taxableAmt = Math.max(0, bandTop - prev);
    const bandTax = taxableAmt * band.rate;

    breakdown.push({
      label: band.label,
      from: prev + allowance,
      to: bandTop + allowance,
      rate: band.rate,
      taxable: taxableAmt,
      tax: bandTax,
    });

    tax += bandTax;
    prev = band.limit - allowance;
  }

  return { tax, breakdown, allowance };
}

function calcNationalInsurance(grossIncome: number) {
  if (grossIncome <= NI_PRIMARY_THRESHOLD) return { total: 0, lower: 0, upper: 0 };

  const lowerBandIncome = Math.min(grossIncome, NI_UPPER_THRESHOLD) - NI_PRIMARY_THRESHOLD;
  const upperBandIncome = Math.max(0, grossIncome - NI_UPPER_THRESHOLD);

  const lower = lowerBandIncome * NI_LOWER_RATE;
  const upper = upperBandIncome * NI_UPPER_RATE;

  return { total: lower + upper, lower, upper };
}

const INPUT_CLS =
  "mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const CARD_CLS =
  "rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700/50 dark:bg-stone-800/50";

export default function UKTaxCalculator() {
  const [region, setRegion] = useState<UKRegion>("england");
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("60,000");

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(v);

  const digits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);
  const entered = useMemo(() => (digits ? Number(digits) : 0), [digits]);
  const annualIncome = useMemo(() => (mode === "monthly" ? entered * 12 : entered), [entered, mode]);

  const { tax, breakdown, allowance } = useMemo(() => calcIncomeTax(annualIncome, region), [annualIncome, region]);
  const ni = useMemo(() => calcNationalInsurance(annualIncome), [annualIncome]);

  const totalDeductions = tax + ni.total;
  const netAnnual = annualIncome - totalDeductions;
  const effectiveTax = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;
  const effectiveTotal = annualIncome > 0 ? (totalDeductions / annualIncome) * 100 : 0;

  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIncomeInput(addCommas(stripToDigits(e.target.value)));
  }

  const radioBase = "flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer";
  const radioAccent = "accent-teal-600 dark:accent-teal-400";

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        UK Income Tax Calculator (2024/25)
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Covers income tax and employee National Insurance (Class 1). Scotland uses Scottish income
        tax rates. Pension contributions and other reliefs are not included.
      </p>

      {/* Region */}
      <div className="mt-5">
        <div className="fb-label">Region</div>
        <div className="mt-2 flex flex-wrap gap-4">
          {(["england", "scotland"] as UKRegion[]).map((r) => (
            <label key={r} className={radioBase}>
              <input type="radio" className={radioAccent} checked={region === r} onChange={() => setRegion(r)} />
              {r === "england" ? "England / Wales / N. Ireland" : "Scotland"}
            </label>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="mt-4">
        <div className="fb-label">Income period</div>
        <div className="mt-2 flex gap-4">
          {(["annual", "monthly"] as IncomeMode[]).map((m) => (
            <label key={m} className={radioBase}>
              <input type="radio" className={radioAccent} checked={mode === m} onChange={() => setMode(m)} />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Input */}
      <label className="mt-4 fb-label block">
        {mode === "monthly" ? "Monthly gross income (£)" : "Annual gross income (£)"}
      </label>
      <input
        value={incomeInput}
        onChange={handleIncomeChange}
        inputMode="numeric"
        placeholder="e.g. 60,000"
        className={INPUT_CLS}
      />
      <div className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
        Personal allowance applied: <span className="font-semibold">{fmt(allowance)}</span>
      </div>

      {/* Monthly-mode notice */}
      {mode === "monthly" && (
        <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-700 dark:border-teal-800/50 dark:bg-teal-900/20 dark:text-teal-400">
          You entered a monthly income of <strong>{fmt(entered)}</strong>. Tax is calculated on the
          annualised figure of <strong>{fmt(annualIncome)}</strong>. The Monthly column below shows
          each amount divided by 12.
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
              { label: "Income tax", annual: tax, monthly: tax / 12 },
              { label: "National Insurance", annual: ni.total, monthly: ni.total / 12 },
              { label: "Total deductions", annual: totalDeductions, monthly: totalDeductions / 12, subtotal: true },
            ].map((row) => (
              <tr
                key={row.label}
                className={`border-b border-stone-100 dark:border-stone-700/30 ${
                  row.subtotal ? "bg-stone-50 dark:bg-stone-800/30 font-medium" : ""
                }`}
              >
                <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">{row.label}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">{fmt(row.annual)}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">{fmt(row.monthly)}</td>
              </tr>
            ))}
            {/* Net income, highlighted */}
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
        <span>Effective income tax rate: <strong className="text-stone-800 dark:text-stone-200">{effectiveTax.toFixed(2)}%</strong></span>
        <span>Combined effective rate (tax + NI): <strong className="text-stone-800 dark:text-stone-200">{effectiveTotal.toFixed(2)}%</strong></span>
      </div>

      {/* Income tax breakdown */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">Income tax breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Band", "Rate", "Gross range", "Taxable", "Tax"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {breakdown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-xs text-stone-400">
                  Enter an income above £0 to see the breakdown.
                </td>
              </tr>
            )}
            {breakdown.map((row, i) => (
              <tr key={i} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{row.label}</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{(row.rate * 100).toFixed(0)}%</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                  {fmt(row.from)} – {fmt(Math.min(row.to, annualIncome))}
                </td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{fmt(row.taxable)}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">{fmt(row.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NI breakdown */}
      <h3 className="mt-5 text-sm font-semibold text-stone-900 dark:text-stone-50">National Insurance breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Band", "Rate", "NI due"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {annualIncome > NI_PRIMARY_THRESHOLD ? (
              <>
                <tr className="border-b border-stone-100 dark:border-stone-700/30">
                  <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                    {fmt(NI_PRIMARY_THRESHOLD)} – {fmt(Math.min(annualIncome, NI_UPPER_THRESHOLD))}
                  </td>
                  <td className="px-3 py-2 text-stone-700 dark:text-stone-300">8%</td>
                  <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(ni.lower)}</td>
                </tr>
                {annualIncome > NI_UPPER_THRESHOLD && (
                  <tr className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                    <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                      Above {fmt(NI_UPPER_THRESHOLD)}
                    </td>
                    <td className="px-3 py-2 text-stone-700 dark:text-stone-300">2%</td>
                    <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(ni.upper)}</td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={3} className="px-3 py-3 text-xs text-stone-400">
                  No NI due: income is below the primary threshold of {fmt(NI_PRIMARY_THRESHOLD)}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
        Source: HMRC 2024/25 rates. NI rates reflect the 8% / 2% employee thresholds effective
        Jan 2024. Scotland NI rates are the same as the rest of the UK (NI is a UK-wide tax).
        This does not include employer NI, student loan repayments, or pension contributions.
      </p>
    </div>
  );
}
