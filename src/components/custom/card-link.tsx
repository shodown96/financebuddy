import Link from "next/link";

export function CardLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        block rounded-2xl border p-4 transition
        border-gray-200 hover:border-gray-300 hover:bg-slate-50
        dark:border-gray-600/60 dark:hover:border-gray-500 dark:hover:bg-white/5
      "
    >
      <div className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
        {description}
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-200/70">
        Open →
      </div>
    </Link>
  );
}