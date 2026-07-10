import { baseApi } from "./baseApi";
import type { DocumentCategory, DocumentVaultItem } from "@/components/student/document-vault/types";

// documentType values returned by GET /documents/vault — mirrors the
// backend's VaultDocumentType (see document-vault module). Extend
// CATEGORY_BY_TYPE below when the backend adds a new document type.
export type VaultDocumentType = "OFFER_LETTER" | "AGREEMENT" | "ENROLLMENT_CERTIFICATE";

export interface RawVaultDocument {
  id: string;
  documentType: VaultDocumentType;
  documentName: string;
  applicationId: string;
  applicationNumber: string | null;
  uploadedBy: string;
  generatedAt: string;
  fileType: "PDF";
  downloadUrl: string;
  previewUrl: string;
  status: "AVAILABLE";
}

// Full source-table record for the single-document viewer (GET
// /documents/vault/:documentType/:id) — field set differs per document
// type (offer letter has program/fee fields, agreement/enrollment have
// certification fields), so this stays loosely typed rather than modeling
// all three shapes; the viewer only reads well-known common fields.
export interface VaultDocumentDetail {
  documentType: VaultDocumentType;
  id: string;
  applicationId: string;
  collegeName: string;
  refNo: string;
  studentFullName: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const CATEGORY_BY_TYPE: Record<VaultDocumentType, DocumentCategory> = {
  OFFER_LETTER: "Offer Letter",
  AGREEMENT: "Bonafide Agreement",
  ENROLLMENT_CERTIFICATE: "Enrollment Certificate",
};

function mapVaultDocument(raw: RawVaultDocument): DocumentVaultItem {
  return {
    id: raw.id,
    documentName: raw.documentName,
    category: CATEGORY_BY_TYPE[raw.documentType],
    uploadedBy: raw.uploadedBy,
    uploadedAt: raw.generatedAt,
    fileType: raw.fileType,
    fileSize: "—",
    downloadUrl: raw.downloadUrl,
    previewUrl: raw.previewUrl,
    status: raw.status,
    applicationId: raw.applicationId,
    applicationNumber: raw.applicationNumber,
    documentType: raw.documentType,
  };
}

export const documentVaultApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    getDocumentVault: builder.query<DocumentVaultItem[], void>({
      query: () => "/documents/vault",
      transformResponse: (response: { documents: RawVaultDocument[] }) =>
        response.documents.map(mapVaultDocument),
      providesTags: ["DocumentVault"],
    }),

    getVaultDocument: builder.query<VaultDocumentDetail, { documentType: string; id: string }>({
      query: ({ documentType, id }) => `/documents/vault/${documentType}/${id}`,
      providesTags: (_r, _e, { documentType, id }) => [{ type: "DocumentVault", id: `${documentType}-${id}` }],
    }),
  }),
});

export const { useGetDocumentVaultQuery, useGetVaultDocumentQuery } = documentVaultApi;
