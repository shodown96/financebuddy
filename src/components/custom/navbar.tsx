import { APP_NAME } from "@/lib/constants/app";
import { PATHS } from "@/lib/constants/paths";
import Link from "next/link";

export default function NavBar() {
    return (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-600/60 dark:bg-[#2C2C2C]/85">
            <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 flex items-center justify-between">
                <Link href="/" className="font-extrabold text-slate-900 dark:text-slate-50">
                    {APP_NAME}
                </Link>

                <nav className="flex items-center gap-4 text-sm">
                    <Link
                        href={PATHS.PROGRESSIVE_TAX_CALCULATOR}
                        className="text-slate-700 hover:text-slate-900 dark:text-slate-200/85 dark:hover:text-slate-50"
                    >
                        Tax
                    </Link>
                    <Link
                        href={PATHS.MONTHLY_INTEREST_ESTIMATOR}
                        className="text-slate-700 hover:text-slate-900 dark:text-slate-200/85 dark:hover:text-slate-50"
                    >
                        Monthly
                    </Link>
                    <Link
                        href={PATHS.ANNUAL_INTEREST_ESTIMATOR}
                        className="text-slate-700 hover:text-slate-900 dark:text-slate-200/85 dark:hover:text-slate-50"
                    >
                        Annual
                    </Link>
                </nav>
            </div>
        </header>
    );
}
