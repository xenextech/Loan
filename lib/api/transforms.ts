// Mapping helpers between frontend form values and backend Prisma enum strings.

import type {
  StudyType,
  IdentityType,
  Gender,
  Occupation,
  MaritalStatus,
  FeeStructureMethod,
  LoanApplication,
} from "@/types/api";
import { toNumber } from "@/lib/formatters";
import type { Application, StudyType as FEStudyType } from "@/types/application";

// ─── To-backend transforms ────────────────────────────────────────────────────

// Frontend: "program" | "course" | "diploma" | "certification"
// Backend:  "PROGRAM" | "COURSE" | "DIPLOMA" | "CERTIFICATION"
export const toStudyType = (v: string | undefined): StudyType =>
  ((v ?? "program").toUpperCase()) as StudyType;

// Frontend: "citizenship" | "passport" | "driving_license"
// Backend:  "CITIZENSHIP" | "PASSPORT" | "DRIVING_LICENSE"
export const toIdentityType = (v: string | undefined): IdentityType =>
  ((v ?? "citizenship").toUpperCase()) as IdentityType;

// Frontend: "male" | "female" | "other"
// Backend:  "MALE" | "FEMALE" | "OTHER"
export const toGender = (v: string | undefined): Gender =>
  ((v ?? "other").toUpperCase()) as Gender;

// Frontend: "student" | "employed" | "self_employed" | "unemployed"
// Backend:  "STUDENT" | "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED"
export const toOccupation = (v: string | undefined): Occupation =>
  ((v ?? "student").toUpperCase()) as Occupation;

// Frontend: "single" | "married" | "divorced" | "widowed"
// Backend:  "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED"
export const toMaritalStatus = (v: string | undefined): MaritalStatus =>
  ((v ?? "single").toUpperCase()) as MaritalStatus;

// Frontend: "upload" | "website" | "manual"
// Backend:  "DOCUMENT" | "LINK"   | "MANUAL"
export const toFeeMethod = (v: string): FeeStructureMethod => {
  const map: Record<string, FeeStructureMethod> = {
    upload: "DOCUMENT",
    website: "LINK",
    manual: "MANUAL",
  };
  return map[v] ?? "MANUAL";
};

// Parse "4 years" / "2 semesters" / "18" → months (number)
export const parseDurationMonths = (v: string): number => {
  const num = parseFloat(v);
  if (isNaN(num)) return 12;
  return num <= 8 ? Math.round(num * 12) : Math.round(num);
};

// ─── To-frontend transforms ───────────────────────────────────────────────────

const studyTypeBack: Record<StudyType, FEStudyType> = {
  PROGRAM:       "program",
  COURSE:        "course",
  DIPLOMA:       "diploma",
  CERTIFICATION: "certification",
};

// Convert backend LoanApplication → frontend Application (for existing UI components)
// Fields may be flat (step save responses) or nested inside studyInformation / loanInformation
// (list/detail responses that use Prisma include).
export const toFrontendApplication = (a: LoanApplication): Application => ({
  id:                a.id,
  applicationNumber: a.applicationNumber,
  status:            a.status.toLowerCase() as Application["status"],
  submittedAt:       a.submittedAt ?? a.createdAt,
  updatedAt:         a.updatedAt,
  loanAmount:        toNumber(a.loanInformation?.loanAmount ?? a.loanAmount),
  courseName:        a.studyInformation?.courseName ?? a.courseName ?? "",
  studyType:         studyTypeBack[a.studyInformation?.studyType ?? a.studyType ?? "PROGRAM"] ?? "program",
  fullName:          a.fullName ?? "",
  email:             a.email ?? "",
  phoneNumber:       a.phoneNumber ?? "",
});
