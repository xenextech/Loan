export type { DisbursementConditionStatus, DisbursementStatus } from "@/types/dashboard";

/** Row shown in the "Pending disbursements" table — GET /dashboard/disbursement/pending. */
export interface DisbursementListRow {
  id: string;
  refNo: string;
  borrowerName: string;
  amountLabel: string;
  conditionsDone: number;
  conditionsTotal: number;
  status: import("@/types/dashboard").DisbursementStatus;
}
