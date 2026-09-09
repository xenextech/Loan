import { baseApi } from "./baseApi";
import type { Document, DocumentType, IdentityType } from "@/types/api";

export const documentsApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === 'development',
  endpoints: (builder) => ({
    // Upload a document for an application (multipart/form-data).
    // identityType scopes IDENTITY_FRONT/IDENTITY_BACK/IDENTITY_DOCUMENT to
    // the specific identity type being uploaded for (citizenship, passport,
    // ...) — omit it only for the generic "upload a document" option with no
    // specific identity type. Ignored by the backend for every other
    // documentType.
    uploadDocument: builder.mutation<
      Document,
      {
        applicationId: string;
        documentType: DocumentType;
        identityType?: IdentityType;
        file: File;
      }
    >({
      query: ({ applicationId, documentType, identityType, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        const query = identityType ? `?identityType=${identityType}` : "";
        return {
          url: `/applications/${applicationId}/documents/${documentType}${query}`,
          method: "POST",
          body: formData,
          // Don't set Content-Type — browser sets it with boundary
          formData: true,
        };
      },
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: "Document", id: applicationId },
      ],
    }),

    // List all documents for an application
    getDocuments: builder.query<Document[], string>({
      query: (applicationId) => `/applications/${applicationId}/documents`,
      providesTags: (_r, _e, applicationId) => [
        { type: "Document", id: applicationId },
      ],
    }),

    // Delete a specific document
    deleteDocument: builder.mutation<
      { message: string },
      { applicationId: string; documentId: string }
    >({
      query: ({ applicationId, documentId }) => ({
        url: `/applications/${applicationId}/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: "Document", id: applicationId },
      ],
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
} = documentsApi;
