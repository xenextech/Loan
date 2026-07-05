import { baseApi } from "./baseApi";
import type { CollegeVerifiedItem, InitiatorApplicationRecord, LoanApplication, PaginatedData } from "@/types/api";
import type { LoanAssessmentFormValues } from "@/components/initiator/loan-assessment/schema";
import type { InitiatorApplicationDetail, InitiatorApplicationListItem } from "@/components/initiator/types/initiator";
import { toInitiatorDetail, toInitiatorListItem } from "./transforms";

type ApplicantInfo = LoanAssessmentFormValues["applicantInfo"];

// ─── Shared value coercion ──────────────────────────────────────────────────────

const toNumber = (value?: string | number) => {
  if (value === undefined || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
};

// DateField/most date inputs store plain "YYYY-MM-DD" — the backend's
// @IsDateString()/@IsISO8601() decorators want a full ISO datetime string.
const toISODateTime = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const toBoolean = (value?: "Yes" | "No") => (value === undefined ? undefined : value === "Yes");

/** True if at least one own value is a non-empty, defined value — used to avoid
 *  sending an all-blank nested object that would otherwise upsert an empty row. */
const hasAnyValue = (obj: Record<string, unknown>) => Object.values(obj).some((v) => v !== undefined && v !== "");

// ─── Step 1 request body — CreateInitiatorApplicationDto ──────────────────────
// Basic Information only; matches both Create and Update DTOs field-for-field.

const buildInitiatorCreateBody = (data: ApplicantInfo) => ({
  customerName: data.customerName || undefined,
  relationshipStartDate: toISODateTime(data.relationshipStartDate),
  customerGroup: data.group || undefined,
  obligorNumber: toNumber(data.obligorNumber),
  permanentAddress: data.permanentAddress || undefined,
  correspondenceAddress: data.correspondenceAddress || undefined,
  phoneNumber: data.contactNumber || undefined,
  profession: data.profession || undefined,
  repaymentSource: data.repaymentSource || undefined,
  citizenshipNumber: data.citizenshipNumber || undefined,
  citizenshipIssuedDate: toISODateTime(data.citizenshipIssuedDate),
  citizenshipIssuedPlace: data.citizenshipIssuedPlace || undefined,
  nidNumber: data.nationalId || undefined,
  panNumber: data.pan || undefined,
  licenseNumber: data.license || undefined,
  bankingRelationship: data.bankingRelationship || undefined,
  isBlacklisted: data.blacklistedStatus ? data.blacklistedStatus === "BLACKLISTED" : undefined,
});

// ─── Full update body — UpdateInitiatorApplicationDto ──────────────────────────
// Built from the entire form state every time any step's "Update" is clicked (or
// on final submit), not just the current step's slice — this keeps every step in
// sync regardless of navigation order, and is safe because untouched fields stay
// `undefined` (never overwrite already-saved backend values with a blank default).

const buildInitiatorUpdateBody = (values: LoanAssessmentFormValues) => {
  const a = values.applicantInfo;
  const n = values.nrbReporting;
  const c = values.creditAssessment;
  const bg = values.applicantBackground;
  const s = values.security;
  const g = s.guarantor;
  const ir = values.insuranceRepayment;
  const ins = ir.insurance;
  const rc = ir.repaymentCapacity;
  const r = values.riskAssessment;
  const rec = values.recommendation;

  const familyMembers = (bg.familyMembers ?? [])
    .filter((m) => hasAnyValue(m))
    .map((m) => ({
      personName: m.personName || undefined,
      age: toNumber(m.age),
      qualification: m.qualification || undefined,
      relationshipWithBorrower: m.relationshipWithBorrower || undefined,
      occupationSocialInvolvement: m.occupationSocialInvolvement || undefined,
    }));

  const personalGuarantee = {
    nameOfGuarantor: g.nameOfGuarantor || undefined,
    relationship: g.relationship || undefined,
    age: toNumber(g.age),
    netWorth: toNumber(g.netWorth),
    guarantorConsent: toBoolean(g.guarantorConsent),
    ciclStatus: toBoolean(g.ciclStatus),
    ciclRemarks: g.ciclRemarks || undefined,
    blackListedDate: toISODateTime(g.blackListedDate),
    releasedDate: toISODateTime(g.releasedDate),
  };

  const repaymentCapacity = {
    insuredAssets: toNumber(rc.insuredAssets),
    valueOfAssets: toNumber(rc.valueOfAssets),
    sumOfInsurance: toNumber(rc.sumOfInsurance),
    insuranceCoverage: toNumber(rc.insuranceCoverage),
    insuranceRemarks: rc.insuranceRemarks || undefined,
  };

  return {
    // 1. Basic Information
    customerName: a.customerName || undefined,
    relationshipStartDate: toISODateTime(a.relationshipStartDate),
    customerGroup: a.group || undefined,
    obligorNumber: toNumber(a.obligorNumber),
    permanentAddress: a.permanentAddress || undefined,
    correspondenceAddress: a.correspondenceAddress || undefined,
    phoneNumber: a.contactNumber || undefined,
    profession: a.profession || undefined,
    repaymentSource: a.repaymentSource || undefined,
    citizenshipNumber: a.citizenshipNumber || undefined,
    citizenshipIssuedDate: toISODateTime(a.citizenshipIssuedDate),
    citizenshipIssuedPlace: a.citizenshipIssuedPlace || undefined,
    nidNumber: a.nationalId || undefined,
    panNumber: a.pan || undefined,
    licenseNumber: a.license || undefined,
    bankingRelationship: a.bankingRelationship || undefined,
    isBlacklisted: a.blacklistedStatus ? a.blacklistedStatus === "BLACKLISTED" : undefined,

    // 2. NRB Reporting
    baselClassification: n.baselClassification || undefined,
    baselRiskWeight: toNumber(n.baselRiskWeight),
    nrb93SectorCode: n.nrb93SectorCode || undefined,
    nrb93KaProductCode: n.nrb93KaProductCode || undefined,
    nrb94SecurityTypeCode: n.nrb94SecurityTypeCode || undefined,
    sis0IndustrialClassification: n.sis0IndustrialClassification || undefined,
    sis1ProductType: n.sis1ProductType || undefined,
    sis2Sector: n.sis2Sector || undefined,
    sis3Security: n.sis3Security || undefined,
    sis4InstitutionalGroupingOfBorrower: n.sis4InstitutionalGroupingOfBorrower || undefined,
    sis9PriorityLending: n.sis9PriorityLending || undefined,
    greenFinanceEconomicSector: n.greenFinanceEconomicSector || undefined,
    greenFinanceSubSector: n.greenFinanceSubSector || undefined,
    greenFinanceTaxonomyTag: n.greenFinanceTaxonomyTag || undefined,

    // 3. Credit Scoring
    creditLimit: toNumber(c.creditLimit),
    loanToValueRatio: toNumber(c.loanToValueRatio),
    dsgir: toNumber(c.dsgir),
    performanceYears: toNumber(c.performanceYears),
    bankingRelationshipScore: toNumber(c.bankingRelationshipScore),
    parentsBorrowingsWithBFIs: c.parentsBorrowingsWithBFIs || undefined,
    sourceOfIncomeScore: toNumber(c.sourceOfIncomeScore),
    operationOfInstitution: toNumber(c.operationOfInstitution),
    creditRiskScoring: c.creditRiskScoring || undefined,
    riskGrade: c.riskGrade || undefined,
    totalScore: toNumber(c.totalScore),
    totalPercentage: toNumber(c.totalPercentage),

    // 4. Applicant Background ("This facility" terms + family members)
    facility: bg.facility || undefined,
    purpose: bg.purpose || undefined,
    limit: toNumber(bg.limit),
    period: toNumber(bg.period),
    interestRate: toNumber(bg.interestRate),
    fee: toNumber(bg.fee),
    remarks: bg.remarks || undefined,
    ...(familyMembers.length > 0 && { familyMembers }),

    // 5. Security
    securityDetails: s.securityDetails || undefined,
    fmv: toNumber(s.fmv),
    proposedLoan: toNumber(s.proposedLoan),
    financeAgainstFmv: toNumber(s.financeAgainstFmv),

    // 6. Personal Guarantee — omit entirely when blank, to avoid upserting an empty row.
    ...(hasAnyValue(personalGuarantee) && { personalGuarantee }),

    // 7. Insurance — flat fields; the backend gates the upsert on these itself.
    insuredAssets: ins.insuredAssets || undefined,
    valueOfAssets: toNumber(ins.valueOfAssets),
    sumOfInsurance: toNumber(ins.sumOfInsurance),
    insuranceCoverage: toNumber(ins.insuranceCoverage),
    insuranceRemarks: ins.insuranceRemarks || undefined,

    // 8. Repayment Capacity — separate nested relation, omit entirely when blank.
    ...(hasAnyValue(repaymentCapacity) && { repaymentCapacity }),

    // 9-17. Risk / Recommendation
    amlRisk: r.amlRisk || undefined,
    waiver: r.waiver || undefined,
    bankingRelationshipRemarks: r.bankingRelationshipRemarks || undefined,
    keyCreditRiskMitigation: r.keyCreditRiskMitigation || undefined,
    termsAndConditions: rec.termsAndConditions || undefined,
    justificationOfLoan: rec.justificationOfLoan || undefined,
    accountStrategy: rec.accountStrategy || undefined,
    disbursementSection: rec.disbursementSection || undefined,
    utilizationOfFund: rec.utilizationOfFund || undefined,
    conclusionAndRecommendation: rec.conclusionAndRecommendation || undefined,
  };
};

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

    // Step 2+ "Update" — patches the same initiator record with the full
    // accumulated form state (PATCH), so every step's data stays in sync.
    updateInitiatorApplication: builder.mutation<LoanApplication, { applicationId: string; data: LoanAssessmentFormValues }>({
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
