"use client";
import {
  addCommas,
  formatNGN,
  stripToDigits
} from "@/lib/utils";
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

  const breakdown: Array<{
    from: number;
    to: number;
    rate: number;
    taxable: number;
    tax: number;
  }> = [];

  for (const band of BANDS) {
    if (income <= previousLimit) break;

    const bandTop = Math.min(income, band.limit);
    const taxableAmount = Math.max(0, bandTop - previousLimit);
    const bandTax = taxableAmount * band.rate;

    breakdown.push({
      from: previousLimit,
      to: bandTop,
      rate: band.rate,
      taxable: taxableAmount,
      tax: bandTax,
    });

    tax += bandTax;
    previousLimit = band.limit;
  }

  return { tax, breakdown };
}

export default function ProgressiveTaxCalculator() {
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("15,000,000");

  const incomeDigits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);

  const incomeNumber = useMemo(() => {
    if (!incomeDigits) return 0;
    const n = Number(incomeDigits);
    return Number.isFinite(n) ? n : 0;
  }, [incomeDigits]);

  const annualIncome = useMemo(() => {
    return mode === "monthly" ? incomeNumber * 12 : incomeNumber;
  }, [incomeNumber, mode]);

  const { tax, breakdown } = useMemo(
    () => calculateAnnualTax(annualIncome),
    [annualIncome]
  );

  const netAnnual = annualIncome - tax;
  const monthlyTaxAvg = tax / 12;
  const netMonthlyAvg = netAnnual / 12;
  const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;

  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = stripToDigits(e.target.value);
    setIncomeInput(addCommas(digitsOnly));
  }

  return (
    <div className="">
      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50">
        Nigeria Progressive Tax Calculator
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
        Choose monthly or annual income. Monthly input is multiplied by 12 to
        compute annual tax. Input auto-formats with commas.
      </p>

      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Income type
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200/85">
            <input
              type="radio"
              name="incomeMode"
              value="annual"
              checked={mode === "annual"}
              onChange={() => setMode("annual")}
            />
            Annual
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200/85">
            <input
              type="radio"
              name="incomeMode"
              value="monthly"
              checked={mode === "monthly"}
              onChange={() => setMode("monthly")}
            />
            Monthly
          </label>
        </div>
      </div>

      <label className="mt-5 block text-sm font-semibold text-slate-900 dark:text-slate-50">
        {mode === "monthly" ? "Monthly income (₦)" : "Annual income (₦)"}
      </label>

      <input
        value={incomeInput}
        onChange={handleIncomeChange}
        inputMode="numeric"
        placeholder={mode === "monthly" ? "e.g. 1,250,000" : "e.g. 15,000,000"}
        className="
          mt-2 w-full rounded-xl border px-3 py-2 text-sm
          border-slate-200 bg-white text-slate-900
          focus:outline-none focus:ring-2 focus:ring-slate-300
          dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50 dark:focus:ring-white/20
        "
      />

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-200/70">
        Annualized income used for calculation:{" "}
        <span className="font-semibold">{formatNGN(annualIncome)}</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
          <div className="text-xs text-slate-500 dark:text-slate-200/70">
            Total annual tax
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            {formatNGN(tax)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
          <div className="text-xs text-slate-500 dark:text-slate-200/70">
            Monthly tax (avg)
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            {formatNGN(monthlyTaxAvg)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
          <div className="text-xs text-slate-500 dark:text-slate-200/70">
            Net annual income
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            {formatNGN(netAnnual)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
          <div className="text-xs text-slate-500 dark:text-slate-200/70">
            Net monthly (avg)
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            {formatNGN(netMonthlyAvg)}
          </div>
        </div>

        <div className="sm:col-span-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
          <div className="text-xs text-slate-500 dark:text-slate-200/70">
            Effective tax rate
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
            {effectiveRate.toFixed(2)}%
          </div>
        </div>
      </div>

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
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-200/85"
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
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {formatNGN(row.from)}{" "}
                  <span className="opacity-70">to</span> {formatNGN(row.to)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {(row.rate * 100).toFixed(0)}%
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {formatNGN(row.taxable)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                  {formatNGN(row.tax)}
                </td>
              </tr>
            ))}

            {annualIncome <= 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-3 text-xs text-slate-500 dark:text-slate-200/70"
                >
                  Enter an income above ₦0 to see the breakdown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-200/70">
        Note: This uses the chart-based progressive bands only. If your real
        computation includes reliefs (CRA), pension, NHF, etc., you’d reduce the
        taxable income first, then apply these bands.
      </p>
    </div>
  );
}
