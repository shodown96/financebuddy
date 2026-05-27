import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION, APP_URL, DEVELOPER_LINK } from "@/lib/constants/app";
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
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "tax calculator",
    "PAYE",
    "Nigeria income tax",
    "UK income tax",
    "Canada income tax",
    "US income tax",
    "Rwanda income tax",
    "compound interest calculator",
    "savings calculator",
    "budget calculator",
    "financial dictionary",
    "Finance Buddy",
    "free financial tools",
    "income tax calculator",
  ],
  authors: [{ name: "Elijah Soladoye", url: DEVELOPER_LINK }],
  creator: "Elijah Soladoye",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
