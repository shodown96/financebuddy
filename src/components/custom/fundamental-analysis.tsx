"use client";

import { useEffect, useRef, useState } from "react";
import { analyzeFundamentals } from "@/actions/analyze-fundamentals";
import type { ComparisonRow, Direction, FundamentalAnalysis as Analysis } from "@/lib/fundamentals";
import {
  MAX_UPLOAD_BYTES,
  type ExtractedStatement,
  type FundamentalsExplanation,
  type TextPage,
} from "@/lib/validations/fundamentals";
import { downscaleImage, parsePdf, pickPages, type ParsedPdf } from "@/lib/statement-ingest";
import InfoTip from "@/components/custom/info-tip";
import { FUNDAMENTALS_GLOSSARY } from "@/lib/constants/fundamentals-glossary";

const STORAGE_KEY = "financebuddy:fundamental-analysis";
const MAX_HISTORY = 10;
const MAX_FILES = 5;
const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

const INPUT_CLS =
  "w-full rounded-xl border px-3 py-2 text-sm outline-none transition " +
  "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 " +
  "focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400 " +
  "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
  "dark:focus:ring-teal-600/40 dark:focus:border-teal-600";

const CARD_CLS =
  "rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50";

interface Upload {
  id: string;
  file: File;
  kind: "pdf" | "image";
  status: "parsing" | "ready" | "error";
  parsed?: ParsedPdf;
  // Page numbers to send as text (text PDFs only)
  selected: number[];
  error?: string;
}

interface HistoryEntry {
  id: string;
  createdAt: string;
  fileNames: string[];
  extracted: ExtractedStatement;
  analysis: Analysis;
  explanation?: FundamentalsExplanation;
  // Plain summary saved by earlier versions
  summary?: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// "3, 45-47" -> [3, 45, 46, 47]
function parsePageList(input: string, totalPages: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
    if (!Number.isFinite(a)) continue;
    const end = Number.isFinite(b) ? b : a;
    for (let p = Math.max(1, a); p <= Math.min(end, totalPages); p++) pages.add(p);
  }
  return [...pages].sort((x, y) => x - y);
}

function formatPageList(pages: number[]): string {
  const out: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    const start = pages[i];
    while (pages[i + 1] === pages[i] + 1) i++;
    out.push(start === pages[i] ? `${start}` : `${start}-${pages[i]}`);
  }
  return out.join(", ");
}

export default function FundamentalAnalysis() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const hasLoaded = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // localStorage isn't available during SSR, so history loads post-mount
  useEffect(() => {
    const loaded = loadHistory();
    setHistory(loaded);
    setActiveId(loaded[0]?.id ?? null);
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore write failures (e.g. storage full or disabled)
    }
  }, [history]);

  const patchUpload = (id: string, patch: Partial<Upload>) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    const incoming = [...files].slice(0, MAX_FILES - uploads.length);
    const rejected = [...files].filter((f) => !ACCEPTED.includes(f.type));
    if (rejected.length) setError(`Unsupported file: ${rejected.map((f) => f.name).join(", ")}`);

    for (const file of incoming.filter((f) => ACCEPTED.includes(f.type))) {
      const upload: Upload = {
        id: crypto.randomUUID(),
        file,
        kind: file.type === "application/pdf" ? "pdf" : "image",
        status: "parsing",
        selected: [],
      };
      setUploads((prev) => [...prev, upload]);

      try {
        if (upload.kind === "pdf") {
          const parsed = await parsePdf(file);
          patchUpload(upload.id, { status: "ready", parsed, selected: pickPages(parsed.pages) });
        } else {
          patchUpload(upload.id, { status: "ready", file: await downscaleImage(file) });
        }
      } catch (e) {
        console.log("parse error", e);
        patchUpload(upload.id, { status: "error", error: "Could not read this file." });
      }
    }
  };

  const removeUpload = (id: string) => setUploads((prev) => prev.filter((u) => u.id !== id));

  const ready = uploads.filter((u) => u.status === "ready");
  const scannedPdfs = ready.filter((u) => u.kind === "pdf" && u.parsed?.isScanned);
  const textPdfs = ready.filter((u) => u.kind === "pdf" && !u.parsed?.isScanned);
  const images = ready.filter((u) => u.kind === "image");
  const binaryBytes = [...scannedPdfs, ...images].reduce((n, u) => n + u.file.size, 0);
  const tooLarge = binaryBytes > MAX_UPLOAD_BYTES;
  const canSubmit =
    !loading &&
    !tooLarge &&
    ready.length > 0 &&
    !uploads.some((u) => u.status === "parsing") &&
    (images.length > 0 || scannedPdfs.length > 0 || textPdfs.some((u) => u.selected.length > 0));

  const submit = async () => {
    setLoading(true);
    setError(null);

    const pages: TextPage[] = textPdfs.flatMap((u) =>
      u.selected.map((page) => ({
        file: u.file.name,
        page,
        text: u.parsed!.pages[page - 1]?.text ?? "",
      })),
    );
    const fd = new FormData();
    fd.set("pages", JSON.stringify(pages));
    images.forEach((u) => fd.append("images", u.file));
    scannedPdfs.forEach((u) => fd.append("pdfs", u.file));

    try {
      const res = await analyzeFundamentals(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        fileNames: ready.map((u) => u.file.name),
        extracted: res.extracted,
        analysis: res.analysis,
        explanation: res.explanation,
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
      setActiveId(entry.id);
      setUploads([]);
    } catch (e) {
      console.log("submit error", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeEntry = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const active = history.find((h) => h.id === activeId);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-50">
        Fundamental Analysis
      </h2>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        Upload a company&apos;s financial statements (PDF or screenshots). We pull out the key
        figures and show how revenue, profit, EPS and debt changed against the prior period.
      </p>

      {/* Upload */}
      <div className={CARD_CLS + " mt-5 space-y-4"}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging
              ? "border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-900/20"
              : "border-stone-300 hover:border-teal-400 dark:border-stone-600 dark:hover:border-teal-600"
          }`}
        >
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            Drop files here or click to browse
          </p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            PDF, PNG, JPEG or WebP. Up to {MAX_FILES} files. Annual reports work best.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <SourcesGuide defaultOpen={history.length === 0} />

        {uploads.length > 0 && (
          <div className="space-y-2">
            {uploads.map((u) => (
              <UploadRow key={u.id} upload={u} onChange={(patch) => patchUpload(u.id, patch)} onRemove={() => removeUpload(u.id)} />
            ))}
          </div>
        )}

        {tooLarge && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Images and scanned PDFs add up to more than {MAX_UPLOAD_BYTES / 1024 / 1024} MB. Upload
            screenshots of just the statement pages instead.
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-teal-700 text-white py-2.5 text-sm font-semibold hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          {loading ? "Analysing…" : "Analyse"}
        </button>
        <p className="text-xs text-stone-400 dark:text-stone-500">
          Selected pages are sent to OpenAI for extraction. Files are not stored.
        </p>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {history.map((h) => {
            const isActive = h.id === activeId;
            return (
              <div
                key={h.id}
                className={`group flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-teal-400 bg-teal-50 text-teal-800 dark:border-teal-600 dark:bg-teal-900/30 dark:text-teal-300"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:border-stone-600"
                }`}
              >
                <button onClick={() => setActiveId(h.id)}>
                  {h.extracted.companyName ?? h.fileNames[0]}
                  <span className="ml-1.5 text-xs opacity-60">
                    {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                </button>
                <button
                  onClick={() => removeEntry(h.id)}
                  aria-label="Delete analysis"
                  className="text-lg leading-none text-stone-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100 dark:text-stone-500 dark:hover:text-red-400"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {active && <ResultView key={active.id} entry={active} />}
    </div>
  );
}

const SOURCES = [
  {
    market: "Nigerian companies (NGX)",
    href: "https://ngxgroup.com/exchange/trade/equities/listed-companies/",
    linkLabel: "NGX Listed Companies",
    steps: [
      "Search for the company name or ticker and click the company.",
      "Scroll down and open the \"Financials Statements\" tab.",
      "Pick a document. \"Quarter 5\" is the audited full-year result, \"Quarter 4\" the unaudited full year, and Quarters 1 to 3 are quarterly updates. Download the PDF and upload it here.",
    ],
  },
  {
    market: "US companies",
    href: "https://www.sec.gov/edgar/searchedgar/companysearch",
    linkLabel: "SEC EDGAR Company Filings",
    steps: [
      "Search for the company name or ticker, e.g. Apple or AAPL.",
      "Open the latest 10-K (annual report) or 10-Q (quarterly report).",
      "These open as web pages: use your browser's Print, then Save as PDF, and upload that file.",
    ],
  },
];

function SourcesGuide({ defaultOpen }: { defaultOpen: boolean }) {
  return (
    <details open={defaultOpen} className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-700/30 dark:bg-stone-800/30">
      <summary className="cursor-pointer text-sm font-semibold text-stone-700 dark:text-stone-200">
        Where do I get a company&apos;s financial statements?
      </summary>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {SOURCES.map((src) => (
          <div key={src.market}>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">{src.market}</div>
            <a
              href={src.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-semibold text-teal-700 underline-offset-2 hover:underline dark:text-teal-400"
            >
              {src.linkLabel} ↗
            </a>
            <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-stone-600 dark:text-stone-400">
              {src.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
        You can also check the &quot;Investor Relations&quot; section of the company&apos;s own website. A full annual report
        is fine: we find the statement pages for you.
      </p>
    </details>
  );
}

function UploadRow({
  upload,
  onChange,
  onRemove,
}: {
  upload: Upload;
  onChange: (patch: Partial<Upload>) => void;
  onRemove: () => void;
}) {
  const { file, kind, status, parsed, selected } = upload;
  const [pageInput, setPageInput] = useState<string | null>(null);

  let detail = "";
  if (status === "parsing") detail = "Reading…";
  else if (status === "error") detail = upload.error ?? "Error";
  else if (kind === "image") detail = `Image, ${(file.size / 1024).toFixed(0)} KB`;
  else if (parsed?.isScanned) detail = `Scanned PDF, ${parsed.totalPages} pages, sent as file`;
  else if (parsed) detail = `${parsed.totalPages} pages, ${selected.length} selected`;

  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-700/30 dark:bg-stone-800/30">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">{file.name}</p>
          <p className={`text-xs ${status === "error" ? "text-red-600 dark:text-red-400" : "text-stone-400 dark:text-stone-500"}`}>
            {detail}
          </p>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="text-lg leading-none text-stone-400 hover:text-red-600 dark:text-stone-500 dark:hover:text-red-400"
        >
          ×
        </button>
      </div>

      {kind === "pdf" && status === "ready" && parsed && !parsed.isScanned && (
        <div className="mt-2">
          <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
            Statement pages (auto-detected, edit if needed)
          </label>
          <input
            value={pageInput ?? formatPageList(selected)}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => {
              if (pageInput !== null) onChange({ selected: parsePageList(pageInput, parsed.totalPages) });
              setPageInput(null);
            }}
            placeholder="e.g. 45-48, 52"
            className={INPUT_CLS}
          />
          {selected.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              No statement pages detected. Enter the page numbers manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const DIRECTION_STYLE: Record<Direction, string> = {
  improving: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  worsening: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  flat: "bg-stone-100 text-stone-600 dark:bg-stone-700/50 dark:text-stone-300",
  "n/a": "text-stone-400 dark:text-stone-500",
};

function makeFormatters(currency: string | null) {
  let money: Intl.NumberFormat;
  let perShare: Intl.NumberFormat;
  try {
    money = new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency ?? "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    });
    perShare = new Intl.NumberFormat("en", { style: "currency", currency: currency ?? "USD", maximumFractionDigits: 2 });
  } catch {
    // Model returned something that isn't an ISO currency code
    money = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });
    perShare = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
  }
  return (value: number | null, kind: ComparisonRow["kind"]) => {
    if (value === null) return "–";
    if (kind === "ratio") return `${(value * 100).toFixed(1)}%`;
    return kind === "perShare" ? perShare.format(value) : money.format(value);
  };
}

function formatChange(row: ComparisonRow) {
  if (row.change === null) return "–";
  const sign = row.change > 0 ? "+" : "";
  return row.kind === "ratio" ? `${sign}${row.change.toFixed(1)} pp` : `${sign}${row.change.toFixed(1)}%`;
}

function ResultView({ entry }: { entry: HistoryEntry }) {
  const { extracted, analysis, explanation, summary } = entry;
  const [compIndex, setCompIndex] = useState(0);
  const comparison = analysis.comparisons[compIndex];
  const fmt = makeFormatters(extracted.currency);
  const latest = analysis.periods[0];

  const debtRow = comparison?.rows.find((r) => r.key === "totalDebt");

  return (
    <div className="mt-5 space-y-5">
      <div className={CARD_CLS}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-50">
            {extracted.companyName ?? "Unnamed company"}
            {extracted.ticker && (
              <span className="ml-2 text-sm font-medium text-stone-400 dark:text-stone-500">{extracted.ticker}</span>
            )}
          </h3>
          <span className="text-xs text-stone-400 dark:text-stone-500">
            {extracted.currency ?? "Currency unknown"} · {analysis.periods.map((p) => p.label).join(", ")}
          </span>
        </div>
        {explanation ? (
          <ExplanationView explanation={explanation} />
        ) : (
          summary && <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{summary}</p>
        )}
      </div>

      {/* Highlights */}
      {latest && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label={`EPS · ${latest.label}`}
            info="eps"
            value={fmt(latest.eps.reported ?? latest.eps.calculated, "perShare")}
            sub={
              latest.eps.calculated !== null && latest.eps.reported !== null
                ? `Calculated ${fmt(latest.eps.calculated, "perShare")}${latest.eps.mismatch ? " (differs from reported)" : ""}`
                : latest.eps.calculated !== null
                  ? "Calculated from net profit / shares"
                  : "Not enough data"
            }
            warn={latest.eps.mismatch}
          />
          <StatCard
            label="Net margin"
            info="netMargin"
            value={fmt(latest.metrics.netMargin, "ratio")}
            sub={`Revenue ${fmt(latest.metrics.revenue, "money")}`}
          />
          <StatCard
            label="Total debt"
            info="totalDebt"
            value={fmt(latest.metrics.totalDebt, "money")}
            sub={
              debtRow && debtRow.direction !== "n/a"
                ? `${formatChange(debtRow)} vs ${comparison.priorLabel} (${debtRow.direction === "improving" ? "reducing" : debtRow.direction === "worsening" ? "rising" : "flat"})`
                : "No prior period to compare"
            }
          />
        </div>
      )}

      {/* Comparison table */}
      {comparison ? (
        <div className={CARD_CLS}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">Period comparison</div>
            {analysis.comparisons.length > 1 && (
              <select
                value={compIndex}
                onChange={(e) => setCompIndex(Number(e.target.value))}
                className={INPUT_CLS + " w-auto"}
              >
                {analysis.comparisons.map((c, i) => (
                  <option key={i} value={i}>
                    {c.currentLabel} vs {c.priorLabel}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  <th className="py-2 pr-3 font-semibold">Metric</th>
                  <th className="py-2 px-3 font-semibold text-right">{comparison.priorLabel}</th>
                  <th className="py-2 px-3 font-semibold text-right">{comparison.currentLabel}</th>
                  <th className="py-2 pl-3 font-semibold text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows
                  .filter((r) => r.current !== null || r.prior !== null)
                  .map((r) => (
                    <tr key={r.key} className="border-t border-stone-100 dark:border-stone-700/40">
                      <td className="py-2 pr-3 text-stone-700 dark:text-stone-300">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          {r.label}
                          <InfoTip entry={FUNDAMENTALS_GLOSSARY[r.key]} />
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-stone-500 dark:text-stone-400">{fmt(r.prior, r.kind)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-medium text-stone-900 dark:text-stone-50">{fmt(r.current, r.kind)}</td>
                      <td className="py-2 pl-3 text-right">
                        <span className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${DIRECTION_STYLE[r.direction]}`}>
                          {r.direction === "improving" ? "▲ " : r.direction === "worsening" ? "▼ " : ""}
                          {formatChange(r)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
            Green means better for the company (e.g. higher profit, lower debt). Tap ⓘ next to any line to see what it means.
          </p>
        </div>
      ) : (
        <div className={CARD_CLS + " text-sm text-stone-500 dark:text-stone-400"}>
          Only one period was found, so there is nothing to compare against. Include the prior-year column or another report.
        </div>
      )}

      {extracted.notes.length > 0 && (
        <details className={CARD_CLS + " group"}>
          <summary className="cursor-pointer text-sm font-semibold text-stone-900 dark:text-stone-50">
            Technical notes from the document
            <span className="ml-2 text-xs font-normal text-stone-400 dark:text-stone-500">for advanced readers</span>
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600 dark:text-stone-400">
            {extracted.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-xs text-stone-400 dark:text-stone-500">
        Figures are extracted by AI and may contain errors. Verify against the source document. This is not investment advice.
      </p>
    </div>
  );
}

const MOOD_STYLE: Record<FundamentalsExplanation["mood"], { label: string; cls: string }> = {
  healthy: { label: "Looking healthy", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  mixed: { label: "Mixed results", cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  struggling: { label: "Struggling", cls: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  unclear: { label: "Not enough to tell", cls: "bg-stone-100 text-stone-600 dark:bg-stone-700/50 dark:text-stone-300" },
};

function ExplanationView({ explanation: e }: { explanation: FundamentalsExplanation }) {
  const mood = MOOD_STYLE[e.mood];
  const section = (title: string, body: string | null) =>
    body && (
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">{title}</div>
        <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{body}</p>
      </div>
    );
  const list = (title: string, items: string[], bullet: string, bulletCls: string) =>
    items.length > 0 && (
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">{title}</div>
        <ul className="mt-1 space-y-1 text-sm text-stone-700 dark:text-stone-300">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className={bulletCls}>{bullet}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="mt-3 space-y-4">
      <div>
        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${mood.cls}`}>{mood.label}</span>
        <p className="mt-2 text-base font-semibold text-stone-900 dark:text-stone-50">{e.headline}</p>
      </div>
      {section("How the business is doing", e.howItsDoing)}
      <div className="grid gap-4 sm:grid-cols-2">
        {section("What each share earned", e.perShare)}
        {section("Borrowing", e.debt)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {list("Good signs", e.goodSigns, "✓", "text-emerald-600 dark:text-emerald-400")}
        {list("Things to watch", e.watchOuts, "!", "font-bold text-amber-600 dark:text-amber-400")}
      </div>
      {list("Worth knowing", e.thingsToKnow, "•", "text-teal-600 dark:text-teal-400")}
    </div>
  );
}

function StatCard({
  label,
  info,
  value,
  sub,
  warn,
}: {
  label: string;
  info: keyof typeof FUNDAMENTALS_GLOSSARY;
  value: string;
  sub: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700/50 dark:bg-stone-800/50">
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
        {label}
        <InfoTip entry={FUNDAMENTALS_GLOSSARY[info]} />
      </div>
      <div className="mt-1 text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-50">{value}</div>
      <div className={`mt-0.5 text-xs ${warn ? "text-amber-600 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}>{sub}</div>
    </div>
  );
}
