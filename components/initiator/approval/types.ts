export type ApprovalStageLabel =
  | "Awaiting Review"
  | "Checking"
  | "Approved"
  | "CICL Hold"
  | "Escalated"
  | "Rejected"
  | "Sent Back"
  | "Disbursed";

/** Row shown in the Approval Workflow queue. */
export interface ApprovalListItem {
  id: string;
  refNo: string;
  borrowerName: string;
  branch: string;
  loanType: string;
  amountLabel: string;
  grade: string;
  stageLabel: ApprovalStageLabel;
  dsgirLabel: string;
  ltvLabel: string;
  daysOpen: number;
}

/**
 * Visual-only stage tracker types. The backend has no persisted
 * INITIATOR/SUPPORTER/CHECKER/APPROVER workflow state yet — these render an
 * illustrative stage strip (Initiator done, rest awaiting), not live status.
 */
export type ApprovalRoleKey = "INITIATOR" | "SUPPORTER" | "CHECKER" | "APPROVER";

export type StageStatus = "DONE" | "ACTIVE" | "AWAITING";

export interface ApprovalStage {
  role: ApprovalRoleKey;
  roleLabel: string;
  actorName: string;
  actorTitle: string;
  status: StageStatus;
  comment?: string;
}

/** Illustrative credit-scoring parameter row — reference only, not sourced from a
 *  per-parameter scoring API. The real, live figure is the overall score/grade above. */
export interface CreditScoringParameter {
  label: string;
  value: string;
  weight: number;
  score: number;
}
