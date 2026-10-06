import FundamentalAnalysis from "@/components/custom/fundamental-analysis";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Fundamental Analysis | Finance Buddy",
  description:
    "Analyse stocks from their financial statements. Upload a company's report (PDF, Excel or screenshots) and see revenue, profit, EPS and debt against the same period last year.",
  keywords: ["stocks", "stock fundamental analysis", "EPS calculator", "financial statement analysis", "NGX stocks", "US stocks"],
};

export default function FundamentalAnalysisPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <FundamentalAnalysis />
      </main>
    </>
  );
}
