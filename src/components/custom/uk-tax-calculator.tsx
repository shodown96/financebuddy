"use client";

import {
  addCommas,
  stripToDigits
} from "@/lib/utils";
import React, { useMemo, useState } from "react";

type IncomeMode = "annual" | "monthly";

type Band = {
  limit: number;
  rate: number;
};

const PERSONAL_ALLOWANCE_BASE = 12_570;
const BASIC_LIMIT = 50_270;
const HIGHER_LIMIT = 125_140;

const BANDS: Band[] = [
  { limit: BASIC_LIMIT, rate: 0.20 },
  { limit: HIGHER_LIMIT, rate: 0.40 },
  { limit: Infinity, rate: 0.45 },
];

function calculatePersonalAllowance(income: number) {
  if (income <= 100_000) return PERSONAL_ALLOWANCE_BASE;

  const reduction = (income - 100_000) / 2;
  return Math.max(0, PERSONAL_ALLOWANCE_BASE - reduction);
}

function calculateAnnualTax(income: number) {
  const allowance = calculatePersonalAllowance(income);
  const taxableIncome = Math.max(0, income - allowance);

  let tax = 0;
  let previousLimit = 0;

  const breakdown: Array<{
    from: number;
    to: number;
    rate: number;
    taxable: number;
    tax: number;
  }> = [];

  for (const band of BANDS) {
    if (taxableIncome <= previousLimit) break;

    const bandTop = Math.min(taxableIncome, band.limit - allowance);
    const taxableAmount = Math.max(0, bandTop - previousLimit);
    const bandTax = taxableAmount * band.rate;

    breakdown.push({
      from: previousLimit + allowance,
      to: bandTop + allowance,
      rate: band.rate,
      taxable: taxableAmount,
      tax: bandTax,
    });

    tax += bandTax;
    previousLimit = band.limit - allowance;
  }

  return { tax, breakdown, allowance };
}

export default function UKProgressiveTaxCalculator() {
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("60,000");

  const formatGBP = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 2,
    }).format(value);

  const incomeDigits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);

  const incomeNumber = useMemo(() => {
    if (!incomeDigits) return 0;
    const n = Number(incomeDigits);
    return Number.isFinite(n) ? n : 0;
  }, [incomeDigits]);

  const annualIncome = useMemo(() => {
    return mode === "monthly" ? incomeNumber * 12 : incomeNumber;
  }, [incomeNumber, mode]);

  const { tax, breakdown, allowance } = useMemo(
    () => calculateAnnualTax(annualIncome),
    [annualIncome]
  );

  const netAnnual = annualIncome - tax;
  const monthlyTaxAvg = tax / 12;
  const netMonthlyAvg = netAnnual / 12;
  const effectiveRate =
    annualIncome > 0 ? (tax / annualIncome) * 100 : 0;

  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = stripToDigits(e.target.value);
    setIncomeInput(addCommas(digitsOnly));
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50">
        UK Income Tax Calculator (England/Wales/Northern Ireland)
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
        Monthly income is annualized before tax calculation. Includes personal
        allowance taper above £100,000.
      </p>

      {/* Income Mode */}
      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Income type
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200/85">
            <input
              type="radio"
              checked={mode === "annual"}
              onChange={() => setMode("annual")}
              className="accent-slate-600 dark:accent-slate-300"
            />
            Annual
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200/85">
            <input
              type="radio"
              checked={mode === "monthly"}
              onChange={() => setMode("monthly")}
              className="accent-slate-600 dark:accent-slate-300"
            />
            Monthly
          </label>
        </div>
      </div>

      {/* Income Input */}
      <label className="mt-5 block text-sm font-semibold text-slate-900 dark:text-slate-50">
        {mode === "monthly" ? "Monthly income (£)" : "Annual income (£)"}
      </label>

      <input
        value={incomeInput}
        onChange={handleIncomeChange}
        inputMode="numeric"
        placeholder="e.g. 60,000"
        className="
          mt-2 w-full rounded-xl border px-3 py-2 text-sm
          border-slate-200 bg-white text-slate-900
          focus:outline-none focus:ring-2 focus:ring-slate-300
          dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50 dark:focus:ring-white/20
        "
      />

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-200/70">
        Annualized income used:{" "}
        <span className="font-semibold">{formatGBP(annualIncome)}</span>
      </div>

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-200/70">
        Personal allowance applied:{" "}
        <span className="font-semibold">{formatGBP(allowance)}</span>
      </div>

      {/* Summary Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ["Total annual tax", formatGBP(tax)],
          ["Monthly tax (avg)", formatGBP(monthlyTaxAvg)],
          ["Net annual income", formatGBP(netAnnual)],
          ["Net monthly (avg)", formatGBP(netMonthlyAvg)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60"
          >
            <div className="text-xs text-slate-500 dark:text-slate-200/70">
              {label}
            </div>
            <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
              {value}
            </div>
          </div>
        ))}

        <div className="sm:col-span-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
          <div className="text-xs text-slate-500 dark:text-slate-200/70">
            Effective tax rate
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            {effectiveRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Band breakdown
      </h3>

      <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-600/60">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600/60">
              {["Band", "Rate", "Taxable in band", "Tax in band"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-200/85"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 last:border-b-0 dark:border-slate-600/30"
              >
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {formatGBP(row.from)} to {formatGBP(row.to)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {(row.rate * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {formatGBP(row.taxable)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {formatGBP(row.tax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-200/70">
        Note: This covers income tax only. National Insurance and other
        deductions are not included.
      </p>
    </div>
  );
}
