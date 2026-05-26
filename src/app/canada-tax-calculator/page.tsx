import CanadaTaxCalculator from "@/components/custom/canada-tax-calculator";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Canada Tax Calculator | Finance Buddy",
  description: "Federal + provincial income tax, CPP, and EI calculator for all Canadian provinces and territories.",
};

export default function CanadaTaxPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <CanadaTaxCalculator />
      </main>
    </>
  );
}
