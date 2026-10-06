import { z } from "zod";

// Every figure is nullable so the model reports "not in the document"
// instead of guessing. OpenAI strict structured outputs require every key
// to be present, so nothing here is optional.
const figure = z
  .number()
  .nullable()
  .describe("Exactly as printed, in the document's stated units. Negative for losses or outflows. Null if absent.");

export const PeriodSchema = z.object({
  label: z.string().describe('Column heading as printed, e.g. "FY2025", "Q2 2025", "Year ended 31 Dec 2024"'),
  endDate: z.string().nullable().describe("Period end date as YYYY-MM-DD if determinable"),
  months: z
    .number()
    .nullable()
    .describe("Length of the period in months: 3 for a quarter, 6 for a half year, 9, or 12 for a full year. Null if unclear."),
  revenue: figure,
  costOfRevenue: figure,
  grossProfit: figure,
  operatingIncome: figure,
  netIncome: figure,
  netIncomeAttributable: figure.describe("Profit attributable to owners/shareholders of the parent. Null if absent."),
  preferredDividends: figure,
  weightedAvgSharesBasic: figure.describe("Weighted average ordinary shares, basic. In the units stated for share counts."),
  weightedAvgSharesDiluted: figure,
  reportedEpsBasic: figure.describe("Basic EPS as printed, per share in the reporting currency (convert kobo/cents to main units)."),
  reportedEpsDiluted: figure,
  totalAssets: figure,
  totalLiabilities: figure,
  totalEquity: figure,
  cash: figure.describe("Cash and cash equivalents"),
  shortTermDebt: figure.describe("Borrowings due within one year, incl. current portion of long-term debt"),
  longTermDebt: figure.describe("Non-current borrowings"),
  operatingCashFlow: figure,
  capitalExpenditure: figure.describe("Purchase of property, plant and equipment, as a positive number"),
  dividendsPaid: figure.describe("Dividends paid, as a positive number"),
});

export const UNIT_SCALES = ["units", "thousands", "millions", "billions"] as const;

export const ExtractedStatementSchema = z.object({
  companyName: z.string().nullable(),
  ticker: z.string().nullable(),
  currency: z.string().nullable().describe("ISO code if possible, e.g. NGN, USD, GBP"),
  units: z.enum(UNIT_SCALES).describe("Scale of monetary figures, e.g. \"N'000\" means thousands"),
  shareUnits: z
    .enum(UNIT_SCALES)
    .describe("Scale of share counts as stated next to the share figures (e.g. \"shares in thousands\"). Often different from monetary units"),
  periods: z.array(PeriodSchema).describe("One entry per period column, most recent first"),
  notes: z.array(z.string()).describe("Caveats: restatements, unusual items, ambiguous figures, missing statements"),
});

export type ExtractedPeriod = z.infer<typeof PeriodSchema>;
export type ExtractedStatement = z.infer<typeof ExtractedStatementSchema>;
export type UnitScale = (typeof UNIT_SCALES)[number];

// Vercel rejects request bodies over ~4.5 MB
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export interface TextPage {
  file: string;
  page: number;
  text: string;
}

export const FundamentalsExplanationSchema = z.object({
  mood: z
    .enum(["healthy", "mixed", "struggling", "unclear"])
    .describe("Overall picture of the business from these results"),
  headline: z.string().describe("One plain-English sentence, at most 20 words, no jargon"),
  howItsDoing: z
    .string()
    .describe("2 to 3 short sentences: is it selling more or less than before, and is it keeping more or less of that as profit"),
  perShare: z
    .string()
    .nullable()
    .describe("1 to 2 sentences on what the company earned for each share and how that changed, e.g. \"Each share earned NGN 5.20, up from NGN 4.10\". Null if unknown."),
  debt: z
    .string()
    .nullable()
    .describe("1 to 2 sentences on whether borrowing went up or down and whether that looks comfortable. Null if unknown."),
  goodSigns: z.array(z.string()).describe("1 to 3 short plain-English positives"),
  watchOuts: z.array(z.string()).describe("1 to 3 short plain-English concerns"),
  thingsToKnow: z
    .array(z.string())
    .describe(
      "Plain-English versions of only those document notes that matter to an investor (one-off gains or losses, restatements, big write-offs). Skip notes about units, formatting or missing data. Empty if none.",
    ),
});

export type FundamentalsExplanation = z.infer<typeof FundamentalsExplanationSchema>;
