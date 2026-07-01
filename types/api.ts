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
  | 'SUPPORTER'
  | 'APPROVER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; role: UserRole };
}

// ─── Enums (match backend Prisma enums exactly) ───────────────────────────────

export type AppStatus = 'DRAFT' | 'SUBMITTED';
export type StudyType = 'PROGRAM' | 'COURSE' | 'DIPLOMA' | 'CERTIFICATION';
export type IdentityType = 'CITIZENSHIP' | 'PASSPORT' | 'DRIVING_LICENSE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type Occupation = 'STUDENT' | 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';
export type FeeStructureMethod = 'DOCUMENT' | 'LINK' | 'MANUAL';
export type DocumentType =
  | 'APPLICANT_PHOTO'
  | 'IDENTITY_FRONT'
  | 'IDENTITY_BACK'
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
  boardUniversity?: string;
  courseDuration?: number;
  loanAmount?: number;
  // Step 2
  identityType?: IdentityType;
  identityNumber?: string;
  identityName?: string;
  dob?: string;
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
  createdAt: string;
  updatedAt: string;
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
  monthlySalary?: number;
  tenureMonths?: number;
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
  citizenshipNo?: string;
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
