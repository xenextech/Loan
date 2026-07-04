import type { AgreementRecord, DocumentCenterDetail, VaultDocument } from "./types";

/**
 * Standing in for a future document-center backend module (offer-letter QR verification,
 * document vault, agreement generation/e-sign) — none of that exists on the API yet. Swap
 * `useDocumentCenterDetail` for a real RTK Query hook once it does; the call signature
 * already matches.
 */

const VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: "doc-offer-letter",
    title: "Admission offer letter",
    subtitle: "AIM-OFFER-2081-082/0041 · Verified ✓ · 12 Jun 2026",
    tone: "success",
  },
  {
    id: "doc-loan-agreement",
    title: "Student loan agreement",
    subtitle: "Signed digitally · 24 Jun 2026",
    tone: "info",
  },
  {
    id: "doc-guarantor-agreement",
    title: "Parent guarantor agreement",
    subtitle: "Rajendra Rai · Signed · 24 Jun 2026",
    tone: "purple",
  },
  {
    id: "doc-college-mou",
    title: "College disbursement MOU",
    subtitle: "BFCL ↔ AIM · Active · KMC-NIC-MOU-2081-001",
    tone: "warning",
  },
];

const GENERATED_AGREEMENTS: AgreementRecord[] = [
  {
    id: "agr-1",
    docType: "Student agreement",
    forName: "Bikash Rai",
    generatedLabel: "24 Jun",
    signedLabel: "24 Jun",
    status: "Signed",
    actionLabel: "View",
  },
  {
    id: "agr-2",
    docType: "Parent guarantee",
    forName: "Rajendra Rai",
    generatedLabel: "24 Jun",
    signedLabel: "24 Jun",
    status: "Signed",
    actionLabel: "View",
  },
  {
    id: "agr-3",
    docType: "College MOU",
    forName: "AIM",
    generatedLabel: "01 Jun",
    signedLabel: "05 Jun",
    status: "Active",
    actionLabel: "View",
  },
  {
    id: "agr-4",
    docType: "Student agreement",
    forName: "Sunita Shrestha",
    generatedLabel: "26 Jun",
    signedLabel: "—",
    status: "Pending sign",
    actionLabel: "Remind",
  },
  {
    id: "agr-5",
    docType: "Parent guarantee",
    forName: "Ram Bahadur (Father)",
    generatedLabel: "26 Jun",
    signedLabel: "—",
    status: "Not signed",
    actionLabel: "Send OTP",
  },
];

export const MOCK_DOCUMENT_CENTER: DocumentCenterDetail = {
  id: "ln-20260624-093727",
  loanRef: "LN-20260624-093727",
  borrowerName: "Sharada Sah Godh",
  offerLetterVerification: {
    refNo: "AIM/OFFER/2081-082/0041",
    college: "Ace Institute of Management",
    program: "BBA (Pokhara University)",
    totalFeeLabel: "Rs 6,37,000",
    nrbPartner: "AIM-NRB-2081-003",
    studentName: "Bikash Rai",
    duration: "4 years · 8 semesters",
    validUntil: "Ashwin 15, 2081",
    status: "VALID",
  },
  vaultDocuments: VAULT_DOCUMENTS,
  loanReferenceOptions: [{ value: "ln-20260624-093727", label: "LN-20260624-093727 — Sharada Sah Godh" }],
  agreementTypeOptions: ["Student loan agreement", "Parent guarantee", "College MOU"],
  autoPopulated: {
    borrower: "Bikash Rai",
    interestRate: "9.5% p.a. floating",
    college: "Ace Institute of Management",
    disbursement: "Semester tranches to college A/C",
    loanAmount: "Rs 6,37,000",
    tenure: "8 semesters (4 years)",
    guarantor: "Rajendra Rai (Father)",
    platform: "Unnati Loan Pvt. Ltd.",
  },
  generatedAgreements: GENERATED_AGREEMENTS,
};

export function getMockDocumentCenter(): DocumentCenterDetail {
  return MOCK_DOCUMENT_CENTER;
}
