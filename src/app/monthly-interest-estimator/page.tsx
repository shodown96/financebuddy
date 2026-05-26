import MonthlyInterestEstimator from "@/components/custom/monthly-interest-estimator";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Monthly Interest Estimator | Finance Buddy",
  description: "See how a fixed monthly deposit grows with compound interest over time.",
};

export default function MonthlyInterestPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <MonthlyInterestEstimator />
      </main>
    </>
  );
}
