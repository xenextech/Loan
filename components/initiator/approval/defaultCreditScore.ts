import type { CreditScoringParameter } from "./types";

/**
 * Illustrative parameter breakdown shown alongside the real overall score.
 * Reference only — `/dashboard/approval/:id/credit-score` returns just the
 * aggregate (score/weight/percentage/grade/riskCategory), not a per-parameter
 * weight/score split, so these rows are generic placeholders, not live data.
 */
// Labels/weights mirror the backend's actual `CREDIT_PARAMETERS` scoring inputs
// (credit-score/constant/credit-parameters.constant.ts) — only the per-row
// score is illustrative, since the API doesn't return that breakdown.
export const ILLUSTRATIVE_CREDIT_PARAMETERS: CreditScoringParameter[] = [
  { label: "Credit facility size", value: "By credit limit tier", weight: 2, score: 0 },
  { label: "DSGIR", value: "By debt-service ratio band", weight: 3, score: 0 },
  { label: "Operation of institution", value: "By years in operation", weight: 2, score: 0 },
  { label: "Satisfactory performance", value: "By performance track record", weight: 1, score: 0 },
  { label: "Parents' borrowings with BFIs", value: "By exposure category", weight: 1, score: 0 },
  { label: "Source of income", value: "By income-source category", weight: 1, score: 0 },
];
