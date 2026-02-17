"use client";

import AnnualInterestEstimator from "@/components/custom/annual-compund-interest";
import NavBar from "@/components/custom/navbar";

export default function InterestPage() {
    return (
        <>
            <NavBar />
            <main className="mx-auto max-w-7xl p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-extrabold">
                    Compare Annual Estimates
                </h1>

                <div className="mt-4 grid grid-cols-12 gap-4">
                    <div className="col-span-12 lg:col-span-6">
                        <AnnualInterestEstimator showExplanation={false} />
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <AnnualInterestEstimator showExplanation={false} />
                    </div>
                </div>
            </main>
        </>
    );
}
