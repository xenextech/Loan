// Document Vault — expected shape once a real backend endpoint exists
// (see documentation for the suggested API contract). useDocumentVault()
// is the only place that needs to change when that endpoint ships; every
// component here consumes this type, not the mock data directly.

export const DOCUMENT_CATEGORIES = [
  "Offer Letter",
  "Acceptance Agreement",
  "Enrollment Certificate",
  "Admission Letter",
  "Tuition Fee Structure",
  "Student ID Letter",
  "Scholarship Letter",
  "Loan Agreement",
  "Sanction Letter",
  "Disbursement Letter",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type DocumentFileType = "PDF" | "IMAGE";

export type DocumentStatus = "AVAILABLE";

export interface DocumentVaultItem {
  id: string;
  documentName: string;
  category: DocumentCategory;
  uploadedBy: string;
  /** ISO 8601 timestamp. */
  uploadedAt: string;
  fileType: DocumentFileType;
  /** Human-readable, e.g. "1.2 MB" — mocked for now. */
  fileSize: string;
  downloadUrl: string | null;
  previewUrl: string | null;
  status: DocumentStatus;
}
