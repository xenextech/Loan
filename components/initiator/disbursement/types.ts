export type { DisbursementConditionStatus, DisbursementStatus } from "@/types/dashboard";

/** Readiness to actually disburse — derived client-side from the real
 *  conditions-checklist progress and bank-account-on-file flag (the only
 *  thing the backend's `confirm()` truly enforces server-side). */
export type DisbursementReadiness = "ready" | "conditions" | "blocked";

/** Shared by the pending list and the single-application detail page so both
 *  agree on what "ready to disburse" means. */
export function deriveReadiness(row: { conditionsDone: number; conditionsTotal: number; bankAccountReady: boolean }): DisbursementReadiness {
  if (!row.bankAccountReady) return "blocked";
  if (row.conditionsTotal > 0 && row.conditionsDone === row.conditionsTotal) return "ready";
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
