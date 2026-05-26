import Link from "next/link";

export function CardLink({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-700"
    >
      {icon && (
        <div className="mb-3 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          {icon}
        </div>
      )}
      <div className="text-base font-bold text-stone-900 dark:text-stone-50 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
        {title}
      </div>
      <div className="mt-1.5 text-sm leading-6 text-stone-500 dark:text-stone-400">
        {description}
      </div>
      <div className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
        Open
        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
