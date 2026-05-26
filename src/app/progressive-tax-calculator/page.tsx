import NavBar from "@/components/custom/navbar";
import ProgressiveTaxCalculator from "@/components/custom/progressive-tax-calcaulator";

export const metadata = {
  title: "Nigeria Tax Calculator | Finance Buddy",
  description: "Nigerian progressive PAYE income tax calculator with band breakdown.",
};

export default function NigeriaTaxPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ProgressiveTaxCalculator />
      </main>
    </>
  );
}
