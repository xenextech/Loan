import { baseApi } from "./baseApi";
import type { Document, DocumentType } from "@/types/api";

export const documentsApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === 'development',
  endpoints: (builder) => ({
    // Upload a document for an application (multipart/form-data)
    uploadDocument: builder.mutation<
      Document,
      { applicationId: string; documentType: DocumentType; file: File }
    >({
      query: ({ applicationId, documentType, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/applications/${applicationId}/documents/${documentType}`,
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
