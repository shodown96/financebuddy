import AnnualInterestEstimator from "@/components/custom/annual-compund-interest";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Annual Interest Estimator | Finance Buddy",
  description: "Multi-year savings projection with monthly top-ups using standard monthly or annual compound interest.",
};

export default function AnnualInterestPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <AnnualInterestEstimator />
      </main>
    </>
  );
}
