import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatString = (...args: any) => {
  let i = 1;
  const str = args[0];
  return str.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
}

export function stripToDigits(value: string) {
    return value.replace(/[^\d]/g, "");
}

export function addCommas(digitsOnly: string) {
    if (!digitsOnly) return "";
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function parseMoneyFromFormatted(input: string) {
    const digits = stripToDigits(input);
    const n = Number(digits);
    return Number.isFinite(n) ? n : 0;
}

export function parsePercent(input: string) {
    const cleaned = input.replace(/[%\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

export function formatNGN(value: number) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(value);
}

export function buildSchedule(params: {
    annualRatePct: number;
    monthlyDeposit: number;
    months: number;
}) {
    const { annualRatePct, monthlyDeposit, months } = params;

    const r = annualRatePct / 100 / 12;

    let balance = 0;
    let totalInterest = 0;

    const rows: Array<{
        month: number;
        deposit: number;
        interest: number;
        endBalance: number;
        totalDeposits: number;
        totalInterest: number;
    }> = [];

    for (let m = 1; m <= months; m++) {
        // deposit at start of month
        balance += monthlyDeposit;

        const interest = r === 0 ? 0 : balance * r;
        balance += interest;
        totalInterest += interest;

        rows.push({
            month: m,
            deposit: monthlyDeposit,
            interest,
            endBalance: balance,
            totalDeposits: monthlyDeposit * m,
            totalInterest,
        });
    }

    return {
        monthlyRate: r,
        finalBalance: balance,
        totalDeposits: monthlyDeposit * months,
        totalInterest,
        rows,
    };
}