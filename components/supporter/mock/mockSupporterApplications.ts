import type { DocumentItem, InitiatorDocumentSet } from "@/components/initiator/types/initiator";
import type { LoanAssessmentFormValues } from "@/components/initiator/loan-assessment";
import type { SupporterApplicationDetail } from "../types/supporter";

const SAMPLE_PDF = "/assets/sample-document.pdf";

/**
 * Mock dataset standing in for a future `GET /applications/supporter/initiator-approved`
 * (list) and `GET /applications/:id/supporter` (detail) endpoint pair. Replace
 * `useSupporterApplications`/`useSupporterApplicationDetail` with real RTK Query hooks
 * once the backend module exists — component call signatures already match, following
 * the same pattern the Initiator module used before its backend landed.
 */
function buildMockDocuments(seed: string): InitiatorDocumentSet {
  const img = (n: number) => `/assets/${["image1.png", "image2.png", "checker.png", "mobile.png", "hero2.png"][n % 5]}`;

  const student: DocumentItem[] = [
    { id: `${seed}-stu-citizenship`, label: "Citizenship", fileType: "image", url: img(0), uploadedAt: "2026-06-20T08:10:00.000Z" },
    { id: `${seed}-stu-photo`, label: "Photo", fileType: "image", url: img(1), uploadedAt: "2026-06-20T08:11:00.000Z" },
    { id: `${seed}-stu-academic`, label: "Academic Certificates", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-20T08:15:00.000Z" },
    { id: `${seed}-stu-transcript`, label: "Transcript", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-20T08:16:00.000Z" },
  ];

  const parent: DocumentItem[] = [
    { id: `${seed}-par-citizenship`, label: "Citizenship", fileType: "image", url: img(2), uploadedAt: "2026-06-21T09:00:00.000Z" },
    { id: `${seed}-par-income`, label: "Income Proof", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-21T09:05:00.000Z" },
    { id: `${seed}-par-bank`, label: "Bank Statement", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-21T09:12:00.000Z" },
  ];

  const college: DocumentItem[] = [
    { id: `${seed}-col-offer`, label: "Offer Letter", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-23T11:08:00.000Z" },
    { id: `${seed}-col-enrollment`, label: "Enrollment Verification", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-24T09:00:00.000Z" },
  ];

  return { student, parent, college };
}

function buildMockLoanAssessment(overrides: {
  customerName: string;
  contactNumber: string;
  nationalId: string;
  loanAmount: number;
  courseName: string;
  collegeName: string;
  initiatorName: string;
  initiatorApprovedAt: string;
}): LoanAssessmentFormValues {
  return {
    applicantInfo: {
      customerName: overrides.customerName,
      relationshipStartDate: "2026-06-15",
      group: "Retail Education Loan",
      obligorNumber: 44710,
      permanentAddress: "Ward 10, Kathmandu Metropolitan City, Bagmati",
      correspondenceAddress: "Ward 10, Kathmandu Metropolitan City, Bagmati",
      contactNumber: overrides.contactNumber,
      profession: "Student",
      repaymentSource: "Parent's salary income + expected post-graduation earnings",
      citizenshipNumber: overrides.nationalId,
      citizenshipIssuedDate: "2019-03-10",
      citizenshipIssuedPlace: "Kathmandu",
      nationalId: overrides.nationalId,
      pan: "",
      license: "",
      bankingRelationship: "NEW",
      blacklistedStatus: "NOT_BLACKLISTED",
    },
    nrbReporting: {
      sectorClassification: "Education",
      productCode: "EDU-LN-01",
      loanType: "Term Loan",
      purposeOfLoan: "Tuition Fee Financing",
      securityType: "Personal Guarantee",
      interestRateType: "Floating",
      baseRate: 8.5,
      premium: 2,
      effectiveInterestRate: 10.5,
      creditRatingAgency: "Not Rated",
      creditRatingGrade: "",
      loanClassification: "Pass",
      provisioningPercentage: 1,
      restructured: "No",
      rescheduled: "No",
      insiderLending: "No",
      singleObligorLimitStatus: "Within Limit",
      regulatoryReportingRemarks: "Standard education loan, no regulatory flags identified.",
    },
    creditAssessment: {
      creditLimit: overrides.loanAmount,
      loanToValueRatio: 75,
      dsgir: 12,
      performanceYears: 4,
      bankingRelationshipScore: 8,
      parentsBorrowingsWithBfis: 350000,
      sourceOfIncome: 95,
      collegeOperations: 15,
    },
    applicantBackground: {
      familyMembers: [
        { name: "Father", age: 52, qualification: "Bachelor's", relationship: "Father", occupation: "Government Service" },
        { name: "Mother", age: 48, qualification: "Higher Secondary", relationship: "Mother", occupation: "Homemaker" },
      ],
      existingFacilities: [],
    },
    security: {
      securities: [{ securityDetails: "Fixed Deposit Receipt pledged by parent", fmv: 500000, proposedLoan: overrides.loanAmount }],
      guarantors: [
        {
          guarantorName: "Father (Personal Guarantor)",
          relationship: "Father",
          age: 52,
          netWorth: 2500000,
          consent: "Yes",
          ciclStatus: "Clear",
          ciclRemarks: "No adverse CICL record found.",
        },
      ],
    },
    insuranceRepayment: {
      insurances: [{ insuranceType: "Loan Protection Insurance", insurer: "NLIC", sumAssured: overrides.loanAmount, policyNumber: "NLIC-88213" }],
      repaymentCapacity: {
        monthlyIncome: 85000,
        existingObligations: 8000,
        proposedEmi: 18500,
      },
    },
    riskAssessment: {
      moneyLaunderingRisk: "Low risk — funds sourced from documented family income and salary certificates.",
      waiver: "No waiver requested.",
      bankingRelationshipRisk: "New-to-bank relationship; no adverse history found in CIC records.",
      keyCreditRiskMitigation: "Loan is secured against a personal guarantee and fixed deposit receipt; EMI-to-income ratio is within policy limits.",
    },
    recommendation: {
      termsAndConditions: "Standard education loan terms and conditions apply, disbursed in tranches against fee receipts.",
      justification: `Student has secured admission for ${overrides.courseName} at ${overrides.collegeName} with verified college enrollment. Repayment capacity assessed as adequate through parental income.`,
      accountStrategy: "Standard monitoring; annual academic progress review before each disbursement tranche.",
      disbursement: "Disbursed directly to the college account against fee structure and enrollment confirmation.",
      fundUtilization: "100% for tuition and academic fees as per the college fee structure.",
      conclusion: "Application meets underwriting criteria for education loan approval.",
      recommendation: "Recommended for approval subject to Support and Approver sign-off.",
    },
    approval: {
      initiator: {
        approverName: overrides.initiatorName,
        role: "INITIATOR",
        status: "APPROVED",
        approvedDate: overrides.initiatorApprovedAt,
        remarks: "All KYC documents verified and consistent. Recommending for Support review.",
        signature: overrides.initiatorName,
      },
      support: {
        approverName: "",
        role: "SUPPORT",
        status: "PENDING",
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
}

export const MOCK_SUPPORTER_APPLICATIONS: SupporterApplicationDetail[] = [
  {
    id: "spt-2001",
    applicationNumber: "GZL-2026-01042",
    studentName: "Aarav Sharma",
    collegeName: "Kathmandu University",
    loanAmount: 850000,
    program: "B.E. Computer Engineering",
    status: "APPROVED_BY_INITIATOR",
    initiatorApprovedAt: "2026-07-01T10:15:00.000Z",
    studentInfo: {
      fullName: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phoneNumber: "9841020304",
      identityName: "Aarav Sharma",
      identityType: "citizenship",
      identityNumber: "23-01-77-04521",
      dob: "2003-05-14",
      issuedDistrict: "Kathmandu",
      gender: "male",
      maritalStatus: "single",
      occupation: "student",
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu Metropolitan City",
      ward: "10",
      fatherName: "Ramesh Sharma",
      motherName: "Sunita Sharma",
      grandfatherName: "Krishna Sharma",
      courseName: "B.E. Computer Engineering",
      boardUniversity: "Kathmandu University",
      studyType: "program",
      courseDuration: "48 months",
      loanAmount: 850000,
      expectedSalary: 60000,
    },
    collegeVerification: {
      collegeName: "Kathmandu University",
      collegeEmail: "registrar@ku.edu.np",
      contactPerson: "Prof. Binod Aryal",
      contactPhone: "01-5000000",
      isApplicationVerified: true,
      verificationNotes: "Enrollment confirmed for current semester. No disciplinary holds.",
      offerLetterPublicUrl: "https://example.com/docs/offer-letter-1001.pdf",
      enrollmentDocPublicUrl: "https://example.com/docs/enrollment-1001.pdf",
    },
    documents: buildMockDocuments("spt-2001"),
    submittedAt: "2026-06-24T08:20:00.000Z",
    workflowStage: "Support Review",
    loanAssessment: buildMockLoanAssessment({
      customerName: "Aarav Sharma",
      contactNumber: "9841020304",
      nationalId: "23-01-77-04521",
      loanAmount: 850000,
      courseName: "B.E. Computer Engineering",
      collegeName: "Kathmandu University",
      initiatorName: "Rojina Shrestha",
      initiatorApprovedAt: "2026-07-01",
    }),
  },
  {
    id: "spt-2002",
    applicationNumber: "GZL-2026-01057",
    studentName: "Priya Koirala",
    collegeName: "Tribhuvan University",
    loanAmount: 420000,
    program: "BSc. Nursing",
    status: "APPROVED_BY_INITIATOR",
    initiatorApprovedAt: "2026-07-02T13:40:00.000Z",
    studentInfo: {
      fullName: "Priya Koirala",
      email: "priya.koirala@example.com",
      phoneNumber: "9812345678",
      identityName: "Priya Koirala",
      identityType: "passport",
      identityNumber: "PA0912233",
      dob: "2002-11-02",
      issuedDistrict: "Lalitpur",
      gender: "female",
      maritalStatus: "single",
      occupation: "student",
      province: "Bagmati",
      district: "Lalitpur",
      municipality: "Lalitpur Metropolitan City",
      ward: "5",
      fatherName: "Dinesh Koirala",
      motherName: "Kamala Koirala",
      grandfatherName: "Hari Koirala",
      courseName: "BSc. Nursing",
      boardUniversity: "Tribhuvan University",
      studyType: "program",
      courseDuration: "48 months",
      loanAmount: 420000,
      expectedSalary: 45000,
    },
    collegeVerification: {
      collegeName: "Tribhuvan University",
      collegeEmail: "admissions@tu.edu.np",
      contactPerson: "Ms. Sarita Bhandari",
      contactPhone: "01-4330433",
      isApplicationVerified: true,
      verificationNotes: "Fee dues cleared. Verified against academic records.",
      offerLetterPublicUrl: "https://example.com/docs/offer-letter-1002.pdf",
    },
    documents: buildMockDocuments("spt-2002"),
    submittedAt: "2026-06-25T09:20:00.000Z",
    workflowStage: "Support Review",
    loanAssessment: buildMockLoanAssessment({
      customerName: "Priya Koirala",
      contactNumber: "9812345678",
      nationalId: "PA0912233",
      loanAmount: 420000,
      courseName: "BSc. Nursing",
      collegeName: "Tribhuvan University",
      initiatorName: "Rojina Shrestha",
      initiatorApprovedAt: "2026-07-02",
    }),
  },
];

export function getMockSupporterApplications(): SupporterApplicationDetail[] {
  return MOCK_SUPPORTER_APPLICATIONS;
}

export function getMockSupporterApplicationById(id: string): SupporterApplicationDetail | undefined {
  return MOCK_SUPPORTER_APPLICATIONS.find((a) => a.id === id);
}
