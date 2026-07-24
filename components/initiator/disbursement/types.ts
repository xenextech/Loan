export type { DisbursementConditionStatus, DisbursementStatus } from "@/types/dashboard";

/** Readiness to actually disburse — derived client-side, but mirrors exactly
 *  what the backend's `confirm()` enforces server-side: a parent bank
 *  account on file, a signed Loan Agreement legal document, and every
 *  disbursement condition marked DONE (an empty checklist doesn't block —
 *  conditions are optional per application). */
export type DisbursementReadiness = "ready" | "conditions" | "blocked";

/** Shared by the pending list and the single-application detail page so both
 *  agree on what "ready to disburse" means. */
export function deriveReadiness(row: {
  conditionsDone: number;
  conditionsTotal: number;
  bankAccountReady: boolean;
  legalDocumentReady: boolean;
}): DisbursementReadiness {
  if (!row.bankAccountReady || !row.legalDocumentReady) return "blocked";
  if (row.conditionsTotal === 0 || row.conditionsDone === row.conditionsTotal) return "ready";
  return "conditions";
}

/** Row shown in the "Pending disbursements" table — GET /dashboard/disbursement/pending. */
export interface DisbursementListRow {
  id: string;
  refNo: string;
  borrowerName: string;
  amountLabel: string;
  conditionsDone: number;
  conditionsTotal: number;
  readiness: DisbursementReadiness;
}
