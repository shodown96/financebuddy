import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Pacifico, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants/app";
import Footer from "@/components/custom/footer";

const poppinsSans = Poppins({
  variable: "--font-poppins-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700']
});

const pacificoSans = Pacifico({
  variable: "--font-pacifico-sans",
  subsets: ["latin"],
  weight: ['400']
});

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A tool to help with financial decisions",
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
          `${poppinsSans.variable} ${pacificoSans.variable} ${robotoSans.variable} antialiased`,
          "bg-white text-slate-900 dark:bg-[#2C2C2C] dark:text-slate-100"
        )}>
          <div className="min-h-[93vh]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
