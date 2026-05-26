"use client";

import { addCommas, parseMoneyFromFormatted, parsePercent, stripToDigits } from "@/lib/utils";
import { useMemo, useState } from "react";

type CompoundMode = "monthly" | "annual" | "nigerian-fd";

type MonthRow = {
  month: number;
  interest: number;
  endBalance: number;
};

type YearRow = {
  year: number;
  startBalance: number;
  totalAdded: number;
  totalInterest: number;
  yearEndBalance: number;
};

/**
 * Standard monthly compound interest.
 * Each month: deposit added, then interest applied on new balance.
 * Formula: balance = (balance + deposit) * (1 + r/12)
 */
function simulateMonthly(params: {
  initialPrincipal: number;
  monthlyTopUp: number;
  annualRate: number;
  years: number;
}) {
  const { initialPrincipal, monthlyTopUp, annualRate, years } = params;
  const monthlyRate = annualRate / 12;

  let balance = initialPrincipal;
  const yearRows: YearRow[] = [];
  const monthRowsByYear: Record<number, MonthRow[]> = {};

  for (let y = 1; y <= years; y++) {
    const startBalance = balance;
    let totalAdded = 0;
    let totalInterest = 0;
    const months: MonthRow[] = [];

    for (let m = 1; m <= 12; m++) {
      balance += monthlyTopUp;
      totalAdded += monthlyTopUp;

      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      balance += interest;
      totalInterest += interest;

      months.push({ month: m, interest, endBalance: balance });
    }

    monthRowsByYear[y] = months;
    yearRows.push({ year: y, startBalance, totalAdded, totalInterest, yearEndBalance: balance });
  }

  return { finalBalance: balance, yearRows, monthRowsByYear };
}

/**
 * Annual compound interest.
 * Monthly deposits accumulate throughout the year; interest applied once at year-end.
 */
function simulateAnnual(params: {
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
    const totalAdded = monthlyTopUp * 12;
    balance += totalAdded;
    const interest = balance * annualRate;
    balance += interest;

    yearRows.push({ year: y, startBalance, totalAdded, totalInterest: interest, yearEndBalance: balance });
  }

  return { finalBalance: balance, yearRows, monthRowsByYear: {} as Record<number, MonthRow[]> };
}

/**
 * Nigerian fixed-deposit "upfront interest reinvested" model.
 * When you deposit P for daysRemaining days at annual rate r,
 * the bank pays interest = P * r * (daysRemaining / 365) upfront.
 * This is immediately reinvested, producing an infinite geometric series
 * with closed-form sum: P * factor / (1 - factor), where factor = r * d/365.
 *
 * NOTE: This model yields higher returns than standard compounding and is
 * specific to Nigerian fixed-deposit products with upfront interest payouts.
 */
function upfrontClosedForm(annualRate: number, amount: number, daysRemaining: number): number {
  const factor = annualRate * (daysRemaining / 365);
  if (amount <= 0 || factor <= 0) return 0;
  if (factor >= 1) return Infinity;
  return (amount * factor) / (1 - factor);
}

function simulateNigerianFD(params: {
  initialPrincipal: number;
  monthlyTopUp: number;
  annualRate: number;
  years: number;
}) {
  const { initialPrincipal, monthlyTopUp, annualRate, years } = params;

  let balance = initialPrincipal;
  const yearRows: YearRow[] = [];
  const monthRowsByYear: Record<number, MonthRow[]> = {};

  for (let y = 1; y <= years; y++) {
    const startBalance = balance;

    const principalInterest = upfrontClosedForm(annualRate, startBalance, 365);
    if (!isFinite(principalInterest)) return { finalBalance: Infinity, yearRows: [], monthRowsByYear: {} };
    balance += principalInterest;

    let totalAdded = 0;
    let totalInterest = principalInterest;
    const months: MonthRow[] = [];

    for (let m = 1; m <= 12; m++) {
      const daysLeft = Math.max(0, 365 - (m - 1) * 30);
      balance += monthlyTopUp;
      totalAdded += monthlyTopUp;

      let interest = 0;
      if (monthlyTopUp > 0 && daysLeft > 0) {
        interest = upfrontClosedForm(annualRate, monthlyTopUp, daysLeft);
        if (!isFinite(interest)) return { finalBalance: Infinity, yearRows: [], monthRowsByYear: {} };
        balance += interest;
        totalInterest += interest;
      }

      months.push({ month: m, interest, endBalance: balance });
    }

    monthRowsByYear[y] = months;
    yearRows.push({ year: y, startBalance, totalAdded, totalInterest, yearEndBalance: balance });
  }

  return { finalBalance: balance, yearRows, monthRowsByYear };
}

const INPUT_CLS =
  "mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const CARD_CLS =
  "rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700/50 dark:bg-stone-800/50";

const SELECT_CLS =
  "rounded-xl border px-3 py-2.5 text-sm outline-none transition cursor-pointer " +
  "border-stone-200 bg-white text-stone-900 " +
  "focus:ring-2 focus:ring-teal-300/50 dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50";

export default function AnnualInterestEstimator({ showExplanation = true }) {
  const [initialInput, setInitialInput] = useState("2,500,000");
  const [topUpInput, setTopUpInput] = useState("500,000");
  const [yearsInput, setYearsInput] = useState("5");
  const [rateInput, setRateInput] = useState("16.5");
  const [mode, setMode] = useState<CompoundMode>("monthly");
  const [viewYearInput, setViewYearInput] = useState("1");
  const [currency, setCurrency] = useState<"NGN" | "USD" | "GBP" | "EUR">("NGN");

  const fmt = (v: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(v);

  const initialPrincipal = useMemo(() => parseMoneyFromFormatted(initialInput), [initialInput]);
  const monthlyTopUp = useMemo(() => parseMoneyFromFormatted(topUpInput), [topUpInput]);
  const years = useMemo(() => {
    const n = Number(stripToDigits(yearsInput));
    return Number.isFinite(n) ? Math.max(1, Math.min(60, n)) : 1;
  }, [yearsInput]);
  const annualRate = useMemo(() => parsePercent(rateInput) / 100, [rateInput]);

  const result = useMemo(() => {
    if (initialPrincipal <= 0 || years <= 0 || annualRate < 0) {
      return { finalBalance: 0, yearRows: [] as YearRow[], monthRowsByYear: {} as Record<number, MonthRow[]> };
    }
    const p = { initialPrincipal, monthlyTopUp, annualRate, years };
    if (mode === "annual") return simulateAnnual(p);
    if (mode === "nigerian-fd") return simulateNigerianFD(p);
    return simulateMonthly(p);
  }, [initialPrincipal, monthlyTopUp, annualRate, years, mode]);

  const viewYear = useMemo(() => {
    const n = Number(stripToDigits(viewYearInput));
    return Number.isFinite(n) ? Math.max(1, Math.min(years, n)) : 1;
  }, [viewYearInput, years]);

  const totalDeposits = initialPrincipal + monthlyTopUp * 12 * years;
  const profit = result.finalBalance - totalDeposits;
  const monthRows = result.monthRowsByYear?.[viewYear] ?? [];
  const hasMonthRows = mode !== "annual";

  const modeLabels: Record<CompoundMode, string> = {
    monthly: "Monthly Compound",
    annual: "Annual Compound",
    "nigerian-fd": "Nigerian FD (Upfront Interest)",
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Annual Interest Estimator
      </h2>

      {showExplanation && (
        <div className="mt-2 text-sm text-stone-500 dark:text-stone-400 space-y-1">
          <p>
            <strong className="text-stone-700 dark:text-stone-300">Monthly Compound:</strong>{" "}
            standard savings where each month your deposit is added and interest compounds on the running balance.
          </p>
          <p>
            <strong className="text-stone-700 dark:text-stone-300">Annual Compound:</strong>{" "}
            monthly deposits accumulate throughout the year, then one interest payment is made at year-end.
          </p>
          <p>
            <strong className="text-stone-700 dark:text-stone-300">Nigerian FD:</strong>{" "}
            models Nigerian fixed-deposit accounts where interest is paid upfront and immediately reinvested.
          </p>
        </div>
      )}

      {/* Currency + Mode */}
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-stone-900 dark:text-stone-50">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className={SELECT_CLS}
          >
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
            <option value="GBP">£ GBP</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-stone-900 dark:text-stone-50">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CompoundMode)}
            className={SELECT_CLS}
          >
            {(Object.keys(modeLabels) as CompoundMode[]).map((k) => (
              <option key={k} value={k}>{modeLabels[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {mode === "nigerian-fd" && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-3 py-2">
          Nigerian FD mode uses a closed-form infinite geometric series. Returns are higher than
          standard compounding and model a product where every upfront payout is immediately
          re-deposited. Treat results as an upper bound.
        </p>
      )}

      {/* Inputs */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">
            Initial principal ({currency})
          </label>
          <input
            value={initialInput}
            onChange={(e) => setInitialInput(addCommas(stripToDigits(e.target.value)))}
            inputMode="numeric"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">
            Monthly top-up ({currency})
          </label>
          <input
            value={topUpInput}
            onChange={(e) => setTopUpInput(addCommas(stripToDigits(e.target.value)))}
            inputMode="numeric"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">Years</label>
          <input
            value={yearsInput}
            onChange={(e) => setYearsInput(e.target.value)}
            inputMode="numeric"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">
            Annual interest rate (%)
          </label>
          <input
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            inputMode="decimal"
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 rounded-2xl border border-stone-200 dark:border-stone-700/50 overflow-hidden">
        {[
          { label: "Total deposited", value: fmt(totalDeposits), highlight: false },
          { label: "Estimated interest earned", value: isFinite(profit) ? fmt(profit) : "N/A", highlight: false },
          {
            label: `Estimated balance after ${years} yr${years !== 1 ? "s" : ""}`,
            value: isFinite(result.finalBalance) ? fmt(result.finalBalance) : "∞ (rate too high)",
            highlight: true,
          },
        ].map((row) => (
          <div
            key={row.label}
            className={`flex items-baseline justify-between gap-4 px-4 py-3 border-b border-stone-100 last:border-b-0 dark:border-stone-700/30 ${
              row.highlight ? "bg-teal-50 dark:bg-teal-900/20" : ""
            }`}
          >
            <span className="text-xs text-stone-500 dark:text-stone-400 shrink-0">{row.label}</span>
            <span
              className={`text-sm font-bold text-right break-all min-w-0 ${
                row.highlight ? "text-teal-800 dark:text-teal-300" : "text-stone-900 dark:text-stone-50"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Yearly breakdown */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">Yearly breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Year", "Start balance", "Monthly adds", "Interest earned", "Year-end balance"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.yearRows.map((r) => (
              <tr key={r.year} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{r.year}</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{fmt(r.startBalance)}</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{fmt(r.totalAdded)}</td>
                <td className="px-3 py-2 text-teal-700 dark:text-teal-400 font-medium">{fmt(r.totalInterest)}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(r.yearEndBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly breakdown */}
      {hasMonthRows && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Monthly breakdown, Year</h3>
            <input
              value={viewYearInput}
              onChange={(e) => setViewYearInput(e.target.value)}
              inputMode="numeric"
              className="w-16 rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-sm text-center text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-300/50 dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50"
            />
          </div>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700/50">
                  {["Month", "Added", "Interest", "End balance"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                      No monthly data for this year.
                    </td>
                  </tr>
                ) : (
                  monthRows.map((r) => (
                    <tr key={r.month} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                      <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{r.month}</td>
                      <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{fmt(monthlyTopUp)}</td>
                      <td className="px-3 py-2 text-teal-700 dark:text-teal-400 font-medium">{fmt(r.interest)}</td>
                      <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(r.endBalance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
