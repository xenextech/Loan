import type { DocumentItem, InitiatorApplicationDetail, InitiatorDocumentSet } from "../types/initiator";

const SAMPLE_PDF = "/assets/sample-document.pdf";

/**
 * Builds a realistic-looking document set for the review workspace.
 * Images point at existing marketing assets purely as stand-ins so previews
 * render without any external network dependency; PDFs share one local
 * placeholder file. Swap for real signed upload URLs once storage exists.
 */
function buildMockDocuments(seed: string): InitiatorDocumentSet {
  const img = (n: number) => `/assets/${["image1.png", "image2.png", "checker.png", "mobile.png", "hero2.png"][n % 5]}`;

  const student: DocumentItem[] = [
    { id: `${seed}-stu-citizenship`, label: "Citizenship", fileType: "image", url: img(0), uploadedAt: "2026-06-24T08:10:00.000Z" },
    { id: `${seed}-stu-photo`, label: "Photo", fileType: "image", url: img(1), uploadedAt: "2026-06-24T08:11:00.000Z" },
    { id: `${seed}-stu-academic`, label: "Academic Certificates", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-24T08:15:00.000Z" },
    { id: `${seed}-stu-transcript`, label: "Transcript", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-24T08:16:00.000Z" },
    { id: `${seed}-stu-character`, label: "Character Certificate", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-24T08:18:00.000Z" },
  ];

  const parent: DocumentItem[] = [
    { id: `${seed}-par-citizenship`, label: "Citizenship", fileType: "image", url: img(2), uploadedAt: "2026-06-25T09:00:00.000Z" },
    { id: `${seed}-par-income`, label: "Income Proof", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-25T09:05:00.000Z" },
    { id: `${seed}-par-pan`, label: "PAN", fileType: "image", url: img(3), uploadedAt: "2026-06-25T09:08:00.000Z" },
    { id: `${seed}-par-bank`, label: "Bank Statement", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-25T09:12:00.000Z" },
    { id: `${seed}-par-salary`, label: "Salary Certificate", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-25T09:15:00.000Z" },
  ];

  const college: DocumentItem[] = [
    { id: `${seed}-col-admission`, label: "Admission Letter", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-27T11:00:00.000Z" },
    { id: `${seed}-col-fee`, label: "Fee Structure", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-27T11:05:00.000Z" },
    { id: `${seed}-col-offer`, label: "Offer Letter", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-27T11:08:00.000Z" },
    { id: `${seed}-col-enrollment`, label: "Enrollment Verification", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-28T09:00:00.000Z" },
    { id: `${seed}-col-verification-form`, label: "College Verification Form", fileType: "pdf", url: SAMPLE_PDF, uploadedAt: "2026-06-28T09:12:00.000Z" },
  ];

  return { student, parent, college };
}

/**
 * Mock dataset standing in for a future
 * `GET /initiator/applications?status=VERIFIED_BY_COLLEGE` endpoint.
 * Replace `useInitiatorApplications` / `useInitiatorApplicationDetail`
 * with real RTK Query hooks once the backend is implemented — the
 * component call signatures are already shaped to match.
 */
export const MOCK_INITIATOR_APPLICATIONS: InitiatorApplicationDetail[] = [
  {
    id: "app-1001",
    applicationNumber: "GZL-2026-01042",
    studentName: "Aarav Sharma",
    collegeName: "Kathmandu University",
    loanAmount: 850000,
    program: "B.E. Computer Engineering",
    status: "VERIFIED_BY_COLLEGE",
    collegeVerifiedAt: "2026-06-28T09:12:00.000Z",
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
    documents: buildMockDocuments("app-1001"),
    submittedAt: "2026-06-24T08:20:00.000Z",
    workflowStage: "Initiator Review",
  },
  {
    id: "app-1002",
    applicationNumber: "GZL-2026-01057",
    studentName: "Priya Koirala",
    collegeName: "Tribhuvan University",
    loanAmount: 420000,
    program: "BSc. Nursing",
    status: "VERIFIED_BY_COLLEGE",
    collegeVerifiedAt: "2026-06-29T13:45:00.000Z",
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
    documents: buildMockDocuments("app-1002"),
    submittedAt: "2026-06-25T09:20:00.000Z",
    workflowStage: "Initiator Review",
  },
  {
    id: "app-1003",
    applicationNumber: "GZL-2026-01063",
    studentName: "Bibek Thapa",
    collegeName: "Pokhara University",
    loanAmount: 1200000,
    program: "MBA",
    status: "VERIFIED_BY_COLLEGE",
    collegeVerifiedAt: "2026-06-30T06:30:00.000Z",
    studentInfo: {
      fullName: "Bibek Thapa",
      email: "bibek.thapa@example.com",
      phoneNumber: "9860112233",
      identityName: "Bibek Thapa",
      identityType: "citizenship",
      identityNumber: "27-01-70-01199",
      dob: "1998-02-20",
      issuedDistrict: "Kaski",
      gender: "male",
      maritalStatus: "married",
      occupation: "employed",
      province: "Gandaki",
      district: "Kaski",
      municipality: "Pokhara Metropolitan City",
      ward: "8",
      fatherName: "Suresh Thapa",
      motherName: "Gita Thapa",
      grandfatherName: "Bir Bahadur Thapa",
      spouseName: "Anita Thapa",
      courseName: "MBA",
      boardUniversity: "Pokhara University",
      studyType: "program",
      courseDuration: "24 months",
      loanAmount: 1200000,
      expectedSalary: 90000,
    },
    collegeVerification: {
      collegeName: "Pokhara University",
      collegeEmail: "verify@pu.edu.np",
      contactPerson: "Mr. Ramesh Gurung",
      contactPhone: "061-504000",
      isApplicationVerified: true,
      verificationNotes: "Working professional cohort — evening MBA program.",
      offerLetterPublicUrl: "https://example.com/docs/offer-letter-1003.pdf",
      enrollmentDocPublicUrl: "https://example.com/docs/enrollment-1003.pdf",
    },
    documents: buildMockDocuments("app-1003"),
    submittedAt: "2026-06-29T14:00:00.000Z",
    workflowStage: "Initiator Review",
  },
];

export function getMockInitiatorApplications(): InitiatorApplicationDetail[] {
  return MOCK_INITIATOR_APPLICATIONS;
}

export function getMockInitiatorApplicationById(
  id: string,
): InitiatorApplicationDetail | undefined {
  return MOCK_INITIATOR_APPLICATIONS.find((a) => a.id === id);
}
