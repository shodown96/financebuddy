import { CardLink } from "@/components/custom/card-link";
import { PATHS } from "@/lib/constants/paths";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
        Finance Calculators
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
        Pick a calculator below. These tools run locally in your browser.
      </p>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardLink
          href={PATHS.PROGRESSIVE_TAX_CALCULATOR}
          title="Progressive Tax Calculator"
          description="Compute annual tax using progressive bands. Supports monthly or annual income input."
        />

        <CardLink
          href={PATHS.MONTHLY_INTEREST_ESTIMATOR}
          title="Monthly Interest Estimator"
          description="Estimates your monthly interest and your total balance by the end of the year, assuming you deposit the same amount every month and your savings compounds monthly."
        />

        <CardLink
          href={PATHS.ANNUAL_INTEREST_ESTIMATOR}
          title="Annual Interest Estimator"
          description="Estimate how your savings can grow over multiple years. You can choose normal yearly compounding, or “recursive” mode that simulates reinvesting upfront interest payouts repeatedly."
        />
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 p-4 dark:border-gray-600/60 font-semibold">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Note
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
          These calculators are for estimation. Real-world tax or interest may
          differ depending on reliefs, fees, compounding rules, and timing.
          These are currently tailored to the Nigerian system.
        </div>
      </section>
    </main>
  );
}
