import type { GlossaryEntry } from "@/lib/constants/technical-glossary";
import type { DerivedPeriod } from "@/lib/fundamentals";

// Beginner explanations for each metric on the fundamental analysis page

export const FUNDAMENTALS_GLOSSARY: Record<keyof DerivedPeriod["metrics"], GlossaryEntry> = {
  revenue: {
    title: "Revenue",
    what: "All the money the company brought in from selling its products or services, before paying any costs. Also called sales or turnover.",
    read: [
      "Rising revenue: more customers are buying, or they are paying more.",
      "Falling revenue: the business is shrinking, at least for now.",
    ],
    tip: "Revenue growth is good, but only if the company also keeps some of it as profit.",
  },
  grossProfit: {
    title: "Gross profit",
    what: "What is left from revenue after paying the direct cost of making or buying what was sold, such as raw materials and factory wages.",
    read: ["Growing gross profit means the core product is earning more."],
  },
  operatingIncome: {
    title: "Operating profit",
    what: "Profit from running the business day to day, after paying staff, rent, marketing and other running costs, but before interest and tax.",
    read: [
      "This shows whether the main business makes money, ignoring how it is financed.",
      "A negative number means the day-to-day business is losing money.",
    ],
  },
  netIncome: {
    title: "Net profit",
    what: "The final profit after every cost, including interest on loans and tax. This is what actually belongs to shareholders.",
    read: [
      "Positive: the company made money. Negative: it made a loss.",
      "Compare it with last period to see if things are improving.",
    ],
    tip: "One-off events, like selling a building, can make net profit jump for a single year. Check the notes for anything unusual.",
  },
  eps: {
    title: "EPS (earnings per share)",
    what: "Net profit divided by the number of shares. It tells you how much profit the company made for each share you own.",
    read: [
      "If EPS is ₦5 and you own 100 shares, the company earned ₦500 on your behalf this period.",
      "Rising EPS is one of the clearest signs a company is becoming more valuable to shareholders.",
    ],
    tip: "We calculate EPS ourselves and compare it with the number the company reports. A big difference is flagged, since it may mean a figure was misread.",
  },
  grossMargin: {
    title: "Gross margin",
    what: "Gross profit as a percentage of revenue. Out of every ₦100 of sales, how much is left after the direct cost of the product.",
    read: [
      "Higher is better: the company can charge well above what its product costs.",
      "A falling margin can mean rising costs or price cuts to win customers.",
    ],
  },
  operatingMargin: {
    title: "Operating margin",
    what: "Operating profit as a percentage of revenue. Out of every ₦100 of sales, how much is left after running the business.",
    read: ["Higher is better. Compare it with similar companies, since some industries naturally run on thin margins."],
  },
  netMargin: {
    title: "Net margin",
    what: "Net profit as a percentage of revenue. Out of every ₦100 of sales, how much ends up as final profit.",
    read: [
      "A net margin of 10% means ₦10 profit for every ₦100 of sales.",
      "Changes are shown in \"pp\" (percentage points): going from 8% to 10% is +2 pp.",
    ],
  },
  roe: {
    title: "Return on equity (ROE)",
    what: "Net profit as a percentage of the shareholders' money in the business. It shows how well the company turns its owners' money into profit.",
    read: [
      "15% or more is generally considered strong.",
      "Very high ROE can also come from heavy borrowing, so check debt too.",
    ],
  },
  totalDebt: {
    title: "Total debt",
    what: "All the money the company has borrowed, from banks or by issuing bonds, that it has to pay back with interest.",
    read: [
      "Falling debt: the company is paying down what it owes. Usually a good sign.",
      "Rising debt: it is borrowing more. Fine if it is funding growth, worrying if it is covering losses.",
    ],
    tip: "Interest on debt eats into profit, and high debt makes a company fragile when times get tough.",
  },
  netDebt: {
    title: "Net debt",
    what: "Total debt minus the cash the company holds. It shows how much it would still owe if it used all its cash to repay loans.",
    read: ["A negative number means the company has more cash than debt, which is a strong position."],
  },
  debtToEquity: {
    title: "Debt to equity",
    what: "Debt compared with the shareholders' money in the business. It shows how much the company relies on borrowing.",
    read: [
      "Under 50%: modest borrowing.",
      "Over 100%: the company owes more than its owners have put in, which adds risk.",
    ],
  },
  totalLiabilities: {
    title: "Total liabilities",
    what: "Everything the company owes: loans, unpaid bills to suppliers, taxes due and other obligations.",
    read: ["Falling liabilities while the business grows is a healthy sign."],
  },
  totalEquity: {
    title: "Shareholders' equity",
    what: "What would be left for shareholders if the company sold everything it owns and paid off everything it owes. Roughly the book value of the business.",
    read: ["Growing equity usually means the company is keeping profits and building value."],
  },
  cash: {
    title: "Cash",
    what: "Money the company has in the bank or in very safe short-term investments.",
    read: ["More cash gives the company a cushion for hard times and money to invest or pay dividends."],
  },
  operatingCashFlow: {
    title: "Operating cash flow",
    what: "Actual cash that came in from running the business. Unlike profit, it cannot be flattered by accounting choices.",
    read: [
      "If profit is high but cash flow is weak, the company may not be collecting what it is owed.",
      "Steady positive cash flow is a sign of a healthy business.",
    ],
  },
  freeCashFlow: {
    title: "Free cash flow",
    what: "Operating cash flow minus money spent on equipment, buildings and other long-term investments. This is the spare cash available for dividends, repaying debt or growth.",
    read: [
      "Positive and growing: the company generates more cash than it needs.",
      "Negative: it is spending more than it brings in, often because it is investing heavily.",
    ],
  },
};
