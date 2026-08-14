import { baseApi } from "./baseApi";
import type {
  CollegeApplicationView,
  CollegeMyVerification,
  CollegeVerification,
  ParentApplicationView,
  ParentDocument,
  ParentVerification,
} from "@/types/api";

export type ParentIdentityDocumentType = "NID" | "PAN_ID";

// Every parent/college token endpoint accepts an optional confirmed
// recipient email — the backend validates it against the invitation
// (invitations created before this feature had no captured email and skip
// the check server-side, so passing it here is always safe).
const withEmail = (path: string, email?: string) =>
  email ? `${path}?email=${encodeURIComponent(email)}` : path;

export const collegeApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    // ── Parent token ──────────────────────────────────────────────────────────
    getApplicationByParentToken: builder.query<
      ParentApplicationView,
      { token: string; email?: string }
    >({
      query: ({ token, email }) => withEmail(`/parent/${token}`, email),
      providesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    submitParentProfile: builder.mutation<
      ParentVerification,
      {
        token: string;
        email?: string;
        name?: string;
        phone?: string;
        contact?: string;
        citizenshipNumber?: string;
        salaryBankName?: string;
        bankAccountNumber?: string;
      }
    >({
      query: ({ token, email, ...body }) => ({
        url: withEmail(`/parent/${token}/profile`, email),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    uploadParentSalarySheet: builder.mutation<
      ParentDocument[],
      { token: string; files: File[]; label?: string; email?: string }
    >({
      query: ({ token, files, label, email }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        if (label) formData.append("label", label);
        return {
          url: withEmail(`/parent/${token}/salary-sheet`, email),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    uploadParentIdentityDocument: builder.mutation<
      ParentDocument,
      {
        token: string;
        documentType: ParentIdentityDocumentType;
        file: File;
        label?: string;
        email?: string;
      }
    >({
      query: ({ token, documentType, file, label, email }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (label) formData.append("label", label);
        return {
          url: withEmail(`/parent/${token}/documents/${documentType}`, email),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    updateParentDocumentLabel: builder.mutation<
      ParentDocument,
      { token: string; documentId: string; label: string; email?: string }
    >({
      query: ({ token, documentId, label, email }) => ({
        url: withEmail(`/parent/${token}/documents/${documentId}/label`, email),
        method: "PATCH",
        body: { label },
      }),
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    // ── College authenticated (JWT required, COLLEGE role) ────────────────────
    getMyVerifications: builder.query<CollegeMyVerification[], void>({
      query: () => '/college/my-verifications',
      providesTags: [{ type: 'Application' as const, id: 'college-my-verifications' }],
    }),

    // ── College token ─────────────────────────────────────────────────────────
    getApplicationByCollegeToken: builder.query<
      CollegeApplicationView,
      { token: string; email?: string }
    >({
      query: ({ token, email }) => withEmail(`/college/${token}`, email),
      providesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),

    submitCollegeForm: builder.mutation<
      CollegeVerification,
      {
        token: string;
        email?: string;
        collegeName: string;
        collegeEmail: string;
        contactPerson: string;
        contactPhone?: string;
        isApplicationVerified: boolean;
        verificationNotes?: string;
      }
    >({
      query: ({ token, email, ...body }) => ({
        url: withEmail(`/college/${token}/form`, email),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),

    uploadOfferLetter: builder.mutation<
      CollegeVerification,
      { token: string; file: File; email?: string }
    >({
      query: ({ token, file, email }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: withEmail(`/college/${token}/offer-letter`, email),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),

    uploadEnrollmentDocs: builder.mutation<
      CollegeVerification,
      { token: string; file: File; email?: string }
    >({
      query: ({ token, file, email }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: withEmail(`/college/${token}/enrollment-docs`, email),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),
  }),
});

export const {
  useGetApplicationByParentTokenQuery,
  useSubmitParentProfileMutation,
  useUploadParentSalarySheetMutation,
  useUploadParentIdentityDocumentMutation,
  useUpdateParentDocumentLabelMutation,
  useGetMyVerificationsQuery,
  useGetApplicationByCollegeTokenQuery,
  useSubmitCollegeFormMutation,
  useUploadOfferLetterMutation,
  useUploadEnrollmentDocsMutation,
} = collegeApi;
