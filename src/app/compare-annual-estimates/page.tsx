import AnnualInterestEstimator from "@/components/custom/annual-compund-interest";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Compare Annual Estimates | Finance Buddy",
  description: "Side-by-side comparison of two savings scenarios across multiple years.",
};

export default function CompareAnnualPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50">
          Compare Annual Estimates
        </h1>
        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
          Configure two scenarios side-by-side to compare how different rates, top-ups, or compounding
          modes affect your savings over time.
        </p>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50">
            <div className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-4">Scenario A</div>
            <AnnualInterestEstimator showExplanation={false} />
          </div>
          <div className="col-span-12 lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700/50 dark:bg-stone-800/50">
            <div className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-4">Scenario B</div>
            <AnnualInterestEstimator showExplanation={false} />
          </div>
        </div>
      </main>
    </>
  );
}
