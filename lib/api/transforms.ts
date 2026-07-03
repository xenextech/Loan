// Mapping helpers between frontend form values and backend Prisma enum strings.

import type {
  StudyType,
  IdentityType,
  Gender,
  Occupation,
  MaritalStatus,
  FeeStructureMethod,
  LoanApplication,
  CollegeVerifiedItem,
  InitiatorApplicationRecord,
  Document as ApiDocument,
  DocumentType,
  CollegeVerification,
} from "@/types/api";
import { toNumber, toOptionalNumber } from "@/lib/formatters";
import type { Application, StudyType as FEStudyType } from "@/types/application";
import type {
  DocumentItem,
  InitiatorApplicationDetail,
  InitiatorApplicationListItem,
  InitiatorDocumentSet,
} from "@/components/initiator/types/initiator";

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

// ─── Initiator ─────────────────────────────────────────────────────────────────
// Backend college-verified / initiator responses → the Initiator dashboard's view models.

// Convert backend college-verified list row → Initiator dashboard table row.
export const toInitiatorListItem = (item: CollegeVerifiedItem): InitiatorApplicationListItem => ({
  id:                item.applicationId,
  applicationNumber: item.student.applicationNumber,
  studentName:       item.student.fullName ?? "—",
  collegeName:       item.collegeVerification.collegeName ?? "—",
  loanAmount:        toNumber(item.student.loanInformation?.loanAmount),
  program:           item.student.studyInformation?.courseName ?? "—",
  status:            "VERIFIED_BY_COLLEGE",
  collegeVerifiedAt: item.collegeVerification.submittedAt ?? "",
});

// Only these document types are uploaded by the student during the application itself.
const STUDENT_DOCUMENT_TYPES = new Set<DocumentType>([
  "APPLICANT_PHOTO",
  "IDENTITY_FRONT",
  "IDENTITY_BACK",
  "ACADEMIC_RECORD",
  "FEE_STRUCTURE",
  "STUDENT_APPLICATION",
]);
const COLLEGE_DOCUMENT_TYPES = new Set<DocumentType>(["OFFER_LETTER", "ENROLLMENT_DOCUMENT"]);

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  APPLICANT_PHOTO: "Photo",
  IDENTITY_FRONT: "Identity Document (Front)",
  IDENTITY_BACK: "Identity Document (Back)",
  ACADEMIC_RECORD: "Academic Records",
  FEE_STRUCTURE: "Fee Structure",
  STUDENT_APPLICATION: "Application Form",
  OFFER_LETTER: "Offer Letter",
  ENROLLMENT_DOCUMENT: "Enrollment Document",
};

const toDocumentItem = (doc: ApiDocument): DocumentItem => ({
  id: doc.id,
  label: DOCUMENT_LABELS[doc.documentType] ?? doc.documentType,
  fileType: doc.mimeType?.startsWith("image/") ? "image" : "pdf",
  url: doc.publicUrl,
  uploadedAt: doc.createdAt,
});

// Groups the flat `documents[]` relation by review tab, and folds in the college's
// offer-letter / enrollment-doc links when they were captured via the magic-link
// verification form rather than uploaded as a regular Document row.
const groupInitiatorDocuments = (
  documents: ApiDocument[] = [],
  parentSalarySheetUrl: string | undefined,
  parentSubmittedAt: string | undefined,
  collegeVerification: CollegeVerification | undefined,
): InitiatorDocumentSet => {
  const student = documents.filter((d) => STUDENT_DOCUMENT_TYPES.has(d.documentType)).map(toDocumentItem);
  const college = documents.filter((d) => COLLEGE_DOCUMENT_TYPES.has(d.documentType)).map(toDocumentItem);

  if (collegeVerification?.offerLetterPublicUrl && !documents.some((d) => d.documentType === "OFFER_LETTER")) {
    college.push({
      id: `${collegeVerification.id}-offer-letter`,
      label: "Offer Letter",
      fileType: "pdf",
      url: collegeVerification.offerLetterPublicUrl,
    });
  }
  if (collegeVerification?.enrollmentDocPublicUrl && !documents.some((d) => d.documentType === "ENROLLMENT_DOCUMENT")) {
    college.push({
      id: `${collegeVerification.id}-enrollment-doc`,
      label: "Enrollment Document",
      fileType: "pdf",
      url: collegeVerification.enrollmentDocPublicUrl,
    });
  }

  const parent: DocumentItem[] = parentSalarySheetUrl
    ? [{ id: "parent-salary-sheet", label: "Salary Sheet", fileType: "pdf", url: parentSalarySheetUrl, uploadedAt: parentSubmittedAt }]
    : [];

  return { student, parent, college };
};

// Convert the full backend initiator record (GET .../initiator) → the review workspace's view model.
export const toInitiatorDetail = (record: InitiatorApplicationRecord): InitiatorApplicationDetail => {
  const { collegeVerification, parentVerification, studyInformation, loanInformation } = record;

  return {
    id:                record.id,
    applicationNumber: record.applicationNumber,
    studentName:       record.fullName ?? "—",
    collegeName:       collegeVerification?.collegeName ?? "—",
    loanAmount:        toNumber(loanInformation?.loanAmount),
    program:           studyInformation?.courseName ?? "—",
    status:            "VERIFIED_BY_COLLEGE",
    collegeVerifiedAt: collegeVerification?.submittedAt ?? "",
    submittedAt:       record.submittedAt ?? record.createdAt,
    workflowStage:     "Initiator Review",
    studentInfo: {
      fullName:        record.fullName ?? "",
      email:           record.email ?? "",
      phoneNumber:     record.phoneNumber ?? "",
      identityName:    record.identityName,
      identityType:    record.identityType,
      identityNumber:  record.identityNumber,
      dob:             record.dateOfBirth,
      issuedDistrict:  record.issuedDistrict,
      gender:          record.gender,
      maritalStatus:   record.maritalStatus,
      occupation:      record.occupation,
      province:        record.province,
      district:        record.district,
      municipality:    record.municipality,
      ward:            record.ward,
      fatherName:      record.fatherName,
      motherName:      record.motherName,
      grandfatherName: record.grandfatherName,
      spouseName:      record.spouseName,
      courseName:      studyInformation?.courseName,
      boardUniversity: studyInformation?.boardUniversity,
      studyType:       studyInformation?.studyType,
      courseDuration:  studyInformation?.courseDuration,
      loanAmount:      toOptionalNumber(loanInformation?.loanAmount),
      expectedSalary:  toOptionalNumber(loanInformation?.expectedSalary),
    },
    collegeVerification: {
      collegeName:            collegeVerification?.collegeName,
      collegeEmail:           collegeVerification?.collegeEmail,
      contactPerson:          collegeVerification?.contactPerson,
      contactPhone:           collegeVerification?.contactPhone,
      isApplicationVerified:  collegeVerification?.isApplicationVerified ?? false,
      verificationNotes:      collegeVerification?.verificationNotes,
      offerLetterPublicUrl:   collegeVerification?.offerLetterPublicUrl,
      enrollmentDocPublicUrl: collegeVerification?.enrollmentDocPublicUrl,
    },
    documents: groupInitiatorDocuments(
      record.documents,
      parentVerification?.salarySheetPublicUrl,
      parentVerification?.submittedAt,
      collegeVerification,
    ),
  };
};
