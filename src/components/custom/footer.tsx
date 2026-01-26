import { DEVELOPER_LINK } from "@/lib/constants/app";

export default function Footer() {
    return (
        <footer className="bg-primary text-center p-5 dark:text-white text-sm">
            {/* Copyright © {(new Date).getFullYear()} {APP_NAME} |  */}
            Built by <a href={DEVELOPER_LINK} target="__blank" className="hover:underline">Elijah Soladoye</a>
        </footer>
    )
}
