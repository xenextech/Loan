import type { ComplianceCheck, CreditScoringParameter } from "./types";

/**
 * Placeholder credit scoring shown for real applications until the backend exposes a real
 * per-application scoring endpoint — same shape as the mock demo dataset, generic values.
 */
export const DEFAULT_CREDIT_SCORE: {
  weighted: number;
  max: number;
  grade: string;
  riskLabel: string;
  percentage: number;
  parameters: CreditScoringParameter[];
} = {
  weighted: 19,
  max: 52,
  grade: "A1",
  riskLabel: "Low risk",
  percentage: 36.5,
  parameters: [
    { label: "Credit facility size", value: "Below Rs 10L", weight: 2, score: 2 },
    { label: "DSGIR", value: "Not yet assessed", weight: 3, score: 0 },
    { label: "CIC bureau score", value: "Not yet pulled", weight: 3, score: 0 },
    { label: "Banking relationship", value: "Sole banking", weight: 1, score: 1 },
    { label: "Source of income", value: "Not yet assessed", weight: 1, score: 0 },
    { label: "Collateral quality", value: "Not yet assessed", weight: 2, score: 0 },
    { label: "Sector risk", value: "Education", weight: 2, score: 2 },
    { label: "Guarantor strength", value: "Not yet assessed", weight: 1, score: 0 },
    { label: "Performance history", value: "New customer", weight: 2, score: 1 },
    { label: "Institution vintage", value: "New customer", weight: 1, score: 1 },
  ],
};

export const DEFAULT_COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { label: "DSGIR within 50% NRB limit", passed: false },
  { label: "LTV within NRB education loan cap", passed: false },
  { label: "CICL checked — no adverse", passed: false },
  { label: "PEP screening — clear", passed: false },
  { label: "4-eye rule: 1/4 stages complete", passed: false },
  { label: "Insurance attached", passed: false },
  { label: "Agreement documents generated", passed: false },
];
