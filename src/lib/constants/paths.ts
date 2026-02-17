export enum PATHS {
    LANDING = "/",
    MONTHLY_INTEREST_ESTIMATOR = "monthly-interest-estimator",
    PROGRESSIVE_TAX_CALCULATOR = "progressive-tax-calculator",
    ANNUAL_INTEREST_ESTIMATOR = "annual-interest-estimator",
    UK_TAX_CALCULATOR = "uk-tax-calculator",
    COMPARE_ANNUAL_ESTIMATES = "compare-annual-estimates"
}

export const originURL = process.env.NODE_ENV === 'development' ?
    'http://localhost:3000' : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`

export const DOMAIN = process.env.NODE_ENV === 'development' ?
    'localhost' : process.env.VERCEL_PROJECT_PRODUCTION_URL
