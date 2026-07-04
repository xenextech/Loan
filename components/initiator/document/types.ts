export type DocumentTone = "success" | "info" | "purple" | "warning";

export interface VaultDocument {
  id: string;
  title: string;
  subtitle: string;
  tone: DocumentTone;
}

export interface OfferLetterVerification {
  refNo: string;
  college: string;
  program: string;
  totalFeeLabel: string;
  nrbPartner: string;
  studentName: string;
  duration: string;
  validUntil: string;
  status: "VALID" | "INVALID" | "EXPIRED";
}

export type AgreementStatus = "Signed" | "Active" | "Pending sign" | "Not signed";

export interface AgreementRecord {
  id: string;
  docType: string;
  forName: string;
  generatedLabel: string;
  signedLabel: string;
  status: AgreementStatus;
  actionLabel: string;
}

export interface AgreementAutoPopulatedFields {
  borrower: string;
  interestRate: string;
  college: string;
  disbursement: string;
  loanAmount: string;
  tenure: string;
  guarantor: string;
  platform: string;
}

export interface DocumentCenterDetail {
  id: string;
  loanRef: string;
  borrowerName: string;
  offerLetterVerification: OfferLetterVerification;
  vaultDocuments: VaultDocument[];
  loanReferenceOptions: { value: string; label: string }[];
  agreementTypeOptions: string[];
  autoPopulated: AgreementAutoPopulatedFields;
  generatedAgreements: AgreementRecord[];
}
