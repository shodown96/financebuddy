import { APP_NAME } from "@/lib/constants/app";

export default function Header() {
    return (
        <nav className="flex justify-between items-center p-5 px-10 w-full text-white absolute">
            <div className="font-pacifico text-4xl">{APP_NAME}</div>
            <div className="flex gap-4">
                <div>Home</div>
                <div>Why</div>
                <div>IAM Corner</div>
            </div>
        </nav>
    )
}
