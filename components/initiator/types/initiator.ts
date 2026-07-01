// Mirrors the Prisma enums added for InitiatorVerification
// (edu-loan-backend/prisma/schema.prisma).

export type CreditFacilitySize =
  | "BELOW_1_LAKH"
  | "ONE_LAKH_TO_2_5_LAKH"
  | "ABOVE_2_5_LAKH";

export type DSGIR = "BELOW_40_PERCENT" | "RANGE_40_TO_45_PERCENT" | "ABOVE_45_PERCENT";

export type CollegeOperation =
  | "MORE_THAN_10_YEARS"
  | "FIVE_TO_10_YEARS"
  | "LESS_THAN_5_YEARS";

export type InstitutionPerformance =
  | "ABOVE_3_YEARS"
  | "ONE_TO_3_YEARS"
  | "LESS_THAN_1_YEAR";

export type ParentBorrowing =
  | "BORROWING_FROM_US"
  | "BORROWING_FROM_ONE_OTHER_BFI"
  | "BORROWING_FROM_MULTIPLE_BFIS";

export type IncomeSource =
  | "FIXED_INCOME"
  | "SALARY"
  | "RENT"
  | "BUSINESS_INCOME"
  | "MIXED_INCOME";

export interface InitiatorVerificationData {
  creditFacilitySize?: CreditFacilitySize;
  dsgir?: DSGIR;
  collegeOperation?: CollegeOperation;
  institutionPerformance?: InstitutionPerformance;
  parentsBorrowings?: ParentBorrowing;
  sourceOfIncome?: IncomeSource;
  remarks?: string;
}

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

export interface InitiatorApplicationDetail extends InitiatorApplicationListItem {
  studentInfo: InitiatorStudentInfo;
  collegeVerification: InitiatorCollegeVerification;
  initiatorVerification?: InitiatorVerificationData;
}
