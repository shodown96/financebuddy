import FinancialDictionary from "@/components/custom/financial-dictionary";
import NavBar from "@/components/custom/navbar";

export const metadata = {
  title: "Financial Dictionary | Finance Buddy",
  description:
    "Plain-English definitions for 80+ financial terms covering savings, investing, stocks, bonds, funds, tax, and wealth protection.",
};

export default function DictionaryPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 pb-16">
        <FinancialDictionary />
      </main>
    </>
  );
}
