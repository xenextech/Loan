import { baseApi } from "./baseApi";
import type { LoanApplication, SubmitApplicationResult } from "@/types/api";
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
  boardUniversity: data.boardUniversity,
  courseDuration: data.courseDuration, // backend stores as String
  loanAmount: data.loanAmount,
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
  dateOfBirth: data.dob || undefined, // omit empty string — @IsDateString fails on ""
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

    // Final submission — returns SUBMITTED application + parent/college magic links
    submitApplication: builder.mutation<
      SubmitApplicationResult,
      {
        id: string;
        informationAccurate: boolean;
        authorizeVerification: boolean;
        parentContactEmail?: string;
        collegeContactEmail?: string;
      }
    >({
      query: ({
        id,
        informationAccurate,
        authorizeVerification,
        parentContactEmail,
        collegeContactEmail,
      }) => ({
        url: `/applications/${id}/submit`,
        method: "POST",
        body: {
          informationAccurate,
          authorizeVerification,
          parentContactEmail,
          collegeContactEmail,
        },
      }),
      invalidatesTags: ["Application"],
    }),

    // Delete a DRAFT application
    deleteDraft: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/applications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Application"],
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
} = applicationApi;
