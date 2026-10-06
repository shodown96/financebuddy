import type { ExtractedPeriod, ExtractedStatement, UnitScale } from "@/lib/validations/fundamentals";

// Pure calculations over figures extracted by the model. No I/O here so
// every number shown to the user is reproducible from the extracted data.

const SCALE: Record<UnitScale, number> = {
  units: 1,
  thousands: 1e3,
  millions: 1e6,
  billions: 1e9,
};

export type MetricKind = "money" | "ratio" | "perShare";
export type Direction = "improving" | "worsening" | "flat" | "n/a";

interface MetricDef {
  key: keyof DerivedPeriod["metrics"];
  label: string;
  kind: MetricKind;
  higherIsBetter: boolean;
}

export const METRICS: MetricDef[] = [
  { key: "revenue", label: "Revenue", kind: "money", higherIsBetter: true },
  { key: "grossProfit", label: "Gross profit", kind: "money", higherIsBetter: true },
  { key: "operatingIncome", label: "Operating profit", kind: "money", higherIsBetter: true },
  { key: "netIncome", label: "Net profit", kind: "money", higherIsBetter: true },
  { key: "eps", label: "EPS (basic)", kind: "perShare", higherIsBetter: true },
  { key: "grossMargin", label: "Gross margin", kind: "ratio", higherIsBetter: true },
  { key: "operatingMargin", label: "Operating margin", kind: "ratio", higherIsBetter: true },
  { key: "netMargin", label: "Net margin", kind: "ratio", higherIsBetter: true },
  { key: "roe", label: "Return on equity", kind: "ratio", higherIsBetter: true },
  { key: "totalDebt", label: "Total debt", kind: "money", higherIsBetter: false },
  { key: "netDebt", label: "Net debt", kind: "money", higherIsBetter: false },
  { key: "debtToEquity", label: "Debt to equity", kind: "ratio", higherIsBetter: false },
  { key: "totalLiabilities", label: "Total liabilities", kind: "money", higherIsBetter: false },
  { key: "totalEquity", label: "Shareholders' equity", kind: "money", higherIsBetter: true },
  { key: "cash", label: "Cash", kind: "money", higherIsBetter: true },
  { key: "operatingCashFlow", label: "Operating cash flow", kind: "money", higherIsBetter: true },
  { key: "freeCashFlow", label: "Free cash flow", kind: "money", higherIsBetter: true },
];

export interface EpsCheck {
  calculated: number | null;
  reported: number | null;
  // True when calculated and reported EPS differ by more than 5%
  mismatch: boolean;
}

export interface DerivedPeriod {
  label: string;
  endDate: string | null;
  eps: EpsCheck;
  metrics: {
    revenue: number | null;
    grossProfit: number | null;
    operatingIncome: number | null;
    netIncome: number | null;
    eps: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
    roe: number | null;
    totalDebt: number | null;
    netDebt: number | null;
    debtToEquity: number | null;
    totalLiabilities: number | null;
    totalEquity: number | null;
    cash: number | null;
    operatingCashFlow: number | null;
    freeCashFlow: number | null;
  };
}

export interface ComparisonRow {
  key: MetricDef["key"];
  label: string;
  kind: MetricKind;
  current: number | null;
  prior: number | null;
  // Percent change for money/perShare, percentage-point change for ratios
  change: number | null;
  direction: Direction;
}

export interface Comparison {
  currentLabel: string;
  priorLabel: string;
  rows: ComparisonRow[];
}

export interface FundamentalAnalysis {
  periods: DerivedPeriod[];
  comparisons: Comparison[];
}

const isNum = (n: number | null | undefined): n is number =>
  typeof n === "number" && Number.isFinite(n);

const div = (a: number | null, b: number | null) =>
  isNum(a) && isNum(b) && b !== 0 ? a / b : null;

const sub = (a: number | null, b: number | null) =>
  isNum(a) && isNum(b) ? a - b : null;

// Sum that treats missing parts as zero, but is null when every part is missing
const sumPresent = (...vals: (number | null)[]) =>
  vals.some(isNum) ? vals.reduce<number>((acc, v) => acc + (isNum(v) ? v : 0), 0) : null;

export function computeEps(
  p: ExtractedPeriod,
  moneyScale: number,
  shareScale: number,
): EpsCheck {
  const earnings = p.netIncomeAttributable ?? p.netIncome;
  const shares = p.weightedAvgSharesBasic;
  const calculated =
    isNum(earnings) && isNum(shares) && shares !== 0
      ? ((earnings - (p.preferredDividends ?? 0)) * moneyScale) / (shares * shareScale)
      : null;
  const reported = isNum(p.reportedEpsBasic) ? p.reportedEpsBasic : null;
  const mismatch =
    isNum(calculated) && isNum(reported) && reported !== 0
      ? Math.abs(calculated - reported) / Math.abs(reported) > 0.05
      : false;
  return { calculated, reported, mismatch };
}

export function derivePeriod(p: ExtractedPeriod, moneyScale: number, shareScale: number): DerivedPeriod {
  const m = (v: number | null) => (isNum(v) ? v * moneyScale : null);

  const revenue = m(p.revenue);
  const costOfRevenue = m(p.costOfRevenue);
  const grossProfit =
    m(p.grossProfit) ?? (isNum(costOfRevenue) ? sub(revenue, Math.abs(costOfRevenue)) : null);
  const operatingIncome = m(p.operatingIncome);
  const netIncome = m(p.netIncomeAttributable ?? p.netIncome);
  const totalEquity = m(p.totalEquity);
  const cash = m(p.cash);
  const totalDebt = sumPresent(m(p.shortTermDebt), m(p.longTermDebt));
  const operatingCashFlow = m(p.operatingCashFlow);
  const capex = m(p.capitalExpenditure);

  const eps = computeEps(p, moneyScale, shareScale);

  return {
    label: p.label,
    endDate: p.endDate,
    eps,
    metrics: {
      revenue,
      grossProfit,
      operatingIncome,
      netIncome,
      eps: eps.reported ?? eps.calculated,
      grossMargin: div(grossProfit, revenue),
      operatingMargin: div(operatingIncome, revenue),
      netMargin: div(netIncome, revenue),
      roe: div(netIncome, totalEquity),
      totalDebt,
      netDebt: sub(totalDebt, cash),
      debtToEquity: div(totalDebt, totalEquity),
      totalLiabilities: m(p.totalLiabilities),
      totalEquity,
      cash,
      operatingCashFlow,
      freeCashFlow: isNum(operatingCashFlow) && isNum(capex) ? operatingCashFlow - Math.abs(capex) : null,
    },
  };
}

// Changes smaller than these count as flat
const FLAT_PCT = 1;
const FLAT_PP = 0.5;

export function compareMetric(def: MetricDef, current: number | null, prior: number | null): ComparisonRow {
  let change: number | null = null;
  if (isNum(current) && isNum(prior)) {
    if (def.kind === "ratio") change = (current - prior) * 100;
    else if (prior !== 0) change = ((current - prior) / Math.abs(prior)) * 100;
  }

  let direction: Direction = "n/a";
  if (isNum(change)) {
    const threshold = def.kind === "ratio" ? FLAT_PP : FLAT_PCT;
    if (Math.abs(change) < threshold) direction = "flat";
    else direction = change > 0 === def.higherIsBetter ? "improving" : "worsening";
  }

  return { key: def.key, label: def.label, kind: def.kind, current, prior, change, direction };
}

export function comparePeriods(current: DerivedPeriod, prior: DerivedPeriod): Comparison {
  return {
    currentLabel: current.label,
    priorLabel: prior.label,
    rows: METRICS.map((def) => compareMetric(def, current.metrics[def.key], prior.metrics[def.key])),
  };
}

export function analyze(data: ExtractedStatement): FundamentalAnalysis {
  const moneyScale = SCALE[data.units] ?? 1;
  const shareScale = SCALE[data.shareUnits] ?? 1;

  // Most recent first. Fall back to document order when dates are missing.
  const sorted = [...data.periods].sort((a, b) =>
    a.endDate && b.endDate ? b.endDate.localeCompare(a.endDate) : 0,
  );
  const periods = sorted.map((p) => derivePeriod(p, moneyScale, shareScale));

  const comparisons: Comparison[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    comparisons.push(comparePeriods(periods[i], periods[i + 1]));
  }

  return { periods, comparisons };
}
