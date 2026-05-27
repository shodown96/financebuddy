"use client";

import React, { useMemo, useState } from "react";

type Category =
  | "Savings"
  | "Budgeting"
  | "Tax & Payroll"
  | "Stocks & Equities"
  | "Orders & Trading"
  | "Bonds & Fixed Income"
  | "Funds"
  | "Real Assets"
  | "Crypto & Forex"
  | "Wealth Protection"
  | "Retirement"
  | "General Finance";

type Term = {
  term: string;
  category: Category;
  definition: string;
  example?: string;
  compare?: string;
  also?: string;
};

const TERMS: Term[] = [
  // ---- SAVINGS ----
  {
    term: "Savings Account",
    category: "Savings",
    definition:
      "A bank account designed to hold money you do not need for daily spending, earning interest in return. Unlike a current account (built for transactions), a savings account rewards you for leaving money untouched. Traditional bank savings accounts in Nigeria offer low rates, often 1 to 4%, which is why fintech platforms like PiggyVest, Cowrywise, and Optimus have become popular alternatives offering significantly higher rates.",
    compare:
      "vs Fixed Deposit: a savings account lets you withdraw at any time; a fixed deposit locks your money for a set period in exchange for a higher rate.",
  },
  {
    term: "High-Yield Savings Account",
    category: "Savings",
    definition:
      "A savings account offering interest rates significantly above what traditional banks pay, usually provided by fintech platforms or online banks with lower overhead. In Nigeria, platforms like PiggyVest Flex (Naira), Cowrywise, and Optimus regularly offer rates between 10% and 20%+, far above the 1 to 4% at most commercial banks.",
    example:
      "Keeping 1,000,000 in a traditional account at 2% earns you 20,000 a year. In a high-yield account at 15%, the same money earns 150,000, a difference of 130,000 for identical effort.",
    compare:
      "vs Fixed Deposit: high-yield savings accounts usually allow withdrawals at any time; fixed deposits lock your money but may offer even higher rates in return.",
  },
  {
    term: "Emergency Fund",
    category: "Savings",
    definition:
      "Money set aside exclusively for unexpected, urgent expenses, sudden job loss, medical emergencies, urgent car repairs, or a broken appliance. The key rule: this money must be immediately accessible, not locked in a fixed deposit or invested in stocks. A widely recommended target is three to six months of essential living expenses. Store it somewhere accessible but separate from your spending account, ideally in a high-yield savings account or money market fund.",
    example:
      "If your monthly rent, food, transport, and utilities total 200,000, a solid emergency fund holds between 600,000 and 1,200,000.",
  },
  {
    term: "Fixed Deposit",
    category: "Savings",
    also: "Term Deposit",
    definition:
      "A savings product where you lock a sum of money with a bank for a fixed period, 30, 60, 90, 180, or 365 days, in exchange for a guaranteed, typically higher, interest rate. You cannot access the money early without a penalty (usually forfeiting some interest). The rate is locked in at the start, so you are protected if market rates fall, but you also miss out if rates rise.",
    example:
      "You deposit 5,000,000 in a 6-month fixed deposit at 14%. After six months you receive 5,350,000, your principal plus 350,000 interest, guaranteed regardless of what happens to interest rates during that time.",
    compare:
      "vs Treasury Bill: both lock money for a fixed period at a guaranteed return. T-bills are issued by the government (zero default risk); fixed deposits are issued by banks (carry some bank risk, though covered by deposit insurance up to a limit). T-bills are generally slightly safer.",
  },
  {
    term: "Compound Interest",
    category: "Savings",
    definition:
      "Interest calculated on both your original principal and the interest already added to your account. This causes wealth to grow exponentially rather than in a straight line. The more frequently interest compounds, daily, monthly, annually, the faster growth occurs. It is often called the eighth wonder of the world because time alone, not extra effort, does the heavy lifting.",
    example:
      "Start with 1,000,000 at 10% per year compounded annually. Year 1: 1,000,000 x 1.10 = 1,100,000 (earned 100,000). Year 2: 1,100,000 x 1.10 = 1,210,000 (earned 110,000, 10,000 more than year 1 because you earned interest on last year's interest). Year 3: 1,210,000 x 1.10 = 1,331,000 (earned 121,000). By year 10: approximately 2,593,742. Simple interest at the same 10% would only give 2,000,000 after 10 years (100,000 flat each year). The compound approach delivers 593,742 more, with no extra deposits. Rule of 72: divide 72 by your rate to estimate doubling time. At 10%, money doubles in 7.2 years. At 18%, in 4 years. At 6%, in 12 years.",
    compare:
      "vs Simple Interest: simple interest always calculates on the original principal only. Compound interest calculates on a growing balance. For short periods the gap is small; over decades it is enormous.",
  },
  {
    term: "Simple Interest",
    category: "Savings",
    definition:
      "Interest calculated only on the original principal, never on interest already earned. The annual return is always the same fixed amount regardless of how long the money has been invested. Common in short-term loans and some basic savings products.",
    example:
      "500,000 at 10% simple interest. Year 1: earns 500,000 x 10% = 50,000. Balance = 550,000. Year 2: still earns 500,000 x 10% = 50,000 (calculated on original 500,000 only, not 550,000). Balance = 600,000. Year 3: earns 50,000 again. Balance = 650,000. After 10 years: 1,000,000 (original 500,000 + 500,000 interest at 50,000/year). With compound interest at the same 10%, year 3 already earns 60,500 instead of 50,000, and by year 10 the balance is 1,296,871, nearly 300,000 more than simple interest on the same principal.",
    compare:
      "vs Compound Interest: compound interest earns interest on interest. Simple interest earns the same flat amount every period. The longer the time frame, the larger the gap in outcomes.",
  },
  {
    term: "Annual Percentage Yield (APY)",
    category: "Savings",
    also: "Effective Annual Rate (EAR)",
    definition:
      "The real rate of return on a savings account over one full year, factoring in the effect of compounding. If an account pays 12% annually but compounds monthly, the APY is slightly above 12% because each month's interest earns its own interest for the remaining months of the year. Always compare APY rather than the headline rate when evaluating savings accounts.",
    example:
      "A 12% nominal rate compounding monthly: each month earns 12% / 12 = 1% on the current balance. Month 1: 1,000,000 x 1% = 10,000 interest, balance = 1,010,000. Month 2: 1,010,000 x 1% = 10,100 (slightly more because last month's interest is now in the base). After 12 months: 1,126,825, meaning the APY is 12.68%, not 12%. On a 5,000,000 deposit that extra 0.68% equals 34,000 in additional earnings per year purely from the compounding frequency.",
    compare:
      "vs APR: APR is the stated rate before compounding. APY is the actual return after compounding. APY is always higher than or equal to APR for the same product.",
  },
  {
    term: "Annual Percentage Rate (APR)",
    category: "Savings",
    definition:
      "The stated annual interest rate without factoring in compounding. Used to describe both the cost of borrowing (loans, credit cards, mortgages) and sometimes savings rates. Because it ignores compounding, APR understates the true annual cost of debt and the true return on savings.",
    example:
      "A credit card with 24% APR compounding monthly actually costs you 26.8% APY annually. That extra 2.8% is the real additional cost of leaving a balance unpaid each month.",
    compare:
      "vs APY: APR understates the true annual impact because it ignores compounding. When borrowing, a lower APR is better. When saving, look at APY to see what you actually earn.",
  },
  {
    term: "Principal",
    category: "Savings",
    definition:
      "The original amount of money you deposit, invest, or borrow, before any interest is added or charged. When your savings grow, everything above the principal is interest earned. In lending, every repayment is split between reducing principal and paying interest.",
    example:
      "You deposit 2,000,000 in a savings account. A year later the balance is 2,300,000. Your principal remains 2,000,000; the 300,000 above it is interest earned.",
  },
  {
    term: "Liquidity",
    category: "Savings",
    definition:
      "How quickly and easily an asset can be converted into cash without a significant loss in value. Cash is perfectly liquid. A savings account is highly liquid. Stocks on a major exchange are fairly liquid (1 to 3 business days to settle). Real estate and fixed deposits are illiquid, selling takes time or carries penalties.",
    example:
      "You face a medical emergency and need 500,000 today. Cash in a savings account delivers it instantly. A fixed deposit may charge a penalty. A stock portfolio takes 1 to 3 days to settle. A rental property might take months to sell. Always keep your emergency fund in a liquid form.",
  },
  {
    term: "Rule of 72",
    category: "Savings",
    definition:
      "A quick mental calculation to estimate how many years it takes for an investment to double at a fixed annual return. Divide 72 by the annual interest rate. The result is the approximate doubling time in years. Useful for comparing rates without a calculator.",
    example:
      "At 9% annual return, money doubles in 72 / 9 = 8 years. At 18%, it doubles in 4 years. At 6%, in 12 years. So earning 18% for 20 years is not just twice as good as 9%, it lets you double your money 5 times versus 2.5 times. The gap is dramatic.",
  },

  // ---- BUDGETING ----
  {
    term: "Budget",
    category: "Budgeting",
    definition:
      "A written plan deciding how income will be allocated across spending, saving, and investing before the money arrives. A budget is not a restriction, it is an intention. Without one, money tends to disappear into discretionary spending without building long-term wealth. The point of a budget is to make saving non-negotiable rather than optional.",
  },
  {
    term: "Gross Income",
    category: "Budgeting",
    definition:
      "Your total earnings before any deductions, tax, pension, insurance, or loan repayments. The headline figure on a salary offer or total business revenue before expenses. You cannot spend your gross income; always plan budgets using your net (take-home) amount.",
    compare:
      "vs Net Income: gross is what you earn on paper; net is what actually arrives in your account. Building a budget on gross income leads to overspending every month.",
  },
  {
    term: "Net Income",
    category: "Budgeting",
    also: "Take-Home Pay",
    definition:
      "The actual money that arrives in your account after all mandatory deductions, income tax, pension contributions, insurance. This is the only correct figure to use when budgeting. For salaried workers, it is gross pay minus PAYE, pension, and any other payroll deductions.",
  },
  {
    term: "Cash Flow",
    category: "Budgeting",
    definition:
      "The total movement of money into and out of your finances in a given period. Positive cash flow means more comes in than goes out, the foundation for building wealth. Negative cash flow means spending exceeds income, and debt is accumulating. Managing cash flow is the foundation of every financial plan.",
    example:
      "Monthly income 400,000. Total outgoings 310,000. Cash flow = +90,000. That surplus is available to save or invest. If outgoings were 420,000, cash flow would be -20,000, debt quietly accumulating every month.",
  },
  {
    term: "Discretionary Spending",
    category: "Budgeting",
    definition:
      "Money spent on non-essential, chosen items, restaurants, entertainment, clothing beyond necessity, streaming subscriptions, holidays, impulse purchases. This is the most flexible category in any budget and the first place to look when trying to free up money for investing or saving.",
    compare:
      "vs Non-Discretionary Spending: discretionary is a choice; non-discretionary is a near-fixed obligation. Cutting discretionary spending is painful but fast; cutting non-discretionary spending requires bigger life changes.",
  },
  {
    term: "Non-Discretionary Spending",
    category: "Budgeting",
    also: "Fixed Expenses",
    definition:
      "Spending on essential, fixed costs that are difficult to avoid or reduce quickly, rent, electricity, food staples, transport to work, loan repayments, insurance premiums. These are the bills that exist regardless of your income level and must be planned for before allocating money to anything else.",
  },
  {
    term: "Pay Yourself First",
    category: "Budgeting",
    definition:
      "A savings strategy where you move a fixed amount to savings or investments the moment income arrives, before paying any bills or spending anything. Whatever remains is then used for living expenses. This reverses the common pattern of spending first and saving whatever is left, which is usually nothing.",
    example:
      "Your salary of 300,000 arrives. You immediately transfer 60,000 (20%) to an investment account and 30,000 (10%) to your emergency fund. You live on 210,000. Saving becomes automatic rather than aspirational.",
  },
  {
    term: "50/30/20 Rule",
    category: "Budgeting",
    definition:
      "A popular budget framework: 50% of net income to needs (rent, food, utilities), 30% to wants (entertainment, dining out, hobbies), 20% to savings and investments. These are a starting point, not a rule. Many serious wealth-builders push 40 to 50% into savings and investments, especially in the early years of building wealth.",
  },
  {
    term: "Sinking Fund",
    category: "Budgeting",
    definition:
      "A pot of money built gradually in small regular contributions for a specific, known future expense, car insurance, school fees, a holiday, annual subscriptions. Instead of scrambling when the bill arrives, you prepare for it quietly over months.",
    example:
      "Your car insurance renews every January for 240,000. Starting in January, you set aside 20,000 per month in a labelled savings pocket. By December the money is already there, no scrambling, no borrowing.",
  },

  // ---- TAX & PAYROLL ----
  {
    term: "PAYE",
    category: "Tax & Payroll",
    also: "Pay As You Earn",
    definition:
      "A tax collection system in which income tax is deducted directly from an employee's salary by the employer before the money ever reaches the employee's account. The employer sends the deducted tax to the government on the employee's behalf, typically monthly. Used in Nigeria, the UK, Rwanda, and many other countries. For the self-employed, PAYE does not apply automatically; they must file and pay their own tax separately.",
    example:
      "Your monthly gross salary is 500,000. The employer calculates the income tax owed on that amount, say 84,000, and pays you only 416,000. The 84,000 goes directly to the tax authority. You never receive the tax portion; it is removed before you see it.",
    compare:
      "vs Self-Assessment: PAYE is automatic for employees, the employer handles everything. Self-employed people must calculate and pay their own tax through a self-assessment return filed once a year.",
  },
  {
    term: "Progressive Tax",
    category: "Tax & Payroll",
    definition:
      "A tax system in which the rate of tax increases as income rises. Lower income earners pay a lower percentage; higher income earners pay a higher percentage. Every country in this app (Nigeria, UK, Canada, US, Rwanda) uses a progressive income tax system. Critically, higher rates apply only to the income within each band, not to all income.",
    example:
      "Nigeria's PAYE bands: 0% on the first 800,000, then 15% on the next 2,200,000. Someone earning 1,000,000 does not pay 15% on all 1,000,000, they pay 0% on the first 800,000 and 15% only on the 200,000 above that. Tax = 0 + 30,000 = 30,000, not 150,000.",
    compare:
      "vs Flat Tax: a flat tax applies the same single rate to all income regardless of how much is earned. Progressive taxation is more common globally because it aims to distribute the tax burden according to ability to pay.",
  },
  {
    term: "Tax Band",
    category: "Tax & Payroll",
    also: "Tax Bracket",
    definition:
      "A defined range of income to which a specific tax rate applies under a progressive tax system. Income is taxed band by band, each slice of income faces its own rate. You move up to the next band only for income above the lower band's ceiling.",
    example:
      "Rwanda's monthly PAYE bands: Band 1 is 0 to 60,000 (0%). Band 2 is 60,001 to 100,000 (10%). Band 3 is 100,001 to 200,000 (20%). Band 4 is 200,001+ (30%). On a monthly income of 150,000: 0% on the first 60,000 = 0. 10% on the next 40,000 = 4,000. 20% on the remaining 50,000 = 10,000. Total tax = 14,000.",
  },
  {
    term: "Effective Tax Rate",
    category: "Tax & Payroll",
    definition:
      "The actual percentage of your total income paid in tax, your total tax bill divided by your total income. Because of progressive banding, your effective rate is always lower than your highest (marginal) rate. It gives you the truest picture of your overall tax burden.",
    example:
      "You earn 500,000 monthly and pay 84,000 in PAYE. Effective rate = 84,000 / 500,000 = 16.8%. Even though 30% of your top-band income is taxed, your effective rate on all income is only 16.8% because the lower bands are taxed at lower rates.",
    compare:
      "vs Marginal Tax Rate: your marginal rate is the rate on your next unit of income, the highest band you reach. Your effective rate is the blended average across all bands. Effective rate is always lower than marginal rate in a progressive system.",
  },
  {
    term: "Marginal Tax Rate",
    category: "Tax & Payroll",
    definition:
      "The tax rate that applies to the very next unit of income you earn, the rate on the highest band your income reaches. Relevant for decisions about whether additional income (a bonus, a side hustle, overtime) is worth pursuing after tax.",
    example:
      "If your income places you in the 30% band, every additional 1,000 you earn above that threshold adds only 700 to your take-home pay (1,000 minus 300 in tax). Knowing your marginal rate helps you evaluate whether extra work is financially worthwhile.",
    compare:
      "vs Effective Tax Rate: marginal rate is the rate on your last naira of income. Effective rate is the blended average across all income. A 30% marginal rate does not mean you pay 30% on everything, most of your income was taxed at much lower rates.",
  },
  {
    term: "Taxable Income",
    category: "Tax & Payroll",
    definition:
      "The portion of your gross income that is actually subject to income tax after applying all allowable deductions, allowances, and reliefs. Tax is calculated on taxable income, not on total gross income. Reducing taxable income through eligible deductions directly reduces your tax bill.",
    example:
      "UK example: gross income 60,000. Personal allowance 12,570 is deducted. Taxable income = 47,430. Tax is calculated only on this 47,430, not on the full 60,000. The allowance saves you from paying any tax on the first 12,570 earned.",
    compare:
      "vs Gross Income: gross income is everything you earn. Taxable income is what remains after subtracting allowances and reliefs. The gap between the two represents the value of your tax reliefs.",
  },
  {
    term: "Tax Relief",
    category: "Tax & Payroll",
    also: "Tax Deduction / Allowance",
    definition:
      "An amount you are allowed to subtract from your gross income before calculating how much tax you owe, reducing your taxable income and therefore your tax bill. Different countries offer different reliefs, pension contributions, personal allowances, professional expenses, and insurance premiums are common examples.",
    example:
      "Nigeria's Consolidated Relief Allowance (CRA) is the most significant relief, 200,000 or 1% of gross income (whichever is higher) plus 20% of gross income. On a 5,000,000 annual income, CRA = 200,000 + 1,000,000 = 1,200,000. Tax is computed on 3,800,000, not 5,000,000.",
  },
  {
    term: "CRA (Consolidated Relief Allowance)",
    category: "Tax & Payroll",
    definition:
      "Nigeria's primary income tax relief for employees and sole traders under the Personal Income Tax Act. Calculated as the higher of 200,000 or 1% of gross income, plus 20% of gross income. Subtracted from gross income before applying PAYE bands. The Nigeria tax calculator on this site notes that CRA is not applied, enter your post-CRA income for accurate results.",
    example:
      "Annual gross income 6,000,000. CRA = max(200,000, 1% x 6,000,000) + 20% x 6,000,000 = 60,000... wait, 1% x 6,000,000 = 60,000, which is less than 200,000, so use 200,000 + 20% x 6,000,000 = 200,000 + 1,200,000 = 1,400,000. Taxable income = 6,000,000 - 1,400,000 = 4,600,000.",
  },
  {
    term: "Personal Allowance",
    category: "Tax & Payroll",
    definition:
      "In the UK, the amount of income you can earn each year completely free of income tax. For the 2024/25 tax year, this is 12,570. Only income above this threshold is subject to tax. The allowance is gradually withdrawn for incomes above 100,000, reduced by 1 for every 2 earned above that level, disappearing entirely at 125,140.",
    example:
      "Gross income 50,000. Personal allowance 12,570. Taxable income = 37,430. The first 12,570 is tax-free. Income between 12,571 and 50,270 is taxed at the basic rate (20%). Tax = 37,430 x 20% = 7,486.",
    compare:
      "vs CRA (Nigeria): both are deductions from gross income before tax is applied. The UK Personal Allowance is a fixed threshold; Nigeria's CRA is a formula-based percentage.",
  },
  {
    term: "Personal Allowance Taper",
    category: "Tax & Payroll",
    definition:
      "A UK rule that reduces the standard Personal Allowance (12,570) for high earners. For every 2 of income above 100,000, the allowance falls by 1. At income of 125,140 or above, the allowance is zero, and income between 100,000 and 125,140 is effectively taxed at 60% (40% higher rate plus loss of 20p of allowance per 1 earned).",
    example:
      "Income of 110,000. Excess above 100,000 = 10,000. Allowance reduced by 10,000 / 2 = 5,000. Effective personal allowance = 12,570 - 5,000 = 7,570. This subtle withdrawal creates a punishing 60% effective marginal rate in that 25,140 income range, a key reason the UK tax calculator shows a non-linear effective rate curve.",
  },
  {
    term: "National Insurance (NI)",
    category: "Tax & Payroll",
    definition:
      "A UK payroll deduction that funds state benefits including the NHS, state pension, and unemployment benefits. Employees pay Class 1 NI on earnings above the Primary Threshold (12,570). The 2024/25 rates: 8% on earnings between 12,570 and 50,270, then 2% on anything above 50,270. Employers pay a separate employer NI on top of this.",
    example:
      "Annual income 60,000. NI on 12,570 to 50,270 = 37,700 x 8% = 3,016. NI on 50,270 to 60,000 = 9,730 x 2% = 195. Total employee NI = 3,211 per year (268 per month). This is on top of your income tax, giving you two deductions from gross pay.",
    compare:
      "vs Income Tax: both are deducted from UK salary through PAYE, but they are separate calculations with different thresholds and rates. NI does not apply in Scotland or Wales at different rates, it is a uniform UK-wide deduction unlike Scottish income tax.",
  },
  {
    term: "CPP (Canada Pension Plan)",
    category: "Tax & Payroll",
    definition:
      "A mandatory Canadian pension contribution for employees and employers. In 2024, employees contribute 5.95% of pensionable earnings between the Year's Basic Exemption (3,500) and the Year's Maximum Pensionable Earnings (68,500), up to a maximum of about 3,867. In return, contributors receive a monthly pension at retirement based on contributions over their working life.",
    example:
      "Pensionable earnings: 68,500 minus 3,500 = 65,000. CPP = 65,000 x 5.95% = 3,867.50. This is the maximum CPP contribution for 2024. Earnings above 68,500 also face CPP2 (a second enhanced contribution at 4%) up to a second ceiling of 73,200.",
    compare:
      "vs QPP (Quebec): Quebec residents contribute to the Quebec Pension Plan instead of CPP. QPP rates are slightly higher (6.4%) and the plan is administered by Quebec rather than the federal government.",
  },
  {
    term: "QPP (Quebec Pension Plan)",
    category: "Tax & Payroll",
    definition:
      "The Quebec equivalent of the Canada Pension Plan, administered by the provincial government of Quebec rather than the federal government. Applies to all employees who work in Quebec. The 2024 employee contribution rate is 6.4%, slightly higher than CPP's 5.95%. Quebec also has QPIP (Quebec Parental Insurance Plan) instead of EI maternity/parental benefits.",
    compare:
      "vs CPP: QPP and CPP provide broadly the same retirement benefit but are run by separate governments. Quebec opted out of CPP when it was created in 1965, establishing its own equivalent scheme.",
  },
  {
    term: "EI (Employment Insurance)",
    category: "Tax & Payroll",
    definition:
      "A Canadian federal program providing temporary income replacement for workers who lose their jobs through no fault of their own, or who take parental or medical leave. Both employees and employers contribute. The 2024 employee premium rate is 1.66% on insurable earnings up to 63,200, giving a maximum annual contribution of about 1,049.",
    example:
      "Annual salary 50,000. EI = 50,000 x 1.66% = 830 per year (69 per month). This amount, along with your employer's matching contribution, funds the programme. If you are laid off, you can claim up to 55% of your average insurable weekly earnings for up to 45 weeks depending on the regional unemployment rate.",
    compare:
      "vs QPIP: Quebec residents pay a lower EI rate (1.32%) because QPIP covers parental benefits separately in Quebec. The net deduction is similar when both QPIP and lower EI are combined.",
  },
  {
    term: "FICA",
    category: "Tax & Payroll",
    also: "Federal Insurance Contributions Act",
    definition:
      "The US law mandating payroll contributions to two federal programs: Social Security (retirement, disability, survivor benefits) and Medicare (healthcare for those 65+). Both the employee and employer each contribute half. For 2024: Social Security is 6.2% on wages up to 168,600. Medicare is 1.45% on all wages with no cap. High earners pay an additional 0.9% Medicare surcharge on wages above 200,000 (single) or 250,000 (married).",
    example:
      "Annual salary $100,000. Social Security: $100,000 x 6.2% = $6,200. Medicare: $100,000 x 1.45% = $1,450. Total FICA = $7,650 per year ($637.50 per month). Your employer pays another $7,650 on your behalf that you never see.",
    compare:
      "vs CPP/EI (Canada) and NI (UK): all three are payroll-tax systems funding social insurance programmes, structured differently by country but serving the same purpose.",
  },
  {
    term: "Social Security Tax",
    category: "Tax & Payroll",
    definition:
      "The US employee contribution to the Social Security programme, a federal retirement and disability insurance scheme. The 2024 rate is 6.2% on wages up to a wage base of 168,600. Once your annual earnings exceed this cap, no further Social Security tax is deducted for the rest of that year. The employer matches this 6.2% separately.",
    example:
      "You earn $200,000. Social Security tax applies only to the first $168,600: 168,600 x 6.2% = $10,453. On income above $168,600, no additional Social Security tax is deducted, but Medicare tax continues with no cap.",
  },
  {
    term: "Medicare Tax",
    category: "Tax & Payroll",
    definition:
      "The US employee contribution to Medicare, the federal health insurance programme for people aged 65 and over and certain younger people with disabilities. The standard rate is 1.45% on all wages with no upper limit. High earners pay an additional 0.9% on earnings above 200,000 (single filers) or 250,000 (married filing jointly), this is the Additional Medicare Tax.",
    example:
      "Annual salary $300,000 (single filer). Standard Medicare: $300,000 x 1.45% = $4,350. Additional Medicare on amounts above $200,000: $100,000 x 0.9% = $900. Total Medicare = $5,250. Note: the Additional Medicare Tax is not matched by the employer, it is an employee-only surcharge.",
  },
  {
    term: "Standard Deduction",
    category: "Tax & Payroll",
    definition:
      "A fixed amount the US Internal Revenue Service allows taxpayers to deduct from gross income before calculating federal income tax, without needing to itemise individual expenses. For 2024: $14,600 for single filers, $29,200 for married filing jointly, $21,900 for head of household. Most Americans use the standard deduction rather than itemising.",
    example:
      "Single filer earns $80,000. Standard deduction: $14,600. Taxable income = $80,000 - $14,600 = $65,400. Federal income tax is calculated on $65,400, not $80,000. The $14,600 deduction saves roughly $1,606 to $3,212 in tax depending on the bracket.",
    compare:
      "vs UK Personal Allowance: both reduce taxable income before applying brackets, but the US standard deduction is larger and all filers also have a choice to itemise deductions instead. The UK Personal Allowance tapers away for high earners; the US standard deduction does not.",
  },
  {
    term: "Filing Status",
    category: "Tax & Payroll",
    definition:
      "A US tax category that determines which tax brackets, standard deduction, and credits apply to your return. The three main statuses are: Single (unmarried), Married Filing Jointly (married couples combining income on one return), and Head of Household (unmarried people who pay more than half the cost of a home for a qualifying dependent). Filing status significantly affects how much tax you owe.",
    example:
      "The same $100,000 income generates different tax bills by status. Single filer: taxable income $85,400 after standard deduction, federal tax approximately $15,093. Married Filing Jointly: taxable income $70,800 after larger standard deduction, federal tax approximately $9,674. The MFJ bracket thresholds are also twice as wide, reducing the marginal rate on higher income. Filing status is one of the most impactful variables in the US tax calculator.",
  },
  {
    term: "RSSB (Rwanda Social Security Board)",
    category: "Tax & Payroll",
    definition:
      "The government body that administers Rwanda's mandatory social security contributions. Employers collect both employee and employer contributions monthly and remit them to RSSB. Employee contributions cover pension (6% in 2025), maternity leave (0.3%), and CBHI (0.5%). Employer contributions include matching pension (6%), maternity (0.3%), and occupational hazard insurance (2%).",
    compare:
      "vs PAYE: PAYE is income tax collected by the Rwanda Revenue Authority (RRA). RSSB contributions are social security payments collected by the Rwanda Social Security Board. Both are deducted from payroll but are entirely separate systems going to different bodies.",
  },
  {
    term: "CBHI (Community-Based Health Insurance)",
    category: "Tax & Payroll",
    definition:
      "Rwanda's mandatory health insurance contribution for formal sector employees. The employee contributes 0.5% of their net salary (calculated on the amount remaining after PAYE, pension, and maternity deductions). This is deducted monthly alongside other RSSB contributions and provides access to healthcare through Rwanda's community health insurance network.",
    example:
      "Monthly gross salary 400,000. After PAYE (84,000), pension (24,000), and maternity (1,200), the net is 290,800. CBHI = 290,800 x 0.5% = 1,454 per month. Final take-home: 289,346.",
    compare:
      "vs NI (UK) and Medicare (US): all three are employer/employee-shared contributions funding healthcare access, structured differently but serving the same underlying purpose of ensuring workers have access to medical care.",
  },
  {
    term: "Withholding Tax",
    category: "Tax & Payroll",
    definition:
      "Tax deducted at source from a payment before it reaches the recipient. PAYE is the most common form, income tax withheld from wages. Withholding also applies to interest, dividends, and certain professional fees. The withheld amount is remitted directly to the tax authority by the payer (the employer or bank), not the recipient.",
    compare:
      "vs Self-Assessment Tax: withholding tax is collected automatically without the recipient doing anything. Self-assessment requires the taxpayer to calculate and voluntarily pay their own tax, typical for freelancers, the self-employed, and those with income from multiple sources.",
  },
  {
    term: "Compounding Frequency",
    category: "Tax & Payroll",
    definition:
      "How often interest is calculated and added to a balance, daily, monthly, quarterly, or annually. The more frequently interest compounds, the higher the effective annual yield (APY), even at the same nominal rate. Relevant to every savings and interest calculator.",
    example:
      "100,000 at 12% nominal rate for 1 year. Compounded annually: 112,000. Compounded monthly: 112,683 (1% applied to growing balance each month). Compounded daily: 112,747. The difference seems small at 1 year but compounds dramatically over 10 to 20 years, especially on larger principals.",
    compare:
      "vs Annual Rate: the annual rate is the stated rate. Compounding frequency determines how that rate is applied, the same 12% rate produces more money when compounded monthly than when compounded annually.",
  },
  {
    term: "Regular Contribution",
    category: "Tax & Payroll",
    also: "Monthly Top-Up",
    definition:
      "A fixed amount added to a savings or investment account at regular intervals, typically monthly. Regular contributions are the engine of long-term wealth building. Combined with compound interest, even modest monthly contributions accumulate to significant sums over years. Used directly in the Annual Estimator and Monthly Interest calculators.",
    example:
      "Starting with 500,000 and adding 50,000 per month at 12% annual interest compounded monthly for 10 years. Without contributions: 500,000 grows to about 1,649,000. With 50,000 monthly top-ups: final balance is approximately 12,270,000, showing that regular contributions contribute far more than the initial lump sum over a long period.",
    compare:
      "vs Lump Sum: a regular contribution invests smaller amounts over time (dollar-cost averaging). A lump sum invests all at once. For salaried workers, regular monthly contributions are the natural approach since income arrives monthly.",
  },

  // ---- STOCKS & EQUITIES ----
  {
    term: "Stock",
    category: "Stocks & Equities",
    also: "Share / Equity",
    definition:
      "A unit of ownership in a company. When a company sells shares to the public, it divides ownership into millions (or billions) of small pieces. Buy enough of those pieces and you own a measurable portion of that business, including a share of its profits, its assets, and its growth over time. If the company grows in value, your shares grow proportionally.",
    example:
      "If Dangote Cement has 17 billion shares outstanding and you own 10,000, you own roughly 0.00006% of the company. Small as that sounds, if the company doubles in value your shares also double, no matter how small the holding.",
    compare:
      "vs Bond: a stock makes you a part-owner (equity); a bond makes you a creditor (lender). Stockholders benefit more if the company thrives enormously. Bondholders have priority in repayment if the company fails, meaning they get paid first.",
  },
  {
    term: "Stock Exchange",
    category: "Stocks & Equities",
    definition:
      "A regulated marketplace where buyers and sellers trade stocks and other financial instruments under standardised rules. Prices are determined by supply and demand in real time. Exchanges provide transparency, price discovery, and legal protection for all participants.",
    example:
      "Nigerian Exchange Group (NGX) in Lagos for Nigerian companies. New York Stock Exchange (NYSE) and NASDAQ for US companies. Apps like Bamboo and Trove give Nigerians direct access to US exchanges from their phones.",
  },
  {
    term: "Brokerage Account",
    category: "Stocks & Equities",
    definition:
      "An account opened with a licensed broker that enables you to buy and sell investments, stocks, bonds, ETFs, and more. Without one, you cannot participate in financial markets. Even when using a fintech app, the app sits on top of a brokerage infrastructure.",
    example:
      "In Nigeria: Afrinvest, Stanbic IBTC, Meristem for traditional brokers. Bamboo and Trove for US stocks via app. All require account registration, identity verification, and sometimes a minimum deposit.",
  },
  {
    term: "Stockbroker",
    category: "Stocks & Equities",
    definition:
      "A licensed professional or firm authorised to execute buy and sell orders on a stock exchange on behalf of clients. They may also offer investment advice, though execution-only brokers simply carry out orders without advising. Every stock trade, even through an app, goes through a licensed broker or a platform with brokerage infrastructure behind it.",
  },
  {
    term: "IPO (Initial Public Offering)",
    category: "Stocks & Equities",
    definition:
      "The first time a private company offers its shares to the general public on a stock exchange. Companies do this to raise capital for expansion. For investors, an IPO offers the chance to invest early, but early-stage public companies are often volatile and their true value is uncertain.",
    example:
      "Before an IPO, only founders and private investors own the company. After the IPO, anyone can buy shares on the exchange. Airtel Africa listed on the NGX in 2019, giving ordinary investors access to a stake in a company previously only accessible to institutional investors.",
    compare:
      "vs Rights Issue: an IPO is the first time shares are offered publicly. A rights issue is when an already-listed company offers additional shares to existing shareholders to raise more capital.",
  },
  {
    term: "Rights Issue",
    category: "Stocks & Equities",
    definition:
      "When an already-listed company offers new shares to its existing shareholders, usually at a discount to the current market price, to raise additional capital for expansion or debt reduction. Shareholders can buy the new shares (accept), decline (reject), or in some markets sell their rights to another investor.",
    example:
      "You own 5,000 shares at 100 each. The company announces a 1-for-5 rights issue at 85. You are entitled to buy 1,000 new shares at 85, 15 below market. Accepting protects your ownership percentage. Declining dilutes your stake as more shares are issued.",
  },
  {
    term: "Stock Split",
    category: "Stocks & Equities",
    definition:
      "When a company divides each existing share into multiple new shares, reducing the price per share proportionally. Total value stays the same, it is like cutting a pizza into more slices, but shares become more affordable and easier for smaller investors to trade.",
    example:
      "You own 100 shares at 500 each (total 50,000). A 2-for-1 split gives you 200 shares at 250 each. Your total is still 50,000. Nothing changes financially, but the lower price may attract more buyers and improve trading activity.",
  },
  {
    term: "Blue-Chip Stock",
    category: "Stocks & Equities",
    definition:
      "Shares in a large, financially stable, well-established company with a long track record of reliable performance, strong earnings, and often consistent dividend payments. Considered the backbone of long-term, lower-risk equity portfolios. They tend to weather economic downturns better than smaller companies.",
    example:
      "Nigeria: MTN Nigeria, Dangote Cement, Zenith Bank. US: Apple, Microsoft, Johnson & Johnson, Coca-Cola.",
    compare:
      "vs Growth Stock: blue chips are steady, predictable, and often dividend-paying. Growth stocks are faster-moving with higher potential returns but greater volatility and no dividends. Blue chips suit conservative investors; growth stocks suit those willing to accept short-term swings for long-term gains.",
  },
  {
    term: "Growth Stock",
    category: "Stocks & Equities",
    definition:
      "Shares in a company expected to grow revenue and earnings significantly faster than the market average. These companies typically reinvest all profits into expansion rather than paying dividends. Higher potential upside, but greater volatility and risk.",
    example:
      "Many technology companies, early-stage fintechs, e-commerce platforms, are growth stocks. Their price can double in a good year or halve in a bad one. Patience and a long time horizon are essential.",
    compare:
      "vs Value Stock: growth stocks are priced on future potential (often expensive relative to current earnings). Value stocks are priced below their current worth and appeal to investors wanting a margin of safety.",
  },
  {
    term: "Value Stock",
    category: "Stocks & Equities",
    definition:
      "A share trading below what the company is actually worth based on fundamentals, earnings, assets, cash flow. Value investors identify these undervalued companies expecting the market to eventually price them correctly.",
    compare:
      "vs Growth Stock: value investing is about finding what is cheap today based on existing business strength. Growth investing is about finding what will become expensive tomorrow based on future potential. Both approaches have produced highly successful long-term investors.",
  },
  {
    term: "Penny Stock",
    category: "Stocks & Equities",
    definition:
      "Stocks that trade at very low prices, typically below the equivalent of $5, usually in small, obscure, or speculative companies with little trading history or financial transparency. Extremely high risk: prone to price manipulation, very low liquidity, and can fall to zero with no warning.",
    example:
      "A common pattern is 'pump and dump', insiders buy cheap shares, promote them heavily through social media and messaging apps, sell when the price spikes, and leave late buyers with worthless stock. Treat any unsolicited tip to buy a cheap, unknown stock with extreme caution.",
  },
  {
    term: "Dividend",
    category: "Stocks & Equities",
    definition:
      "A portion of a company's profits paid out to shareholders, usually quarterly or annually. Not all companies pay dividends, growth companies typically reinvest all profits. Dividend-paying stocks suit investors who want regular income from their investments alongside any price appreciation.",
    example:
      "You own 10,000 shares of a bank that declares a 5 dividend per share. You receive 50,000 in cash deposited to your brokerage account, while still owning all your shares. This income arrives whether the share price goes up or down.",
  },
  {
    term: "Dividend Yield",
    category: "Stocks & Equities",
    definition:
      "The annual dividend payment expressed as a percentage of the current share price. A useful way to compare income-generating potential across different stocks without worrying about absolute prices.",
    example:
      "A stock priced at 200 paying 16 per year in dividends has a dividend yield of 8% (16 / 200). Investing 1,000,000 in this stock generates 80,000 per year in passive income while you continue to hold the shares.",
    compare:
      "Note: a very high dividend yield can sometimes signal danger. It may mean the share price has fallen sharply due to business problems, which inflates the yield ratio mathematically even as the company deteriorates.",
  },
  {
    term: "Market Capitalisation",
    category: "Stocks & Equities",
    also: "Market Cap",
    definition:
      "The total market value of all a company's outstanding shares. Calculated as share price multiplied by total number of shares. Used to classify company size. Large-cap companies (over $10 billion) are generally more stable; small-cap companies (under $2 billion) offer higher growth potential with higher risk.",
    example:
      "Share price 300 with 1 billion shares outstanding = market cap of 300 billion. If the price rises to 450, the market cap rises to 450 billion. A company's size by market cap tells you how much the entire market currently values that business.",
  },
  {
    term: "P/E Ratio",
    category: "Stocks & Equities",
    definition:
      "Price-to-Earnings ratio. The share price divided by annual earnings per share. Tells you how much investors are currently paying for every unit of profit. A high P/E suggests investors expect strong future growth; a low P/E may indicate undervaluation or weak prospects.",
    example:
      "A stock trading at 300 with annual EPS of 20 has a P/E of 15, you are paying 15 for every 1 the company earns. Comparing P/E ratios across similar companies in the same sector can reveal which are cheap or expensive relative to their earnings.",
  },
  {
    term: "Earnings Per Share (EPS)",
    category: "Stocks & Equities",
    definition:
      "A company's net profit divided by the number of shares outstanding. Shows how much profit is attributable to each share. Rising EPS year over year signals a genuinely growing business and typically drives the share price higher over time.",
    example:
      "A company earns 2,000,000,000 with 100,000,000 shares outstanding. EPS = 20. Next year profit rises to 3,000,000,000, EPS rises to 30, a 50% increase. This kind of earnings growth is what drives long-term stock price appreciation.",
  },
  {
    term: "Bull Market",
    category: "Stocks & Equities",
    definition:
      "A sustained period of rising stock prices, typically defined as a rise of 20% or more from recent lows. Investor confidence is high, economic conditions are usually favourable, and buying activity dominates. Named after the way a bull attacks, thrusting its horns upward.",
    compare:
      "vs Bear Market: a bull market rises; a bear market falls. Every bear market in history has eventually been followed by a new bull market, though the timing is unpredictable. Long-term investors hold through both.",
  },
  {
    term: "Bear Market",
    category: "Stocks & Equities",
    definition:
      "A sustained period of falling stock prices, typically a decline of 20% or more from recent highs. Triggered by economic recession, rising interest rates, geopolitical crises, or declining corporate earnings. Psychologically difficult because everything appears to be losing value.",
    example:
      "Long-term investors who stay invested through bear markets and continue buying (via dollar-cost averaging) typically emerge in far stronger positions when markets recover. The instinct to sell everything during a crash is almost always the wrong move.",
  },
  {
    term: "Market Correction",
    category: "Stocks & Equities",
    definition:
      "A decline of 10% to 20% in stock prices from a recent peak. Less severe than a bear market, and a normal, healthy part of market cycles. Corrections prevent asset bubbles by bringing inflated prices back toward fair value. They happen on average once every one to two years in most major markets.",
    compare:
      "vs Bear Market: a correction is a 10 to 20% drop, typically shorter and less damaging. A bear market is 20%+ and usually accompanied by broader economic deterioration.",
  },
  {
    term: "Volatility",
    category: "Stocks & Equities",
    definition:
      "The degree to which an asset's price moves up and down over time. High volatility means dramatic price swings in short periods; low volatility means steady, predictable movement. Volatility is not the same as risk, a volatile stock can still deliver outstanding long-term returns.",
    compare:
      "Volatility vs Risk: volatility is short-term price movement that smooths out over time. Risk is the probability of permanent capital loss. A stock that swings 30% up and down annually can still grow 300% over 10 years. For a long-term investor, short-term volatility is noise; the real risk is buying something that permanently goes to zero.",
  },
  {
    term: "Short Selling",
    category: "Stocks & Equities",
    definition:
      "Borrowing shares you do not own, selling them at the current price, waiting for the price to fall, buying them back cheaper, then returning the borrowed shares, pocketing the difference as profit. Used by investors who believe a stock is overvalued and headed lower.",
    example:
      "A stock is at 500. You borrow and sell 1,000 shares, receiving 500,000. The price falls to 350. You buy 1,000 shares for 350,000 and return them. Profit: 150,000.",
    compare:
      "Risk note: if the stock rises instead of falls, losses are theoretically unlimited, the price can keep climbing with no ceiling. Short selling is extremely high risk and unsuitable for most individuals.",
  },
  {
    term: "Dollar-Cost Averaging",
    category: "Stocks & Equities",
    also: "DCA",
    definition:
      "An investment strategy where you invest a fixed amount at regular intervals, weekly or monthly, regardless of price, rather than trying to time the market with a large lump sum. When prices are low, your fixed amount buys more units. When prices are high, it buys fewer. Over time this produces a lower average purchase cost than trying to pick the perfect moment to invest.",
    example:
      "You invest 50,000 in an ETF every month. January: price 500 per unit, you buy 100 units. February: price drops to 250, you buy 200 units. March: price is 400, you buy 125 units. Total invested: 150,000. Total units: 425. Average cost per unit: 353, significantly lower than the original 500.",
  },
  {
    term: "Portfolio",
    category: "Stocks & Equities",
    definition:
      "The complete collection of all your investments across all accounts and platforms. A well-constructed portfolio has a deliberate mix of asset types chosen to balance growth potential against risk in a way that matches your goals and time horizon.",
  },
  {
    term: "Securities",
    category: "Stocks & Equities",
    definition:
      "A broad legal term for tradeable financial instruments: stocks, bonds, ETFs, and similar assets that can be bought and sold on financial markets. When a company 'issues securities,' it is offering stocks or bonds for sale. Regulated by securities commissions, in Nigeria, the Securities and Exchange Commission (SEC).",
  },

  // ---- ORDERS & TRADING ----
  {
    term: "Market Order",
    category: "Orders & Trading",
    definition:
      "An instruction to buy or sell a security immediately at the best available current price. Execution is virtually guaranteed, but the exact price is not, in fast-moving markets you may pay slightly more (or receive slightly less) than the price you saw when placing the order.",
    example:
      "You see a stock at 38.50 and place a market buy for 1,000 shares. The order fills within seconds, but if the price moved to 38.60 in that instant, you pay 38.60. The difference is called slippage and is the cost of prioritising speed over price.",
    compare:
      "vs Limit Order: a market order guarantees execution but not price. A limit order guarantees price but not execution.",
  },
  {
    term: "Limit Order",
    category: "Orders & Trading",
    definition:
      "An instruction to buy or sell a security only at a specific price you set, or better. A buy limit order fills only at or below your specified price. A sell limit order fills only at or above it. If the market never reaches your price, the order stays open (pending) or expires.",
    example:
      "A stock is at 500. You place a limit buy at 460, believing it will dip before rising further. If the price drops to 460 or below, your order fills automatically. If the stock instead rallies to 550, your order never executes, you miss the move, but you also never overpaid.",
    compare:
      "vs Market Order: a limit order prioritises price control. A market order prioritises immediate execution. For volatile stocks, limit orders protect you from accidentally paying far more than you intended.",
  },
  {
    term: "Stop-Loss Order",
    category: "Orders & Trading",
    definition:
      "An automatic instruction to sell a security if its price falls to a level you specify, designed to cap your losses. Once the stop price is triggered, it becomes a market order and executes at the next available price.",
    example:
      "You buy shares at 1,000 and set a stop-loss at 800. If the price drops to 800, your shares are sold automatically, limiting your loss to 20%. Without this, a stock can fall to 200 or lower while you keep waiting for a recovery that may not come.",
    compare:
      "vs Stop-Limit Order: a stop-loss converts to a market order (guarantees a sale, not the price). A stop-limit converts to a limit order (guarantees a price range, not execution). In a fast crash, a stop-limit may not fill at all.",
  },
  {
    term: "Stop-Limit Order",
    category: "Orders & Trading",
    definition:
      "A combination of a stop order and a limit order. When the stop price is triggered, instead of becoming a market order it becomes a limit order at a price you specify. Gives more control over the execution price but carries the risk that the order may not fill at all if the market moves too quickly past your limit.",
    example:
      "Stop at 800, limit at 790. When the price hits 800, a limit order to sell at 790 or better is placed. If the stock crashes instantly to 700, the order never fills, you remain holding a falling stock. Useful when you want price control; risky in fast-moving markets.",
    compare:
      "vs Stop-Loss: a stop-loss guarantees you exit (at whatever market price exists); a stop-limit guarantees the exit price range but not that an exit happens at all.",
  },
  {
    term: "Bid Price",
    category: "Orders & Trading",
    definition:
      "The highest price a buyer is currently willing to pay for a security. In an order book, all outstanding buy orders are listed as bids, ranked from highest to lowest. The top bid, the best bid, is the price at which your shares will sell instantly if you place a market sell order.",
    example:
      "The order book shows three bids: 98.50 for 500 shares, 98.00 for 1,200 shares, 97.50 for 2,000 shares. The best bid is 98.50. If you own shares and want to sell immediately, you receive 98.50 each for the first 500 shares. If you need to sell more than 500, the next 1,200 go at 98.00.",
    compare:
      "vs Ask Price: the bid is what buyers offer; the ask is what sellers demand. You always sell at the bid and buy at the ask. The gap between them (the spread) is an immediate cost of entering or exiting a trade.",
  },
  {
    term: "Ask Price",
    category: "Orders & Trading",
    also: "Offer Price",
    definition:
      "The lowest price a seller is currently willing to accept for a security. In an order book, all outstanding sell orders appear as asks, ranked from lowest to highest. The best ask, the lowest, is the price you pay if you place a market buy order right now.",
    example:
      "The order book shows asks at 100.00 for 300 shares, 100.50 for 800 shares, 101.00 for 1,500 shares. The best ask is 100.00. A market buy order for 300 shares fills at 100.00. If you want 1,000 shares, the first 300 cost 100.00 and the remaining 700 cost 100.50, this is called 'walking up the order book' and increases your average purchase price.",
    compare:
      "vs Bid Price: the ask is always higher than the bid. You buy at the ask; you sell at the bid. The spread between them (100.00 ask minus 98.50 bid = 1.50 in this example) is an invisible cost you absorb the moment you trade.",
  },
  {
    term: "Bid-Ask Spread",
    category: "Orders & Trading",
    definition:
      "The difference between the highest price a buyer is willing to pay (the bid) and the lowest price a seller will accept (the ask). This gap is an invisible transaction cost, when you buy at the ask and later sell at the bid, the spread is an immediate loss you must overcome before becoming profitable.",
    example:
      "A stock has a bid of 98 and an ask of 100. The spread is 2. You buy at 100. For you to break even on a sale, the bid must rise to at least 100. Tight spreads (major liquid stocks) = lower trading cost. Wide spreads (illiquid or small stocks) = higher implicit cost per trade.",
  },
  {
    term: "Order Book",
    category: "Orders & Trading",
    definition:
      "A real-time, continuously updated list of all outstanding buy and sell orders for a security on an exchange, organised by price level and showing the quantity available at each price. Visible on trading platforms like Bamboo. The very top of the order book, the best bid and best ask, shows where the next trade will happen.",
    example:
      "The order book for a stock shows buyers queuing at 99 (10,000 shares), 98.50 (25,000 shares), and 98 (40,000 shares). On the sell side: 8,000 shares at 100, 15,000 at 100.50. The next trade will happen between 99 and 100 when a buyer and seller agree. A thick, deep order book means the stock is liquid, large orders can be filled without moving the price much. A thin book means even a modest buy order can push the price up sharply.",
    compare:
      "Why it matters: reading the order book shows you market depth, how much buying and selling pressure exists at different prices. It also reveals where large orders (potential resistance or support levels) are sitting.",
  },

  // ---- BONDS & FIXED INCOME ----
  {
    term: "Bond",
    category: "Bonds & Fixed Income",
    definition:
      "A loan you make to a government or company in exchange for a certificate promising regular interest payments (coupons) and the return of your original money on a set future date (maturity). Bonds sit on the lower-risk end of the investment spectrum because payments are contractually fixed, the borrower is legally obligated to pay.",
    example:
      "You buy a 10-year government bond for 1,000,000 with a 13% coupon. Calculation: 1,000,000 x 13% = 130,000 per year in interest. Year 1 through Year 10: you collect 130,000 every year (260,000 if paid semi-annually at 65,000 every 6 months). At the end of Year 10: the government returns your original 1,000,000 (face value). Grand total received: 130,000 x 10 = 1,300,000 in coupons + 1,000,000 principal = 2,300,000 on a 1,000,000 investment, while never risking your original capital.",
    compare:
      "vs Stock: a bond is debt (you are owed money back with interest); a stock is equity (you own part of the company). Bonds are predictable and rank above stockholders in repayment if a company fails. Stocks offer higher potential returns but no guaranteed repayment.",
  },
  {
    term: "Government Bond",
    category: "Bonds & Fixed Income",
    also: "Sovereign Bond",
    definition:
      "A bond issued by a national government to fund public spending, infrastructure, salaries, debt refinancing. Backed by the government's taxing power, making them the lowest-risk fixed income investment in that country. In Nigeria, issued and managed by the Debt Management Office (DMO) on behalf of the Federal Government.",
    compare:
      "vs Corporate Bond: government bonds pay less but are safer. Corporate bonds pay more to compensate for the additional risk that a company (unlike a government) can go bankrupt.",
  },
  {
    term: "Treasury Bill",
    category: "Bonds & Fixed Income",
    also: "T-Bill",
    definition:
      "A short-term government debt instrument with a maturity of 91, 182, or 364 days. Unlike bonds that pay periodic coupons, T-bills are sold at a discount, you pay less than face value and receive the full face value at maturity. The difference is your return. Considered one of the safest investments available.",
    example:
      "You buy a 364-day T-bill with a face value of 1,000,000 at a discounted price of 870,000. After one year, the government pays you 1,000,000. Your profit is 130,000, roughly a 14.9% return, with no periodic interest payments and zero credit risk.",
    compare:
      "vs FGN Bond: T-bills are short-term (under a year), sold at a discount, and return everything at maturity. FGN Bonds are long-term (5 to 30 years), pay regular coupon interest semi-annually, and return principal at the end. T-bills are ideal for short-term cash parking; bonds lock in a rate for years.",
  },
  {
    term: "FGN Savings Bond",
    category: "Bonds & Fixed Income",
    definition:
      "A retail-focused Federal Government of Nigeria bond designed specifically for individual investors, available at low minimum investment levels (often from 5,000). Available in 2-year and 3-year tenors, with quarterly interest payments sent directly to your bank account.",
    example:
      "One of the most accessible government-backed investment options for ordinary Nigerians. The quarterly income stream makes it popular with people who want regular passive income without any stock market exposure. Accessible through the DMO website and licensed dealers.",
  },
  {
    term: "FGN Bond",
    category: "Bonds & Fixed Income",
    definition:
      "Longer-term Federal Government of Nigeria bonds with maturities of 5, 7, 10, 20, or 30 years, paying semi-annual coupon interest. Traded on the secondary market, meaning you can sell before maturity, but the price you receive depends on prevailing interest rates at the time.",
    compare:
      "Interest rate relationship: when market interest rates rise, existing bond prices fall (because newer bonds offer better rates). When rates fall, existing bond prices rise. This matters if you plan to sell before maturity. If you hold to maturity, you always receive face value regardless of price movements.",
  },
  {
    term: "Corporate Bond",
    category: "Bonds & Fixed Income",
    definition:
      "A bond issued by a company rather than a government. Offers higher interest rates than government bonds to compensate for additional risk, a company can default (fail to pay), whereas a government rarely does.",
    example:
      "A well-rated Nigerian company might issue a 5-year bond at 17%, while FGN bonds yield 14%. The extra 3% compensates you for lending to a company rather than the government. Smaller or financially stressed companies ('high yield' or 'junk' bonds) might offer 22%+, much higher reward but meaningful default risk.",
    compare:
      "vs Government Bond: corporate bonds pay more; government bonds are safer. The decision depends on your risk tolerance and how thoroughly you can assess the issuing company's creditworthiness.",
  },
  {
    term: "Zero-Coupon Bond",
    category: "Bonds & Fixed Income",
    definition:
      "A bond that pays no periodic interest at all. It is issued at a deep discount to face value and redeemed at face value at maturity, the entire return comes from that price difference. Similar in concept to a T-bill but typically longer-term (years rather than months).",
    example:
      "A 5-year zero-coupon bond with a 1,000,000 face value might be sold today for 620,000. You receive nothing for 5 years, then collect 1,000,000. Your total return is 380,000. Ideal when you need a specific lump sum at a specific future date, planning for university fees or a property deposit, for instance.",
    compare:
      "vs Regular Bond: a regular bond pays you income along the way. A zero-coupon bond pays nothing until the end. Zero-coupon bonds require patience and a defined future need; regular bonds suit investors who want income throughout the holding period.",
  },
  {
    term: "Coupon Rate",
    category: "Bonds & Fixed Income",
    definition:
      "The fixed annual interest a bond pays, expressed as a percentage of its face value. Paid periodically (semi-annually or quarterly) to bondholders. The coupon is fixed at issuance and does not change regardless of what happens to market interest rates or the bond's trading price.",
    example:
      "A 1,000,000 bond with a 12% coupon rate pays 120,000 per year (60,000 every six months). Even if the bond's market price rises to 1,100,000 because rates have fallen, the cash payment remains 120,000 based on the original face value.",
  },
  {
    term: "Yield to Maturity (YTM)",
    category: "Bonds & Fixed Income",
    definition:
      "The total annualised return you earn if you buy a bond today at its current market price and hold it until it matures, accounting for both coupon payments and the gain or loss between your purchase price and face value. The most complete single measure of a bond's return.",
    example:
      "You buy a bond at 950,000 (below its 1,000,000 face value) with 5 years to maturity and a 10% coupon. Annual coupon: 1,000,000 x 10% = 100,000. Over 5 years: 5 x 100,000 = 500,000 in coupons. At maturity you receive 1,000,000, not the 950,000 you paid, an extra 50,000 gain. Total receipts: 500,000 + 1,000,000 = 1,500,000 on a 950,000 investment. The YTM (roughly 11.1%) is higher than the 10% coupon rate because of that discount gain built into the purchase price.",
    compare:
      "vs Coupon Rate: the coupon rate is a fixed number printed on the bond at issuance. YTM reflects your actual return based on the price you paid in the market today, which may be above or below face value.",
  },
  {
    term: "Commercial Paper",
    category: "Bonds & Fixed Income",
    definition:
      "A short-term, unsecured debt instrument (typically 7 to 270 days) issued by large corporations to meet short-term funding needs quickly. Sold at a discount. Usually offers higher rates than T-bills to compensate for the absence of a government guarantee. Available through asset managers and investment platforms in Nigeria.",
    compare:
      "vs Treasury Bill: T-bills are government-issued (no default risk). Commercial paper is company-issued (carries some credit risk). Both are short-term and return the face value at maturity. Always check the issuing company's credit rating before investing in commercial paper.",
  },
  {
    term: "Face Value",
    category: "Bonds & Fixed Income",
    also: "Par Value",
    definition:
      "The stated value printed on a bond, the amount the issuer promises to repay at maturity. Bonds are initially issued at face value but can subsequently trade above it (at a premium) or below it (at a discount) in the secondary market depending on how current interest rates compare to the bond's coupon.",
  },
  {
    term: "Fixed Income Portfolio",
    category: "Bonds & Fixed Income",
    definition:
      "A collection of fixed income investments, government bonds, treasury bills, corporate bonds, commercial paper, held together with the goal of generating predictable, regular income while preserving capital. Often constructed by fund managers for conservative investors, retirees, or those needing stable returns without equity market exposure.",
    example:
      "A fixed income portfolio might hold 40% in FGN Bonds, 30% in Treasury Bills, 20% in corporate bonds, and 10% in commercial paper. Diversification across issuers and maturities reduces the impact of any single default while maintaining a steady income stream from multiple coupon and discount sources.",
    compare:
      "vs Equity Portfolio: a fixed income portfolio prioritises income and capital preservation. An equity portfolio prioritises growth. A balanced portfolio deliberately combines both, using fixed income to cushion the volatility of equities.",
  },

  // ---- FUNDS ----
  {
    term: "Mutual Fund",
    category: "Funds",
    definition:
      "A professionally managed pool of money from many investors, invested collectively into a basket of assets, stocks, bonds, money market instruments, or a mix. Each investor owns units of the fund proportional to their contribution. A fund manager makes daily investment decisions on behalf of all unit holders.",
    example:
      "You invest 100,000 in a mutual fund alongside thousands of other investors. The manager pools everything and buys a diversified portfolio of 80 securities. Your 100,000 effectively owns a tiny slice of all 80, diversification that would be impossible to replicate individually at that amount.",
    compare:
      "vs ETF: mutual funds are priced once daily (at NAV); ETFs trade like stocks throughout the day. ETFs generally have lower fees. For long-term buy-and-hold investors, both work well. ETFs offer more flexibility for those who want to trade during the day.",
  },
  {
    term: "ETF (Exchange-Traded Fund)",
    category: "Funds",
    definition:
      "A fund that tracks an index, commodity, or basket of assets and trades on a stock exchange like a regular share throughout the trading day. Combines the broad diversification of a mutual fund with the intraday trading flexibility of a stock.",
    example:
      "VOO tracks the S&P 500 (top 500 US companies). VT tracks nearly the entire global stock market. Buying one share of VOO gives you exposure to Apple, Microsoft, Google, Amazon, and 496 other companies simultaneously, at a very low annual fee.",
    compare:
      "vs Index Fund: an index fund is typically a mutual fund version of an ETF (priced daily, no minimum trade size beyond one unit). Both replicate an index cheaply. ETFs can be bought and sold at any time during market hours; index funds transact only at the end of each trading day.",
  },
  {
    term: "Index Fund",
    category: "Funds",
    definition:
      "A passively managed fund designed to replicate the performance of a specific market index, S&P 500, NGX All Share, MSCI World, by holding the same securities in the same proportions. Because there is no active stock picking, fees (expense ratios) are very low.",
    example:
      "Decades of data consistently show that most actively managed funds fail to beat their benchmark index over 10+ year periods, after fees. An index fund guarantees you the full market return at minimal cost. Warren Buffett famously recommended that most individual investors simply put their money in a low-cost S&P 500 index fund and leave it there.",
  },
  {
    term: "Money Market Fund",
    category: "Funds",
    definition:
      "A mutual fund that invests exclusively in short-term, highly liquid, low-risk instruments, treasury bills, commercial paper, and short-term bank deposits. The goal is capital preservation and modest returns above a savings account, with daily liquidity.",
    example:
      "In Nigeria, money market funds from managers like Stanbic IBTC, FBN Quest, and Cowrywise have recently offered returns in the 18 to 22% per annum range, paid and accessible daily. Ideal for an emergency fund, your money earns more than a savings account and is still accessible within 24 to 48 hours.",
    compare:
      "vs High-Yield Savings Account: both are low risk with easy access. Money market funds typically offer slightly higher returns but are not bank deposits, they are not covered by the NDIC deposit insurance scheme.",
  },
  {
    term: "Equity Fund",
    category: "Funds",
    definition:
      "A mutual fund or ETF that invests primarily or exclusively in stocks. Aims for long-term capital growth. Higher risk than bond or money market funds because stock prices fluctuate significantly, but historically delivers the highest long-term returns of any major asset class.",
    compare:
      "vs Balanced Fund: an equity fund is 100% (or near 100%) invested in stocks, maximum growth potential but full stock market volatility. A balanced fund holds stocks and bonds together, softening the ride in exchange for somewhat lower long-term returns.",
  },
  {
    term: "Balanced Fund",
    category: "Funds",
    definition:
      "A mutual fund holding a deliberate mix of stocks and bonds within a single product, designed to provide both growth (from equities) and income and stability (from fixed income). A common split is 60% equities and 40% bonds, though proportions vary by fund mandate.",
    example:
      "In a year when stocks fall 30%, the bond portion of a balanced fund may hold steady or even rise, cushioning the overall portfolio loss to perhaps 15% instead of 30%. In a strong bull market, the fund gains less than a pure equity fund but more than a pure bond fund.",
    compare:
      "vs Equity Fund: a balanced fund provides less upside in good markets but less downside in bad ones. Suitable for medium-risk investors or those approaching retirement who want to reduce pure equity exposure gradually.",
  },
  {
    term: "Bond Fund (Fixed Income Fund)",
    category: "Funds",
    definition:
      "A mutual fund or ETF that invests in a collection of bonds, government bonds, corporate bonds, or a mix, distributing the coupon income regularly to investors. Lower risk and lower long-term return than equity funds, but more predictable income.",
    example:
      "Rather than buying one government bond for 10,000,000 (the typical minimum for institutional bonds), you invest 100,000 in a bond fund that holds 50 different bonds. You receive proportional monthly income and are not exposed to the default of any single issuer.",
    compare:
      "vs Buying Bonds Directly: a bond fund provides diversification, professional management, and a low minimum investment. Buying bonds directly gives you certainty about your exact cash flows and maturity dates, but requires much larger capital and limits diversification.",
  },
  {
    term: "Managed Portfolio",
    category: "Funds",
    definition:
      "A pre-built investment portfolio managed continuously by professionals on your behalf. You select a risk level (conservative, balanced, aggressive) and the manager handles asset selection, rebalancing, and execution. Offered by platforms like Risevest and Cowrywise in Nigeria.",
    compare:
      "vs Mutual Fund: both are managed on your behalf. A managed portfolio is often more personalised, combining stocks, bonds, real assets, and international exposure in a single package optimised for your risk profile. A mutual fund has a fixed investment mandate (e.g., Nigerian equities only) that does not adjust to your individual situation.",
  },
  {
    term: "Net Asset Value (NAV)",
    category: "Funds",
    definition:
      "The price per unit of a mutual fund, calculated each business day by taking the total value of all the fund's assets, subtracting liabilities, and dividing by the number of units outstanding. When you invest in a mutual fund, you buy units at that day's NAV. As the fund's assets grow, NAV rises.",
    example:
      "A fund holds assets worth 10,000,000,000 with 50,000,000 units outstanding. NAV = 200 per unit. You invest 200,000 and receive 1,000 units. The fund grows and assets rise to 12,000,000,000. NAV is now 240, your 1,000 units are worth 240,000.",
  },
  {
    term: "Expense Ratio",
    category: "Funds",
    definition:
      "The annual fee deducted from a fund's assets to cover management, administration, and operational costs, expressed as a percentage. Automatically deducted, you never write a cheque for it; it simply reduces the fund's returns.",
    example:
      "A 1.5% expense ratio on a 1,000,000 investment costs 15,000 per year. On a 30-year investment earning 10% annually, the difference between a 0.1% expense ratio and a 1.5% ratio can reduce your final wealth by 25 to 30%. Fees compound against you just as returns compound for you. Always compare expense ratios, lower is almost always better.",
  },
  {
    term: "Asset Allocation",
    category: "Funds",
    definition:
      "The strategic decision of how to divide your portfolio across different asset classes, stocks, bonds, cash, real estate, commodities, to balance risk and return according to your goals, time horizon, and risk tolerance. Research consistently shows that asset allocation explains more of long-term investment performance than individual security selection.",
    example:
      "A common guideline: subtract your age from 100 to get your equity allocation percentage. At 30, hold roughly 70% in equities and 30% in bonds. At 50, roughly 50/50. This gradually shifts the portfolio toward lower volatility as retirement approaches.",
  },
  {
    term: "Diversification",
    category: "Funds",
    definition:
      "Spreading investments across different assets, sectors, and geographies so that no single failure can significantly damage the overall portfolio. Different assets do not all move in the same direction at the same time, when one falls, others may hold steady or rise.",
    example:
      "If you own only bank stocks and Nigeria's banking sector faces a crisis, your entire portfolio suffers. If you own bank stocks, technology stocks, government bonds, a REIT, and gold, a banking crisis hurts only part of your holdings, the others may cushion the blow.",
    compare:
      "Note: diversification reduces company-specific and sector-specific risk (unsystematic risk). It does not protect against a global crisis that affects all asset classes simultaneously (systematic risk).",
  },
  {
    term: "Rebalancing",
    category: "Funds",
    definition:
      "Periodically adjusting your portfolio back to its intended asset allocation after market movements have changed the proportions. If stocks rally strongly and now make up 75% of a portfolio meant to be 60% equities, rebalancing means selling some stocks and buying bonds or other assets to restore the target split.",
    example:
      "Rebalancing automatically enforces a 'sell high, buy low' discipline without requiring any market prediction. You sell the asset that has grown expensive relative to your target and buy the one that has become relatively cheap, a mechanical form of rational investing.",
  },
  {
    term: "Active vs Passive Investing",
    category: "Funds",
    definition:
      "Two fundamentally different approaches. Active investing involves a manager (or the investor) making frequent decisions about which securities to buy and sell, aiming to outperform the market. Passive investing tracks a market index with minimal trading, aiming to match the market return at very low cost.",
    example:
      "Multiple independent studies across decades show that after fees, approximately 80 to 90% of actively managed funds underperform their benchmark index over 10-year periods. This is why low-cost index funds have become the default recommendation for most long-term investors who lack deep specialist knowledge.",
    compare:
      "When active makes sense: specialised strategies (private equity, niche emerging markets) where passive alternatives do not exist, or where a manager has a genuinely differentiated information edge. For broad market exposure, passive wins on cost almost every time.",
  },

  // ---- REAL ASSETS ----
  {
    term: "Real Estate",
    category: "Real Assets",
    definition:
      "Physical property, land, residential buildings, commercial premises, warehouses. One of the oldest stores of wealth, generating returns through rental income and price appreciation over time. Widely used in Nigeria as a wealth-building vehicle because property prices in major cities have historically outpaced inflation.",
    example:
      "You buy a property for 40,000,000. You rent it at 3,000,000 per year (7.5% rental yield). Over 10 years you collect 30,000,000 in rent and the property appreciates to 80,000,000. Total value created: 70,000,000 on a 40,000,000 investment, before accounting for maintenance costs and property taxes.",
    compare:
      "vs REIT: direct real estate requires massive capital, is illiquid, and demands active management (or management fees). A REIT gives you real estate exposure through an exchange-listed share, investable from small amounts, sellable in minutes, and professionally managed.",
  },
  {
    term: "REIT (Real Estate Investment Trust)",
    category: "Real Assets",
    definition:
      "A company that owns and operates income-generating real estate and trades on a stock exchange like an ordinary share. REITs must by law distribute at least 90% of taxable income as dividends to shareholders, making them one of the highest-yielding income investments available.",
    example:
      "Rather than buying a shopping mall for 5,000,000,000 (which requires enormous capital and full-time management), you buy shares in a REIT that owns 20 shopping malls. You receive quarterly dividend income and can sell your shares in minutes on the exchange if you need cash.",
    compare:
      "vs Direct Property: REITs offer liquidity (sellable instantly), diversification (many properties in one investment), low minimum entry, and no landlord responsibilities. Direct property gives full control and no management fees, but demands large capital and is highly illiquid.",
  },
  {
    term: "Commodity",
    category: "Real Assets",
    definition:
      "A raw material or primary product traded in standardised quantities, oil, gold, silver, wheat, cocoa, copper, natural gas. Commodity prices are driven by global supply and demand, geopolitical events, and weather. Investors use commodities to diversify portfolios and hedge against inflation, since commodity prices often rise when the purchasing power of money falls.",
  },
  {
    term: "Gold",
    category: "Real Assets",
    definition:
      "A precious metal that has served as a store of value across civilisations for thousands of years. Unlike paper currency, gold cannot be printed at will, which is why it tends to preserve purchasing power over long periods. Commonly rises during economic uncertainty, high inflation, or currency depreciation.",
    example:
      "A Nigerian investor holding naira savings loses purchasing power when the naira depreciates. The same amount held in gold, bought via a dollar-denominated platform like Risevest or through a gold ETF, may retain or increase its naira value as the exchange rate shifts.",
    compare:
      "Note: gold pays no dividends or interest. Its value depends entirely on what others will pay for it. Best used as a portfolio hedge (5 to 10% allocation) rather than a primary growth investment.",
  },
  {
    term: "Capital Gain",
    category: "Real Assets",
    definition:
      "The profit made when you sell an asset for more than you paid. Occurs with stocks, property, bonds, and other assets. A gain that exists on paper while you still hold the asset is called an unrealised gain, it only becomes a realised gain (and potentially taxable) when you sell.",
    example:
      "You buy shares at 500 and sell at 850. Capital gain = 350 per share. On 10,000 shares, that is 3,500,000 in capital gains. You pay no tax on an unrealised gain, only on the gain at the point of sale.",
  },
  {
    term: "Capital Loss",
    category: "Real Assets",
    definition:
      "The loss incurred when you sell an asset for less than you paid. In many tax systems, capital losses can be used to offset capital gains from other investments, reducing your total tax liability.",
    example:
      "You bought shares at 800 and sold at 550. Capital loss = 250 per share. In a tax jurisdiction where this applies, that 250-per-share loss can reduce the taxable gain on another investment you sold profitably in the same period.",
    compare:
      "Unrealised vs Realised Loss: while you still hold a fallen stock, the loss is unrealised and you have the choice to hold for recovery. Once you sell, the loss is locked in permanently. Deciding when a loss is worth realising (for tax purposes or to cut exposure) is one of the more nuanced investing decisions.",
  },

  // ---- CRYPTO & FOREX ----
  {
    term: "Cryptocurrency",
    category: "Crypto & Forex",
    also: "Crypto",
    definition:
      "Digital money secured by cryptography, operating on decentralised networks (blockchains) not controlled by any government or central bank. Bitcoin (BTC) is the original and largest. Ethereum (ETH) is the second largest and powers a broad ecosystem of applications. Supply is typically fixed or predictably limited, unlike traditional currencies which governments can print at will.",
    compare:
      "Risk note: cryptocurrencies can lose 50 to 80% of their value within months and double just as fast. They are speculative assets, not reliable stores of value for most people. If you allocate to crypto, treat it as a high-risk, small portion (5 to 10% at most) of a diversified portfolio, not a financial strategy in itself.",
  },
  {
    term: "Blockchain",
    category: "Crypto & Forex",
    definition:
      "The underlying technology of cryptocurrency. A decentralised digital ledger, a record of transactions stored simultaneously across thousands of computers worldwide, making it virtually impossible to alter, delete, or counterfeit. Every transaction is transparent, permanent, and verified without a central authority.",
    example:
      "Think of a Google Doc that can only be added to (never edited or deleted), that thousands of people hold an identical copy of simultaneously, and that updates in real time across every copy. No single person or company controls or owns the record. That is the core idea of a blockchain.",
  },
  {
    term: "Forex",
    category: "Crypto & Forex",
    also: "Foreign Exchange / FX",
    definition:
      "The global market for buying and selling currencies, the largest financial market in the world, with over $7 trillion traded daily. Forex trading involves speculating on the relative value of currency pairs (for example, USD/NGN, EUR/USD, GBP/JPY).",
    compare:
      "Risk note: the majority of retail forex traders lose money. Professional trading uses significant leverage that amplifies both gains and losses. Without deep expertise, robust risk management, and sufficient capital, retail forex trading is closer to gambling than investing for most individuals.",
  },
  {
    term: "Exchange Rate",
    category: "Crypto & Forex",
    definition:
      "The price at which one currency converts to another. If USD/NGN is 1,600, it costs 1,600 naira to buy one US dollar. Exchange rates fluctuate constantly based on trade flows, inflation differentials, interest rate levels, political stability, and market sentiment.",
    example:
      "If you hold dollar-denominated investments and the naira depreciates from 800 to 1,600 per dollar, your investments are worth twice as much in naira terms, even if they earned nothing in dollar terms. Currency movements can be a major source of return or loss for investors holding cross-currency assets.",
  },
  {
    term: "Stablecoin",
    category: "Crypto & Forex",
    definition:
      "A cryptocurrency designed to maintain a fixed value by being pegged to a traditional currency (usually the US dollar) or another asset. Examples: USDT (Tether), USDC, BUSD. Each unit is designed to always equal $1.",
    example:
      "Nigerians use stablecoins to hold dollar-equivalent value digitally without navigating bank restrictions on dollar accounts. They also enable fast, cheap international money transfers. Risk: the peg can break, TerraUSD (UST) famously collapsed from $1 to near zero in 2022, wiping out billions. Centralised stablecoins also carry custodial risk if the issuer mismanages reserves.",
  },

  // ---- WEALTH PROTECTION ----
  {
    term: "Insurance",
    category: "Wealth Protection",
    definition:
      "A contract where you pay regular premiums to an insurer who agrees to compensate you financially when specific bad events occur. The purpose is not to generate profit but to prevent a single unexpected event from destroying years of accumulated wealth.",
    example:
      "Think of insurance as renting financial protection. You will never 'profit' from good insurance, and that is exactly the point. The years you do make a claim, the payout can save everything. The years you do not claim, the premium was the cheap price of peace of mind.",
  },
  {
    term: "Life Insurance",
    category: "Wealth Protection",
    definition:
      "A policy that pays a lump sum or income stream to your nominated beneficiaries when you die. Two main types: Term Life covers you for a fixed period (cheaper, if you survive, it expires with no payout). Whole Life covers your entire life and builds a cash value over time (more expensive but permanent). Critical for anyone whose income supports other people.",
    compare:
      "Term vs Whole Life: term life is the more financially efficient choice for most people, it is far cheaper, allowing you to invest the premium difference. Whole life is useful for estate planning or when lifelong coverage is needed regardless of cost.",
  },
  {
    term: "HMO (Health Maintenance Organisation)",
    category: "Wealth Protection",
    definition:
      "A managed health plan where members pay regular premiums to access medical care through a network of approved hospitals. Common in Nigeria: Hygeia, Reliance HMO, AXA Mansard. Protects against medical bills that could wipe out savings entirely.",
    example:
      "A single surgery or extended hospital stay without insurance can cost 2,000,000 to 5,000,000. For someone saving 100,000 per month, that one event erases 20 to 50 months of savings. Health coverage is not a luxury, it is wealth protection.",
  },
  {
    term: "Trust",
    category: "Wealth Protection",
    definition:
      "A legal structure where you (the settlor) transfer ownership of assets to a trustee, a person or institution, who manages them according to your written instructions for named beneficiaries. Assets held in a trust belong to the trust itself, not to you personally, protecting them from certain creditors and ensuring they pass exactly as you intended.",
    example:
      "A parent creates a trust holding 50,000,000 and instructs the trustee to release 500,000 per month to their children starting at age 25. If the parent dies, the trust continues functioning exactly as written, no probate delays, no court involvement, no family disputes about the parent's intentions.",
  },
  {
    term: "Will",
    category: "Wealth Protection",
    also: "Testament",
    definition:
      "A legal document specifying how your assets should be distributed after your death and who should care for minor children. Without a will, your estate is distributed according to intestacy laws, which may completely ignore your wishes and leave loved ones in prolonged, expensive legal disputes.",
    compare:
      "Critical point: a will is not only for wealthy people. If you have any assets, any bank accounts, or any children, you need one. A will written today can always be updated as your situation changes.",
  },
  {
    term: "Beneficiary",
    category: "Wealth Protection",
    definition:
      "The person or organisation designated to receive money or assets from a specific account, insurance policy, pension fund, or trust. Beneficiary designations on financial accounts typically override what your will says, so they must be reviewed and kept current at every major life event (marriage, divorce, births, deaths).",
    example:
      "Your will says your spouse inherits everything. But if your pension form still names your mother as beneficiary from before you married, your pension pays out to your mother, regardless of what the will says. The beneficiary designation on the pension form legally wins.",
  },
  {
    term: "Estate Planning",
    category: "Wealth Protection",
    definition:
      "The holistic process of arranging what happens to your wealth during your lifetime and after your death. Includes writing a will, setting up trusts, naming beneficiaries on all financial accounts, arranging powers of attorney, and sometimes planning to minimise inheritance taxes. The goal is to transfer wealth to the people you choose in the way you intend.",
  },
  {
    term: "Power of Attorney",
    category: "Wealth Protection",
    definition:
      "A legal document authorising someone you trust to act on your behalf for financial or medical decisions if you become mentally or physically incapacitated. A financial power of attorney allows them to manage your bank accounts and investments. A medical one authorises healthcare decisions. Without it, even your closest family member may have no legal authority to act for you in an emergency.",
  },

  // ---- RETIREMENT ----
  {
    term: "Pension",
    category: "Retirement",
    definition:
      "A long-term savings vehicle specifically for retirement, typically with contributions from both employer and employee and often with tax advantages. In Nigeria, the Contributory Pension Scheme requires 8% from the employer and 10% from the employee (of basic salary, housing allowance, and transport allowance). Funds are managed by licensed Pension Fund Administrators (PFAs).",
    compare:
      "For self-employed individuals and business owners: you must make voluntary contributions to a PFA yourself, no employer is doing it for you. This is one of the most frequently overlooked gaps in financial planning among Nigerian entrepreneurs.",
  },
  {
    term: "Pension Fund Administrator (PFA)",
    category: "Retirement",
    definition:
      "A licensed company that manages employee pension contributions under the Contributory Pension Scheme in Nigeria. Examples: Stanbic IBTC Pensions, Leadway Pensure, ARM Pensions. Your contributions are held in a Retirement Savings Account (RSA) in your name, separate from the PFA's own assets. Even if the PFA fails, your pension is legally protected.",
  },
  {
    term: "Annuity",
    category: "Retirement",
    definition:
      "A financial contract where you pay a lump sum to an insurance company, which then pays you a guaranteed regular income for the rest of your life (or a fixed period). Used at retirement to convert accumulated savings into a predictable monthly or annual income that cannot be outlived.",
    example:
      "At retirement, you use 20,000,000 from your pension savings to purchase an annuity. The insurer calculates based on your age and life expectancy and agrees to pay you 180,000 per month for the rest of your life. If you live 25 more years, total payouts far exceed your initial premium.",
    compare:
      "vs Lump Sum Withdrawal: taking your pension as a lump sum risks running out of money if you live longer than expected or invest poorly. An annuity removes 'longevity risk', the risk of outliving your savings, by guaranteeing income for life.",
  },
  {
    term: "Compound Growth",
    category: "Retirement",
    definition:
      "The long-run mathematical effect of reinvesting returns so they themselves generate returns over subsequent periods. The critical variable is not the amount invested but the time allowed for compounding to work. Starting early is consistently more powerful than saving larger amounts later.",
    example:
      "Two people invest 100,000 per month. Person A starts at 25 and stops at 35 (10 years, 12,000,000 total invested). Person B starts at 35 and continues to 65 (30 years, 36,000,000 total invested). At 10% annual growth, Person A ends up with more money at 65, despite investing three times less, because the extra decade of compounding is that powerful.",
  },
  {
    term: "Time Horizon",
    category: "Retirement",
    definition:
      "The length of time you plan to leave money invested before needing it. The single most important factor in determining appropriate investment risk. A long time horizon (10+ years) tolerates high volatility, temporary crashes are just bumps in a long upward trend. A short time horizon (under 3 years) demands low-volatility, capital-preserving instruments.",
  },

  // ---- GENERAL FINANCE ----
  {
    term: "Inflation",
    category: "General Finance",
    definition:
      "The rate at which prices in an economy rise over time, reducing the purchasing power of money. If inflation is 22% and your savings earn 10%, your money grows in number but shrinks in what it can actually buy. Beating inflation, earning a positive real return, is the minimum requirement for preserving wealth over time.",
    example:
      "1,000,000 naira today and 1,000,000 naira in 10 years at 20% annual inflation are very different sums. The future 1,000,000 buys roughly what 160,000 buys today. Cash under a mattress is not safe, it is slowly robbed by inflation every single year.",
  },
  {
    term: "Real Return",
    category: "General Finance",
    definition:
      "The return on an investment after adjusting for inflation. Nominal returns (the number you see) can be misleading; real returns tell you whether your purchasing power is genuinely growing.",
    example:
      "Portfolio return: 18%. Inflation: 22%. Real return: approximately -4%. Despite seeing your naira balance grow, you can buy less at the end of the year than at the start. Always ask: 'Is this return ahead of inflation?'",
  },
  {
    term: "Asset",
    category: "General Finance",
    definition:
      "Anything you own that has monetary value or generates future income. Financial assets: stocks, bonds, cash. Real assets: property, gold. Productive assets generate income or grow in value over time. Building an increasing base of productive assets is the core definition of wealth creation.",
    compare:
      "vs Liability: an asset puts money in your pocket over time. A liability takes money out. A car on hire purchase is primarily a liability (monthly payments, depreciating value). A rental property is an asset (generates rent, typically appreciates).",
  },
  {
    term: "Liability",
    category: "General Finance",
    definition:
      "A financial obligation or debt you owe to another party. Mortgages, car loans, credit card balances, and business debts are all liabilities. Net worth = Assets minus Liabilities. Reducing liabilities accelerates wealth building just as effectively as growing assets.",
  },
  {
    term: "Net Worth",
    category: "General Finance",
    definition:
      "The total value of everything you own minus everything you owe. The most comprehensive single number for tracking financial progress over time. Net worth can grow even when income stays flat, if you invest wisely and reduce debt simultaneously.",
    example:
      "Assets: savings 500,000 + stocks 2,000,000 + property value 15,000,000 = 17,500,000. Liabilities: mortgage balance 8,000,000 + car loan 1,500,000 = 9,500,000. Net Worth = 8,000,000. Track this number every 6 to 12 months, the upward trend over years is what matters.",
  },
  {
    term: "Risk Tolerance",
    category: "General Finance",
    definition:
      "Your personal willingness and financial ability to accept losses and price fluctuations in pursuit of returns. Two components: psychological (how you feel when your portfolio drops 30%) and financial (whether a 30% drop would cause real hardship in your life). Both must be considered honestly.",
    compare:
      "Important: most people significantly overestimate their risk tolerance until they actually experience a sharp market decline. Design your portfolio for how you will genuinely behave in a crash, not for how you think you should behave in theory.",
  },
  {
    term: "Risk Pyramid",
    category: "General Finance",
    definition:
      "A visual framework that layers investments from lowest risk at the base (largest allocation) to highest risk at the apex (smallest allocation). Base: cash, savings accounts, T-bills. Middle: bonds, mutual funds, dividend-paying blue chips. Apex: individual growth stocks, REITs, crypto, forex. As you move up the pyramid, potential reward increases alongside potential for significant loss.",
    compare:
      "Your ideal allocation across these levels depends entirely on your time horizon, risk tolerance, and financial goals. Someone at 25 with a 35-year horizon can afford a higher apex allocation than someone at 60 who needs the money within 5 years.",
  },
  {
    term: "Return on Investment (ROI)",
    category: "General Finance",
    also: "ROI",
    definition:
      "A percentage measure of how efficient an investment is. Calculated as (Gain minus Cost) divided by Cost, multiplied by 100. Allows comparison of very different investments on an equal basis regardless of the absolute amounts involved.",
    example:
      "Investment A: costs 100,000, returns 130,000. ROI = 30%. Investment B: costs 1,000,000, returns 1,200,000. ROI = 20%. Investment A has a superior ROI despite generating far less absolute profit. ROI helps you see which use of capital was most efficient.",
  },
  {
    term: "Opportunity Cost",
    category: "General Finance",
    definition:
      "The value of the next best alternative you give up when making a financial decision. Every choice to use money one way means it cannot simultaneously be used another way. Opportunity cost is often invisible but always real.",
    example:
      "Spending 2,000,000 on a new car rather than investing it. If that money would have grown at 15% annually for 10 years, it would be worth approximately 8,000,000. The true cost of the car is not just 2,000,000, it is also the 6,000,000 in foregone future wealth.",
  },
  {
    term: "Passive Income",
    category: "General Finance",
    definition:
      "Money earned with little or no active daily effort, generated by assets you have already built or purchased. Dividends from stocks, bond coupons, interest from savings, rental income from property, distributions from mutual funds. Building passive income streams is the path to financial independence.",
  },
  {
    term: "Financial Independence",
    category: "General Finance",
    definition:
      "The state where your passive income and existing wealth are sufficient to cover your living expenses indefinitely without depending on active employment. The long-term goal of wealth building, not just accumulating money but reaching a point where money works for you rather than you working for money.",
    example:
      "A widely used benchmark is the '4% rule': if your annual expenses are 4,000,000, you need roughly 100,000,000 invested. A portfolio of that size, invested properly, historically generates enough returns to sustain withdrawals indefinitely without depleting the principal.",
  },
  {
    term: "Fintech",
    category: "General Finance",
    definition:
      "Short for financial technology. Companies and apps using software to deliver financial services more accessibly and efficiently than traditional banks. In Nigeria, the fintech revolution has dramatically lowered barriers to saving, investing, and wealth building.",
    example:
      "PiggyVest (goal-based savings and fixed deposits), Cowrywise (savings and mutual funds), Bamboo (US stocks), Trove (Nigerian and US stocks), Optimus by Afrinvest (savings, mutual funds, and stocks), Risevest (managed portfolios in USD).",
  },
  {
    term: "Leverage",
    category: "General Finance",
    definition:
      "Using borrowed money to increase the potential return on an investment. Amplifies both gains and losses in exact proportion to the leverage ratio.",
    example:
      "You invest 1,000,000 of your own money in a property worth 5,000,000 (4,000,000 borrowed). If the property rises 20% to 6,000,000, your equity doubles from 1,000,000 to 2,000,000, a 100% return on your own capital. But if it falls 20% to 4,000,000, your equity is completely wiped out. Leverage multiplies both outcomes identically.",
    compare:
      "Caution: leverage is a power tool. It builds wealth faster in rising markets and destroys it faster in falling ones. Never use leverage you cannot afford to repay even if the investment goes to zero.",
  },
  {
    term: "Systematic Risk",
    category: "General Finance",
    also: "Market Risk",
    definition:
      "Risk that affects the entire market simultaneously and cannot be reduced through diversification. Examples: global recessions, central bank interest rate cycles, currency crises, geopolitical conflicts, pandemics. No matter how diversified your portfolio, systematic risk affects all holdings.",
    compare:
      "vs Unsystematic Risk: unsystematic risk is specific to one company or industry (a scandal, a product recall, a management failure). This can be substantially reduced through diversification. Owning 50 stocks across 10 sectors means one company's failure barely moves your overall portfolio.",
  },
  {
    term: "Unsystematic Risk",
    category: "General Finance",
    also: "Idiosyncratic Risk",
    definition:
      "Risk specific to a single company, industry, or country, which can be substantially reduced through diversification. If you own shares in only one company and it collapses, you lose everything in that position. If you own 40 companies across 10 sectors, any single failure is a small setback rather than a disaster.",
    compare:
      "vs Systematic Risk: systematic risk cannot be diversified away. Unsystematic risk can be, and should be. A well-diversified portfolio eliminates most unsystematic risk at almost no cost.",
  },
  {
    term: "Speculation",
    category: "General Finance",
    definition:
      "Buying an asset primarily with the expectation of short-term price appreciation, with little or no analysis of its underlying value. Higher risk than investing. Not inherently wrong as a deliberate, small allocation, but dangerous when mistaken for investing.",
    compare:
      "vs Investing: investing is based on the underlying value and income potential of an asset, typically held for years with a fundamental reason. Speculation is based on price movement over days or weeks, relying on others paying more than you did. Both can produce profits, but they require completely different skills and carry very different risk profiles.",
  },
  {
    term: "Capital Preservation",
    category: "General Finance",
    definition:
      "An investment strategy where protecting the original amount invested is the overriding priority, accepting lower returns in exchange for near-zero risk of loss. Used for money needed in the short term, emergency funds, and by very risk-averse investors. T-bills, money market funds, and high-quality short-term bonds are the primary capital-preservation instruments.",
  },
  {
    term: "Benchmark",
    category: "General Finance",
    definition:
      "A standard reference point used to measure the performance of a fund or portfolio. If a fund claims to beat the market, it must demonstrate returns above its benchmark, after fees. A fund that charges 2% annually must return at least 2% more than its benchmark just to break even with a passive alternative.",
    example:
      "The NGX All Share Index is the standard benchmark for Nigerian equity funds. The S&P 500 for US large-cap funds. If your Nigerian equity fund returns 18% in a year when the NGX All Share returned 24%, the fund underperformed its benchmark by 6% despite delivering a positive absolute return.",
  },
  {
    term: "Inflation Hedge",
    category: "General Finance",
    definition:
      "An investment that tends to maintain or increase its real purchasing power during periods of high inflation. When inflation is high, these assets often rise in price alongside or ahead of the cost of living, preserving the real value of your wealth.",
    example:
      "Common hedges: gold (has preserved value across centuries), real estate (rents and property prices typically rise with inflation), commodities (food and energy prices drive inflation itself), and inflation-linked bonds (coupon payments automatically rise with inflation). In Nigeria, dollar-denominated investments also serve as a currency and inflation hedge.",
  },
  {
    term: "Lump Sum Investing",
    category: "General Finance",
    definition:
      "Investing a large amount all at once rather than spreading it over time. Statistically, in markets that trend upward over the long run, lump sum investing outperforms dollar-cost averaging in roughly two-thirds of historical periods, because money invested earlier has more time to compound.",
    example:
      "You receive a 5,000,000 bonus. Investing it immediately gives all 5,000,000 maximum time in the market. Spreading it over 10 months puts only 500,000 to work in the first month, meaning 4,500,000 sits idle, missing potential gains.",
    compare:
      "vs Dollar-Cost Averaging: lump sum is mathematically better on average but psychologically harder, investing everything right before a crash feels terrible. DCA is emotionally easier and appropriate if you receive income in regular amounts rather than a windfall.",
  },
];

const ALL_CATEGORIES: Category[] = [
  "Savings",
  "Budgeting",
  "Tax & Payroll",
  "Stocks & Equities",
  "Orders & Trading",
  "Bonds & Fixed Income",
  "Funds",
  "Real Assets",
  "Crypto & Forex",
  "Wealth Protection",
  "Retirement",
  "General Finance",
];

const CATEGORY_COLORS: Record<Category, string> = {
  "Tax & Payroll":
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40",
  "Savings":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/40",
  "Budgeting":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40",
  "Stocks & Equities":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/40",
  "Orders & Trading":
    "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/40",
  "Bonds & Fixed Income":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
  "Funds":
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40",
  "Real Assets":
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40",
  "Crypto & Forex":
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/40",
  "Wealth Protection":
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40",
  "Retirement":
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/40",
  "General Finance":
    "bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800/40 dark:text-stone-400 dark:border-stone-700/40",
};

export default function FinancialDictionary() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TERMS.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.also ?? "").toLowerCase().includes(q) ||
        (t.example ?? "").toLowerCase().includes(q) ||
        (t.compare ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    if (activeCategory !== "All" || query) return null;
    const map: Partial<Record<Category, Term[]>> = {};
    for (const t of TERMS.slice().sort((a, b) => a.term.localeCompare(b.term))) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category]!.push(t);
    }
    return map;
  }, [activeCategory, query]);

  function toggle(term: string) {
    setExpanded((prev) => (prev === term ? null : term));
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
        Financial Dictionary
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-2xl">
        Plain-English definitions with worked examples, comparisons, and mechanics
        for {TERMS.length} terms across {ALL_CATEGORIES.length} categories.
      </p>

      {/* Search */}
      <div className="mt-6 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
          placeholder="Search terms, definitions, or examples..."
          className={
            "w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-900 " +
            "outline-none transition placeholder:text-stone-400 " +
            "focus:border-teal-400 focus:ring-2 focus:ring-teal-300/50 " +
            "dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-50 dark:placeholder:text-stone-500 " +
            "dark:focus:border-teal-600 dark:focus:ring-teal-600/40"
          }
        />
      </div>

      {/* Category filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveCategory("All"); setExpanded(null); }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            activeCategory === "All"
              ? "bg-stone-900 text-white border-stone-900 dark:bg-stone-50 dark:text-stone-900 dark:border-stone-50"
              : "border-stone-200 text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-500"
          }`}
        >
          All ({TERMS.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = TERMS.filter((t) => t.category === cat).length;
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setExpanded(null); }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "bg-stone-900 text-white border-stone-900 dark:bg-stone-50 dark:text-stone-900 dark:border-stone-50"
                  : "border-stone-200 text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-500"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Result count when searching */}
      {query && (
        <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
          {filtered.length === 0
            ? "No terms matched."
            : `${filtered.length} term${filtered.length !== 1 ? "s" : ""} matched.`}
        </p>
      )}

      {/* Term list */}
      <div className="mt-6 space-y-8">
        {grouped
          ? ALL_CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
              <section key={cat}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  {cat}
                </h2>
                <TermList
                  terms={grouped[cat]!}
                  expanded={expanded}
                  toggle={toggle}
                  categoryColors={CATEGORY_COLORS}
                />
              </section>
            ))
          : (
            <TermList
              terms={filtered}
              expanded={expanded}
              toggle={toggle}
              categoryColors={CATEGORY_COLORS}
              showCategory
            />
          )}
      </div>

      {filtered.length === 0 && query && (
        <div className="mt-10 text-center text-sm text-stone-400 dark:text-stone-500">
          No terms matched. Try a different word or clear the filter.
        </div>
      )}
    </div>
  );
}

function TermList({
  terms,
  expanded,
  toggle,
  categoryColors,
  showCategory = false,
}: {
  terms: Term[];
  expanded: string | null;
  toggle: (term: string) => void;
  categoryColors: Record<Category, string>;
  showCategory?: boolean;
}) {
  return (
    <div className="divide-y divide-stone-100 dark:divide-stone-700/30 rounded-2xl border border-stone-200 dark:border-stone-700/50 overflow-hidden">
      {terms.map((t) => {
        const isOpen = expanded === t.term;
        return (
          <div key={t.term}>
            <button
              onClick={() => toggle(t.term)}
              className="w-full text-left px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400"
              aria-expanded={isOpen}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-semibold text-stone-900 dark:text-stone-50 text-sm">
                    {t.term}
                  </span>
                  {t.also && (
                    <span className="text-xs text-stone-400 dark:text-stone-500 italic shrink-0">
                      also: {t.also}
                    </span>
                  )}
                  {showCategory && (
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${categoryColors[t.category]}`}>
                      {t.category}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-stone-400 shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 bg-white dark:bg-stone-900/20">
                {/* Definition */}
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t.definition}
                </p>

                {/* Example */}
                {t.example && (
                  <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 px-3.5 py-3">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mb-1 uppercase tracking-wide">
                      Example
                    </p>
                    <p className="text-sm text-teal-800 dark:text-teal-300 leading-relaxed">
                      {t.example}
                    </p>
                  </div>
                )}

                {/* Compare / vs note */}
                {t.compare && (
                  <div className="rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/40 px-3.5 py-3">
                    <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wide">
                      Compare
                    </p>
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {t.compare}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
