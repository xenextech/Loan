import type { EmiStatus, RepaymentFrequency } from "./dashboard";

// Backend API response envelope
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginatedMeta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'STUDENT'
  | 'ADMIN'
  | 'PARENT'
  | 'COLLEGE'
  | 'INITIATOR'
  // Deprecated: use CREDIT_MANAGER — kept because existing rows/JWTs may still reference it.
  | 'CHECKER'
  | 'SUPPORTER'
  | 'APPROVER'
  | 'CREDIT_MANAGER';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role: UserRole;
  };
}

// ─── Enums (match backend Prisma enums exactly) ───────────────────────────────

export type AppStatus = 'DRAFT' | 'SUBMITTED';
export type StudyType = 'PROGRAM' | 'COURSE' | 'DIPLOMA' | 'CERTIFICATION';
export type IdentityType = 'CITIZENSHIP' | 'PASSPORT' | 'DRIVING_LICENSE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type Occupation = 'STUDENT' | 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';
export type FeeStructureMethod = 'DOCUMENT' | 'LINK' | 'MANUAL';
export type ApprovalEntryStatus =
  | 'PENDING'
  | 'WAITING'
  | 'UNDER_REVIEW'
  | 'FIELD_VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENT_BACK';
export type DocumentType =
  | 'APPLICANT_PHOTO'
  | 'IDENTITY_FRONT'
  | 'IDENTITY_BACK'
  | 'IDENTITY_DOCUMENT'
  | 'ACADEMIC_RECORD'
  | 'FEE_STRUCTURE'
  | 'STUDENT_APPLICATION'
  | 'OFFER_LETTER'
  | 'ENROLLMENT_DOCUMENT';

// ─── Submission result (includes magic links) ────────────────────────────────

export interface SubmitApplicationResult {
  id: string;
  applicationNumber: string;
  status: AppStatus;
  submittedAt: string;
  parentLink: string;
  collegeLink: string;
}

// ─── Parent verification (via magic link) ────────────────────────────────────

export interface ParentVerification {
  id: string;
  applicationId: string;
  name?: string;
  phone?: string;
  contact?: string;
  citizenshipNumber?: string;
  salaryBankName?: string;
  bankAccountNumber?: string;
  salarySheetPublicUrl?: string;
  submittedAt?: string;
  /** NID/PAN/salary-sheet uploads — only present on the Initiator's GET .../initiator response. */
  documents?: ParentDocument[];
}

export type ParentDocumentType = 'NID' | 'PAN_ID' | 'SALARY_SHEET';

export interface ParentDocument {
  id: string;
  parentVerificationId: string;
  documentType: ParentDocumentType;
  label?: string | null;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  bucketName: string;
  filePath: string;
  publicUrl: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentApplicationView {
  applicationNumber: string;
  studentName?: string;
  email?: string;
  phoneNumber?: string;
  studyType?: string;
  courseName?: string;
  boardUniversity?: string;
  courseDuration?: string;
  loanAmount?: number;
  submittedAt?: string;
  verification?: ParentVerification;
  documents: ParentDocument[];
}

// ─── Student consent ──────────────────────────────────────────────────────────
// Approver-authored terms & conditions, consented to from the student's own
// logged-in dashboard (GET/POST /applications/:id/consent[/accept]) — no
// anonymous link involved, so consent is backed by the same login every other
// authenticated action in this app relies on.

export interface StudentConsentRecord {
  id: string;
  applicationId: string;
  termsText: string;
  createdByUserId: string | null;
  consentedAt: string | null;
  consentedIp: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── College verification ────────────────────────────────────────────────────

export interface CollegeVerification {
  id: string;
  applicationId: string;
  collegeName?: string;
  collegeEmail?: string;
  contactPerson?: string;
  contactPhone?: string;
  isApplicationVerified: boolean;
  verificationNotes?: string;
  offerLetterPublicUrl?: string;
  enrollmentDocPublicUrl?: string;
  submittedAt?: string;
}

export interface CollegeApplicationView {
  applicationNumber: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studyType?: string;
  courseName?: string;
  boardUniversity?: string;
  courseDuration?: string;
  loanAmount?: number;
  submittedAt?: string;
  verification?: CollegeVerification;
}

export interface CollegeMyVerification {
  id: string;
  applicationId: string;
  applicationNumber: string;
  studentName?: string;
  courseName?: string;
  boardUniversity?: string;
  loanAmount?: number;
  applicationStatus: AppStatus;
  isApplicationVerified: boolean;
  offerLetterUploaded: boolean;
  enrollmentDocUploaded: boolean;
  verificationSubmittedAt?: string;
  linkToken: string;
  linkExpiresAt: string;
}

// ─── Nested relation shapes (returned by Prisma include) ─────────────────────

export interface StudyInformation {
  studyType?: StudyType;
  courseName?: string;
  boardUniversity?: string;
  courseDuration?: string;
}

export interface LoanInformation {
  loanAmount?: number;
  expectedSalary?: number;
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  status: AppStatus;
  userId: string;
  // Nested relations (present when included by Prisma)
  studyInformation?: StudyInformation;
  loanInformation?: LoanInformation;
  collegeVerification?: CollegeVerification;
  documents?: { id: string; documentType: DocumentType; publicUrl?: string }[];
  // Step 1 (flat fields — present on create/update responses)
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  studyType?: StudyType;
  courseName?: string;
  collegeName?: string;
  boardUniversity?: string;
  courseDuration?: number;
  loanAmount?: number;
  // Step 2
  identityType?: IdentityType;
  identityNumber?: string;
  identityName?: string;
  dob?: string;
  // Computed on read by ApplicationsService.withComputedDob() — AD-canonical
  // date of birth + live-calculated age, present on GET /applications/:id.
  dobAd?: string;
  age?: number;
  issuedDistrict?: string;
  issuedDate?: string;
  gender?: Gender;
  occupation?: Occupation;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: number;
  // Step 3
  fatherName?: string;
  motherName?: string;
  grandfatherName?: string;
  maritalStatus?: MaritalStatus;
  spouseName?: string;
  expectedSalary?: number;
  feeStructureMethod?: FeeStructureMethod;
  feeWebsiteLink?: string;
  feeManualAmount?: number;
  submittedAt?: string;
  reviewComment?: string;
  // Present on the raw Prisma response (e.g. PATCH .../initiator) even
  // though this type otherwise mirrors the student-facing apply flow — the
  // Initiator's "Update"/"Submit" actions need to know whether a send-back
  // targeted them, to auto-resubmit instead of leaving the application stuck.
  stage?: import("./dashboard").ApplicationStage | null;
  sentBackToStage?: import("./dashboard").ApplicationStage | null;
  sentBackByApprover?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Initiator ────────────────────────────────────────────────────────────────
// Wire shapes for GET /applications/initiator/college-verified and
// GET /applications/:applicationId/initiator (see applicationInitiator module).

export interface CollegeVerifiedStudent {
  id: string;
  applicationNumber: string;
  status: AppStatus;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  user: { id: string; email: string; role: UserRole };
  studyInformation?: Pick<StudyInformation, 'courseName' | 'studyType'>;
  loanInformation?: Pick<LoanInformation, 'loanAmount'>;
}

export interface CollegeVerifiedItem {
  applicationId: string;
  student: CollegeVerifiedStudent;
  collegeVerification: CollegeVerification;
}

// Wire shape for GET /applications/initiator/queue — same as CollegeVerifiedItem
// plus `source`, and `collegeVerification` is null for Initiator-created rows
// (they never go through college verification).
export interface InitiatorQueueItem {
  applicationId: string;
  source: 'STUDENT' | 'INITIATOR';
  student: CollegeVerifiedStudent;
  collegeVerification: CollegeVerification | null;
}

export interface InitiatorFamilyMemberRecord {
  id: string;
  personName?: string;
  age?: number;
  qualification?: string;
  relationshipWithBorrower?: string;
  occupationSocialInvolvement?: string;
}

export type FacilityStatus = 'PERFORMING' | 'OVERDUE' | 'NPA' | 'CLOSED';

export interface InitiatorExistingFacilityRecord {
  id: string;
  facilityType?: string;
  bank?: string;
  sanctionedLimit?: number;
  outstanding?: number;
  status?: FacilityStatus;
}

export interface InitiatorPersonalGuaranteeRecord {
  nameOfGuarantor?: string;
  relationship?: string;
  age?: number;
  netWorth?: number;
  guarantorConsent?: boolean;
  ciclStatus?: boolean;
  ciclRemarks?: string;
  blackListedDate?: string;
  releasedDate?: string;
}

export interface InitiatorInsuranceRecord {
  insuredAssets?: string;
  valueOfAssets?: number;
  sumOfInsurance?: number;
  insuranceCoverage?: number;
  insuranceRemarks?: string;
}

export interface InitiatorRepaymentCapacityRecord {
  insuredAssets?: number;
  valueOfAssets?: number;
  sumOfInsurance?: number;
  insuranceCoverage?: number;
  insuranceRemarks?: string;
}

// Full record returned by GET /applications/:applicationId/initiator — a plain
// LoanApplication row with every relation the initiator review screen needs.
export interface InitiatorApplicationRecord {
  id: string;
  applicationNumber: string;
  status: AppStatus;
  source: 'STUDENT' | 'INITIATOR';
  // Stamped once, only by POST /applications/:id/initiator — the authoritative
  // "has the initiator's Basic Information already been created" flag (see
  // ApplicationInitiatorService.createInitiatorApplication on the backend).
  initiatorUserId?: string | null;
  stage?: import('./dashboard').ApplicationStage | null;
  userId?: string;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  rejectedByUserId?: string | null;
  sentBackReason?: string | null;
  sentBackAt?: string | null;
  sentBackByUserId?: string | null;
  sentBackToStage?: import('./dashboard').ApplicationStage | null;
  nrbClassification?: import('./dashboard').NrbLoanClassification;
  nrbClassifiedAt?: string | null;
  branch?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  identityType?: IdentityType | null;
  identityNumber?: string;
  identityName?: string;
  dateOfBirth?: string;
  dobBs?: string | null;
  issuedDistrict?: string;
  issuedDate?: string;
  gender?: Gender;
  occupation?: Occupation;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  fatherName?: string;
  motherName?: string;
  grandfatherName?: string;
  maritalStatus?: MaritalStatus;
  spouseName?: string;
  informationAccurate?: boolean | null;
  authorizeVerification?: boolean | null;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  studyInformation?: StudyInformation;
  loanInformation?: LoanInformation;
  documents?: Document[];
  collegeVerification?: CollegeVerification;
  parentVerification?: ParentVerification;

  // ─── Approval workflow trail (who signed off each stage, and when) ─────────
  initiatorName?: string | null;
  initiatorPost?: string | null;
  initiatorDate?: string | null;
  initiatorSignature?: string | null;
  initiatorRemarks?: string | null;
  initiatorStatus?: ApprovalEntryStatus | null;
  supporterUserId?: string | null;
  supporterName?: string | null;
  supporterPost?: string | null;
  supporterDate?: string | null;
  supporterSignature?: string | null;
  supporterRemarks?: string | null;
  supporterStatus?: ApprovalEntryStatus | null;
  checkerUserId?: string | null;
  checkerName?: string | null;
  checkerPost?: string | null;
  checkerDate?: string | null;
  checkerSignature?: string | null;
  checkerRemarks?: string | null;
  checkerStatus?: ApprovalEntryStatus | null;
  approverUserId?: string | null;
  approverName?: string | null;
  approverPost?: string | null;
  approverDate?: string | null;
  approverSignature?: string | null;
  approverRemarks?: string | null;
  approverStatus?: ApprovalEntryStatus | null;

  // ─── Compliance / risk flags ────────────────────────────────────────────────
  existingBankingRelationship?: string | null;
  blacklistStatus?: string | null;
  blacklistReason?: string | null;
  blacklistDate?: string | null;
  blacklistReferenceNumber?: string | null;
  pepStatus?: string | null;
  pepRemarks?: string | null;
  pepCheckedAt?: string | null;
  pepCheckedByUserId?: string | null;
  moneyLaunderingRisk?: string | null;

  // ─── Initiator credit-appraisal fields (flat on LoanApplication) ────────────
  // Basic Information
  customerName?: string;
  relationshipStartDate?: string;
  customerGroup?: string;
  obligorNumber?: number;
  permanentAddress?: string;
  correspondenceAddress?: string;
  profession?: string;
  repaymentSource?: string;
  citizenshipNumber?: string;
  citizenshipIssuedDate?: string;
  citizenshipIssuedPlace?: string;
  nidNumber?: string;
  panNumber?: string;
  licenseNumber?: string;
  bankingRelationship?: string;
  isBlacklisted?: boolean;
  // NRB Reporting
  baselClassification?: string;
  baselRiskWeight?: number;
  nrb93SectorCode?: string;
  nrb93KaProductCode?: string;
  nrb94SecurityTypeCode?: string;
  sis0IndustrialClassification?: string;
  sis1ProductType?: string;
  sis2Sector?: string;
  sis3Security?: string;
  sis4InstitutionalGroupingOfBorrower?: string;
  sis9PriorityLending?: string;
  greenFinanceEconomicSector?: string;
  greenFinanceSubSector?: string;
  greenFinanceTaxonomyTag?: string;
  // Credit Scoring
  creditLimit?: number;
  loanToValueRatio?: number;
  dsgir?: number;
  performanceYears?: number;
  satisfactoryPerformance?: number;
  bankingRelationshipScore?: number;
  parentsBorrowingsWithBFIs?: string;
  sourceOfIncomeScore?: number;
  sourceOfIncome?: string;
  operationOfInstitution?: number;
  creditRiskScoring?: string;
  riskGrade?: string;
  totalScore?: number;
  totalPercentage?: number;
  collegeName?: string;
  // Applicant Background / This Facility
  facility?: string;
  purpose?: string;
  limit?: number;
  period?: number;
  periodUnit?: "YEAR" | "MONTH";
  interestRate?: number;
  fee?: number;
  remarks?: string;
  familyMember?: InitiatorFamilyMemberRecord[];
  existingFacility?: InitiatorExistingFacilityRecord[];
  // Security
  securityDetails?: string;
  fmv?: number;
  proposedLoan?: number;
  financeAgainstFmv?: number;
  personalGuarantee?: InitiatorPersonalGuaranteeRecord;
  // Insurance / Repayment Capacity — both are relations, not flat fields
  insurance?: InitiatorInsuranceRecord;
  repaymentCapacity?: InitiatorRepaymentCapacityRecord;
  // Risk / Recommendation
  amlRisk?: string;
  waiver?: string;
  termsAndConditions?: string;
  bankingRelationshipRemarks?: string;
  keyCreditRiskMitigation?: string;
  justificationOfLoan?: string;
  accountStrategy?: string;
  disbursementSection?: string;
  utilizationOfFund?: string;
  conclusionAndRecommendation?: string;
}

// ─── Application Tracker ──────────────────────────────────────────────────────
// Mirrors edu-loan-backend/src/modules/applications/dto/application-tracker.dto.ts
// (GET /applications/:id/tracker, STUDENT-only, ownership-enforced).

export type TrackerStageKey =
  | 'STUDENT'
  | 'PARENT'
  | 'COLLEGE'
  | 'INITIATOR'
  | 'SUPPORTER'
  | 'CREDIT_MANAGER_REVIEW'
  | 'APPROVER'
  | 'CREDIT_MANAGER_SETUP'
  | 'DISBURSEMENT';

export type TrackerStageStatus =
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'REJECTED'
  | 'SENT_BACK'
  | 'SKIPPED';

export type TrackerOverallStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'REJECTED'
  | 'SENT_BACK'
  | 'COMPLETED';

export interface TrackerStage {
  key: TrackerStageKey;
  label: string;
  role: UserRole;
  status: TrackerStageStatus;
  completedAt: string | null;
  completedBy: string | null;
  reason: string | null;
}

// ─── Repayment (nested in ApplicationTracker, populated once the Credit
// Manager has configured loan servicing and the EMI schedule exists) ────────

export type RepaymentStatus =
  | "NOT_CONFIGURED"
  | "ON_TRACK"
  | "OVERDUE"
  | "NEEDS_REVIEW"
  | "CLEARED";

export interface RepaymentLoanSummary {
  approvedAmount: number;
  finalDisbursementAmount: number;
  interestRate: number;
  interestFrequency: RepaymentFrequency;
  repaymentFrequency: RepaymentFrequency;
  tenureMonths: number;
  gracePeriodMonths: number;
  totalRepayable: number;
}

export interface RepaymentNextPayment {
  dueDate: string | null;
  amount: number | null;
  daysRemaining: number | null;
  status: RepaymentStatus;
}

export interface RepaymentScheduleEntry {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  outstandingBalance: number;
  status: EmiStatus;
}

export interface RepaymentProgress {
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  outstandingBalance: number;
  totalPaid: number;
  totalRemaining: number;
}

export interface RepaymentTrackerData {
  loanSummary: RepaymentLoanSummary;
  nextPayment: RepaymentNextPayment;
  schedule: RepaymentScheduleEntry[];
  progress: RepaymentProgress;
}

export interface ApplicationTracker {
  applicationId: string;
  applicationNumber: string | null;
  currentStageKey: TrackerStageKey | null;
  currentStageLabel: string | null;
  currentOwnerRole: UserRole | null;
  currentStatus: TrackerOverallStatus;
  progressPercentage: number;
  completedStages: number;
  totalStages: number;
  timeline: TrackerStage[];
  // Null until the Credit Manager has configured loan servicing.
  repayment: RepaymentTrackerData | null;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  bucketName: string;
  filePath: string;
  publicUrl: string;
  createdAt: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalSubmitted: number;
  totalDraft: number;
  recentSubmissions: LoanApplication[];
}

export interface AdminQuery {
  search?: string;
  status?: AppStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export interface EmiScheduleEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface EmiResult {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalPayable: number;
  totalInterest: number;
  schedule: EmiScheduleEntry[];
}

export interface EligibilityResult {
  eligible: boolean;
  maxLoanAmount: number;
  reasons: string[];
  estimatedEmi?: number;
}

export interface EligibilityRequest {
  studyType: StudyType;
  loanAmount: number;
  expectedSalary: number;
}

// ─── College Document Templates ───────────────────────────────────────────────

export interface OfferLetterListItem {
  id: string;
  refNo: string;
  collegeName: string;
  studentFullName: string;
  programName?: string;
  issuedDateAD?: string;
  issuedDateBS?: string;
  qrToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferLetterRecord extends OfferLetterListItem {
  createdByEmail: string;
  collegeAddress?: string;
  collegeRegNo?: string;
  collegeAffiliation?: string;
  collegePhone?: string;
  collegeEmail?: string;
  collegeWebsite?: string;
  logoUrl?: string;
  validUntilAD?: string;
  validUntilBS?: string;
  studentDobAD?: string;
  studentDobBS?: string;
  citizenshipNumber?: string;
  fatherName?: string;
  motherName?: string;
  permanentAddress?: string;
  district?: string;
  province?: string;
  programFullName?: string;
  programAffiliation?: string;
  durationYears?: number;
  totalSemesters?: number;
  creditHours?: number;
  academicYearBS?: string;
  intakeMonthBS?: string;
  admissionFee?: number;
  tuitionPerSem?: number;
  examFeePerSem?: number;
  labFeePerSem?: number;
  totalApprox?: number;
  conditions?: string[];
  signatories?: { name: string; designation: string; stampAreaLabel?: string }[];
  qrVerifyUrl?: string;
}

export interface AgreementListItem {
  id: string;
  refNo: string;
  collegeName: string;
  studentFullName: string;
  programName?: string;
  issuedDateAD?: string;
  issuedDateBS?: string;
  isEnrolled: boolean;
  qrToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementRecord extends AgreementListItem {
  createdByEmail: string;
  collegeAddress?: string;
  collegeRegNo?: string;
  collegeAffiliation?: string;
  collegePhone?: string;
  collegeEmail?: string;
  collegeWebsite?: string;
  logoUrl?: string;
  tuRollNo?: string;
  enrollmentNo?: string;
  currentYear?: string;
  currentSemester?: string;
  academicYearBS?: string;
  studentStatus?: string;
  hasBacklogs: boolean;
  disciplinaryHold: boolean;
  feeDueRs?: number;
  qrVerifyUrl?: string;
}

export interface EnrollmentCertListItem {
  id: string;
  refNo: string;
  collegeName: string;
  collegeCode?: string;
  studentFullName: string;
  tuRollNo?: string;
  programName?: string;
  issuedDateAD?: string;
  issuedDateBS?: string;
  isEnrolled: boolean;
  qrToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentCertRecord extends EnrollmentCertListItem {
  createdByEmail: string;
  collegeAddress?: string;
  collegeRegNo?: string;
  collegeAffiliation?: string;
  collegePhone?: string;
  collegeEmail?: string;
  collegeWebsite?: string;
  logoUrl?: string;
  enrollmentNo?: string;
  currentYear?: string;
  currentSemester?: string;
  academicYearBS?: string;
  studentStatus?: string;
  hasBacklogs: boolean;
  disciplinaryHold: boolean;
  feeDueRs?: number;
  qrVerifyUrl?: string;
}
