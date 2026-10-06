// Browser-only helpers that shrink uploads before anything reaches the model.
// Text PDFs and spreadsheets become a handful of relevant pages of plain text;
// images get downscaled; only scanned PDFs are sent as files.

export interface ParsedPage {
  page: number;
  text: string;
  score: number;
  // Sheet name (spreadsheets only)
  label?: string;
}

export interface ParsedPdf {
  totalPages: number;
  pages: ParsedPage[];
  // Little or no text layer, so the model needs to see the file itself
  isScanned: boolean;
}

const KEYWORDS: [RegExp, number][] = [
  [/income statement|statement of (comprehensive )?income|profit or loss|profit and loss/i, 6],
  [/balance sheet|statement of financial position/i, 6],
  [/cash flows?/i, 4],
  [/earnings per share|\beps\b/i, 5],
  [/\brevenue\b|\bturnover\b|\bsales\b/i, 2],
  [/gross profit/i, 2],
  [/operating (profit|income)/i, 2],
  [/profit (before|after|for the) (tax|year|period)|net (income|profit)/i, 2],
  [/total (assets|liabilities|equity)/i, 2],
  [/borrowings|loans|debt/i, 1],
  [/weighted average (number of )?(ordinary )?shares/i, 3],
];

const MIN_TEXT_CHARS = 200;
export const MAX_SELECTED_PAGES = 8;

export function scorePage(text: string): number {
  if (text.length < MIN_TEXT_CHARS) return 0;
  let score = KEYWORDS.reduce((acc, [re, w]) => acc + (re.test(text) ? w : 0), 0);
  // Statement pages are dense with numbers
  const numbers = text.match(/\(?\d[\d,]{2,}\)?/g)?.length ?? 0;
  score += Math.min(numbers / 20, 5);
  return score;
}

export async function parsePdf(file: File): Promise<ParsedPdf> {
  const { getDocumentProxy, extractText } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const pages = text.map((t, i) => {
    const clean = t.replace(/[ \t]+/g, " ").trim();
    return { page: i + 1, text: clean, score: scorePage(clean) };
  });
  const textChars = pages.reduce((n, p) => n + p.text.length, 0);

  return { totalPages, pages, isScanned: textChars < totalPages * 100 };
}

export const SPREADSHEET_EXTENSIONS = [".xlsx", ".xlsm", ".xls", ".ods", ".csv"];

export function isSpreadsheet(file: File): boolean {
  const name = file.name.toLowerCase();
  return SPREADSHEET_EXTENSIONS.some((ext) => name.endsWith(ext));
}

// Each sheet becomes one "page" of CSV text, so it flows through the same
// scoring and selection as a text PDF
export async function parseSpreadsheet(file: File): Promise<ParsedPdf> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { dense: true });

  const pages = wb.SheetNames.map((name, i) => {
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name], { blankrows: false, strip: true });
    const text = `Sheet: ${name}\n${csv.replace(/,+$/gm, "")}`.trim();
    return { page: i + 1, text, score: scorePage(text), label: name };
  });

  return { totalPages: pages.length, pages, isScanned: false };
}

// Top scoring pages, returned in page order
export function pickPages(pages: ParsedPage[], max = MAX_SELECTED_PAGES): number[] {
  return [...pages]
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((p) => p.page)
    .sort((a, b) => a - b);
}

export async function downscaleImage(file: File, maxSide = 1600): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1024 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}
