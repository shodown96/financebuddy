"use client";

import AnnualInterestEstimator from "@/components/custom/annual-compund-interest";
import NavBar from "@/components/custom/navbar";

export default function InterestPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold">
          Annual Interest Estimator
        </h1>

        <div className="mt-4">
          <AnnualInterestEstimator />
        </div>
      </main>
    </>
  );
}
