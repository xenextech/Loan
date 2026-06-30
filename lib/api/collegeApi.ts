import { baseApi } from "./baseApi";
import type {
  CollegeApplicationView,
  CollegeMyVerification,
  CollegeVerification,
  ParentApplicationView,
  ParentVerification,
} from "@/types/api";

export const collegeApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    // ── Parent token ──────────────────────────────────────────────────────────
    getApplicationByParentToken: builder.query<ParentApplicationView, string>({
      query: (token) => `/parent/${token}`,
      providesTags: (_r, _e, token) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    submitParentProfile: builder.mutation<
      ParentVerification,
      {
        token: string;
        name?: string;
        phone?: string;
        contact?: string;
        citizenshipNumber?: string;
        salaryBankName?: string;
        bankAccountNumber?: string;
      }
    >({
      query: ({ token, ...body }) => ({
        url: `/parent/${token}/profile`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    uploadParentSalarySheet: builder.mutation<ParentVerification, { token: string; file: File }>({
      query: ({ token, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: `/parent/${token}/salary-sheet`, method: "POST", body: formData };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `parent-${token}` }],
    }),

    // ── College authenticated (JWT required, COLLEGE role) ────────────────────
    getMyVerifications: builder.query<CollegeMyVerification[], void>({
      query: () => '/college/my-verifications',
      providesTags: [{ type: 'Application' as const, id: 'college-my-verifications' }],
    }),

    // ── College token ─────────────────────────────────────────────────────────
    getApplicationByCollegeToken: builder.query<CollegeApplicationView, string>({
      query: (token) => `/college/${token}`,
      providesTags: (_r, _e, token) => [{ type: "Application" as const, id: `college-${token}` }],
    }),

    submitCollegeForm: builder.mutation<
      CollegeVerification,
      {
        token: string;
        collegeName: string;
        collegeEmail: string;
        contactPerson: string;
        contactPhone?: string;
        isApplicationVerified: boolean;
        verificationNotes?: string;
      }
    >({
      query: ({ token, ...body }) => ({
        url: `/college/${token}/form`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),

    uploadOfferLetter: builder.mutation<CollegeVerification, { token: string; file: File }>({
      query: ({ token, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: `/college/${token}/offer-letter`, method: "POST", body: formData };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),

    uploadEnrollmentDocs: builder.mutation<CollegeVerification, { token: string; file: File }>({
      query: ({ token, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: `/college/${token}/enrollment-docs`, method: "POST", body: formData };
      },
      invalidatesTags: (_r, _e, { token }) => [{ type: "Application" as const, id: `college-${token}` }],
    }),
  }),
});

export const {
  useGetApplicationByParentTokenQuery,
  useSubmitParentProfileMutation,
  useUploadParentSalarySheetMutation,
  useGetMyVerificationsQuery,
  useGetApplicationByCollegeTokenQuery,
  useSubmitCollegeFormMutation,
  useUploadOfferLetterMutation,
  useUploadEnrollmentDocsMutation,
} = collegeApi;
