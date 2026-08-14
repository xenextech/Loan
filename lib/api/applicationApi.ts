import { baseApi } from "./baseApi";
import type {
  LoanApplication,
  SubmitApplicationResult,
  ApplicationTracker,
  StudentConsentRecord,
  VerificationStatusResponse,
  BankAccountOpening,
} from "@/types/api";
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
} from "@/lib/validations/schemas";
import {
  toStudyType,
  toIdentityType,
  toGender,
  toOccupation,
  toMaritalStatus,
  toFeeMethod,
} from "./transforms";

// ─── Request body builders ────────────────────────────────────────────────────

const buildStep1Body = (data: Step1FormData) => ({
  fullName: data.fullName,
  phoneNumber: data.phoneNumber,
  email: data.email,
  studyType: toStudyType(data.studyType),
  courseName: data.courseName,
  collegeName: data.collegeName,
  boardUniversity: data.boardUniversity,
  courseDuration: data.courseDuration, // backend stores as String
  loanAmount: data.loanAmount,
  // Only sent when the wizard was prefilled from the College Marketplace —
  // the backend re-derives courseName/collegeName/boardUniversity/
  // courseDuration from these ids server-side rather than trusting the text
  // above, so tampering with the free-text fields alone has no effect.
  collegeId: data.collegeId || undefined,
  courseId: data.courseId || undefined,
});

const buildStep2Body = (data: Step2FormData) => ({
  // "document" means the applicant uploaded a single ID document (IDENTITY_DOCUMENT)
  // instead of picking a specific type — backend has no matching enum value for it,
  // so identityType is left unset rather than sending an invalid string.
  identityType:
    data.identityType === "document"
      ? undefined
      : toIdentityType(data.identityType),
  identityNumber: data.identityNumber,
  identityName: data.identityName, // now accepted by backend
  dobAd: data.dob || undefined, // omit empty string — @IsDateString fails on ""
  dobBs: data.dobBs || undefined,
  issuedDistrict: data.issuedDistrict,
  issuedDate: data.issuedDate || undefined, // same
  gender: toGender(data.gender),
  occupation: toOccupation(data.occupation),
  province: data.province,
  district: data.district,
  municipality: data.municipality,
  ward: data.ward, // backend stores as String
});

const buildStep3Body = (data: Step3FormData) => ({
  fatherName: data.fatherName,
  motherName: data.motherName,
  grandfatherName: data.grandfatherName,
  maritalStatus: toMaritalStatus(data.maritalStatus),
  spouseName: data.spouseName || undefined,
  expectedSalary: parseFloat(data.expectedSalary) || 0,
  feeStructureMethod: toFeeMethod(data.feeStructureType),
  feeStructureUrl: data.feeWebsiteLink || undefined, // backend field name
  feeStructureText: data.feeManualAmount || undefined, // backend stores as String
});

// ─── API ──────────────────────────────────────────────────────────────────────

export const applicationApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    // Create a new draft application
    createDraft: builder.mutation<LoanApplication, void>({
      query: () => ({ url: "/applications", method: "POST" }),
      invalidatesTags: ["Application"],
    }),

    // List all applications for the current user
    getMyApplications: builder.query<LoanApplication[], void>({
      query: () => "/applications",
      transformResponse: (
        response: { data: LoanApplication[] } | LoanApplication[],
      ) =>
        Array.isArray(response)
          ? response
          : ((response as { data: LoanApplication[] }).data ?? []),
      providesTags: ["Application"],
    }),

    // Get a single application by ID
    getApplication: builder.query<LoanApplication, string>({
      query: (id) => `/applications/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Application", id }],
    }),

    // Save step 1 (personal + study info)
    saveStep1: builder.mutation<
      LoanApplication,
      { id: string; data: Step1FormData }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/step1`,
        method: "PATCH",
        body: buildStep1Body(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Application", id }],
    }),

    // Save step 2 (identity + address)
    saveStep2: builder.mutation<
      LoanApplication,
      { id: string; data: Step2FormData }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/step2`,
        method: "PATCH",
        body: buildStep2Body(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Application", id }],
    }),

    // Save step 3 (family + fee info)
    saveStep3: builder.mutation<
      LoanApplication,
      { id: string; data: Step3FormData }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/step3`,
        method: "PATCH",
        body: buildStep3Body(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Application", id }],
    }),

    // Final submission — declaration + status change only. Parent/college
    // verification invitations are sent independently (see below); the raw
    // token/link is never generated in the browser or returned here.
    submitApplication: builder.mutation<
      SubmitApplicationResult,
      {
        id: string;
        informationAccurate: boolean;
        authorizeVerification: boolean;
      }
    >({
      query: ({ id, informationAccurate, authorizeVerification }) => ({
        url: `/applications/${id}/submit`,
        method: "POST",
        body: { informationAccurate, authorizeVerification },
      }),
      invalidatesTags: ["Application"],
    }),

    // ── Parent/college verification invitations ────────────────────────────
    // Status never includes the raw token — only email, verification code,
    // status, and timestamps (see VerificationInvitation type).
    getVerificationStatus: builder.query<VerificationStatusResponse, string>({
      query: (id) => `/applications/${id}/verification`,
      providesTags: (_r, _e, id) => [
        { type: "Application" as const, id: `${id}-verification` },
      ],
    }),
    sendParentVerification: builder.mutation<
      VerificationStatusResponse["parent"],
      { id: string; email: string }
    >({
      query: ({ id, email }) => ({
        url: `/applications/${id}/verification/parent`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Application" as const, id: `${id}-verification` },
      ],
    }),
    resendParentVerification: builder.mutation<
      VerificationStatusResponse["parent"],
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/applications/${id}/verification/parent/resend`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Application" as const, id: `${id}-verification` },
      ],
    }),
    sendCollegeVerification: builder.mutation<
      VerificationStatusResponse["college"],
      { id: string; email: string }
    >({
      query: ({ id, email }) => ({
        url: `/applications/${id}/verification/college`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Application" as const, id: `${id}-verification` },
      ],
    }),
    resendCollegeVerification: builder.mutation<
      VerificationStatusResponse["college"],
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/applications/${id}/verification/college/resend`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Application" as const, id: `${id}-verification` },
      ],
    }),

    // Delete a DRAFT application
    deleteDraft: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/applications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Application"],
    }),

    // Student-facing lifecycle tracker: current stage, progress %, per-stage timeline
    getApplicationTracker: builder.query<ApplicationTracker, string>({
      query: (id) => `/applications/${id}/tracker`,
      providesTags: (_r, _e, id) => [{ type: "Application", id: `${id}-tracker` }],
    }),

    // Approver-authored terms & conditions, consented to from this same
    // logged-in session — null if the Approver hasn't sent any yet.
    getConsent: builder.query<StudentConsentRecord | null, string>({
      query: (id) => `/applications/${id}/consent`,
      providesTags: (_r, _e, id) => [{ type: "Application", id: `${id}-consent` }],
    }),
    acceptConsent: builder.mutation<StudentConsentRecord, string>({
      query: (id) => ({ url: `/applications/${id}/consent/accept`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Application", id: `${id}-consent` }],
    }),

    // Bank Account Opening — inserted after Parent + College verification,
    // before the application is eligible for the Initiator's queue. Null
    // until both of those are complete (nothing to show yet).
    getBankAccountOpening: builder.query<BankAccountOpening | null, string>({
      query: (id) => `/applications/${id}/bank-account`,
      providesTags: (_r, _e, id) => [{ type: "Application", id: `${id}-bank-account` }],
    }),
    completeBankAccountOpening: builder.mutation<BankAccountOpening, string>({
      query: (id) => ({ url: `/applications/${id}/bank-account/complete`, method: "POST" }),
      // Also invalidates the tracker tag — completing this step is what
      // makes the "Bank Account Opening" stage flip to COMPLETED there.
      invalidatesTags: (_r, _e, id) => [
        { type: "Application", id: `${id}-bank-account` },
        { type: "Application", id: `${id}-tracker` },
      ],
    }),
  }),
});

export const {
  useCreateDraftMutation,
  useGetMyApplicationsQuery,
  useGetApplicationQuery,
  useSaveStep1Mutation,
  useSaveStep2Mutation,
  useSaveStep3Mutation,
  useSubmitApplicationMutation,
  useDeleteDraftMutation,
  useGetApplicationTrackerQuery,
  useGetConsentQuery,
  useAcceptConsentMutation,
  useGetBankAccountOpeningQuery,
  useCompleteBankAccountOpeningMutation,
  useGetVerificationStatusQuery,
  useSendParentVerificationMutation,
  useResendParentVerificationMutation,
  useSendCollegeVerificationMutation,
  useResendCollegeVerificationMutation,
} = applicationApi;
