export type StudyType = "program" | "course" | "diploma" | "certification";
export type IdentityType = "citizenship" | "passport" | "driving_license" | "document";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type Gender = "male" | "female" | "other";
export type Occupation = "student" | "employed" | "self_employed" | "unemployed";
export type FeeStructureType = "upload" | "website" | "manual";
export type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export interface Step1Data {
  fullName: string;
  phoneNumber: string;
  email: string;
  studyType: StudyType;
  courseName: string;
  collegeName: string;
  boardUniversity: string;
  courseDuration: string;
  loanAmount: number;
  // Present only when arriving from the College Marketplace.
  collegeId?: string;
  courseId?: string;
  tuitionFee?: number;
}

export interface Step2Data {
  identityType: IdentityType;
  identityNumber: string;
  identityName: string;
  dob: string;
  issuedDistrict: string;
  issuedDate: string;
  gender: Gender;
  occupation: Occupation;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  photoUrl?: string;
  frontDocUrl?: string;
  backDocUrl?: string;
}

export interface Step3Data {
  fatherName: string;
  motherName: string;
  grandfatherName: string;
  maritalStatus: MaritalStatus;
  spouseName?: string;
  expectedSalary: string;
  academicRecords: File[];
  feeStructureType: FeeStructureType;
  feeDocUrl?: string;
  feeWebsiteLink?: string;
  feeManualAmount?: string;
}

export interface ApplicationFormData {
  step1?: Partial<Step1Data>;
  step2?: Partial<Step2Data>;
  step3?: Partial<Step3Data>;
}

export interface Application {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  loanAmount: number;
  courseName: string;
  studyType: StudyType;
  fullName: string;
  email: string;
  phoneNumber: string;
  reviewComment?: string;
}

export interface StatusTimelineItem {
  label: string;
  date: string;
  status: "completed" | "current" | "pending";
}
