import type { ApplicationStage } from "@/types/dashboard";

/** Row shown in the Approval Workflow queue. */
export interface ApprovalListItem {
  id: string;
  refNo: string;
  borrowerName: string;
  branch: string;
  loanType: string;
  amountLabel: string;
  grade: string;
  stage: ApplicationStage | null;
  dsgirLabel: string;
  ltvLabel: string;
  daysOpen: number;
}

/** Illustrative credit-scoring parameter row — reference only, not sourced from a
 *  per-parameter scoring API. The real, live figure is the overall score/grade above. */
export interface CreditScoringParameter {
  label: string;
  value: string;
  weight: number;
  score: number;
}
