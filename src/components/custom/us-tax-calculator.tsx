"use client";

import { addCommas, stripToDigits } from "@/lib/utils";
import React, { useMemo, useState } from "react";

type FilingStatus = "single" | "mfj" | "hoh";
type IncomeMode = "annual" | "monthly";

interface Bracket { limit: number; rate: number }

// ── Federal 2024 ────────────────────────────────────────────────────────
const FEDERAL: Record<FilingStatus, Bracket[]> = {
  single: [
    { limit: 11_600, rate: 0.10 },
    { limit: 47_150, rate: 0.12 },
    { limit: 100_525, rate: 0.22 },
    { limit: 191_950, rate: 0.24 },
    { limit: 243_725, rate: 0.32 },
    { limit: 609_350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  mfj: [
    { limit: 23_200, rate: 0.10 },
    { limit: 94_300, rate: 0.12 },
    { limit: 201_050, rate: 0.22 },
    { limit: 383_900, rate: 0.24 },
    { limit: 487_450, rate: 0.32 },
    { limit: 731_200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  hoh: [
    { limit: 16_550, rate: 0.10 },
    { limit: 63_100, rate: 0.12 },
    { limit: 100_500, rate: 0.22 },
    { limit: 191_950, rate: 0.24 },
    { limit: 243_700, rate: 0.32 },
    { limit: 609_350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
};

const FEDERAL_STD_DED: Record<FilingStatus, number> = {
  single: 14_600,
  mfj: 29_200,
  hoh: 21_900,
};

// ── FICA 2024 ────────────────────────────────────────────────────────────
const SS_RATE = 0.062;
const SS_WAGE_BASE = 168_600;
const MEDICARE_RATE = 0.0145;
const ADD_MEDICARE_RATE = 0.009; // on wages > threshold
const ADD_MEDICARE_THRESHOLD: Record<FilingStatus, number> = { single: 200_000, mfj: 250_000, hoh: 200_000 };

// ── State data ───────────────────────────────────────────────────────────
interface StateData {
  name: string;
  noTax?: boolean;
  flatRate?: number;
  brackets?: { single: Bracket[]; mfj?: Bracket[]; hoh?: Bracket[] };
  stdDed?: Partial<Record<FilingStatus, number>>;
  personalExemption?: Partial<Record<FilingStatus, number>>;
  notes?: string;
}

const STATES: Record<string, StateData> = {
  AL: {
    name: "Alabama",
    brackets: {
      single: [{ limit: 500, rate: 0.02 }, { limit: 3_000, rate: 0.04 }, { limit: Infinity, rate: 0.05 }],
      mfj: [{ limit: 1_000, rate: 0.02 }, { limit: 6_000, rate: 0.04 }, { limit: Infinity, rate: 0.05 }],
    },
    stdDed: { single: 2_500, mfj: 7_500 },
    personalExemption: { single: 1_500, mfj: 3_000 },
  },
  AK: { name: "Alaska", noTax: true },
  AZ: { name: "Arizona", flatRate: 0.025 },
  AR: {
    name: "Arkansas",
    brackets: {
      single: [
        { limit: 4_999, rate: 0 }, { limit: 9_999, rate: 0.02 }, { limit: 14_999, rate: 0.03 },
        { limit: 24_299, rate: 0.034 }, { limit: 84_500, rate: 0.039 }, { limit: Infinity, rate: 0.044 },
      ],
    },
    stdDed: { single: 2_340, mfj: 4_680 },
  },
  CA: {
    name: "California",
    brackets: {
      single: [
        { limit: 10_412, rate: 0.01 }, { limit: 24_684, rate: 0.02 }, { limit: 38_959, rate: 0.04 },
        { limit: 54_081, rate: 0.06 }, { limit: 68_350, rate: 0.08 }, { limit: 349_137, rate: 0.093 },
        { limit: 418_961, rate: 0.103 }, { limit: 698_274, rate: 0.113 }, { limit: 1_000_000, rate: 0.123 },
        { limit: Infinity, rate: 0.133 },
      ],
      mfj: [
        { limit: 20_824, rate: 0.01 }, { limit: 49_368, rate: 0.02 }, { limit: 77_918, rate: 0.04 },
        { limit: 108_162, rate: 0.06 }, { limit: 136_700, rate: 0.08 }, { limit: 698_274, rate: 0.093 },
        { limit: 837_922, rate: 0.103 }, { limit: 1_000_000, rate: 0.113 }, { limit: 1_396_548, rate: 0.123 },
        { limit: Infinity, rate: 0.133 },
      ],
    },
    stdDed: { single: 5_202, mfj: 10_404 },
  },
  CO: { name: "Colorado", flatRate: 0.044, notes: "Flat 4.4%" },
  CT: {
    name: "Connecticut",
    brackets: {
      single: [
        { limit: 10_000, rate: 0.03 }, { limit: 50_000, rate: 0.05 }, { limit: 100_000, rate: 0.055 },
        { limit: 200_000, rate: 0.06 }, { limit: 250_000, rate: 0.065 }, { limit: 500_000, rate: 0.069 },
        { limit: Infinity, rate: 0.0699 },
      ],
      mfj: [
        { limit: 20_000, rate: 0.03 }, { limit: 100_000, rate: 0.05 }, { limit: 200_000, rate: 0.055 },
        { limit: 400_000, rate: 0.06 }, { limit: 500_000, rate: 0.065 }, { limit: 1_000_000, rate: 0.069 },
        { limit: Infinity, rate: 0.0699 },
      ],
    },
    personalExemption: { single: 15_000, mfj: 24_000 },
  },
  DE: {
    name: "Delaware",
    brackets: {
      single: [
        { limit: 2_000, rate: 0 }, { limit: 5_000, rate: 0.022 }, { limit: 10_000, rate: 0.039 },
        { limit: 20_000, rate: 0.048 }, { limit: 25_000, rate: 0.052 }, { limit: 60_000, rate: 0.0555 },
        { limit: Infinity, rate: 0.066 },
      ],
    },
    stdDed: { single: 3_250, mfj: 6_500 },
    personalExemption: { single: 110, mfj: 220 },
  },
  FL: { name: "Florida", noTax: true },
  GA: { name: "Georgia", flatRate: 0.0549, notes: "Flat 5.49%" },
  HI: {
    name: "Hawaii",
    brackets: {
      single: [
        { limit: 2_400, rate: 0.014 }, { limit: 4_800, rate: 0.032 }, { limit: 9_600, rate: 0.055 },
        { limit: 14_400, rate: 0.064 }, { limit: 19_200, rate: 0.068 }, { limit: 24_000, rate: 0.072 },
        { limit: 36_000, rate: 0.076 }, { limit: 48_000, rate: 0.079 }, { limit: 150_000, rate: 0.0825 },
        { limit: 175_000, rate: 0.09 }, { limit: 200_000, rate: 0.10 }, { limit: Infinity, rate: 0.11 },
      ],
      mfj: [
        { limit: 4_800, rate: 0.014 }, { limit: 9_600, rate: 0.032 }, { limit: 19_200, rate: 0.055 },
        { limit: 28_800, rate: 0.064 }, { limit: 38_400, rate: 0.068 }, { limit: 48_000, rate: 0.072 },
        { limit: 72_000, rate: 0.076 }, { limit: 96_000, rate: 0.079 }, { limit: 300_000, rate: 0.0825 },
        { limit: 350_000, rate: 0.09 }, { limit: 400_000, rate: 0.10 }, { limit: Infinity, rate: 0.11 },
      ],
    },
    stdDed: { single: 2_200, mfj: 4_400 },
  },
  ID: { name: "Idaho", flatRate: 0.058 },
  IL: { name: "Illinois", flatRate: 0.0495 },
  IN: { name: "Indiana", flatRate: 0.0315, notes: "Plus county tax (not included)" },
  IA: {
    name: "Iowa",
    brackets: {
      single: [
        { limit: 6_000, rate: 0.044 }, { limit: 30_000, rate: 0.0482 }, { limit: Infinity, rate: 0.057 },
      ],
    },
  },
  KS: {
    name: "Kansas",
    brackets: {
      single: [{ limit: 15_000, rate: 0.031 }, { limit: 30_000, rate: 0.0525 }, { limit: Infinity, rate: 0.057 }],
      mfj: [{ limit: 30_000, rate: 0.031 }, { limit: 60_000, rate: 0.0525 }, { limit: Infinity, rate: 0.057 }],
    },
    stdDed: { single: 3_500, mfj: 8_000 },
  },
  KY: { name: "Kentucky", flatRate: 0.04 },
  LA: {
    name: "Louisiana",
    brackets: {
      single: [{ limit: 12_500, rate: 0.0185 }, { limit: 50_000, rate: 0.035 }, { limit: Infinity, rate: 0.0425 }],
      mfj: [{ limit: 25_000, rate: 0.0185 }, { limit: 100_000, rate: 0.035 }, { limit: Infinity, rate: 0.0425 }],
    },
    stdDed: { single: 4_500, mfj: 9_000 },
    personalExemption: { single: 4_500, mfj: 9_000 },
  },
  ME: {
    name: "Maine",
    brackets: {
      single: [{ limit: 26_050, rate: 0.058 }, { limit: 61_600, rate: 0.0675 }, { limit: Infinity, rate: 0.0715 }],
      mfj: [{ limit: 52_100, rate: 0.058 }, { limit: 123_200, rate: 0.0675 }, { limit: Infinity, rate: 0.0715 }],
    },
  },
  MD: {
    name: "Maryland",
    brackets: {
      single: [
        { limit: 1_000, rate: 0.02 }, { limit: 2_000, rate: 0.03 }, { limit: 3_000, rate: 0.04 },
        { limit: 100_000, rate: 0.0475 }, { limit: 125_000, rate: 0.05 }, { limit: 150_000, rate: 0.0525 },
        { limit: 250_000, rate: 0.055 }, { limit: Infinity, rate: 0.0575 },
      ],
      mfj: [
        { limit: 1_000, rate: 0.02 }, { limit: 2_000, rate: 0.03 }, { limit: 3_000, rate: 0.04 },
        { limit: 150_000, rate: 0.0475 }, { limit: 175_000, rate: 0.05 }, { limit: 225_000, rate: 0.0525 },
        { limit: 300_000, rate: 0.055 }, { limit: Infinity, rate: 0.0575 },
      ],
    },
    notes: "County/city taxes (avg ~2.9%) not included",
  },
  MA: { name: "Massachusetts", flatRate: 0.05, notes: "Surtax of 4% on income >$1M not included" },
  MI: { name: "Michigan", flatRate: 0.0425, notes: "Plus city taxes in some areas" },
  MN: {
    name: "Minnesota",
    brackets: {
      single: [
        { limit: 30_070, rate: 0.0535 }, { limit: 98_760, rate: 0.068 },
        { limit: 183_340, rate: 0.0785 }, { limit: Infinity, rate: 0.0985 },
      ],
      mfj: [
        { limit: 43_950, rate: 0.0535 }, { limit: 174_610, rate: 0.068 },
        { limit: 304_970, rate: 0.0785 }, { limit: Infinity, rate: 0.0985 },
      ],
    },
  },
  MS: {
    name: "Mississippi",
    brackets: {
      single: [{ limit: 10_000, rate: 0 }, { limit: Infinity, rate: 0.047 }],
    },
  },
  MO: {
    name: "Missouri",
    brackets: {
      single: [
        { limit: 1_207, rate: 0 }, { limit: 2_414, rate: 0.02 }, { limit: 3_621, rate: 0.025 },
        { limit: 4_828, rate: 0.03 }, { limit: 6_035, rate: 0.035 }, { limit: 7_242, rate: 0.04 },
        { limit: 8_449, rate: 0.045 }, { limit: Infinity, rate: 0.047 },
      ],
    },
    stdDed: { single: 14_600, mfj: 29_200 }, // Missouri uses federal std deduction
  },
  MT: {
    name: "Montana",
    brackets: {
      single: [
        { limit: 3_600, rate: 0.01 }, { limit: 6_300, rate: 0.02 }, { limit: 9_700, rate: 0.03 },
        { limit: 13_000, rate: 0.04 }, { limit: 17_000, rate: 0.05 }, { limit: 21_700, rate: 0.06 },
        { limit: Infinity, rate: 0.0675 },
      ],
    },
    stdDed: { single: 5_540, mfj: 11_080 },
  },
  NE: {
    name: "Nebraska",
    brackets: {
      single: [
        { limit: 3_700, rate: 0.0246 }, { limit: 22_170, rate: 0.0351 },
        { limit: 35_730, rate: 0.0501 }, { limit: Infinity, rate: 0.0584 },
      ],
      mfj: [
        { limit: 7_390, rate: 0.0246 }, { limit: 44_350, rate: 0.0351 },
        { limit: 71_470, rate: 0.0501 }, { limit: Infinity, rate: 0.0584 },
      ],
    },
  },
  NV: { name: "Nevada", noTax: true },
  NH: { name: "New Hampshire", noTax: true, notes: "No tax on wage income (dividend/interest tax eliminated 2025)" },
  NJ: {
    name: "New Jersey",
    brackets: {
      single: [
        { limit: 20_000, rate: 0.014 }, { limit: 35_000, rate: 0.0175 }, { limit: 40_000, rate: 0.035 },
        { limit: 75_000, rate: 0.05525 }, { limit: 500_000, rate: 0.0637 },
        { limit: 1_000_000, rate: 0.0897 }, { limit: Infinity, rate: 0.1075 },
      ],
      mfj: [
        { limit: 20_000, rate: 0.014 }, { limit: 50_000, rate: 0.0175 }, { limit: 70_000, rate: 0.0245 },
        { limit: 80_000, rate: 0.035 }, { limit: 150_000, rate: 0.05525 }, { limit: 500_000, rate: 0.0637 },
        { limit: 1_000_000, rate: 0.0897 }, { limit: Infinity, rate: 0.1075 },
      ],
    },
  },
  NM: {
    name: "New Mexico",
    brackets: {
      single: [
        { limit: 5_500, rate: 0.017 }, { limit: 11_000, rate: 0.032 }, { limit: 16_000, rate: 0.047 },
        { limit: 210_000, rate: 0.049 }, { limit: Infinity, rate: 0.059 },
      ],
      mfj: [
        { limit: 8_000, rate: 0.017 }, { limit: 16_000, rate: 0.032 }, { limit: 24_000, rate: 0.047 },
        { limit: 315_000, rate: 0.049 }, { limit: Infinity, rate: 0.059 },
      ],
    },
  },
  NY: {
    name: "New York",
    brackets: {
      single: [
        { limit: 8_500, rate: 0.04 }, { limit: 11_700, rate: 0.045 }, { limit: 13_900, rate: 0.0525 },
        { limit: 80_650, rate: 0.0585 }, { limit: 215_400, rate: 0.0625 }, { limit: 1_077_550, rate: 0.0685 },
        { limit: 5_000_000, rate: 0.0965 }, { limit: 25_000_000, rate: 0.103 }, { limit: Infinity, rate: 0.109 },
      ],
      mfj: [
        { limit: 17_150, rate: 0.04 }, { limit: 23_600, rate: 0.045 }, { limit: 27_900, rate: 0.0525 },
        { limit: 161_550, rate: 0.0585 }, { limit: 323_200, rate: 0.0625 }, { limit: 2_155_350, rate: 0.0685 },
        { limit: 5_000_000, rate: 0.0965 }, { limit: 25_000_000, rate: 0.103 }, { limit: Infinity, rate: 0.109 },
      ],
    },
    stdDed: { single: 8_000, mfj: 16_050 },
    notes: "NYC / Yonkers city taxes not included",
  },
  NC: { name: "North Carolina", flatRate: 0.045 },
  ND: {
    name: "North Dakota",
    brackets: {
      single: [
        { limit: 44_725, rate: 0.011 }, { limit: 225_975, rate: 0.0204 }, { limit: Infinity, rate: 0.0227 },
      ],
      mfj: [
        { limit: 74_750, rate: 0.011 }, { limit: 275_100, rate: 0.0204 }, { limit: Infinity, rate: 0.0227 },
      ],
    },
  },
  OH: {
    name: "Ohio",
    brackets: {
      single: [
        { limit: 26_050, rate: 0 }, { limit: 100_000, rate: 0.02765 },
        { limit: 115_300, rate: 0.03226 }, { limit: 500_000, rate: 0.03688 }, { limit: Infinity, rate: 0.0399 },
      ],
    },
    notes: "Municipal taxes not included",
  },
  OK: {
    name: "Oklahoma",
    brackets: {
      single: [
        { limit: 1_000, rate: 0.0025 }, { limit: 2_500, rate: 0.0075 }, { limit: 3_750, rate: 0.0175 },
        { limit: 4_900, rate: 0.0275 }, { limit: 7_200, rate: 0.0375 }, { limit: Infinity, rate: 0.0475 },
      ],
      mfj: [
        { limit: 2_000, rate: 0.0025 }, { limit: 5_000, rate: 0.0075 }, { limit: 7_500, rate: 0.0175 },
        { limit: 9_800, rate: 0.0275 }, { limit: 12_200, rate: 0.0375 }, { limit: Infinity, rate: 0.0475 },
      ],
    },
    stdDed: { single: 6_350, mfj: 12_700 },
  },
  OR: {
    name: "Oregon",
    brackets: {
      single: [
        { limit: 18_400, rate: 0.0475 }, { limit: 46_200, rate: 0.0675 },
        { limit: 250_000, rate: 0.0875 }, { limit: Infinity, rate: 0.099 },
      ],
      mfj: [
        { limit: 36_800, rate: 0.0475 }, { limit: 92_400, rate: 0.0675 },
        { limit: 500_000, rate: 0.0875 }, { limit: Infinity, rate: 0.099 },
      ],
    },
    stdDed: { single: 2_420, mfj: 4_840 },
  },
  PA: { name: "Pennsylvania", flatRate: 0.0307, notes: "Local Earned Income Tax not included" },
  RI: {
    name: "Rhode Island",
    brackets: {
      single: [
        { limit: 73_450, rate: 0.0375 }, { limit: 166_950, rate: 0.0475 }, { limit: Infinity, rate: 0.0599 },
      ],
      mfj: [
        { limit: 73_450, rate: 0.0375 }, { limit: 166_950, rate: 0.0475 }, { limit: Infinity, rate: 0.0599 },
      ],
    },
  },
  SC: {
    name: "South Carolina",
    brackets: {
      single: [
        { limit: 3_200, rate: 0 }, { limit: 6_410, rate: 0.03 }, { limit: 9_620, rate: 0.04 },
        { limit: 12_820, rate: 0.05 }, { limit: 16_040, rate: 0.06 }, { limit: Infinity, rate: 0.064 },
      ],
    },
  },
  SD: { name: "South Dakota", noTax: true },
  TN: { name: "Tennessee", noTax: true, notes: "No tax on wage income" },
  TX: { name: "Texas", noTax: true },
  UT: { name: "Utah", flatRate: 0.0465 },
  VT: {
    name: "Vermont",
    brackets: {
      single: [
        { limit: 45_400, rate: 0.0335 }, { limit: 110_050, rate: 0.066 },
        { limit: 229_550, rate: 0.076 }, { limit: Infinity, rate: 0.0875 },
      ],
      mfj: [
        { limit: 75_800, rate: 0.0335 }, { limit: 183_400, rate: 0.066 },
        { limit: 279_450, rate: 0.076 }, { limit: Infinity, rate: 0.0875 },
      ],
    },
  },
  VA: {
    name: "Virginia",
    brackets: {
      single: [
        { limit: 3_000, rate: 0.02 }, { limit: 5_000, rate: 0.03 },
        { limit: 17_000, rate: 0.05 }, { limit: Infinity, rate: 0.0575 },
      ],
    },
    stdDed: { single: 8_000, mfj: 16_000 },
    personalExemption: { single: 930, mfj: 1_860 },
  },
  WA: { name: "Washington", noTax: true, notes: "No wage income tax (capital gains tax applies separately)" },
  WV: {
    name: "West Virginia",
    brackets: {
      single: [
        { limit: 10_000, rate: 0.03 }, { limit: 25_000, rate: 0.04 }, { limit: 40_000, rate: 0.045 },
        { limit: 60_000, rate: 0.06 }, { limit: Infinity, rate: 0.065 },
      ],
    },
  },
  WI: {
    name: "Wisconsin",
    brackets: {
      single: [
        { limit: 13_810, rate: 0.0354 }, { limit: 27_630, rate: 0.0465 },
        { limit: 304_170, rate: 0.053 }, { limit: Infinity, rate: 0.0765 },
      ],
      mfj: [
        { limit: 18_420, rate: 0.0354 }, { limit: 36_840, rate: 0.0465 },
        { limit: 405_550, rate: 0.053 }, { limit: Infinity, rate: 0.0765 },
      ],
    },
    stdDed: { single: 12_110, mfj: 22_210 },
  },
  WY: { name: "Wyoming", noTax: true },
  DC: {
    name: "District of Columbia",
    brackets: {
      single: [
        { limit: 10_000, rate: 0.04 }, { limit: 40_000, rate: 0.06 }, { limit: 60_000, rate: 0.065 },
        { limit: 250_000, rate: 0.085 }, { limit: 500_000, rate: 0.0925 },
        { limit: 1_000_000, rate: 0.0975 }, { limit: Infinity, rate: 0.1075 },
      ],
    },
  },
};

const STATE_LIST = Object.entries(STATES)
  .map(([code, s]) => ({ code, name: s.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ── Calculation helpers ──────────────────────────────────────────────────

function applyBrackets(taxableIncome: number, brackets: Bracket[]) {
  let tax = 0;
  let prev = 0;
  const bands: { from: number; to: number; rate: number; taxable: number; tax: number }[] = [];

  for (const b of brackets) {
    if (taxableIncome <= prev) break;
    const top = Math.min(taxableIncome, b.limit);
    const amt = top - prev;
    const t = amt * b.rate;
    if (amt > 0) bands.push({ from: prev, to: top, rate: b.rate, taxable: amt, tax: t });
    tax += t;
    prev = b.limit;
  }

  return { tax, bands };
}

function calcFederal(income: number, status: FilingStatus) {
  const stdDed = FEDERAL_STD_DED[status];
  const taxable = Math.max(0, income - stdDed);
  return { ...applyBrackets(taxable, FEDERAL[status]), stdDed, taxable };
}

function calcState(income: number, status: FilingStatus, stateCode: string) {
  const state = STATES[stateCode];
  if (!state || state.noTax) return { tax: 0, bands: [], noTax: true };
  if (state.flatRate !== undefined) {
    const stdDed = state.stdDed?.[status] ?? 0;
    const exempt = state.personalExemption?.[status] ?? 0;
    const taxable = Math.max(0, income - stdDed - exempt);
    return { tax: taxable * state.flatRate, bands: [], flatRate: state.flatRate, taxable };
  }
  const brackets = state.brackets?.[status] ?? state.brackets?.single ?? [];
  const stdDed = state.stdDed?.[status] ?? 0;
  const exempt = state.personalExemption?.[status] ?? 0;
  const taxable = Math.max(0, income - stdDed - exempt);
  const { tax, bands } = applyBrackets(taxable, brackets);
  return { tax, bands, taxable, stdDed, exempt };
}

function calcFICA(income: number, status: FilingStatus) {
  const ss = Math.min(income, SS_WAGE_BASE) * SS_RATE;
  const medicare = income * MEDICARE_RATE;
  const addMedicareThreshold = ADD_MEDICARE_THRESHOLD[status];
  const addMedicare = Math.max(0, income - addMedicareThreshold) * ADD_MEDICARE_RATE;
  return { ss, medicare, addMedicare, total: ss + medicare + addMedicare };
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

export default function USTaxCalculator() {
  const [stateCode, setStateCode] = useState("CA");
  const [status, setStatus] = useState<FilingStatus>("single");
  const [mode, setMode] = useState<IncomeMode>("annual");
  const [incomeInput, setIncomeInput] = useState("75,000");

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

  const digits = useMemo(() => stripToDigits(incomeInput), [incomeInput]);
  const entered = useMemo(() => (digits ? Number(digits) : 0), [digits]);
  const annualIncome = useMemo(() => (mode === "monthly" ? entered * 12 : entered), [entered, mode]);

  const federal = useMemo(() => calcFederal(annualIncome, status), [annualIncome, status]);
  const state = useMemo(() => calcState(annualIncome, status, stateCode), [annualIncome, status, stateCode]);
  const fica = useMemo(() => calcFICA(annualIncome, status), [annualIncome, status]);

  const totalTax = federal.tax + state.tax;
  const totalDeductions = totalTax + fica.total;
  const netAnnual = annualIncome - totalDeductions;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  const effectiveTotal = annualIncome > 0 ? (totalDeductions / annualIncome) * 100 : 0;

  const stateInfo = STATES[stateCode];
  const radioBase = "flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer";
  const radioAccent = "accent-teal-600 dark:accent-teal-400";

  const statusLabels: Record<FilingStatus, string> = {
    single: "Single",
    mfj: "Married Filing Jointly",
    hoh: "Head of Household",
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        US Income Tax Calculator (2024)
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Federal income tax (with standard deduction), state income tax, and FICA (Social Security +
        Medicare). Itemized deductions, AMT, and local taxes are not included.
      </p>

      {/* Filing status */}
      <div className="mt-5">
        <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Filing status</div>
        <div className="mt-2 flex flex-wrap gap-4">
          {(Object.keys(statusLabels) as FilingStatus[]).map((s) => (
            <label key={s} className={radioBase}>
              <input type="radio" className={radioAccent} checked={status === s} onChange={() => setStatus(s)} />
              {statusLabels[s]}
            </label>
          ))}
        </div>
      </div>

      {/* State */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-stone-900 dark:text-stone-50">State</label>
        <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={SELECT_CLS}>
          {STATE_LIST.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
        {stateInfo?.notes && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{stateInfo.notes}</p>
        )}
        {stateInfo?.noTax && (
          <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
            {stateCode} has no state income tax on wages.
          </p>
        )}
      </div>

      {/* Income mode */}
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
        {mode === "monthly" ? "Monthly gross income (USD)" : "Annual gross income (USD)"}
      </label>
      <input
        value={incomeInput}
        onChange={(e) => setIncomeInput(addCommas(stripToDigits(e.target.value)))}
        inputMode="numeric"
        placeholder="e.g. 75,000"
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
              { label: "Federal income tax", annual: federal.tax, monthly: federal.tax / 12 },
              {
                label: `${stateInfo?.name ?? stateCode} state tax`,
                annual: stateInfo?.noTax ? null : state.tax,
                monthly: stateInfo?.noTax ? null : state.tax / 12,
              },
              { label: "Social Security (6.2%)", annual: fica.ss, monthly: fica.ss / 12 },
              { label: "Medicare (1.45%+)", annual: fica.medicare + fica.addMedicare, monthly: (fica.medicare + fica.addMedicare) / 12 },
              { label: "Total deductions", annual: totalDeductions, monthly: totalDeductions / 12, subtotal: true },
            ].map((row) => (
              <tr
                key={row.label}
                className={`border-b border-stone-100 dark:border-stone-700/30 ${
                  row.subtotal ? "bg-stone-50 dark:bg-stone-800/30 font-medium" : ""
                }`}
              >
                <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">{row.label}</td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">
                  {row.annual === null ? "N/A" : fmt(row.annual)}
                </td>
                <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300">
                  {row.monthly === null ? "N/A" : fmt(row.monthly)}
                </td>
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
        <span>Combined effective rate (incl. FICA): <strong className="text-stone-800 dark:text-stone-200">{effectiveTotal.toFixed(2)}%</strong></span>
      </div>

      {/* Federal breakdown */}
      <h3 className="mt-6 text-sm font-semibold text-stone-900 dark:text-stone-50">
        Federal tax breakdown
        <span className="ml-2 text-xs font-normal text-stone-500">
          (Standard deduction: {fmt(federal.stdDed)} applied)
        </span>
      </h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Rate", "Taxable range", "Amount in bracket", "Tax"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {federal.bands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                  Income is below the standard deduction. No federal income tax due.
                </td>
              </tr>
            )}
            {federal.bands.map((b, i) => (
              <tr key={i} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{(b.rate * 100).toFixed(0)}%</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                  {fmt(b.from)} – {fmt(b.to)}
                </td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{fmt(b.taxable)}</td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(b.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* State breakdown */}
      {!stateInfo?.noTax && (
        <>
          <h3 className="mt-5 text-sm font-semibold text-stone-900 dark:text-stone-50">
            {stateInfo?.name} state tax breakdown
          </h3>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
            {stateInfo?.flatRate !== undefined ? (
              <div className="px-4 py-3 text-sm text-stone-700 dark:text-stone-300">
                Flat rate of{" "}
                <span className="font-semibold">{(stateInfo.flatRate * 100).toFixed(2)}%</span>
                {state.taxable !== undefined && (
                  <> on taxable income of <span className="font-semibold">{fmt(state.taxable)}</span></>
                )}
                {" = "}
                <span className="font-semibold text-stone-900 dark:text-stone-50">{fmt(state.tax)}</span>
              </div>
            ) : (
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700/50">
                    {["Rate", "Taxable range", "Amount in bracket", "Tax"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.bands?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-xs text-stone-400">
                        No state tax due at this income level.
                      </td>
                    </tr>
                  )}
                  {state.bands?.map((b, i) => (
                    <tr key={i} className="border-b border-stone-100 last:border-b-0 dark:border-stone-700/30">
                      <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{(b.rate * 100).toFixed(3)}%</td>
                      <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {fmt(b.from)} – {fmt(b.to)}
                      </td>
                      <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">{fmt(b.taxable)}</td>
                      <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(b.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* FICA breakdown */}
      <h3 className="mt-5 text-sm font-semibold text-stone-900 dark:text-stone-50">FICA breakdown</h3>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/50">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/50">
              {["Component", "Rate", "Applies to", "Amount"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100 dark:border-stone-700/30">
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300">Social Security</td>
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300">6.2%</td>
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                First {fmt(SS_WAGE_BASE)}
              </td>
              <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(fica.ss)}</td>
            </tr>
            <tr className="border-b border-stone-100 dark:border-stone-700/30">
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300">Medicare</td>
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300">1.45%</td>
              <td className="px-3 py-2 text-stone-700 dark:text-stone-300">All wages</td>
              <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(fica.medicare)}</td>
            </tr>
            {fica.addMedicare > 0 && (
              <tr className="border-b border-stone-100 dark:border-stone-700/30">
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">Add. Medicare</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">0.9%</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                  Above {fmt(ADD_MEDICARE_THRESHOLD[status])}
                </td>
                <td className="px-3 py-2 font-semibold text-stone-900 dark:text-stone-50">{fmt(fica.addMedicare)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
        Source: IRS 2024 tax tables. State rates are approximate and reflect 2024 rates to the best of
        available information. Local/city taxes, AMT, itemized deductions, tax credits, self-employment
        tax, and investment income are not included. Always verify with a tax professional.
      </p>
    </div>
  );
}
