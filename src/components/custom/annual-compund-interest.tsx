"use client";

import {
    addCommas,
    formatNGN,
    parseMoneyFromFormatted,
    parsePercent,
    stripToDigits,
} from "@/lib/utils";
import { useMemo, useState } from "react";

type MonthRow = {
    month: number;
    daysRemaining: number;
    addedThisMonth: number;
    upfrontProfit: number;
    endBalance: number;
};

type YearRow = {
    year: number;
    startBalance: number;
    totalMonthlyAdds: number;
    totalUpfrontProfit: number;
    yearEndBalance: number;
};

/**
 * Same-day recursive reinvest, computed in closed-form.
 *
 * upfront payout on an amountAdded (with daysRemaining):
 *   payout1 = amountAdded * r * (daysRemaining/365)
 *
 * reinvesting payout immediately produces:
 *   payout2 = payout1 * factor
 *   payout3 = payout2 * factor
 *
 * where factor = r * (daysRemaining/365)
 *
 * totalProfit = payout1 + payout2 + ... = payout1 / (1 - factor), if factor < 1
 */
function upfrontProfitClosedForm(params: {
    annualRate: number;
    amountAdded: number;
    daysRemaining: number;
}) {
    const { annualRate, amountAdded, daysRemaining } = params;

    const factor = annualRate * (daysRemaining / 365);

    if (amountAdded <= 0 || factor <= 0) return 0;

    // If factor >= 1, the product is effectively "infinite" which isn't realistic.
    // We'll guard to avoid Infinity.
    if (factor >= 1) return Number.POSITIVE_INFINITY;

    const firstPayout = amountAdded * factor;
    return firstPayout / (1 - factor);
}

function simulate(params: {
    initialPrincipal: number;
    monthlyTopUp: number;
    annualRate: number; // decimal
    years: number;

    // independent toggle for monthly recursion
    recursiveMonthly: boolean;
}) {
    const { initialPrincipal, monthlyTopUp, annualRate, years, recursiveMonthly } =
        params;

    let balance = initialPrincipal;
    const yearRows: YearRow[] = [];
    const monthRowsByYear: Record<number, MonthRow[]> = {};

    for (let y = 1; y <= years; y++) {
        const startBalance = balance;

        // Principal recursion is ALWAYS TRUE now (as you requested)
        // At start of the year: daysRemaining = 365
        const principalUpfrontProfit = upfrontProfitClosedForm({
            annualRate,
            amountAdded: startBalance,
            daysRemaining: 365,
        });

        // Guard against factor >= 1
        if (!Number.isFinite(principalUpfrontProfit)) {
            return {
                finalBalance: Number.POSITIVE_INFINITY,
                yearRows: [],
                monthRowsByYear: {},
            };
        }

        balance += principalUpfrontProfit;

        let totalUpfrontProfit = principalUpfrontProfit;
        let totalMonthlyAdds = 0;

        const months: MonthRow[] = [];

        for (let m = 1; m <= 12; m++) {
            const daysRemaining = Math.max(0, 365 - (m - 1) * 30);

            // add monthly top-up
            balance += monthlyTopUp;
            totalMonthlyAdds += monthlyTopUp;

            let monthlyUpfrontProfit = 0;

            if (recursiveMonthly && monthlyTopUp > 0 && daysRemaining > 0) {
                monthlyUpfrontProfit = upfrontProfitClosedForm({
                    annualRate,
                    amountAdded: monthlyTopUp,
                    daysRemaining,
                });

                if (!Number.isFinite(monthlyUpfrontProfit)) {
                    return {
                        finalBalance: Number.POSITIVE_INFINITY,
                        yearRows: [],
                        monthRowsByYear: {},
                    };
                }

                balance += monthlyUpfrontProfit;
                totalUpfrontProfit += monthlyUpfrontProfit;
            }

            months.push({
                month: m,
                daysRemaining,
                addedThisMonth: monthlyTopUp,
                upfrontProfit: monthlyUpfrontProfit,
                endBalance: balance,
            });
        }

        monthRowsByYear[y] = months;

        yearRows.push({
            year: y,
            startBalance,
            totalMonthlyAdds,
            totalUpfrontProfit,
            yearEndBalance: balance,
        });
    }

    return { finalBalance: balance, yearRows, monthRowsByYear };
}

function simulateNonRecursive(params: {
    initialPrincipal: number;
    monthlyTopUp: number;
    annualRate: number;
    years: number;
}) {
    const { initialPrincipal, monthlyTopUp, annualRate, years } = params;

    let balance = initialPrincipal;
    const yearRows: YearRow[] = [];

    for (let y = 1; y <= years; y++) {
        const startBalance = balance;

        const totalMonthlyAdds = monthlyTopUp * 12;
        const base = startBalance + totalMonthlyAdds;

        const endOfYearInterest = base * annualRate;
        balance = base + endOfYearInterest;

        yearRows.push({
            year: y,
            startBalance,
            totalMonthlyAdds,
            totalUpfrontProfit: 0,
            yearEndBalance: balance,
        });
    }

    return { finalBalance: balance, yearRows, monthRowsByYear: {} as Record<number, MonthRow[]> };
}

export default function FixedDepositMonthlyTopupYears({ showExplanation = true }) {
    const [initialInput, setInitialInput] = useState("2,500,000");
    const [topUpInput, setTopUpInput] = useState("500,000");
    const [yearsInput, setYearsInput] = useState("5");
    const [rateInput, setRateInput] = useState("16.5");

    const [recursive, setRecursive] = useState(true);
    const [recursiveMonthly, setRecursiveMonthly] = useState(true);

    const [viewYearInput, setViewYearInput] = useState("1");

    // NEW: currency state
    const [currency, setCurrency] = useState<"NGN" | "USD" | "GBP" | "EUR">("NGN");

    // NEW: dynamic formatter
    const formatMoney = (value: number) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value);

    const initialPrincipal = useMemo(
        () => parseMoneyFromFormatted(initialInput),
        [initialInput]
    );

    const monthlyTopUp = useMemo(
        () => parseMoneyFromFormatted(topUpInput),
        [topUpInput]
    );

    const years = useMemo(() => {
        const n = Number(stripToDigits(yearsInput));
        if (!Number.isFinite(n)) return 1;
        return Math.max(1, Math.min(60, n));
    }, [yearsInput]);

    const annualRate = useMemo(() => parsePercent(rateInput) / 100, [rateInput]);

    const result = useMemo(() => {
        if (initialPrincipal <= 0 || years <= 0 || annualRate < 0) {
            return {
                finalBalance: 0,
                yearRows: [] as YearRow[],
                monthRowsByYear: {} as Record<number, MonthRow[]>,
            };
        }

        if (!recursive) {
            return simulateNonRecursive({
                initialPrincipal,
                monthlyTopUp,
                annualRate,
                years,
            });
        }

        return simulate({
            initialPrincipal,
            monthlyTopUp,
            annualRate,
            years,
            recursiveMonthly,
        });
    }, [initialPrincipal, monthlyTopUp, annualRate, years, recursive, recursiveMonthly]);

    const viewYear = useMemo(() => {
        const n = Number(stripToDigits(viewYearInput));
        if (!Number.isFinite(n)) return 1;
        return Math.max(1, Math.min(years, n));
    }, [viewYearInput, years]);

    const totalDeposits = initialPrincipal + monthlyTopUp * 12 * years;
    const profit = result.finalBalance - totalDeposits;
    const monthRows = result.monthRowsByYear?.[viewYear] ?? [];

    return (
        <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Fixed Deposit With Monthly Top-Ups (Multi-Year)
            </h2>

            {showExplanation && (
                <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
                    <p>
                        Scenario: you start with an initial fixed deposit. Each month, you add an extra top-up.
                        In non-recursive mode, you wait until the end of the year before any interest is added.
                        In recursive mode, whenever you add money, the bank credits an upfront payout based on
                        the time left in the year, and you immediately add that payout back into the deposit.
                    </p>
                    <p className="mt-1 font-semibold">
                        NOTE: This assumes interest rate is constant.
                    </p>
                </div>
            )}

            {/* Currency Selector */}
            <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Currency
                </label>
                <select
                    value={currency}
                    onChange={(e) =>
                        setCurrency(e.target.value as "NGN" | "USD" | "GBP" | "EUR")
                    }
                    className="rounded-xl border px-3 py-2 text-sm border-slate-200 bg-white text-slate-900 dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50"
                >
                    <option value="NGN">₦ NGN</option>
                    <option value="USD">$ USD</option>
                    <option value="GBP">£ GBP</option>
                    <option value="EUR">€ EUR</option>
                </select>
            </div>

            {/* Inputs */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Initial principal ({currency})
                    </label>
                    <input
                        value={initialInput}
                        onChange={(e) =>
                            setInitialInput(addCommas(stripToDigits(e.target.value)))
                        }
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 bg-white text-slate-900 dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Monthly top-up ({currency})
                    </label>
                    <input
                        value={topUpInput}
                        onChange={(e) =>
                            setTopUpInput(addCommas(stripToDigits(e.target.value)))
                        }
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 bg-white text-slate-900 dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Years
                    </label>
                    <input
                        value={yearsInput}
                        onChange={(e) => setYearsInput(e.target.value)}
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 bg-white text-slate-900 dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Rate (p.a %)
                    </label>
                    <input
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        inputMode="decimal"
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm border-slate-200 bg-white text-slate-900 dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-50"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Total deposits (initial + monthly across years)
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                        {formatMoney(totalDeposits)}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Estimated profit
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                        {formatMoney(profit)}
                    </div>
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-600/60">
                    <div className="text-xs text-slate-500 dark:text-slate-200/70">
                        Estimated balance after {years} year{years === 1 ? "" : "s"}
                    </div>
                    <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-50">
                        {Number.isFinite(result.finalBalance)
                            ? formatMoney(result.finalBalance)
                            : "∞ (check rate/days rule)"}
                    </div>
                </div>
            </div>

            {/* YEARLY + MONTHLY BREAKDOWNS REMAIN UNTOUCHED EXCEPT formatMoney */}

            {/* Yearly breakdown */}
            <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Yearly breakdown
            </h3>

            <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-600/60">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600/60">
                            {["Year", "Start balance", "Total monthly adds", "Total upfront profit", "Year-end balance"].map(
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
                        {result.yearRows.map((r) => (
                            <tr
                                key={r.year}
                                className="border-b border-slate-100 last:border-b-0 dark:border-slate-600/30"
                            >
                                <td className="px-3 py-2">{r.year}</td>
                                <td className="px-3 py-2">{formatMoney(r.startBalance)}</td>
                                <td className="px-3 py-2">{formatMoney(r.totalMonthlyAdds)}</td>
                                <td className="px-3 py-2">{formatMoney(r.totalUpfrontProfit)}</td>
                                <td className="px-3 py-2">{formatMoney(r.yearEndBalance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {recursive && (
                <>
                    <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Monthly breakdown
                    </h3>

                    <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-600/60">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-600/60">
                                    {["Month", "Days remaining", "Added", "Upfront profit", "End balance"].map((h) => (
                                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {monthRows.map((r) => (
                                    <tr key={r.month}>
                                        <td className="px-3 py-2">{r.month}</td>
                                        <td className="px-3 py-2">{r.daysRemaining}</td>
                                        <td className="px-3 py-2">{formatMoney(r.addedThisMonth)}</td>
                                        <td className="px-3 py-2">{formatMoney(r.upfrontProfit)}</td>
                                        <td className="px-3 py-2">{formatMoney(r.endBalance)}</td>
                                    </tr>
                                ))}

                                {monthRows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-3 text-xs text-slate-500 dark:text-slate-200/70"
                                        >
                                            No monthly rows available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
