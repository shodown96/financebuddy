import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col justify-center items-center h-screen w-screen px-4">
      <div className="text-center border rounded-lg border-gray-200 p-10 dark:border-slate-600/60">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
          404
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200/85">
          This page does not exist (or it was moved).
        </p>

        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
