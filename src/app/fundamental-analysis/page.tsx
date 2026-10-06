import FundamentalAnalysis from "@/components/custom/fundamental-analysis";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Fundamental Analysis | Finance Buddy",
  description:
    "Upload a company's financial statements and see revenue, profit, EPS and debt trends against the prior period.",
};

export default function FundamentalAnalysisPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <FundamentalAnalysis />
      </main>
    </>
  );
}
