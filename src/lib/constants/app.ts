export const APP_NAME = "Finance Buddy"
export const APP_DESCRIPTION =
  "Free browser-based calculators for income tax (Nigeria, UK, Canada, US & Rwanda), compound interest, savings growth, budgeting, and a plain-English financial dictionary. Calculations run locally, nothing is sent anywhere."
export const APP_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "thefinancebuddy.vercel.app"}`
export const DEVELOPER_LINK = "https://www.elijahsoladoye.com/"