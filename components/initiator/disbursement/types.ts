export type DisbursementStatus = "Ready" | "Conditions" | "Blocked";

export interface DisbursementCondition {
  label: string;
  done: boolean;
}

/** Row shown in a "Pending disbursements" table. */
export interface DisbursementListRow {
  id: string;
  loanRef: string;
  borrowerName: string;
  amountLabel: string;
  conditionsLabel: string;
  status: DisbursementStatus;
}

export interface TrancheRecord {
  dateLabel: string;
  loanRef: string;
  borrowerName: string;
  tranche: string;
  amountLabel: string;
  accountCredited: string;
  status: "Confirmed" | "Pending ack";
}

/** Aggregate disbursement stats for the current month — not per-loan. */
export interface DisbursementMonthlyStats {
  totalDisbursedLabel: string;
  loanCount: number;
  toCollegeAccountLabel: string;
  directToBorrowerLabel: string;
}

export interface DisbursementDetail {
  id: string;
  loanRef: string;
  borrowerName: string;
  amountLabel: string;
  amountValue: number;
  statusHeaderLabel: string;
  conditions: DisbursementCondition[];
  commissionLabel: string;
  otherPending: DisbursementListRow[];
  tracker: TrancheRecord[];
  monthlyStats: DisbursementMonthlyStats;
}
