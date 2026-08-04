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
  InitiatorQueueItem,
  InitiatorApplicationRecord,
  Document as ApiDocument,
  DocumentType,
  CollegeVerification,
  ApprovalEntryStatus,
  ParentVerification,
  ParentDocument,
} from "@/types/api";
import { toNumber, toOptionalNumber } from "@/lib/formatters";
import type { Application, StudyType as FEStudyType } from "@/types/application";
import type {
  DocumentItem,
  InitiatorApplicationDetail,
  InitiatorApplicationListItem,
  InitiatorDocumentSet,
} from "@/components/initiator/types/initiator";
import {
  PARENTS_BORROWINGS_WITH_BFIS_OPTIONS,
  SOURCE_OF_INCOME_OPTIONS,
  CREDIT_RISK_SCORING_OPTIONS,
  FACILITY_STATUS_OPTIONS,
  type LoanAssessmentFormValues,
} from "@/components/initiator/loan-assessment/schema";

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

// Convert a queue row (college-verified OR Initiator-created) → Initiator dashboard
// table row. Unlike toInitiatorListItem, collegeVerification may be null here —
// Initiator-created applications never go through college verification.
export const toInitiatorQueueListItem = (item: InitiatorQueueItem): InitiatorApplicationListItem => ({
  id:                item.applicationId,
  applicationNumber: item.student.applicationNumber,
  studentName:       item.student.fullName ?? "—",
  collegeName:       item.collegeVerification?.collegeName ?? "—",
  loanAmount:        toNumber(item.student.loanInformation?.loanAmount),
  program:           item.student.studyInformation?.courseName ?? "—",
  status:            item.source === "INITIATOR" ? "INITIATOR_CREATED" : "VERIFIED_BY_COLLEGE",
  collegeVerifiedAt: item.collegeVerification?.submittedAt ?? "",
});

// Only these document types are uploaded by the student during the application itself.
const STUDENT_DOCUMENT_TYPES = new Set<DocumentType>([
  "APPLICANT_PHOTO",
  "IDENTITY_FRONT",
  "IDENTITY_BACK",
  "IDENTITY_DOCUMENT",
  "ACADEMIC_RECORD",
  "FEE_STRUCTURE",
  "STUDENT_APPLICATION",
]);
const COLLEGE_DOCUMENT_TYPES = new Set<DocumentType>(["OFFER_LETTER", "ENROLLMENT_DOCUMENT"]);

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  APPLICANT_PHOTO: "Photo",
  IDENTITY_FRONT: "Identity Document (Front)",
  IDENTITY_BACK: "Identity Document (Back)",
  IDENTITY_DOCUMENT: "Identity Document",
  ACADEMIC_RECORD: "Academic Records",
  FEE_STRUCTURE: "Fee Structure",
  STUDENT_APPLICATION: "Application Form",
  OFFER_LETTER: "Offer Letter",
  ENROLLMENT_DOCUMENT: "Enrollment Document",
};

const PARENT_DOCUMENT_LABELS: Record<ParentDocument["documentType"], string> = {
  NID: "National ID / Citizenship",
  PAN_ID: "PAN Card",
  SALARY_SHEET: "Salary Sheet",
};

const toDocumentItem = (doc: ApiDocument): DocumentItem => ({
  id: doc.id,
  label: DOCUMENT_LABELS[doc.documentType] ?? doc.documentType,
  fileType: doc.mimeType?.startsWith("image/") ? "image" : "pdf",
  url: doc.publicUrl,
  uploadedAt: doc.createdAt,
});

const toParentDocumentItem = (doc: ParentDocument): DocumentItem => ({
  id: doc.id,
  label: doc.label || PARENT_DOCUMENT_LABELS[doc.documentType] || doc.documentType,
  fileType: doc.mimeType?.startsWith("image/") ? "image" : "pdf",
  url: doc.publicUrl,
  uploadedAt: doc.uploadedAt,
});

// Groups the flat `documents[]` relation by review tab, and folds in the college's
// offer-letter / enrollment-doc links when they were captured via the magic-link
// verification form rather than uploaded as a regular Document row.
const groupInitiatorDocuments = (
  documents: ApiDocument[] = [],
  parentVerification: ParentVerification | undefined,
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

  // ParentDocument (NID/PAN/every labeled salary sheet) supersedes the legacy
  // single salarySheetPublicUrl — only fall back to it for older records that
  // predate ParentDocument and have no rows there.
  const parent: DocumentItem[] = parentVerification?.documents?.length
    ? parentVerification.documents.map(toParentDocumentItem)
    : parentVerification?.salarySheetPublicUrl
      ? [
          {
            id: "parent-salary-sheet",
            label: "Salary Sheet",
            fileType: "pdf",
            url: parentVerification.salarySheetPublicUrl,
            uploadedAt: parentVerification.submittedAt,
          },
        ]
      : [];

  return { student, parent, college };
};

// ─── Initiator assessment (Loan Assessment Form) ───────────────────────────────
// Maps the backend's flat/nested initiator fields onto the Loan Assessment Form's
// per-step shape, so reopening an application pre-fills previously-saved values
// instead of resetting to a blank form. Existing Facilities has no backend field
// yet and is intentionally omitted — it stays local-draft only.

// Exported so callers outside this module (e.g. VerificationFormPanel, which
// falls back to the student's own raw ISO-datetime fields for not-yet-filled
// initiator fields) can also feed a `type="date"` input the exact YYYY-MM-DD
// shape it requires — passing a full ISO datetime string leaves it blank.
export const toDateInputValue = (iso?: string | null): string => (iso ? iso.slice(0, 10) : "");

const toYesNo = (value?: boolean): "Yes" | "No" | undefined => (value === undefined ? undefined : value ? "Yes" : "No");

// Falls back to the same per-role default status constants.ts seeds the form
// with (PENDING for Initiator, WAITING for the rest) when the backend hasn't
// recorded one yet, so `status` stays required rather than `| undefined`.
const toApprovalStatus = (
  value: ApprovalEntryStatus | null | undefined,
  fallback: LoanAssessmentFormValues["approval"]["support"]["status"],
): LoanAssessmentFormValues["approval"]["support"]["status"] => value ?? fallback;

// Backend enforces this as a closed enum (@IsEnum(ParentsBorrowingsWithBFIs)), but the
// wire type is still `string` — narrow against the same option list the form's
// SelectField uses, rather than trusting the value or duplicating the enum here.
const PARENTS_BORROWINGS_WITH_BFIS_VALUES = new Set<string>(PARENTS_BORROWINGS_WITH_BFIS_OPTIONS.map((o) => o.value));
const toParentsBorrowingsWithBFIs = (value?: string | null): LoanAssessmentFormValues["creditAssessment"]["parentsBorrowingsWithBFIs"] =>
  value && PARENTS_BORROWINGS_WITH_BFIS_VALUES.has(value) ? (value as "US" | "OTHER_BFI" | "OTHER_BFIS") : "";

const SOURCE_OF_INCOME_VALUES = new Set<string>(SOURCE_OF_INCOME_OPTIONS.map((o) => o.value));
const toSourceOfIncome = (value?: string | null): LoanAssessmentFormValues["creditAssessment"]["sourceOfIncome"] =>
  value && SOURCE_OF_INCOME_VALUES.has(value) ? (value as "FIXED" | "SALARY_RENT_BUSINESS" | "MIXED") : "";

// Backend enforces this as a closed enum too (@IsEnum(RiskCategory)) — same
// narrowing as above. Also written by the credit-scoring engine itself
// (CreditScoreService), not just the Initiator's manual selection.
const CREDIT_RISK_SCORING_VALUES = new Set<string>(CREDIT_RISK_SCORING_OPTIONS.map((o) => o.value));
const toCreditRiskScoring = (value?: string | null): LoanAssessmentFormValues["creditAssessment"]["creditRiskScoring"] =>
  value && CREDIT_RISK_SCORING_VALUES.has(value)
    ? (value as "LOW_RISK" | "MODERATE_RISK" | "MEDIUM_RISK" | "MEDIUM_HIGH_RISK" | "UNGRADED")
    : "";

// Backend enforces this as a closed enum too (@IsEnum(FacilityStatus)).
const FACILITY_STATUS_VALUES = new Set<string>(FACILITY_STATUS_OPTIONS.map((o) => o.value));
const toFacilityStatus = (value?: string | null): LoanAssessmentFormValues["applicantBackground"]["existingFacilities"][number]["status"] =>
  value && FACILITY_STATUS_VALUES.has(value) ? (value as "PERFORMING" | "OVERDUE" | "NPA" | "CLOSED") : "";

// The Initiator's Family Members table starts empty, but the student already
// named their father/mother/grandfather back in the apply flow's Step 3 — pre-fill
// those names (relationship + name only) so the Initiator just adds age/qualification/
// occupation instead of re-typing names from scratch. Only applies when the Initiator
// hasn't saved any family members yet — once they have, their saved rows win.
const studentFamilyDefaults = (
  record: InitiatorApplicationRecord,
): LoanAssessmentFormValues["applicantBackground"]["familyMembers"] => {
  const defaults: LoanAssessmentFormValues["applicantBackground"]["familyMembers"] = [];
  const add = (personName: string | undefined, relationshipWithBorrower: string) => {
    if (!personName) return;
    defaults.push({ personName, age: undefined, qualification: "", relationshipWithBorrower, occupationSocialInvolvement: "" });
  };
  add(record.fatherName, "Father");
  add(record.motherName, "Mother");
  add(record.grandfatherName, "Grandfather");
  return defaults;
};

export const toAssessmentInitialValues = (record: InitiatorApplicationRecord): Partial<LoanAssessmentFormValues> => {
  const g = record.personalGuarantee;
  const ins = record.insurance;
  const rc = record.repaymentCapacity;
  // Only default relationship alongside the name fallback below — never once
  // the Initiator has saved a guarantee of their own.
  const guarantorIsFatherFallback = !g?.nameOfGuarantor && !!record.fatherName;

  return {
    applicantInfo: {
      customerName: record.customerName ?? "",
      relationshipStartDate: toDateInputValue(record.relationshipStartDate),
      group: record.customerGroup ?? "",
      obligorNumber: record.obligorNumber ?? "",
      // Falls back to the student's own structured address (apply flow's Step 2:
      // province/district/municipality/ward) until the Initiator saves a
      // permanent address of their own — same precedent as the guarantor name
      // fallback below.
      permanentAddress:
        record.permanentAddress ||
        [record.municipality, record.ward ? `Ward ${record.ward}` : undefined, record.district, record.province]
          .filter(Boolean)
          .join(", "),
      correspondenceAddress: record.correspondenceAddress ?? "",
      contactNumber: record.phoneNumber ?? "",
      profession: record.profession ?? "",
      repaymentSource: record.repaymentSource ?? "",
      citizenshipNumber: record.citizenshipNumber ?? "",
      citizenshipIssuedDate: toDateInputValue(record.citizenshipIssuedDate),
      citizenshipIssuedPlace: record.citizenshipIssuedPlace ?? "",
      nationalId: record.nidNumber ?? "",
      pan: record.panNumber ?? "",
      license: record.licenseNumber ?? "",
      bankingRelationship: record.bankingRelationship as LoanAssessmentFormValues["applicantInfo"]["bankingRelationship"],
      blacklistedStatus: record.isBlacklisted === undefined ? undefined : record.isBlacklisted ? "BLACKLISTED" : "NOT_BLACKLISTED",
    },
    nrbReporting: {
      baselClassification: record.baselClassification ?? "",
      baselRiskWeight: toOptionalNumber(record.baselRiskWeight),
      nrb93SectorCode: record.nrb93SectorCode ?? "",
      nrb93KaProductCode: record.nrb93KaProductCode ?? "",
      nrb94SecurityTypeCode: record.nrb94SecurityTypeCode ?? "",
      sis0IndustrialClassification: record.sis0IndustrialClassification ?? "",
      sis1ProductType: record.sis1ProductType ?? "",
      sis2Sector: record.sis2Sector ?? "",
      sis3Security: record.sis3Security ?? "",
      sis4InstitutionalGroupingOfBorrower: record.sis4InstitutionalGroupingOfBorrower ?? "",
      sis9PriorityLending: record.sis9PriorityLending ?? "",
      greenFinanceEconomicSector: record.greenFinanceEconomicSector ?? "",
      greenFinanceSubSector: record.greenFinanceSubSector ?? "",
      greenFinanceTaxonomyTag: record.greenFinanceTaxonomyTag ?? "",
    },
    creditAssessment: {
      creditLimit: toOptionalNumber(record.creditLimit),
      loanToValueRatio: toOptionalNumber(record.loanToValueRatio),
      dsgir: toOptionalNumber(record.dsgir),
      performanceYears: toOptionalNumber(record.performanceYears),
      satisfactoryPerformance: toOptionalNumber(record.satisfactoryPerformance),
      bankingRelationshipScore: toOptionalNumber(record.bankingRelationshipScore),
      parentsBorrowingsWithBFIs: toParentsBorrowingsWithBFIs(record.parentsBorrowingsWithBFIs),
      sourceOfIncomeScore: toOptionalNumber(record.sourceOfIncomeScore),
      sourceOfIncome: toSourceOfIncome(record.sourceOfIncome),
      operationOfInstitution: toOptionalNumber(record.operationOfInstitution),
      creditRiskScoring: toCreditRiskScoring(record.creditRiskScoring),
      riskGrade: record.riskGrade ?? "",
      totalScore: toOptionalNumber(record.totalScore),
      totalPercentage: toOptionalNumber(record.totalPercentage),
    },
    applicantBackground: {
      familyMembers: record.familyMember?.length
        ? record.familyMember.map((m) => ({
            personName: m.personName ?? "",
            age: m.age ?? undefined,
            qualification: m.qualification ?? "",
            relationshipWithBorrower: m.relationshipWithBorrower ?? "",
            occupationSocialInvolvement: m.occupationSocialInvolvement ?? "",
          }))
        : studentFamilyDefaults(record),
      existingFacilities: (record.existingFacility ?? []).map((f) => ({
        facilityType: f.facilityType ?? "",
        bank: f.bank ?? "",
        sanctionedLimit: f.sanctionedLimit ?? undefined,
        outstanding: f.outstanding ?? undefined,
        status: toFacilityStatus(f.status),
      })),
      facility: record.facility ?? "",
      purpose: record.purpose ?? "",
      limit: toOptionalNumber(record.limit),
      period: toOptionalNumber(record.period),
      interestRate: toOptionalNumber(record.interestRate),
      fee: toOptionalNumber(record.fee),
      remarks: record.remarks ?? "",
    },
    security: {
      securityDetails: record.securityDetails ?? "",
      fmv: toOptionalNumber(record.fmv),
      proposedLoan: toOptionalNumber(record.proposedLoan),
      financeAgainstFmv: toOptionalNumber(record.financeAgainstFmv),
      guarantor: {
        // Falls back to the student's father's name (from the apply flow's Step 3)
        // until the Initiator saves a personal guarantee of their own.
        nameOfGuarantor: g?.nameOfGuarantor || record.fatherName || "",
        relationship: g?.relationship || (guarantorIsFatherFallback ? "Father" : ""),
        age: g?.age ?? undefined,
        netWorth: toOptionalNumber(g?.netWorth),
        guarantorConsent: toYesNo(g?.guarantorConsent),
        ciclStatus: toYesNo(g?.ciclStatus),
        ciclRemarks: g?.ciclRemarks ?? "",
        blackListedDate: toDateInputValue(g?.blackListedDate),
        releasedDate: toDateInputValue(g?.releasedDate),
      },
    },
    insuranceRepayment: {
      insurance: {
        insuredName: ins?.insuredName ?? "",
        insuranceCompanyName: ins?.insuranceCompanyName ?? "",
        sumInsured: toOptionalNumber(ins?.sumInsured),
        maturityDate: toDateInputValue(ins?.maturityDate),
        policyNo: ins?.policyNo ?? "",
      },
      repaymentCapacity: {
        insuredAssets: toOptionalNumber(rc?.insuredAssets),
        valueOfAssets: toOptionalNumber(rc?.valueOfAssets),
        sumOfInsurance: toOptionalNumber(rc?.sumOfInsurance),
        insuranceCoverage: toOptionalNumber(rc?.insuranceCoverage),
        insuranceRemarks: rc?.insuranceRemarks ?? "",
      },
    },
    riskAssessment: {
      amlRisk: record.amlRisk ?? "",
      waiver: record.waiver ?? "",
      bankingRelationshipRemarks: record.bankingRelationshipRemarks ?? "",
      keyCreditRiskMitigation: record.keyCreditRiskMitigation ?? "",
    },
    recommendation: {
      termsAndConditions: record.termsAndConditions ?? "",
      justificationOfLoan: record.justificationOfLoan ?? "",
      accountStrategy: record.accountStrategy ?? "",
      disbursementSection: record.disbursementSection ?? "",
      utilizationOfFund: record.utilizationOfFund ?? "",
      conclusionAndRecommendation: record.conclusionAndRecommendation ?? "",
    },
    approval: {
      initiator: {
        approverName: record.initiatorName ?? "",
        role: "INITIATOR",
        status: toApprovalStatus(record.initiatorStatus, "PENDING"),
        approvedDate: toDateInputValue(record.initiatorDate),
        remarks: record.initiatorRemarks ?? "",
        signature: record.initiatorSignature ?? "",
        branchName: record.branch ?? "",
        designation: record.initiatorPost ?? "",
      },
      support: {
        approverName: record.supporterName ?? "",
        role: "SUPPORT",
        status: toApprovalStatus(record.supporterStatus, "WAITING"),
        approvedDate: toDateInputValue(record.supporterDate),
        remarks: record.supporterRemarks ?? "",
        signature: record.supporterSignature ?? "",
      },
      checker: {
        approverName: record.checkerName ?? "",
        role: "CHECKER",
        status: toApprovalStatus(record.checkerStatus, "WAITING"),
        approvedDate: toDateInputValue(record.checkerDate),
        remarks: record.checkerRemarks ?? "",
        signature: record.checkerSignature ?? "",
      },
      approver: {
        approverName: record.approverName ?? "",
        role: "APPROVER",
        status: toApprovalStatus(record.approverStatus, "WAITING"),
        approvedDate: toDateInputValue(record.approverDate),
        remarks: record.approverRemarks ?? "",
        signature: record.approverSignature ?? "",
      },
    },
  };
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
    status:            record.source === "INITIATOR" ? "INITIATOR_CREATED" : "VERIFIED_BY_COLLEGE",
    collegeVerifiedAt: collegeVerification?.submittedAt ?? "",
    submittedAt:       record.submittedAt ?? record.createdAt,
    workflowStage:     "Initiator Review",
    studentInfo: {
      fullName:        record.fullName ?? "",
      email:           record.email ?? "",
      phoneNumber:     record.phoneNumber ?? "",
      identityName:    record.identityName,
      identityType:    record.identityType ?? undefined,
      identityNumber:  record.identityNumber,
      dob:             record.dateOfBirth,
      issuedDistrict:  record.issuedDistrict,
      issuedDate:      record.issuedDate,
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
    parentVerification: parentVerification
      ? {
          name:                  parentVerification.name,
          phone:                 parentVerification.phone,
          contact:               parentVerification.contact,
          citizenshipNumber:     parentVerification.citizenshipNumber,
          salaryBankName:        parentVerification.salaryBankName,
          bankAccountNumber:     parentVerification.bankAccountNumber,
          salarySheetPublicUrl:  parentVerification.salarySheetPublicUrl,
          submittedAt:           parentVerification.submittedAt,
        }
      : null,
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
    documents: groupInitiatorDocuments(record.documents, parentVerification, collegeVerification),
    assessment: toAssessmentInitialValues(record),
    hasInitiatorInfo: Boolean(record.initiatorUserId),
  };
};
