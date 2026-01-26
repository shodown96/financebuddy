"use client";
import {
    addCommas,
    buildSchedule,
    formatNGN,
    parseMoneyFromFormatted,
    parsePercent,
    stripToDigits
} from "@/lib/utils";
import React, { useMemo, useState } from "react";

export default function MonthlyInterestEstimator() {
    const [annualRateInput, setAnnualRateInput] = useState("12");
    const [depositInput, setDepositInput] = useState("100,000");
    const [monthsInput, setMonthsInput] = useState("12");

    const annualRatePct = useMemo(
        () => parsePercent(annualRateInput),
        [annualRateInput]
    );

    const monthlyDeposit = useMemo(
        () => parseMoneyFromFormatted(depositInput),
        [depositInput]
    );

    const months = useMemo(() => {
        const n = Number(monthsInput.replace(/[^\d]/g, ""));
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(600, n));
    }, [monthsInput]);

    const schedule = useMemo(
        () =>
            buildSchedule({
                annualRatePct,
                monthlyDeposit,
                months,
            }),
        [annualRatePct, monthlyDeposit, months]
    );

    const avgMonthlyInterest = months > 0 ? schedule.totalInterest / months : 0;

    const lastMonthInterest =
        schedule.rows.length > 0
            ? schedule.rows[schedule.rows.length - 1].interest
            : 0;

    function handleDepositChange(e: React.ChangeEvent<HTMLInputElement>) {
        const digitsOnly = stripToDigits(e.target.value);
        setDepositInput(addCommas(digitsOnly));
    }

    return (
        <div className="">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Monthly Interest Estimator
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
                Calculates an estimate of your monthly interest and your total balance by the end of the year, assuming you deposit the same amount every month and your savings compounds monthly.

            </p>

            {/* Inputs */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Interest (p.a %)
                    </label>
                    <input
                        value={annualRateInput}
                        onChange={(e) => setAnnualRateInput(e.target.value)}
                        inputMode="decimal"
                        placeholder="e.g. 12.5"
                        className="
              mt-2 w-full rounded-xl border px-3 py-2 text-sm
              border-slate-200 bg-white text-slate-900
              focus:outline-none focus:ring-2 focus:ring-slate-300
              dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50 dark:focus:ring-white/20
            "
                    />
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-200/70">
                        Monthly rate:{" "}
                        <span className="font-semibold">
                            {(schedule.monthlyRate * 100).toFixed(3)}%
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Deposit per month (₦)
                    </label>
                    <input
                        value={depositInput}
                        onChange={handleDepositChange}
                        inputMode="numeric"
                        placeholder="e.g. 100,000"
                        className="
              mt-2 w-full rounded-xl border px-3 py-2 text-sm
              border-slate-200 bg-white text-slate-900
              focus:outline-none focus:ring-2 focus:ring-slate-300
              dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50 dark:focus:ring-white/20
            "
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Duration (months)
                    </label>
                    <input
                        value={monthsInput}
                        onChange={(e) => setMonthsInput(e.target.value)}
                        inputMode="numeric"
                        placeholder="e.g. 12"
                        className="
              mt-2 w-full rounded-xl border px-3 py-2 text-sm
              border-slate-200 bg-white text-slate-900
              focus:outline-none focus:ring-2 focus:ring-slate-300
              dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50 dark:focus:ring-white/20
            "
                    />
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-200/70">
                        Tip: 12 months = 1 year
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Total deposited
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                        {formatNGN(schedule.totalDeposits)}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Total interest earned
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                        {formatNGN(schedule.totalInterest)}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Final balance (deposits + interest)
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                        {formatNGN(schedule.finalBalance)}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Avg interest per month
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                        {formatNGN(avgMonthlyInterest)}
                    </div>

                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-200/70">
                        Interest in last month (highest):{" "}
                        <span className="font-semibold">{formatNGN(lastMonthInterest)}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Monthly breakdown
            </h3>

            <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-600/60">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600/60">
                            {["Month", "Deposit", "Interest earned", "End balance"].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-200/85"
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.rows.slice(0, 60).map((row) => (
                            <tr
                                key={row.month}
                                className="border-b border-slate-100 last:border-b-0 dark:border-slate-600/30"
                            >
                                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                                    {row.month}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                                    {formatNGN(row.deposit)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                                    {formatNGN(row.interest)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200/85">
                                    {formatNGN(row.endBalance)}
                                </td>
                            </tr>
                        ))}

                        {schedule.rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-3 py-3 text-xs text-slate-500 dark:text-slate-200/70"
                                >
                                    Enter values above to see results.
                                </td>
                            </tr>
                        )}

                        {schedule.rows.length > 60 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-3 py-3 text-xs text-slate-500 dark:text-slate-200/70"
                                >
                                    Showing first 60 months only.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-200/70">
                Assumptions: monthly compounding, and deposit happens at the start of
                each month. Some banks credit interest daily or monthly with different
                timing, so real results may vary slightly.
            </p>
        </div>
    );
}
