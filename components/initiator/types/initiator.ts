/** Row shown in the Initiator dashboard list. */
export interface InitiatorApplicationListItem {
  id: string;
  applicationNumber: string;
  studentName: string;
  collegeName: string;
  loanAmount: number;
  program: string;
  status: "VERIFIED_BY_COLLEGE" | "INITIATOR_CREATED";
  collegeVerifiedAt: string;
}

/** Student information shown in the details page — a subset of LoanApplication. */
export interface InitiatorStudentInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityName?: string;
  identityType?: string;
  identityNumber?: string;
  dob?: string;
  issuedDistrict?: string;
  issuedDate?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  fatherName?: string;
  motherName?: string;
  grandfatherName?: string;
  spouseName?: string;
  courseName?: string;
  boardUniversity?: string;
  studyType?: string;
  courseDuration?: string;
  loanAmount?: number;
  expectedSalary?: number;
}

/** Read-only view of the parent's verification submission (via magic link) — distinct from the
 *  student-reported family names on `InitiatorStudentInfo`. */
export interface InitiatorParentVerification {
  name?: string;
  phone?: string;
  contact?: string;
  citizenshipNumber?: string;
  salaryBankName?: string;
  bankAccountNumber?: string;
  salarySheetPublicUrl?: string;
  submittedAt?: string;
}

/** Read-only view of the college's verification form. */
export interface InitiatorCollegeVerification {
  collegeName?: string;
  collegeEmail?: string;
  contactPerson?: string;
  contactPhone?: string;
  isApplicationVerified: boolean;
  verificationNotes?: string;
  offerLetterPublicUrl?: string;
  enrollmentDocPublicUrl?: string;
}

export type DocumentFileType = "pdf" | "image";

/** A single uploaded document shown in the Initiator's document review workspace. */
export interface DocumentItem {
  id: string;
  label: string;
  fileType: DocumentFileType;
  url: string;
  uploadedAt?: string;
}

/** Documents grouped the way the review workspace displays them — one collapsible section each. */
export interface InitiatorDocumentSet {
  student: DocumentItem[];
  parent: DocumentItem[];
  college: DocumentItem[];
}

export interface InitiatorApplicationDetail extends InitiatorApplicationListItem {
  studentInfo: InitiatorStudentInfo;
  /** Present only once the parent has submitted the magic-link verification form. */
  parentVerification: InitiatorParentVerification | null;
  collegeVerification: InitiatorCollegeVerification;
  documents: InitiatorDocumentSet;
  submittedAt: string;
  /** Estimated monthly EMI from the application. */
  estimatedEmi?: number;
  workflowStage: string;
  /** Previously-saved Loan Assessment Form values, mapped from the backend record — pre-fills the form on reopen. */
  assessment: Partial<import("../loan-assessment/schema").LoanAssessmentFormValues>;
  /** True once POST /applications/:id/initiator has ever succeeded for this application —
   *  tells the Loan Assessment Form's Step 1 to PATCH instead of re-attempting a POST
   *  (which the backend correctly rejects with 409 once the record already exists). */
  hasInitiatorInfo: boolean;
  /** Current pipeline stage — used together with sentBackToStage to detect a
   *  resubmission (Support/Approver sent it back to the Initiator) so the
   *  Loan Assessment Form can skip the Review & Submit step on reopen. */
  stage?: import("@/types/dashboard").ApplicationStage | null;
  sentBackToStage?: import("@/types/dashboard").ApplicationStage | null;
}

/**
 * Everything `DocumentReviewPanel` actually reads off a detail record — deliberately
 * excludes `status`/`collegeVerifiedAt`/`id`, which differ by stage (e.g. Supporter's
 * "APPROVED_BY_INITIATOR" vs Initiator's "VERIFIED_BY_COLLEGE"), so any stage's detail
 * type can be passed to the same review panel without a status-literal mismatch.
 */
export type ApplicationReviewSummary = Pick<
  InitiatorApplicationDetail,
  | "studentName"
  | "applicationNumber"
  | "program"
  | "collegeName"
  | "loanAmount"
  | "submittedAt"
  | "workflowStage"
  | "studentInfo"
  | "collegeVerification"
  | "documents"
>;
