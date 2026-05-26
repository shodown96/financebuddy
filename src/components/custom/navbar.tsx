"use client";

import { APP_NAME } from "@/lib/constants/app";
import { PATHS } from "@/lib/constants/paths";
import Link from "next/link";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "Tax",
    links: [
      { href: PATHS.PROGRESSIVE_TAX_CALCULATOR, label: "Nigeria" },
      { href: PATHS.UK_TAX_CALCULATOR, label: "United Kingdom" },
      { href: PATHS.CANADA_TAX_CALCULATOR, label: "Canada" },
      { href: PATHS.US_TAX_CALCULATOR, label: "United States" },
    ],
  },
  {
    label: "Savings",
    links: [
      { href: PATHS.MONTHLY_INTEREST_ESTIMATOR, label: "Monthly Interest" },
      { href: PATHS.ANNUAL_INTEREST_ESTIMATOR, label: "Annual Estimator" },
      { href: PATHS.COMPARE_ANNUAL_ESTIMATES, label: "Compare" },
    ],
  },
  {
    label: "Budget",
    links: [{ href: PATHS.BUDGET_CALCULATOR, label: "Budget Calculator" }],
  },
];

function DropdownGroup({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  if (links.length === 1) {
    return (
      <Link
        href={links[0].href}
        className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-50 dark:hover:bg-stone-800 transition"
      >
        {label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-50 dark:hover:bg-stone-800 transition flex items-center gap-1"
        aria-expanded={open}
      >
        {label}
        <svg
          className={`w-3 h-3 opacity-60 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        /* The outer div starts flush at top-full with pt-1 padding so the mouse
           can travel from the button into the menu without crossing a gap. */
        <div className="absolute left-0 top-full pt-1 z-30 min-w-44">
          <div className="rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900 py-1 overflow-hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50 transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 flex items-center justify-between">
        <Link
          href={PATHS.LANDING}
          className="font-extrabold text-stone-900 dark:text-stone-50 tracking-tight"
        >
          {APP_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_GROUPS.map((g) => (
            <DropdownGroup key={g.label} label={g.label} links={g.links} />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-3 space-y-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50 transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
