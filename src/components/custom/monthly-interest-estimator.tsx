"use client";

import { addCommas, buildSchedule, formatNGN, parseMoneyFromFormatted, parsePercent, stripToDigits } from "@/lib/utils";
import React, { useMemo, useState } from "react";

const INPUT_CLS =
  "mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const CARD_CLS =
  "rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700/50 dark:bg-stone-800/50";

export default function MonthlyInterestEstimator() {
  const [annualRateInput, setAnnualRateInput] = useState("12");
  const [depositInput, setDepositInput] = useState("100,000");
  const [monthsInput, setMonthsInput] = useState("12");

  const annualRatePct = useMemo(() => parsePercent(annualRateInput), [annualRateInput]);
  const monthlyDeposit = useMemo(() => parseMoneyFromFormatted(depositInput), [depositInput]);
  const months = useMemo(() => {
    const n = Number(monthsInput.replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? Math.max(0, Math.min(600, n)) : 0;
  }, [monthsInput]);

  const schedule = useMemo(() => buildSchedule({ annualRatePct, monthlyDeposit, months }), [annualRatePct, monthlyDeposit, months]);

  const avgMonthlyInterest = months > 0 ? schedule.totalInterest / months : 0;
  const lastMonthInterest = schedule.rows.length > 0 ? schedule.rows[schedule.rows.length - 1].interest : 0;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Monthly Interest Estimator
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Estimate how a fixed monthly deposit grows with monthly compound interest. Deposit is
        added at the start of each month, then interest compounds on the new balance.
      </p>

      {/* Inputs */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">Interest (p.a %)</label>
          <input
            value={annualRateInput}
            onChange={(e) => setAnnualRateInput(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 12.5"
            className={INPUT_CLS}
          />
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
            Monthly rate: <span className="font-semibold">{(schedule.monthlyRate * 100).toFixed(3)}%</span>
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">Deposit per month (₦)</label>
          <input
            value={depositInput}
            onChange={(e) => setDepositInput(addCommas(stripToDigits(e.target.value)))}
            inputMode="numeric"
            placeholder="e.g. 100,000"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">Duration (months)</label>
          <input
            value={monthsInput}
            onChange={(e) => setMonthsInput(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 12"
            className={INPUT_CLS}
          />
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">12 months = 1 year</p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: "Total deposited", value: formatNGN(schedule.totalDeposits) },
          { label: "Total interest earned", value: formatNGN(schedule.totalInterest) },
          { label: "Final balance", value: formatNGN(schedule.finalBalance) },
          { label: "Avg interest per month", value: formatNGN(avgMonthlyInterest), sub: `Last month (highest): ${formatNGN(lastMonthInterest)}` },
        ].map((c) => (
          <div key={c.label} className={CARD_CLS}>
            <div className="text-xs text-stone-500 dark:text-stone-400">{c.label}</div>
            <div className="mt-1 text-lg font-extrabold text-stone-900 dark:text-stone-50">{c.value}</div>
            {c.sub && <div className="mt-1 text-xs text-stone-400 dark:text-stone-500">{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Table */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">Monthly breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Month", "Deposit", "Interest earned", "End balance"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                  Enter values above to see results.
                </td>
              </tr>
            )}
            {schedule.rows.slice(0, 60).map((row) => (
              <tr key={row.month} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="whitespace-nowrap px-3 py-2 text-stone-700 dark:text-stone-300">{row.month}</td>
                <td className="whitespace-nowrap px-3 py-2 text-stone-700 dark:text-stone-300">{formatNGN(row.deposit)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-teal-700 dark:text-teal-400 font-medium">{formatNGN(row.interest)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{formatNGN(row.endBalance)}</td>
              </tr>
            ))}
            {schedule.rows.length > 60 && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                  Showing first 60 months only.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
        Assumes monthly compounding with deposit at the start of each month. Real results may vary
        based on your bank's compounding schedule.
      </p>
    </div>
  );
}
