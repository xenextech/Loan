// Client-side mirror of the backend's credit-scoring engine — kept in exact
// lock-step with edu-loan-backend/src/modules/creditScore/{constant/credit-parameters.constant.ts,
// credit-score.service.ts}. This ONLY drives the live "what would this score"
// preview in Step3CreditAssessment; the backend (CreditScoreService) remains
// the sole authority for any persisted/approval-facing score. If the backend
// formula ever changes, update both.

interface ScoreRule {
  min?: number;
  max?: number;
  value?: string;
  weight: number;
  point: number;
}

const CREDIT_PARAMETERS = {
  creditLimit: [
    { max: 999999, weight: 2, point: 1 },
    { min: 1000000, max: 2500000, weight: 2, point: 2 },
    { min: 2500001, weight: 2, point: 3 },
  ],
  dsgir: [
    { max: 39.99, weight: 3, point: 1 },
    { min: 40, max: 45, weight: 3, point: 2 },
    { min: 45.01, weight: 3, point: 3 },
  ],
  operationOfInstitution: [
    { min: 11, weight: 2, point: 1 },
    { min: 5, max: 10, weight: 2, point: 2 },
    { max: 4, weight: 2, point: 3 },
  ],
  satisfactoryPerformance: [
    { min: 4, weight: 1, point: 1 },
    { min: 1, max: 3, weight: 1, point: 2 },
    { max: 0, weight: 1, point: 3 },
  ],
  parentsBorrowingsWithBFIs: [
    { value: "US", weight: 1, point: 1 },
    { value: "OTHER_BFI", weight: 1, point: 2 },
    { value: "OTHER_BFIS", weight: 1, point: 3 },
  ],
  sourceOfIncome: [
    { value: "FIXED", weight: 1, point: 1 },
    { value: "SALARY_RENT_BUSINESS", weight: 1, point: 2 },
    { value: "MIXED", weight: 1, point: 3 },
  ],
} as const satisfies Record<string, readonly ScoreRule[]>;

export type CreditScoreParameterKey = keyof typeof CREDIT_PARAMETERS;

const LOW_RISK_THRESHOLD = 51;
const MODERATE_RISK_THRESHOLD = 61;
const MEDIUM_RISK_THRESHOLD = 71;
const MEDIUM_HIGH_RISK_THRESHOLD = 80;

export type CreditGrade = "A1" | "A2" | "A3" | "A4" | "NA";
export type RiskCategory =
  | "LOW_RISK"
  | "MODERATE_RISK"
  | "MEDIUM_RISK"
  | "MEDIUM_HIGH_RISK"
  | "UNGRADED";

export interface CreditScoreParameterInput {
  creditLimit?: number | null;
  dsgir?: number | null;
  operationOfInstitution?: number | null;
  satisfactoryPerformance?: number | null;
  parentsBorrowingsWithBFIs?: string | null;
  sourceOfIncome?: string | null;
}

export interface CreditScoreParameterBreakdown {
  key: CreditScoreParameterKey;
  weight: number;
  point: number;
  weightScore: number;
}

export interface CreditScoreResult {
  breakdown: CreditScoreParameterBreakdown[];
  totalWeightScore: number;
  maxPossibleScore: number;
  percentage: number;
  grade: CreditGrade;
  riskCategory: RiskCategory;
}

function getScore(
  key: CreditScoreParameterKey,
  input: number | string | null | undefined,
): CreditScoreParameterBreakdown | null {
  if (input === null || input === undefined || input === "") return null;

  const rules = CREDIT_PARAMETERS[key] as readonly ScoreRule[];
  const rule = rules.find((r) => {
    if (typeof input === "number") {
      if (r.min !== undefined && input < r.min) return false;
      if (r.max !== undefined && input > r.max) return false;
      return true;
    }
    return r.value === input;
  });
  if (!rule) return null;

  return { key, weight: rule.weight, point: rule.point, weightScore: rule.weight * rule.point };
}

function resolveGrade(percentage: number): { grade: CreditGrade; riskCategory: RiskCategory } {
  if (percentage < LOW_RISK_THRESHOLD) return { grade: "A1", riskCategory: "LOW_RISK" };
  if (percentage < MODERATE_RISK_THRESHOLD) return { grade: "A2", riskCategory: "MODERATE_RISK" };
  if (percentage < MEDIUM_RISK_THRESHOLD) return { grade: "A3", riskCategory: "MEDIUM_RISK" };
  if (percentage < MEDIUM_HIGH_RISK_THRESHOLD) return { grade: "A4", riskCategory: "MEDIUM_HIGH_RISK" };
  return { grade: "NA", riskCategory: "UNGRADED" };
}

/** Returns null when no scoring input is present at all (nothing to preview yet). */
export function calculateCreditScorePreview(
  input: CreditScoreParameterInput,
): CreditScoreResult | null {
  const breakdown: CreditScoreParameterBreakdown[] = [];
  let totalWeightScore = 0;
  let maxPossibleScore = 0;

  for (const key of Object.keys(CREDIT_PARAMETERS) as CreditScoreParameterKey[]) {
    const score = getScore(key, input[key]);
    if (!score) continue;

    const maxPoint = Math.max(...(CREDIT_PARAMETERS[key] as readonly ScoreRule[]).map((r) => r.point));
    breakdown.push(score);
    totalWeightScore += score.weightScore;
    maxPossibleScore += score.weight * maxPoint;
  }

  if (breakdown.length === 0) return null;

  const percentage = maxPossibleScore === 0 ? 0 : Number(((totalWeightScore / maxPossibleScore) * 100).toFixed(2));
  const { grade, riskCategory } = resolveGrade(percentage);

  return { breakdown, totalWeightScore, maxPossibleScore, percentage, grade, riskCategory };
}
