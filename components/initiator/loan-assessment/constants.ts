import type { Path } from "react-hook-form";
import type { StepDefinition, ApprovalRole } from "./types";
import type { LoanAssessmentFormValues } from "./schema";

export const CURRENT_USER_ROLE: ApprovalRole = "INITIATOR";
export const CURRENT_USER_NAME = "Rojina Shrestha";

export const STEPS: StepDefinition[] = [
  { id: 1, key: "applicant", title: "Applicant Information", shortLabel: "Applicant", description: "Core KYC and relationship details for the borrower." },
  { id: 2, key: "nrb", title: "NRB Reporting", shortLabel: "NRB", description: "Regulatory classification fields for NRB submission." },
  { id: 3, key: "credit", title: "Credit Assessment", shortLabel: "Credit", description: "Credit limit, LTV and the calculated risk score." },
  { id: 4, key: "background", title: "Applicant Background", shortLabel: "Background", description: "Family members and existing credit facilities." },
  { id: 5, key: "security", title: "Security & Guarantee", shortLabel: "Security", description: "Pledged securities and personal guarantors." },
  { id: 6, key: "insurance", title: "Insurance & Repayment", shortLabel: "Insurance", description: "Insurance cover and repayment capacity." },
  { id: 7, key: "risk", title: "Risk Assessment", shortLabel: "Risk", description: "AML/CFT, waivers and credit risk mitigation." },
  { id: 8, key: "recommendation", title: "Loan Recommendation", shortLabel: "Recommend", description: "Terms, strategy and the initiator's recommendation." },
  { id: 9, key: "approval", title: "Approval", shortLabel: "Approval", description: "Sequential sign-off across Initiator, Support and Approver." },
  { id: 10, key: "review", title: "Review & Submit", shortLabel: "Review", description: "Final review of the full assessment before submission." },
];

export const TOTAL_STEPS = STEPS.length;

/** Field paths validated with `form.trigger()` when the user clicks Next on each step. */
export const STEP_FIELD_PATHS: Record<number, Path<LoanAssessmentFormValues>[]> = {
  1: [
    "applicantInfo.customerName",
    "applicantInfo.relationshipStartDate",
    "applicantInfo.group",
    "applicantInfo.obligorNumber",
    "applicantInfo.permanentAddress",
    "applicantInfo.correspondenceAddress",
    "applicantInfo.contactNumber",
    "applicantInfo.profession",
    "applicantInfo.repaymentSource",
    "applicantInfo.citizenshipDetails",
    "applicantInfo.nationalId",
    "applicantInfo.pan",
    "applicantInfo.license",
    "applicantInfo.bankingRelationship",
    "applicantInfo.blacklistedStatus",
  ],
  2: ["nrbReporting"],
  3: ["creditAssessment"],
  4: ["applicantBackground"],
  5: ["security"],
  6: ["insuranceRepayment"],
  7: ["riskAssessment"],
  8: ["recommendation"],
  9: ["approval"],
  10: [],
};

export const DEFAULT_LOAN_ASSESSMENT_VALUES: LoanAssessmentFormValues = {
  applicantInfo: {
    customerName: "",
    relationshipStartDate: "",
    group: "",
    obligorNumber: "",
    permanentAddress: "",
    correspondenceAddress: "",
    contactNumber: "",
    profession: "",
    repaymentSource: "",
    citizenshipDetails: "",
    nationalId: "",
    pan: "",
    license: "",
    bankingRelationship: undefined,
    blacklistedStatus: undefined,
  },
  nrbReporting: {
    sectorClassification: "",
    productCode: "",
    loanType: "",
    purposeOfLoan: "",
    securityType: "",
    interestRateType: undefined,
    baseRate: undefined,
    premium: undefined,
    effectiveInterestRate: undefined,
    creditRatingAgency: "",
    creditRatingGrade: "",
    loanClassification: "",
    provisioningPercentage: undefined,
    restructured: undefined,
    rescheduled: undefined,
    insiderLending: undefined,
    singleObligorLimitStatus: "",
    regulatoryReportingRemarks: "",
  },
  creditAssessment: {
    creditLimit: undefined,
    loanToValueRatio: undefined,
    dsgir: undefined,
    performanceYears: undefined,
    bankingRelationshipScore: undefined,
  },
  applicantBackground: {
    familyMembers: [],
    existingFacilities: [],
  },
  security: {
    securities: [],
    guarantors: [],
  },
  insuranceRepayment: {
    insurances: [],
    repaymentCapacity: {
      monthlyIncome: undefined,
      existingObligations: undefined,
      proposedEmi: undefined,
    },
  },
  riskAssessment: {
    moneyLaunderingRisk: "",
    waiver: "",
    bankingRelationshipRisk: "",
    keyCreditRiskMitigation: "",
  },
  recommendation: {
    termsAndConditions: "",
    justification: "",
    accountStrategy: "",
    disbursement: "",
    fundUtilization: "",
    conclusion: "",
    recommendation: "",
  },
  approval: {
    initiator: {
      approverName: CURRENT_USER_NAME,
      role: "INITIATOR",
      status: "PENDING",
      approvedDate: "",
      remarks: "",
      signature: "",
    },
    support: {
      approverName: "",
      role: "SUPPORT",
      status: "WAITING",
      approvedDate: "",
      remarks: "",
      signature: "",
    },
    approver: {
      approverName: "",
      role: "APPROVER",
      status: "WAITING",
      approvedDate: "",
      remarks: "",
      signature: "",
    },
  },
};

export const DRAFT_STORAGE_PREFIX = "genz-loan-assessment-draft:";
