import { z } from "zod";

// ─── Shared primitives ──────────────────────────────────────────────────────

/**
 * Numeric inputs stay as strings in RHF state while the user types; this schema
 * accepts either shape and transforms to a clean `number | undefined` on validate/submit.
 */
const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") return undefined;
    const num = typeof val === "number" ? val : Number(val);
    return Number.isNaN(num) ? undefined : num;
  });

const optionalText = (max = 500) => z.string().max(max).optional().or(z.literal(""));

// ─── Step 1 — Applicant Information ────────────────────────────────────────

export const BANKING_RELATIONSHIP_OPTIONS = [
  { value: "NEW", label: "New Relationship" },
  { value: "EXISTING", label: "Existing Relationship" },
] as const;

export const BLACKLISTED_STATUS_OPTIONS = [
  { value: "NOT_BLACKLISTED", label: "Not Blacklisted" },
  { value: "BLACKLISTED", label: "Blacklisted" },
] as const;

export const applicantInfoSchema = z
  .object({
    customerName: z.string().min(1, "Customer name is required").max(200),
    relationshipStartDate: optionalText(20),
    group: optionalText(120),
    obligorNumber: optionalNumber,
    permanentAddress: optionalText(300),
    correspondenceAddress: optionalText(300),
    contactNumber: z.string().min(1, "Contact number is required").max(20),
    profession: optionalText(120),
    repaymentSource: optionalText(200),
    citizenshipNumber: optionalText(60),
    citizenshipIssuedDate: optionalText(20),
    citizenshipIssuedPlace: optionalText(120),
    nationalId: z.string().min(1, "National ID is required").max(60),
    pan: optionalText(30),
    license: optionalText(60),
    bankingRelationship: z.enum(["NEW", "EXISTING"]).optional(),
    // Collected only when bankingRelationship is "EXISTING" — see the
    // superRefine below and Step1ApplicantInfo's conditional reveal.
    existingBankName: optionalText(120),
    existingBankAccountNumber: optionalText(60),
    existingBankSavingsAmount: optionalNumber,
    existingBankLoanAmount: optionalNumber,
    blacklistedStatus: z.enum(["NOT_BLACKLISTED", "BLACKLISTED"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.bankingRelationship !== "EXISTING") return;
    if (!data.existingBankName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingBankName"],
        message: "Required when Banking Relationship is Existing",
      });
    }
    if (!data.existingBankAccountNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingBankAccountNumber"],
        message: "Required when Banking Relationship is Existing",
      });
    }
    if (data.existingBankSavingsAmount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingBankSavingsAmount"],
        message: "Required when Banking Relationship is Existing",
      });
    }
    if (data.existingBankLoanAmount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingBankLoanAmount"],
        message: "Required when Banking Relationship is Existing",
      });
    }
  });

// ─── Step 2 — NRB Reporting ─────────────────────────────────────────────────
// Field names match the backend's actual regulatory codes exactly (Basel
// classification/risk weight, NRB Directive 9.3/9.4 codes, SIS classification).
// The *_OPTIONS lists below are the bank's current fixed coding for an
// education loan product; every field still validates as free text so the UI
// (SelectWithOtherField) can save a manually-overridden custom value too.

export const YES_NO_OPTIONS = ["Yes", "No"] as const;

export const BASEL_CLASSIFICATION_OPTIONS = [
  {
    value: "Regulatory Retail Portfolio (RRP)",
    label: "Regulatory Retail Portfolio (RRP) — credit limit up to NPR 25M",
    riskWeight: 75,
  },
  {
    value: "Claims on domestic corporate (Unrated)",
    label: "Claims on domestic corporate (Unrated) — credit limit above NPR 25M",
    riskWeight: 100,
  },
  { value: "Past due claims", label: "Past due claims — past due", riskWeight: 150 },
] as const;

export const NRB_93_SECTOR_CODE_OPTIONS = [{ value: "NF Education Loan", label: "NF — Education Loan" }] as const;

export const NRB_93_KA_PRODUCT_CODE_OPTIONS = [
  { value: "KB Education Loan", label: "KB — Education Loan" },
] as const;

export const NRB_94_SECURITY_TYPE_CODE_OPTIONS = [
  { value: "JC Personal Guarantee", label: "JC — Personal Guarantee" },
] as const;

export const SIS_1_PRODUCT_TYPE_OPTIONS = [
  { value: "A4 Long Term Loan – Others", label: "A4 — Long Term Loan – Others" },
] as const;

export const SIS_2_SECTOR_OPTIONS = [{ value: "PB Education Loan", label: "PB — Education Loan" }] as const;

export const SIS_3_SECURITY_OPTIONS = [
  { value: "EA Personal Guarantee", label: "EA — Personal Guarantee" },
] as const;

export const SIS_4_INSTITUTIONAL_GROUPING_OPTIONS = [
  { value: "FA (Male)", label: "FA — Male" },
  { value: "FB (Female)", label: "FB — Female" },
] as const;

export const nrbReportingSchema = z.object({
  baselClassification: optionalText(120),
  baselRiskWeight: optionalNumber,
  nrb93SectorCode: optionalText(60),
  nrb93KaProductCode: optionalText(60),
  nrb94SecurityTypeCode: optionalText(60),
  sis0IndustrialClassification: optionalText(60),
  sis1ProductType: optionalText(60),
  sis2Sector: optionalText(60),
  sis3Security: optionalText(60),
  sis4InstitutionalGroupingOfBorrower: optionalText(120),
  sis9PriorityLending: optionalText(60),
  greenFinanceEconomicSector: optionalText(120),
  greenFinanceSubSector: optionalText(120),
  greenFinanceTaxonomyTag: optionalText(60),
});

// ─── Step 3 — Credit Scoring ────────────────────────────────────────────────

// Matches backend ParentsBorrowingsWithBFIs exactly (credit-score.enum.ts) —
// scored categorically (see CREDIT_PARAMETERS.parentsBorrowingsWithBFIs), so
// any other string is silently treated as "no data" by CreditScoreService.
export const PARENTS_BORROWINGS_WITH_BFIS_OPTIONS = [
  { value: "US", label: "Borrowing from Us" },
  { value: "OTHER_BFI", label: "Borrowing from One Other BFI" },
  { value: "OTHER_BFIS", label: "Borrowing from Multiple Other BFIs" },
] as const;

// Matches backend RiskCategory exactly (creditScore/constant/credit-parameters.constant.ts) —
// the same categories the credit-scoring engine itself writes into this field
// after a score calculation; picking one here overrides that computed value.
export const CREDIT_RISK_SCORING_OPTIONS = [
  { value: "LOW_RISK", label: "Low" },
  { value: "MODERATE_RISK", label: "Moderate" },
  { value: "MEDIUM_RISK", label: "Medium" },
  { value: "MEDIUM_HIGH_RISK", label: "Medium-High" },
  { value: "UNGRADED", label: "Ungraded" },
] as const;

// Matches backend SourceOfIncome exactly (credit-score.enum.ts) — one of the
// six scoring parameters CREDIT_PARAMETERS actually weighs (weight 1); do not
// confuse with sourceOfIncomeScore below, which the scoring engine ignores.
export const SOURCE_OF_INCOME_OPTIONS = [
  { value: "FIXED", label: "Fixed Income" },
  { value: "SALARY_RENT_BUSINESS", label: "Salary / Rent / Business" },
  { value: "MIXED", label: "Mixed Income" },
] as const;

export const creditAssessmentSchema = z.object({
  // Always auto-populated from the application's requested loan amount
  // (LoanInformation.loanAmount) — see Step4CreditAssessment, which is the
  // only place that ever calls setValue on this field. Refined (not made a
  // plain required number) so the underlying type stays number | undefined,
  // matching every other numeric field here; undefined only happens if the
  // source loan amount itself failed to load, in which case this message
  // points at the real cause instead of "Required".
  creditLimit: optionalNumber.refine((val) => val !== undefined, {
    message: "Credit Limit could not be set — the application's requested loan amount is missing.",
  }),
  // Customer's assessed income — entered manually alongside Credit Limit,
  // unlike Credit Limit itself which always mirrors the requested loan amount.
  income: optionalNumber,
  loanToValueRatio: optionalNumber,
  dsgir: optionalNumber,
  performanceYears: optionalNumber,
  // Years of satisfactory performance with the institution — the actual
  // CREDIT_PARAMETERS.satisfactoryPerformance scoring input (weight 1).
  // Distinct from performanceYears above, which the scoring engine ignores.
  satisfactoryPerformance: optionalNumber,
  bankingRelationshipScore: optionalNumber,
  parentsBorrowingsWithBFIs: z.enum(["US", "OTHER_BFI", "OTHER_BFIS"]).optional().or(z.literal("")),
  sourceOfIncomeScore: optionalNumber,
  // The categorical CREDIT_PARAMETERS.sourceOfIncome scoring input (weight 1).
  // Distinct from sourceOfIncomeScore above, which the scoring engine ignores.
  sourceOfIncome: z.enum(["FIXED", "SALARY_RENT_BUSINESS", "MIXED"]).optional().or(z.literal("")),
  operationOfInstitution: optionalNumber,
  creditRiskScoring: z.enum(["LOW_RISK", "MODERATE_RISK", "MEDIUM_RISK", "MEDIUM_HIGH_RISK", "UNGRADED"]).optional().or(z.literal("")),
  riskGrade: optionalText(60),
  totalScore: optionalNumber,
  totalPercentage: optionalNumber,
});

// ─── Step 4 — Applicant Background ─────────────────────────────────────────

export const familyMemberSchema = z.object({
  personName: optionalText(120),
  age: optionalNumber,
  qualification: optionalText(120),
  relationshipWithBorrower: optionalText(80),
  occupationSocialInvolvement: optionalText(120),
});

// Matches backend FacilityStatus exactly (see schema.prisma's ExistingFacility model).
export const FACILITY_STATUS_OPTIONS = [
  { value: "PERFORMING", label: "Performing" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "NPA", label: "NPA" },
  { value: "CLOSED", label: "Closed" },
] as const;

export const existingFacilitySchema = z.object({
  facilityType: optionalText(120),
  bank: optionalText(120),
  sanctionedLimit: optionalNumber,
  outstanding: optionalNumber,
  status: z.enum(["PERFORMING", "OVERDUE", "NPA", "CLOSED"]).optional().or(z.literal("")),
});

export const applicantBackgroundSchema = z.object({
  familyMembers: z.array(familyMemberSchema),
  existingFacilities: z.array(existingFacilitySchema),
  // "This facility" — the credit facility being proposed under this application.
  facility: optionalText(120),
  purpose: optionalText(200),
  // Auto-populated from creditAssessment.creditLimit (the student's requested
  // loan amount) — see Step3ApplicantBackground. Editable to allow overrides.
  limit: optionalNumber,
  period: optionalNumber,
  interestRate: optionalNumber,
  // Auto-calculated as creditLimit × 1.25% — shown in NPR, editable.
  fee: optionalNumber,
  remarks: optionalText(1000),
});

// ─── Step 5 — Security & Personal Guarantee ────────────────────────────────
// The backend stores exactly one security and one personal guarantee per
// application (1:1 relations, not lists) — single-entry, not repeatable.

// guarantorConsent is labeled "Legal Obligation" in the UI (Step5SecurityGuarantee).
// When it's "Yes", the consent/obligated person's name and relationship become
// required — reusing the guarantor's own name/relationship fields rather than
// inventing new ones, since the backend's PersonalGuarantee model already
// captures exactly that person (no separate "obligated person" entity exists).
export const guarantorSchema = z
  .object({
    nameOfGuarantor: optionalText(120),
    relationship: optionalText(80),
    age: optionalNumber,
    netWorth: optionalNumber,
    guarantorConsent: z.enum(["Yes", "No"]).optional(),
    ciclStatus: z.enum(["Yes", "No"]).optional(),
    ciclRemarks: optionalText(300),
    blackListedDate: optionalText(20),
    releasedDate: optionalText(20),
  })
  .superRefine((data, ctx) => {
    if (data.guarantorConsent !== "Yes") return;
    if (!data.relationship?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["relationship"],
        message: "Required when Legal Obligation is Yes",
      });
    }
    if (!data.nameOfGuarantor?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nameOfGuarantor"],
        message: "Required when Legal Obligation is Yes",
      });
    }
  });

export const securitySchema = z.object({
  securityDetails: optionalText(300),
  fmv: optionalNumber,
  proposedLoan: optionalNumber,
  financeAgainstFmv: optionalNumber,
  guarantor: guarantorSchema,
});

// ─── Step 6 — Insurance & Repayment Capacity ───────────────────────────────
// The backend stores exactly one Insurance record and one (separate)
// RepaymentCapacity record per application — both single-entry.

export const insuranceSchema = z.object({
  insuredName: optionalText(300),
  insuranceCompanyName: optionalText(300),
  sumInsured: optionalNumber,
  maturityDate: optionalText(20),
  policyNo: optionalText(100),
});

export const repaymentCapacitySchema = z.object({
  insuredAssets: optionalNumber,
  valueOfAssets: optionalNumber,
  sumOfInsurance: optionalNumber,
  insuranceCoverage: optionalNumber,
  insuranceRemarks: optionalText(500),
});

export const insuranceRepaymentSchema = z.object({
  insurance: insuranceSchema,
  repaymentCapacity: repaymentCapacitySchema,
});

// ─── Step 7 — Risk Assessment ───────────────────────────────────────────────

export const riskAssessmentSchema = z.object({
  amlRisk: optionalText(2000),
  waiver: optionalText(2000),
  bankingRelationshipRemarks: optionalText(2000),
  keyCreditRiskMitigation: optionalText(2000),
});

// ─── Step 8 — Loan Recommendation ──────────────────────────────────────────

export const recommendationSchema = z.object({
  termsAndConditions: optionalText(3000),
  justificationOfLoan: optionalText(3000),
  accountStrategy: optionalText(3000),
  disbursementSection: optionalText(3000),
  utilizationOfFund: optionalText(3000),
  conclusionAndRecommendation: optionalText(3000),
});

// ─── Step 9 — Approval ──────────────────────────────────────────────────────
// Persisted via PATCH .../initiator's `approval` field — see
// ApplicationInitiatorService.buildApprovalUpdate() on the backend.

// Designation options are role-specific — each of the four approval-chain
// roles has its own fixed list of job titles it can sign off as.
export const INITIATOR_DESIGNATION_OPTIONS = [
  "ARO (Assistant Relationship Officer) - Initiator",
  "BM - Recommended by",
] as const;

export const SUPPORT_DESIGNATION_OPTIONS = [
  "CRAD",
  "Head CRAD",
  "Head Digital Banking and Transaction",
  "CNNMO",
] as const;

// CHECKER is the same seat as "Credit Manager" elsewhere in the app (see
// schema.prisma's LoanApplication comment — CREDIT_MANAGER reuses the
// checker* columns).
export const CHECKER_DESIGNATION_OPTIONS = ["Documentation", "Disbursement"] as const;

export const APPROVER_DESIGNATION_OPTIONS = [
  "Head Digital Banking and Transaction",
  "CNNMO",
  "CEO",
] as const;

export const approvalStatusSchema = z.enum([
  "PENDING",
  "WAITING",
  "UNDER_REVIEW",
  "FIELD_VERIFIED",
  "APPROVED",
  "REJECTED",
  "SENT_BACK",
]);

export const approvalEntrySchema = z.object({
  approverName: optionalText(120),
  role: z.enum(["INITIATOR", "SUPPORT", "CHECKER", "APPROVER"]),
  status: approvalStatusSchema,
  approvedDate: optionalText(20),
  remarks: optionalText(1000),
  signature: optionalText(120),
  designation: optionalText(60),
});

// Only the Initiator's card additionally collects a Branch Name — the other
// three roles use the plain approvalEntrySchema (which now includes designation).
export const initiatorApprovalEntrySchema = approvalEntrySchema.extend({
  branchName: optionalText(120),
});

export const approvalSchema = z.object({
  initiator: initiatorApprovalEntrySchema,
  support: approvalEntrySchema,
  checker: approvalEntrySchema,
  approver: approvalEntrySchema,
});

// ─── Full form schema ───────────────────────────────────────────────────────

export const loanAssessmentSchema = z.object({
  applicantInfo: applicantInfoSchema,
  nrbReporting: nrbReportingSchema,
  creditAssessment: creditAssessmentSchema,
  applicantBackground: applicantBackgroundSchema,
  security: securitySchema,
  insuranceRepayment: insuranceRepaymentSchema,
  riskAssessment: riskAssessmentSchema,
  recommendation: recommendationSchema,
  approval: approvalSchema,
});

/** The shape of the form while it's being edited — numeric fields may still be raw strings. */
export type LoanAssessmentFormValues = z.input<typeof loanAssessmentSchema>;
/** The clean, coerced shape produced once the full form validates on submit. */
export type LoanAssessmentSubmitValues = z.output<typeof loanAssessmentSchema>;

export type FamilyMember = z.input<typeof familyMemberSchema>;
export type ExistingFacility = z.input<typeof existingFacilitySchema>;
export type Guarantor = z.input<typeof guarantorSchema>;
