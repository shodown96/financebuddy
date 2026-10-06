"use server";

import { openai } from "@ai-sdk/openai";
import { generateText, Output, type FilePart, type TextPart } from "ai";
import { analyze, type FundamentalAnalysis } from "@/lib/fundamentals";
import {
  ExtractedStatementSchema,
  FundamentalsExplanationSchema,
  MAX_UPLOAD_BYTES,
  type FundamentalsExplanation,
  type ExtractedStatement,
  type TextPage,
} from "@/lib/validations/fundamentals";

const ANALYSIS_MODEL = "gpt-4.1-mini";

const MAX_TEXT_CHARS = 120_000;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export type AnalyzeResult =
  | { ok: true; extracted: ExtractedStatement; analysis: FundamentalAnalysis; explanation: FundamentalsExplanation }
  | { ok: false; error: string };

const EXTRACTION_INSTRUCTIONS = `You extract figures from company financial statements.
- Copy numbers exactly as printed. Do not calculate, estimate or round.
- Brackets mean negative: (1,234) is -1234.
- Record the scale stated in headings (e.g. "N'000", "in millions") in "units", and the scale used for share counts in "shareUnits".
- Create one period per column (current year, prior year, quarters, etc.). Use "Group"/"Consolidated" columns over "Company" columns when both exist.
- If a figure is not in the document, return null. Never invent values.
- Use "notes" for restatements, one-off items, or anything ambiguous.`;

const EXPLAIN_INSTRUCTIONS = `You explain a company's financial results to complete beginners who are deciding whether the business looks healthy.
The reader has never read a financial statement. Write like a knowledgeable friend explaining over coffee.

Rules:
- No jargon. Avoid terms like EPS, margin, ROE, equity, liabilities, leverage, operating income, impairment, restatement. Say what they mean instead: "for every NGN 100 of sales it kept NGN 12 as profit", "it owes less to banks than last year", "each share earned NGN 5".
- Short sentences. Use real numbers with the currency, rounded so they are easy to read (e.g. "NGN 1.2 trillion", "about 15% more").
- Be balanced and honest about both good and bad news. If results are mixed, say so plainly.
- Explain why a change matters to an owner of the shares, not just that it changed.
- Never tell the reader to buy or sell. No predictions.
- Use only the numbers provided. Do not invent figures.`;

export async function analyzeFundamentals(formData: FormData): Promise<AnalyzeResult> {
  try {
    const pages = JSON.parse(String(formData.get("pages") ?? "[]")) as TextPage[];
    const images = formData.getAll("images").filter((f): f is File => f instanceof File);
    const pdfs = formData.getAll("pdfs").filter((f): f is File => f instanceof File);

    if (pages.length === 0 && images.length === 0 && pdfs.length === 0) {
      return { ok: false, error: "Add at least one statement page or image." };
    }
    const totalBytes = [...images, ...pdfs].reduce((n, f) => n + f.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      return { ok: false, error: "Files are too large. Upload screenshots of just the statement pages." };
    }
    if (images.some((f) => !IMAGE_TYPES.includes(f.type)) || pdfs.some((f) => f.type !== "application/pdf")) {
      return { ok: false, error: "Only PDF, PNG, JPEG and WebP files are supported." };
    }

    const pageText = pages
      .map((p) => `--- ${p.file} p.${p.page} ---\n${p.text}`)
      .join("\n\n")
      .slice(0, MAX_TEXT_CHARS);

    const content: (TextPart | FilePart)[] = [
      { type: "text", text: "Extract the financial figures from these statements." },
    ];
    if (pageText) content.push({ type: "text", text: pageText });
    for (const f of images) {
      content.push({ type: "file", mediaType: f.type, data: new Uint8Array(await f.arrayBuffer()) });
    }
    for (const f of pdfs) {
      content.push({
        type: "file",
        mediaType: "application/pdf",
        filename: f.name,
        data: new Uint8Array(await f.arrayBuffer()),
      });
    }

    const { output: extracted } = await generateText({
      model: openai(ANALYSIS_MODEL),
      instructions: EXTRACTION_INSTRUCTIONS,
      output: Output.object({ schema: ExtractedStatementSchema }),
      messages: [{ role: "user", content }],
    });

    if (extracted.periods.length === 0) {
      return { ok: false, error: "No financial statement figures were found. Try selecting different pages." };
    }

    const analysis = analyze(extracted);

    const { output: explanation } = await generateText({
      model: openai(ANALYSIS_MODEL),
      instructions: EXPLAIN_INSTRUCTIONS,
      output: Output.object({ schema: FundamentalsExplanationSchema }),
      prompt: JSON.stringify({
        company: extracted.companyName,
        currency: extracted.currency,
        comparison: analysis.comparisons[0] ?? null,
        latestPeriod: analysis.periods[0],
        documentNotes: extracted.notes,
      }),
    });

    return { ok: true, extracted, analysis, explanation };
  } catch (error) {
    console.log("analyzeFundamentals error", error);
    return { ok: false, error: "Analysis failed. Please try again." };
  }
}
