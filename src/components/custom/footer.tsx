import { DEVELOPER_LINK } from "@/lib/constants/app";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-center py-5 px-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Built by{" "}
        <a
          href={DEVELOPER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
        >
          Elijah Soladoye
        </a>
        . For estimation only. Consult a professional for financial/tax advice.
      </p>
    </footer>
  );
}
