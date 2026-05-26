import USTaxCalculator from "@/components/custom/us-tax-calculator";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "US Tax Calculator | Finance Buddy",
  description: "Federal income tax, FICA, and state income tax calculator for all 50 US states and DC.",
};

export default function USTaxPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <USTaxCalculator />
      </main>
    </>
  );
}
