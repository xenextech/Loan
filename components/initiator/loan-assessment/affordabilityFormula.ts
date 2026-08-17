

import { calculateEMI } from "@/lib/formatters";

/** Debt service is quoted annually; EMIs are monthly. */
export const MONTHS_PER_YEAR = 12;


export const EXISTING_FACILITY_TERMS_ASSUMED = true;

/** A closed facility is no longer serviced; everything else still costs money each month. */
const NON_SERVICEABLE_STATUS = "CLOSED";

export interface AffordabilityFacilityInput {
  /** RHF keeps numeric inputs as raw strings while they are being typed. */
  outstanding?: number | string;
  sanctionedLimit?: number | string;
  status?: string;
}

export interface AffordabilityInput {
  /** Proposed facility principal — always the application's requested loan amount. */
  creditLimit?: number | string;
  /** Gross ANNUAL income of the borrower/household (creditAssessment.income). */
  annualIncome?: number | string;
  /** Estimated monthly EMI from the application. */
  estimatedEmi?: number;
  /** Annual nominal interest rate, % (applicantBackground.interestRate). */
  interestRate?: number | string;
  /** Facility term in months (applicantBackground.period). */
  tenureMonths?: number | string;
  existingFacilities?: AffordabilityFacilityInput[];
}

/** Which inputs are still missing before DSGIR can be produced — drives the UI hint. */
export type AffordabilityMissingInput =
  | "creditLimit"
  | "annualIncome"
  | "estimatedEmi"
  | "interestRate"
  | "tenureMonths";

export const MISSING_INPUT_LABEL: Record<AffordabilityMissingInput, string> = {
  creditLimit: "Credit Limit",
  annualIncome: "Income",
  estimatedEmi: "Estimated EMI (from Application)",
  interestRate: "Interest Rate (Step 3 — This Facility)",
  tenureMonths: "Period (Step 3 — This Facility)",
};

export interface AffordabilityResult {
  /** (Credit Limit / annual income) × 100, rounded to 2 dp. Needs only those two. */
  loanToIncomeRatio?: number;
  /** (Total monthly debt obligations / gross monthly income) × 100, rounded to 2 dp. Needs all four inputs. */
  dsgir?: number;
  /** Monthly instalment on the proposed facility. */
  proposedEmi?: number;
  /** Estimated combined monthly instalment across still-live existing facilities. */
  existingMonthlyObligation: number;
  /** How many existing facilities contributed to the figure above. */
  existingObligationCount: number;
  /** Proposed EMI + existing obligations — the DSGIR numerator. */
  totalMonthlyDebtService?: number;
  /** Income / 12 — the DSGIR denominator. */
  grossMonthlyIncome?: number;
  annualIncome?: number;
  missingForDsgir: AffordabilityMissingInput[];
}

/** Accepts RHF's raw strings as well as numbers; anything non-numeric or ≤ 0 is "absent". */
function positiveNumber(value: number | string | undefined | null): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

/** Same, but 0 is a legitimate value (an interest-free facility is not a missing rate). */
function nonNegativeNumber(value: number | string | undefined | null): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Estimated monthly servicing cost of the facilities the applicant already
 * holds. Uses `outstanding` where recorded and falls back to `sanctionedLimit`
 * when it isn't, since a facility with an unknown balance is more safely
 * assumed to be fully drawn than assumed to be free.
 */
export function calculateExistingMonthlyObligation(
  facilities: AffordabilityFacilityInput[] | undefined,
  interestRate: number,
  tenureMonths: number,
): { total: number; count: number } {
  if (!facilities?.length) return { total: 0, count: 0 };

  let total = 0;
  let count = 0;
  for (const facility of facilities) {
    if (facility.status === NON_SERVICEABLE_STATUS) continue;
    const balance =
      positiveNumber(facility.outstanding) ?? positiveNumber(facility.sanctionedLimit);
    if (balance === undefined) continue;
    total += calculateEMI(balance, interestRate, tenureMonths);
    count += 1;
  }
  return { total: Math.round(total), count };
}

/**
 * Computes both ratios. Each is returned independently: Loan to Income needs
 * only Credit Limit + income, so it can be filled in well before the facility's
 * rate and term are known on Step 4, while DSGIR stays undefined until every
 * input it depends on exists.
 */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const creditLimit = positiveNumber(input.creditLimit);
  const annualIncome = positiveNumber(input.annualIncome);
  const estimatedEmi = positiveNumber(input.estimatedEmi);
  const interestRate = nonNegativeNumber(input.interestRate) ?? 0;
  const tenureMonths = positiveNumber(input.tenureMonths) ?? 60; // fallback so existing EMI calculates

  const missingForDsgir: AffordabilityMissingInput[] = [];
  if (creditLimit === undefined) missingForDsgir.push("creditLimit");
  if (annualIncome === undefined) missingForDsgir.push("annualIncome");
  if (estimatedEmi === undefined) missingForDsgir.push("estimatedEmi");

  const loanToIncomeRatio =
    creditLimit !== undefined && annualIncome !== undefined && annualIncome > 0
      ? round2((creditLimit / annualIncome) * 100)
      : undefined;

  if (
    creditLimit === undefined ||
    annualIncome === undefined ||
    estimatedEmi === undefined
  ) {
    return {
      loanToIncomeRatio,
      annualIncome,
      existingMonthlyObligation: 0,
      existingObligationCount: 0,
      missingForDsgir,
    };
  }

  // calculateEMI only rounds on the interest-bearing branch — round here so an
  // interest-free facility doesn't surface a fractional rupee instalment.
  const proposedEmi = Math.round(estimatedEmi);
  const { total: existingMonthlyObligation, count: existingObligationCount } =
    calculateExistingMonthlyObligation(input.existingFacilities, interestRate, tenureMonths);

  const totalMonthlyDebtService = proposedEmi + existingMonthlyObligation;
  const grossMonthlyIncome = annualIncome / MONTHS_PER_YEAR;

  return {
    loanToIncomeRatio,
    dsgir: round2((totalMonthlyDebtService / grossMonthlyIncome) * 100),
    proposedEmi,
    existingMonthlyObligation,
    existingObligationCount,
    totalMonthlyDebtService,
    grossMonthlyIncome,
    annualIncome,
    missingForDsgir,
  };
}
