import type { DisbursementCondition } from "./types";

/**
 * Placeholder disbursement conditions shown for real applications until the backend
 * exposes a real conditions-tracking endpoint — same shape as the mock demo dataset,
 * all starting undone since nothing's been verified for real applications yet.
 */
export const DEFAULT_CONDITIONS: DisbursementCondition[] = [
  { label: "Loan agreement signed by borrower + guarantor", done: false },
  { label: "Citizenship + NID copies obtained", done: false },
  { label: "College enrollment / offer letter re-verified", done: false },
  { label: "Insurance policy attached", done: false },
];
