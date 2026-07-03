import { baseApi } from "./baseApi";
import type { CollegeVerifiedItem, InitiatorApplicationRecord, LoanApplication, PaginatedData } from "@/types/api";
import type { LoanAssessmentFormValues } from "@/components/initiator/loan-assessment/schema";
import type { InitiatorApplicationDetail, InitiatorApplicationListItem } from "@/components/initiator/types/initiator";
import { toInitiatorDetail, toInitiatorListItem } from "./transforms";

type ApplicantInfo = LoanAssessmentFormValues["applicantInfo"];

// ─── Request body builders ────────────────────────────────────────────────────
// Maps the frontend Step 1 "Applicant Information" fields onto the backend's
// `CreateInitiatorApplicationDto` / `UpdateInitiatorApplicationDto` field names.
// The two DTOs are identical for these fields except NID/PAN/License, which the
// create DTO names `nidNumber`/`panNumber`/`licenseNumber` and the update DTO
// names `nidNo`/`panNo`/`licenseNo` — kept as separate builders below so each
// request matches its DTO exactly (the backend rejects unknown properties).

const toObligorNo = (value?: string | number) => {
  if (value === undefined || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
};

// DateField stores plain "YYYY-MM-DD" (native <input type="date"> requires that
// exact format) — the backend's @IsDateString() wants a full ISO datetime string.
const toISODateTime = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const buildSharedInitiatorFields = (data: ApplicantInfo) => ({
  customerName: data.customerName || undefined,
  relationshipStartDate: toISODateTime(data.relationshipStartDate),
  customerGroup: data.group || undefined,
  obligorNumber: toObligorNo(data.obligorNumber),
  permanentAddress: data.permanentAddress || undefined,
  correspondenceAddress: data.correspondenceAddress || undefined,
  phoneNumber: data.contactNumber || undefined,
  profession: data.profession || undefined,
  repaymentSource: data.repaymentSource || undefined,
  citizenshipNumber: data.citizenshipNumber || undefined,
  citizenshipIssuedDate: toISODateTime(data.citizenshipIssuedDate),
  citizenshipIssuedPlace: data.citizenshipIssuedPlace || undefined,
  bankingRelationship: data.bankingRelationship || undefined,
  isBlacklisted: data.blacklistedStatus ? data.blacklistedStatus === "BLACKLISTED" : undefined,
});

const buildInitiatorCreateBody = (data: ApplicantInfo) => ({
  ...buildSharedInitiatorFields(data),
  nidNumber: data.nationalId || undefined,
  panNumber: data.pan || undefined,
  licenseNumber: data.license || undefined,
});

const buildInitiatorUpdateBody = (data: ApplicantInfo) => ({
  ...buildSharedInitiatorFields(data),
  nidNo: data.nationalId || undefined,
  panNo: data.pan || undefined,
  licenseNo: data.license || undefined,
});

// ─── API ──────────────────────────────────────────────────────────────────────

export const initiatorApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    // Step 1 "Next" — creates the initiator record for this application (POST).
    createInitiatorApplication: builder.mutation<LoanApplication, { applicationId: string; data: ApplicantInfo }>({
      query: ({ applicationId, data }) => ({
        url: `/applications/${applicationId}/initiator`,
        method: "POST",
        body: buildInitiatorCreateBody(data),
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [{ type: "Application", id: applicationId }],
    }),

    // Step 2+ "Update" — patches the same initiator record (PATCH).
    updateInitiatorApplication: builder.mutation<LoanApplication, { applicationId: string; data: ApplicantInfo }>({
      query: ({ applicationId, data }) => ({
        url: `/applications/${applicationId}/initiator`,
        method: "PATCH",
        body: buildInitiatorUpdateBody(data),
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [{ type: "Application", id: applicationId }],
    }),

    // Initiator dashboard list — applications the college has verified and that
    // are now awaiting initiator review (GET /applications/initiator/college-verified).
    getCollegeVerifiedApplications: builder.query<
      { paginated: PaginatedData<CollegeVerifiedItem>; items: InitiatorApplicationListItem[] },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/applications/initiator/college-verified", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<CollegeVerifiedItem>) => ({
        paginated: raw,
        items: (raw.data ?? []).map(toInitiatorListItem),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.paginated.data.map(({ applicationId }) => ({ type: "Application" as const, id: applicationId })),
              { type: "Application" as const, id: "initiator-college-verified-list" },
            ]
          : [{ type: "Application" as const, id: "initiator-college-verified-list" }],
    }),

    // Initiator review workspace — full application record for a single applicant
    // (GET /applications/:applicationId/initiator).
    getInitiatorApplicationDetail: builder.query<InitiatorApplicationDetail, string>({
      query: (applicationId) => `/applications/${applicationId}/initiator`,
      transformResponse: (raw: InitiatorApplicationRecord) => toInitiatorDetail(raw),
      providesTags: (_r, _e, applicationId) => [{ type: "Application", id: applicationId }],
    }),
  }),
});

export const {
  useCreateInitiatorApplicationMutation,
  useUpdateInitiatorApplicationMutation,
  useGetCollegeVerifiedApplicationsQuery,
  useGetInitiatorApplicationDetailQuery,
} = initiatorApi;
