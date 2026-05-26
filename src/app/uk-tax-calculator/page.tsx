import NavBar from "@/components/custom/navbar";
import UKTaxCalculator from "@/components/custom/uk-tax-calculator";

export const metadata = {
  title: "UK Tax Calculator | Finance Buddy",
  description: "Income tax and National Insurance calculator for England, Wales, Northern Ireland, and Scotland.",
};

export default function UKTaxPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <UKTaxCalculator />
      </main>
    </>
  );
}
