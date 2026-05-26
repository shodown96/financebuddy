import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants/app";
import Footer from "@/components/custom/footer";

const poppinsSans = Poppins({
  variable: "--font-poppins-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Free financial calculators: tax, savings, compound interest and budget tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${poppinsSans.variable} ${robotoSans.variable} antialiased`,
          "bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-50"
        )}
      >
        <div className="min-h-[93vh]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
