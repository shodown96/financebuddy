"use client";

import MonthlyInterestEstimator from "@/components/custom/monthly-interest-estimator";
import NavBar from "@/components/custom/navbar";

export default function InterestPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold">
          Monthly Interest Estimator
        </h1>

        <div className="mt-4">
          <MonthlyInterestEstimator />
        </div>
      </main>
    </>
  );
}
