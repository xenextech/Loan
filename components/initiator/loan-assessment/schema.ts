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

export const applicantInfoSchema = z.object({
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
  blacklistedStatus: z.enum(["NOT_BLACKLISTED", "BLACKLISTED"]).optional(),
});

// ─── Step 2 — NRB Reporting ─────────────────────────────────────────────────

export const SECTOR_CLASSIFICATION_OPTIONS = [
  "Education",
  "Agriculture",
  "Consumer Loan",
  "Industry & Manufacturing",
  "Construction",
  "Service",
  "Wholesale & Retail Trade",
  "Others",
] as const;

export const LOAN_TYPE_OPTIONS = ["Term Loan", "Overdraft", "Working Capital", "Demand Loan"] as const;

export const PURPOSE_OF_LOAN_OPTIONS = [
  "Tuition Fee Financing",
  "Living Expense Financing",
  "Study Abroad Financing",
  "Skill Development",
  "Others",
] as const;

export const SECURITY_TYPE_OPTIONS = [
  "Fixed Deposit Receipt",
  "Land & Building",
  "Personal Guarantee",
  "Gold / Ornaments",
  "Government Bonds",
  "Others",
] as const;

export const INTEREST_RATE_TYPE_OPTIONS = ["Fixed", "Floating"] as const;

export const CREDIT_RATING_AGENCY_OPTIONS = [
  "ICRA Nepal",
  "CARE Ratings Nepal",
  "Not Rated",
] as const;

export const LOAN_CLASSIFICATION_OPTIONS = [
  "Pass",
  "Watchlist",
  "Substandard",
  "Doubtful",
  "Loss",
] as const;

export const YES_NO_OPTIONS = ["Yes", "No"] as const;

export const SINGLE_OBLIGOR_LIMIT_OPTIONS = ["Within Limit", "Exceeds Limit"] as const;

export const nrbReportingSchema = z.object({
  sectorClassification: optionalText(120),
  productCode: optionalText(60),
  loanType: optionalText(60),
  purposeOfLoan: optionalText(120),
  securityType: optionalText(120),
  interestRateType: z.enum(["Fixed", "Floating"]).optional(),
  baseRate: optionalNumber,
  premium: optionalNumber,
  effectiveInterestRate: optionalNumber,
  creditRatingAgency: optionalText(120),
  creditRatingGrade: optionalText(30),
  loanClassification: optionalText(60),
  provisioningPercentage: optionalNumber,
  restructured: z.enum(["Yes", "No"]).optional(),
  rescheduled: z.enum(["Yes", "No"]).optional(),
  insiderLending: z.enum(["Yes", "No"]).optional(),
  singleObligorLimitStatus: optionalText(60),
  regulatoryReportingRemarks: optionalText(1000),
});

// ─── Step 3 — Credit Assessment ────────────────────────────────────────────

export const creditAssessmentSchema = z.object({
  creditLimit: optionalNumber,
  loanToValueRatio: optionalNumber,
  dsgir: optionalNumber,
  performanceYears: optionalNumber,
  bankingRelationshipScore: optionalNumber,
  parentsBorrowingsWithBfis: optionalNumber,
  sourceOfIncome: optionalNumber,
  collegeOperations: optionalNumber,
});

// ─── Step 4 — Applicant Background ─────────────────────────────────────────

export const familyMemberSchema = z.object({
  name: optionalText(120),
  age: optionalNumber,
  qualification: optionalText(120),
  relationship: optionalText(80),
  occupation: optionalText(120),
});

export const existingFacilitySchema = z.object({
  facilityType: optionalText(120),
  bank: optionalText(120),
  sanctionedLimit: optionalNumber,
  outstanding: optionalNumber,
  status: optionalText(60),
});

export const applicantBackgroundSchema = z.object({
  familyMembers: z.array(familyMemberSchema),
  existingFacilities: z.array(existingFacilitySchema),
});

// ─── Step 5 — Security & Personal Guarantee ────────────────────────────────

export const securityItemSchema = z.object({
  securityDetails: optionalText(300),
  fmv: optionalNumber,
  proposedLoan: optionalNumber,
});

export const CICL_STATUS_OPTIONS = ["Clear", "Listed", "Under Review"] as const;

export const guarantorSchema = z.object({
  guarantorName: optionalText(120),
  relationship: optionalText(80),
  age: optionalNumber,
  netWorth: optionalNumber,
  consent: z.enum(["Yes", "No"]).optional(),
  ciclStatus: optionalText(60),
  ciclRemarks: optionalText(300),
  blacklistedDate: optionalText(20),
  releasedDate: optionalText(20),
});

export const securitySchema = z.object({
  securities: z.array(securityItemSchema),
  guarantors: z.array(guarantorSchema),
});

// ─── Step 6 — Insurance & Repayment Capacity ───────────────────────────────

export const insuranceItemSchema = z.object({
  insuranceType: optionalText(120),
  insurer: optionalText(120),
  sumAssured: optionalNumber,
  premiumAmount: optionalNumber,
  policyNumber: optionalText(60),
  expiryDate: optionalText(20),
});

export const repaymentCapacitySchema = z.object({
  monthlyIncome: optionalNumber,
  existingObligations: optionalNumber,
  proposedEmi: optionalNumber,
});

export const insuranceRepaymentSchema = z.object({
  insurances: z.array(insuranceItemSchema),
  repaymentCapacity: repaymentCapacitySchema,
});

// ─── Step 7 — Risk Assessment ───────────────────────────────────────────────

export const riskAssessmentSchema = z.object({
  moneyLaunderingRisk: optionalText(2000),
  waiver: optionalText(2000),
  bankingRelationshipRisk: optionalText(2000),
  keyCreditRiskMitigation: optionalText(2000),
});

// ─── Step 8 — Loan Recommendation ──────────────────────────────────────────

export const recommendationSchema = z.object({
  termsAndConditions: optionalText(3000),
  justification: optionalText(3000),
  accountStrategy: optionalText(3000),
  disbursement: optionalText(3000),
  fundUtilization: optionalText(3000),
  conclusion: optionalText(3000),
  recommendation: optionalText(3000),
});

// ─── Step 9 — Approval ──────────────────────────────────────────────────────

export const approvalStatusSchema = z.enum(["PENDING", "WAITING", "APPROVED", "REJECTED"]);

export const approvalEntrySchema = z.object({
  approverName: optionalText(120),
  role: z.enum(["INITIATOR", "SUPPORT", "APPROVER"]),
  status: approvalStatusSchema,
  approvedDate: optionalText(20),
  remarks: optionalText(1000),
  signature: optionalText(120),
});

export const approvalSchema = z.object({
  initiator: approvalEntrySchema,
  support: approvalEntrySchema,
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
export type SecurityItem = z.input<typeof securityItemSchema>;
export type Guarantor = z.input<typeof guarantorSchema>;
export type InsuranceItem = z.input<typeof insuranceItemSchema>;
