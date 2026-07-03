/** The four sequential desks a credit application passes through before disbursement. */
export type ApprovalRoleKey = "INITIATOR" | "SUPPORTER" | "CHECKER" | "APPROVER";

export type StageStatus = "DONE" | "ACTIVE" | "AWAITING";

export interface ApprovalStage {
  role: ApprovalRoleKey;
  roleLabel: string;
  actorName: string;
  actorTitle: string;
  status: StageStatus;
  comment?: string;
  decidedAt?: string;
}

export interface CreditScoringParameter {
  label: string;
  value: string;
  weight: number;
  score: number;
}

export interface ComplianceCheck {
  label: string;
  passed: boolean;
}

export interface ActivityEvent {
  role: ApprovalRoleKey;
  roleLabel: string;
  actorName: string;
  action: string;
  note: string;
  timestamp: string;
}

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

export interface ApprovalDetail extends ApprovalListItem {
  citizenshipNumber: string;
  riskGrade: string;
  collateral: string;
  insuranceStatus: string;
  offerLetterRef: string;
  offerLetterCollege: string;
  offerLetterVerified: boolean;
  ciclStatus: string;
  stages: ApprovalStage[];
  creditScore: {
    weighted: number;
    max: number;
    grade: string;
    riskLabel: string;
    percentage: number;
    parameters: CreditScoringParameter[];
  };
  complianceChecks: ComplianceCheck[];
  activity: ActivityEvent[];
}
