import RwandaTaxCalculator from "@/components/custom/rwanda-tax-calculator";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Rwanda Income Tax Calculator (2025) | Finance Buddy",
  description:
    "Calculate Rwanda PAYE income tax and RSSB contributions (pension, maternity, CBHI) for 2025. Supports monthly and annual income input.",
};

export default function RwandaTaxPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <RwandaTaxCalculator />
      </main>
    </>
  );
}
