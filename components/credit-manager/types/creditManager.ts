/** Row shown in the Credit Manager's approved-loan portfolio — reuses the same
 *  shape as the Approval Workflow queue, both backed by `/dashboard/applications`. */
export type { ApprovalListItem as CreditManagerPortfolioRow } from "@/components/initiator/approval/types";

export interface LoanActionNeeded {
  label: string;
  severity: "high" | "medium";
}

/** Per-loan health, derived client-side from the real EMI schedule + disbursement
 *  + loan-account records — nothing here is a persisted backend field except the
 *  raw schedule entries and `loanAccount.status`/`nrbClassification` themselves. */
export interface CreditManagerLoanHealth {
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  completionPercent: number;
  nextDueDate: string | null;
  lastPaymentDate: string | null;
  /** Null when no installment has been paid yet — caller falls back to the full credit limit. */
  outstandingBalance: number | null;
  /** Days past due on the oldest unpaid overdue installment — 0 if nothing is overdue. */
  dpd: number;
  emiAmount: number | null;
  isLoading: boolean;
}
