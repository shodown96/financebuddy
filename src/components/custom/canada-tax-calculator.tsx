"use client";

import { addCommas, stripToDigits } from "@/lib/utils";
import React, { useMemo, useState } from "react";

type IncomeMode = "annual" | "monthly";

interface TaxBracket { limit: number; rate: number; label?: string }

interface Province {
  code: string;
  name: string;
  brackets: TaxBracket[];
  basicPersonalAmount: number;
  useQPP?: boolean; // Quebec uses QPP/QPIP instead of CPP/EI
}

// ── Federal 2024 ────────────────────────────────────────────────────────
const FEDERAL_BRACKETS: TaxBracket[] = [
  { limit: 55_867, rate: 0.15, label: "15%" },
  { limit: 111_733, rate: 0.205, label: "20.5%" },
  { limit: 154_906, rate: 0.26, label: "26%" },
  { limit: 220_000, rate: 0.29, label: "29%" },
  { limit: Infinity, rate: 0.33, label: "33%" },
];
const FEDERAL_BASIC_PERSONAL = 15_705;

// ── Provinces / Territories 2024 ────────────────────────────────────────
const PROVINCES: Province[] = [
  {
    code: "AB", name: "Alberta",
    basicPersonalAmount: 21_003,
    brackets: [
      { limit: 148_269, rate: 0.10 },
      { limit: 177_922, rate: 0.12 },
      { limit: 237_230, rate: 0.13 },
      { limit: 355_845, rate: 0.14 },
      { limit: Infinity, rate: 0.15 },
    ],
  },
  {
    code: "BC", name: "British Columbia",
    basicPersonalAmount: 11_981,
    brackets: [
      { limit: 45_654, rate: 0.0506 },
      { limit: 91_310, rate: 0.077 },
      { limit: 104_835, rate: 0.105 },
      { limit: 127_299, rate: 0.1229 },
      { limit: 172_602, rate: 0.147 },
      { limit: 240_716, rate: 0.168 },
      { limit: Infinity, rate: 0.205 },
    ],
  },
  {
    code: "MB", name: "Manitoba",
    basicPersonalAmount: 15_780,
    brackets: [
      { limit: 36_842, rate: 0.108 },
      { limit: 79_625, rate: 0.1275 },
      { limit: Infinity, rate: 0.174 },
    ],
  },
  {
    code: "NB", name: "New Brunswick",
    basicPersonalAmount: 12_458,
    brackets: [
      { limit: 47_715, rate: 0.094 },
      { limit: 95_431, rate: 0.14 },
      { limit: 176_756, rate: 0.16 },
      { limit: Infinity, rate: 0.195 },
    ],
  },
  {
    code: "NL", name: "Newfoundland & Labrador",
    basicPersonalAmount: 10_818,
    brackets: [
      { limit: 43_198, rate: 0.087 },
      { limit: 86_395, rate: 0.145 },
      { limit: 154_244, rate: 0.158 },
      { limit: 215_943, rate: 0.178 },
      { limit: 275_870, rate: 0.198 },
      { limit: 551_739, rate: 0.208 },
      { limit: Infinity, rate: 0.213 },
    ],
  },
  {
    code: "NT", name: "Northwest Territories",
    basicPersonalAmount: 16_593,
    brackets: [
      { limit: 50_597, rate: 0.059 },
      { limit: 101_198, rate: 0.086 },
      { limit: 164_525, rate: 0.122 },
      { limit: Infinity, rate: 0.1405 },
    ],
  },
  {
    code: "NS", name: "Nova Scotia",
    basicPersonalAmount: 8_481,
    brackets: [
      { limit: 29_590, rate: 0.0879 },
      { limit: 59_180, rate: 0.1495 },
      { limit: 93_000, rate: 0.1667 },
      { limit: 150_000, rate: 0.175 },
      { limit: Infinity, rate: 0.21 },
    ],
  },
  {
    code: "NU", name: "Nunavut",
    basicPersonalAmount: 17_925,
    brackets: [
      { limit: 53_268, rate: 0.04 },
      { limit: 106_537, rate: 0.07 },
      { limit: 173_205, rate: 0.09 },
      { limit: Infinity, rate: 0.115 },
    ],
  },
  {
    code: "ON", name: "Ontario",
    basicPersonalAmount: 11_865,
    brackets: [
      { limit: 51_446, rate: 0.0505 },
      { limit: 102_894, rate: 0.0915 },
      { limit: 150_000, rate: 0.1116 },
      { limit: 220_000, rate: 0.1216 },
      { limit: Infinity, rate: 0.1316 },
    ],
  },
  {
    code: "PE", name: "Prince Edward Island",
    basicPersonalAmount: 12_000,
    brackets: [
      { limit: 32_656, rate: 0.0965 },
      { limit: 64_313, rate: 0.1363 },
      { limit: 105_000, rate: 0.1665 },
      { limit: 140_000, rate: 0.18 },
      { limit: Infinity, rate: 0.1875 },
    ],
  },
  {
    code: "QC", name: "Quebec",
    basicPersonalAmount: 17_183,
    useQPP: true,
    brackets: [
      { limit: 51_780, rate: 0.14 },
      { limit: 103_545, rate: 0.19 },
      { limit: 126_000, rate: 0.24 },
      { limit: Infinity, rate: 0.2575 },
    ],
  },
  {
    code: "SK", name: "Saskatchewan",
    basicPersonalAmount: 17_661,
    brackets: [
      { limit: 49_720, rate: 0.105 },
      { limit: 142_058, rate: 0.125 },
      { limit: Infinity, rate: 0.145 },
    ],
  },
  {
    code: "YT", name: "Yukon",
    basicPersonalAmount: 15_705,
    brackets: [
      { limit: 55_867, rate: 0.064 },
      { limit: 111_733, rate: 0.09 },
      { limit: 154_906, rate: 0.109 },
      { limit: 500_000, rate: 0.128 },
      { limit: Infinity, rate: 0.15 },
    ],
  },
];

// ── CPP / EI 2024 ────────────────────────────────────────────────────────
const CPP_RATE = 0.0595;
const CPP_BASIC_EXEMPTION = 3_500;
const CPP_YMPE = 68_500; // year's maximum pensionable earnings
const CPP2_RATE = 0.04;
const CPP2_YAMPE = 73_200; // year's additional maximum pensionable earnings

const EI_RATE = 0.0166;
const EI_MAX_INSURABLE = 63_200;

// Quebec QPP/QPIP 2024 (approximate)
const QPP_RATE = 0.0640;
const QPP_YMPE = 68_500;
const QPIP_RATE = 0.00494;
const QPIP_MAX = 94_000;

type TaxBand = { label: string; from: number; to: number; rate: number; taxable: number; tax: number };

function calcProgressiveTax(income: number, brackets: TaxBracket[], personalAmount: number) {
  const taxable = Math.max(0, income - personalAmount);
  const credit = personalAmount * brackets[0].rate; // non-refundable basic personal credit

  let tax = 0;
  let prev = 0;
  const bands: TaxBand[] = [];

  for (const b of brackets) {
    if (taxable <= prev) break;
    const top = Math.min(taxable, b.limit - personalAmount);
    const amt = Math.max(0, top - prev);
    const t = amt * b.rate;
    bands.push({
      label: b.label ?? `${(b.rate * 100).toFixed(2)}%`,
      from: prev + personalAmount,
      to: top + personalAmount,
      rate: b.rate,
      taxable: amt,
      tax: t,
    });
    tax += t;
    prev = b.limit - personalAmount;
  }

  return { grossTax: tax, credit, netTax: Math.max(0, tax - credit), bands };
}

function calcCPP(income: number, isQC: boolean) {
  if (isQC) {
    const pensionable = Math.min(Math.max(0, income - CPP_BASIC_EXEMPTION), QPP_YMPE - CPP_BASIC_EXEMPTION);
    const qpp = pensionable * QPP_RATE;
    const qpip = Math.min(income, QPIP_MAX) * QPIP_RATE;
    return { label: "QPP + QPIP", total: qpp + qpip, note: "Quebec QPP + QPIP rates" };
  }
  const pensionable = Math.min(Math.max(0, income - CPP_BASIC_EXEMPTION), CPP_YMPE - CPP_BASIC_EXEMPTION);
  const cpp1 = pensionable * CPP_RATE;
  const cpp2Income = Math.max(0, Math.min(income, CPP2_YAMPE) - CPP_YMPE);
  const cpp2 = cpp2Income * CPP2_RATE;
  return { label: "CPP (incl. CPP2)", total: cpp1 + cpp2, note: "CPP1 + CPP2 employee contributions" };
}

function calcEI(income: number, isQC: boolean) {
  if (isQC) {
    const rate = 0.0132; // Quebec EI premium rate (lower, due to QPIP)
    const max = 63_200;
    return { label: "EI premiums", total: Math.min(income, max) * rate };
  }
  return { label: "EI premiums", total: Math.min(income, EI_MAX_INSURABLE) * EI_RATE };
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
  "w-full mt-2 rounded-xl border px-3 py-2.5 text-sm outline-none transition cursor-pointer " +
  "border-stone-200 bg-white text-stone-900 " +
  "focus:ring-2 focus:ring-teal-300/50 dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50";

export default function CanadaTaxCalculator() {
  const [provinceCode, setProvinceCode] = useState("ON");
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("80,000");

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(v);

  const province = useMemo(() => PROVINCES.find((p) => p.code === provinceCode)!, [provinceCode]);
  const digits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);
  const entered = useMemo(() => (digits ? Number(digits) : 0), [digits]);
  const annualIncome = useMemo(() => (mode === "monthly" ? entered * 12 : entered), [entered, mode]);

  const federal = useMemo(
    () => calcProgressiveTax(annualIncome, FEDERAL_BRACKETS, FEDERAL_BASIC_PERSONAL),
    [annualIncome]
  );

  const provincial = useMemo(
    () => calcProgressiveTax(annualIncome, province.brackets, province.basicPersonalAmount),
    [annualIncome, province]
  );

  const cpp = useMemo(() => calcCPP(annualIncome, province.useQPP ?? false), [annualIncome, province]);
  const ei = useMemo(() => calcEI(annualIncome, province.useQPP ?? false), [annualIncome, province]);

  const totalTax = federal.netTax + provincial.netTax;
  const totalDeductions = totalTax + cpp.total + ei.total;
  const netAnnual = annualIncome - totalDeductions;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  const effectiveTotal = annualIncome > 0 ? (totalDeductions / annualIncome) * 100 : 0;

  const radioBase = "flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer";
  const radioAccent = "accent-teal-600 dark:accent-teal-400";

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Canada Income Tax Calculator (2024)
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Federal + provincial income tax, CPP/QPP, and EI premiums. Based on individual (non-spousal)
        filing with the basic personal amount credit only.
      </p>

      {/* Province */}
      <div className="mt-5">
        <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">
          Province / Territory
        </label>
        <select value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} className={SELECT_CLS}>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
      </div>

      {/* Mode */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Income period</div>
        <div className="mt-2 flex gap-4">
          {(["annual", "monthly"] as IncomeMode[]).map((m) => (
            <label key={m} className={radioBase}>
              <input type="radio" className={radioAccent} checked={mode === m} onChange={() => setMode(m)} />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Income input */}
      <label className="mt-4 block text-sm font-semibold text-stone-900 dark:text-stone-50">
        {mode === "monthly" ? "Monthly gross income (CAD)" : "Annual gross income (CAD)"}
      </label>
      <input
        value={incomeInput}
        onChange={(e) => setIncomeInput(addCommas(stripToDigits(e.target.value)))}
        inputMode="numeric"
        placeholder="e.g. 80,000"
        className={INPUT_CLS}
      />
      <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
        Annual gross: <span className="font-semibold">{fmt(annualIncome)}</span>
      </p>

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
              { label: "Federal income tax", annual: federal.netTax, monthly: federal.netTax / 12 },
              { label: `${province.name} provincial tax`, annual: provincial.netTax, monthly: provincial.netTax / 12 },
              { label: cpp.label, annual: cpp.total, monthly: cpp.total / 12 },
              { label: ei.label, annual: ei.total, monthly: ei.total / 12 },
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
        <span>Effective income tax rate: <strong className="text-stone-800 dark:text-stone-200">{effectiveRate.toFixed(2)}%</strong></span>
        <span>Combined effective rate (incl. CPP/EI): <strong className="text-stone-800 dark:text-stone-200">{effectiveTotal.toFixed(2)}%</strong></span>
      </div>

      {/* Federal breakdown */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">Federal tax breakdown</h3>
      <BandTable bands={federal.bands} credit={federal.credit} fmt={fmt} />

      {/* Provincial breakdown */}
      <h3 className="mt-5 text-sm font-semibold text-stone-900 dark:text-stone-50">
        {province.name} provincial tax breakdown
      </h3>
      <BandTable bands={provincial.bands} credit={provincial.credit} fmt={fmt} />

      {/* CPP/EI note */}
      <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700/50 dark:bg-stone-800/30">
        <div className="text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2">
          CPP / EI summary ({province.useQPP ? "Quebec QPP + QPIP" : "Standard CPP + EI"})
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-stone-500 dark:text-stone-400">{cpp.label}:</span>{" "}
            <span className="font-semibold text-stone-900 dark:text-stone-50">{fmt(cpp.total)}</span>
          </div>
          <div>
            <span className="text-stone-500 dark:text-stone-400">{ei.label}:</span>{" "}
            <span className="font-semibold text-stone-900 dark:text-stone-50">{fmt(ei.total)}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
        Source: Canada Revenue Agency 2024 rates. Only the basic personal amount non-refundable credit
        is applied. RRSP contributions, spousal credits, provincial surtaxes, and other deductions
        are not included. Quebec residents are subject to QPP and QPIP instead of CPP and standard EI.
      </p>
    </div>
  );
}

function BandTable({ bands, credit, fmt }: { bands: TaxBand[]; credit: number; fmt: (v: number) => string }) {
  return (
    <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-700/50">
            {["Rate", "Income range", "Taxable", "Tax in band"].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bands.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                Enter income above the basic personal amount to see a breakdown.
              </td>
            </tr>
          )}
          {bands.map((b, i) => (
            <tr key={i} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{(b.rate * 100).toFixed(2)}%</td>
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                {fmt(b.from)} – {fmt(b.to)}
              </td>
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{fmt(b.taxable)}</td>
              <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">{fmt(b.tax)}</td>
            </tr>
          ))}
          {bands.length > 0 && (
            <tr className="bg-stone-50 dark:bg-stone-800/30">
              <td colSpan={3} className="px-3 py-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                Basic personal amount credit (non-refundable)
              </td>
              <td className="px-3 py-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
                −{fmt(credit)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
