"use client";

import NavBar from "@/components/custom/navbar";
import ProgressiveTaxCalculator from "@/components/custom/progressive-tax-calcaulator";

export default function TaxPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold">
            Progressive Tax Calculator
          </h1>
        </div>

        <div className="mt-4">
          <ProgressiveTaxCalculator />
        </div>
      </main>
    </>
  );
}
