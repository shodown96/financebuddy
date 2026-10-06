import NavBar from "@/components/custom/navbar";
import TechnicalAnalysis from "@/components/custom/technical-analysis";

export const metadata = {
  title: "Technical Analysis | Finance Buddy",
  description:
    "Charts with moving averages, Bollinger Bands, MACD, RSI and volume profile for NGX and US stocks.",
};

export default function TechnicalAnalysisPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <TechnicalAnalysis />
      </main>
    </>
  );
}
