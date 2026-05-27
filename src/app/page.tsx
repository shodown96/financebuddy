import { CardLink } from "@/components/custom/card-link";
import NavBar from "@/components/custom/navbar";
import { PATHS } from "@/lib/constants/paths";

const TAX_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2m-5 0V1m0 2a1 1 0 100 2 1 1 0 000-2z" />
  </svg>
);

const SAVINGS_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const COMPARE_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const BUDGET_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const DICT_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14 sm:px-6">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
            Finance Buddy
          </h1>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-400 max-w-xl">
            Free, browser-based calculators for tax, savings growth, and budgeting.
            All calculations happen locally. Nothing is sent anywhere.
          </p>
        </div>

        {/* Tax calculators */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            Tax Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CardLink
              href={PATHS.PROGRESSIVE_TAX_CALCULATOR}
              title="Nigeria: Income Tax"
              description="Progressive PAYE bands. Supports monthly or annual income input."
              icon={TAX_ICON}
            />
            <CardLink
              href={PATHS.UK_TAX_CALCULATOR}
              title="United Kingdom: Income Tax"
              description="Income tax with personal allowance taper, National Insurance, and Scotland option."
              icon={TAX_ICON}
            />
            <CardLink
              href={PATHS.CANADA_TAX_CALCULATOR}
              title="Canada: Income Tax"
              description="Federal + provincial tax, CPP, and EI deductions for all provinces and territories."
              icon={TAX_ICON}
            />
            <CardLink
              href={PATHS.US_TAX_CALCULATOR}
              title="United States: Income Tax"
              description="Federal brackets, FICA (Social Security + Medicare), and state income tax for all 50 states."
              icon={TAX_ICON}
            />
            <CardLink
              href={PATHS.RWANDA_TAX_CALCULATOR}
              title="Rwanda: Income Tax"
              description="PAYE progressive bands with RSSB deductions: pension, maternity, and CBHI (2025 rates)."
              icon={TAX_ICON}
            />
          </div>
        </section>

        {/* Savings calculators */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            Savings & Interest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CardLink
              href={PATHS.MONTHLY_INTEREST_ESTIMATOR}
              title="Monthly Interest Estimator"
              description="See how a fixed monthly deposit grows with compound interest over time."
              icon={SAVINGS_ICON}
            />
            <CardLink
              href={PATHS.ANNUAL_INTEREST_ESTIMATOR}
              title="Annual Interest Estimator"
              description="Multi-year savings projection with monthly top-ups and compound interest."
              icon={SAVINGS_ICON}
            />
            <CardLink
              href={PATHS.COMPARE_ANNUAL_ESTIMATES}
              title="Compare Annual Estimates"
              description="Side-by-side comparison of two savings scenarios across multiple years."
              icon={COMPARE_ICON}
            />
          </div>
        </section>

        {/* Budget */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            Budgeting
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CardLink
              href={PATHS.BUDGET_CALCULATOR}
              title="Budget Calculator"
              description="Allocate your income across spending categories and track what is left."
              icon={BUDGET_ICON}
            />
          </div>
        </section>

        {/* Dictionary */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            Reference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CardLink
              href={PATHS.DICTIONARY}
              title="Financial Dictionary"
              description="Plain-English definitions for 80+ terms covering savings, investing, stocks, bonds, funds, and wealth protection."
              icon={DICT_ICON}
            />
          </div>
        </section>

        <p className="text-xs text-stone-400 dark:text-stone-500">
          These tools are for estimation only. Tax rules change annually and vary by individual
          circumstances. Always consult a qualified professional for financial or tax advice.
        </p>
      </main>
    </>
  );
}
