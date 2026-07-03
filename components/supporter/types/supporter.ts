import type {
  InitiatorCollegeVerification,
  InitiatorDocumentSet,
  InitiatorStudentInfo,
} from "@/components/initiator/types/initiator";
import type { LoanAssessmentFormValues } from "@/components/initiator/loan-assessment";

/** Row shown in the Supporter dashboard list — applications the college has verified. */
export interface SupporterApplicationListItem {
  id: string;
  applicationNumber: string;
  studentName: string;
  collegeName: string;
  loanAmount: number;
  program: string;
  status: "APPROVED_BY_INITIATOR";
  initiatorApprovedAt: string;
}

export interface SupporterApplicationDetail extends SupporterApplicationListItem {
  studentInfo: InitiatorStudentInfo;
  collegeVerification: InitiatorCollegeVerification;
  documents: InitiatorDocumentSet;
  submittedAt: string;
  workflowStage: string;
  /** The full Loan Assessment exactly as the Initiator submitted it, incl. their approval decision. */
  loanAssessment: LoanAssessmentFormValues;
}
