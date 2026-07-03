/** Row shown in the Initiator dashboard list. */
export interface InitiatorApplicationListItem {
  id: string;
  applicationNumber: string;
  studentName: string;
  collegeName: string;
  loanAmount: number;
  program: string;
  status: "VERIFIED_BY_COLLEGE";
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
  collegeVerification: InitiatorCollegeVerification;
  documents: InitiatorDocumentSet;
  submittedAt: string;
  workflowStage: string;
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
