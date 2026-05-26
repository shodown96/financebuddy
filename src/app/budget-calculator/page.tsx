import BudgetCalculator from "@/components/custom/budget-calculator";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Budget Calculator | Finance Buddy",
  description: "Allocate your income across spending categories and track what is left.",
};

export default function BudgetPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BudgetCalculator />
      </main>
    </>
  );
}
