export const APP_NAME = "Finance Buddy"
export const APP_DESCRIPTION =
  "Free financial tools: income tax calculators (Nigeria, UK, Canada, US & Rwanda), compound interest, savings growth and budgeting, stock analysis for NGX and US stocks (fundamental and technical), and a plain-English financial dictionary."
export const APP_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "thefinancebuddy.vercel.app"}`
export const DEVELOPER_LINK = "https://www.elijahsoladoye.com/"