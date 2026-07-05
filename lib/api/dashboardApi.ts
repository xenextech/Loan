import { baseApi } from "./baseApi";
import { toNumber, toOptionalNumber } from "@/lib/formatters";
import type { PaginatedData } from "@/types/api";
import type { InitiatorApplicationRecord } from "@/types/api";
import type {
  DashboardOverview,
  CheckerQueueRow,
  DashboardAlert,
  DashboardApplicationsQuery,
  DashboardApplicationRow,
  ApprovalSummary,
  CreditScoreResult,
  NrbChecklist,
  AuditLogRow,
  DisbursementPendingRow,
  DisbursementConditionRecord,
  ConfirmDisbursementBody,
  DisbursementTrancheRecord,
  EmiScheduleEntryRecord,
  RepaymentOverview,
  MarkEmiPaidBody,
  EmiNotificationTrigger,
  OverdueBucket,
  NotificationLogQuery,
  NotificationLogRow,
  NotificationTemplateRecord,
  CreateNotificationTemplateBody,
  UpdateNotificationTemplateBody,
  VerifyOfferLetterBody,
  VerifyOfferLetterResult,
  DocumentVaultQuery,
  DocumentVaultRow,
  GeneratedAgreementRecord,
  CreateGeneratedAgreementBody,
  InsuranceStats,
  InsurancePolicyRecord,
  CreateInsurancePolicyBody,
  CommissionSummary,
  CommissionPartnerBreakdownRow,
  NrbCapComplianceRow,
  CommissionPartnerRecord,
  CreateCommissionPartnerBody,
  UpdateCommissionPartnerBody,
  CommissionPartnerType,
  CommissionEntryRecord,
  CreateCommissionEntryBody,
  UpdateCommissionEntryBody,
  CommissionEntryStatus,
  AuditQuery,
  ManualAuditEntryBody,
} from "@/types/dashboard";

type Paged<Q> = (Q & { page?: number; limit?: number }) | void;

// ─── Decimal coercion ───────────────────────────────────────────────────────
// Prisma `Decimal` fields (creditLimit, EMI amounts, sumInsured, rateValue, ...)
// come back over the wire as decimal.js `{d,e,s}` objects, not plain numbers —
// `toNumber`/`toOptionalNumber` (lib/formatters.ts) already know how to unwrap
// that shape. Fields the backend already reduces with `Number()` server-side
// (e.g. commission summary totals) are left untouched.

const toNumOrNull = (v: unknown): number | null => (v === null || v === undefined ? null : toNumber(v));

const mapApplicationRow = (row: DashboardApplicationRow): DashboardApplicationRow => ({
  ...row,
  amount: toNumOrNull(row.amount),
  ltv: toNumOrNull(row.ltv),
});

const mapApplicationDetail = (record: InitiatorApplicationRecord): InitiatorApplicationRecord => ({
  ...record,
  obligorNumber: toOptionalNumber(record.obligorNumber),
  baselRiskWeight: toOptionalNumber(record.baselRiskWeight),
  creditLimit: toOptionalNumber(record.creditLimit),
  loanToValueRatio: toOptionalNumber(record.loanToValueRatio),
  dsgir: toOptionalNumber(record.dsgir),
  performanceYears: toOptionalNumber(record.performanceYears),
  bankingRelationshipScore: toOptionalNumber(record.bankingRelationshipScore),
  sourceOfIncomeScore: toOptionalNumber(record.sourceOfIncomeScore),
  operationOfInstitution: toOptionalNumber(record.operationOfInstitution),
  totalScore: toOptionalNumber(record.totalScore),
  totalPercentage: toOptionalNumber(record.totalPercentage),
  limit: toOptionalNumber(record.limit),
  period: toOptionalNumber(record.period),
  interestRate: toOptionalNumber(record.interestRate),
  fee: toOptionalNumber(record.fee),
  fmv: toOptionalNumber(record.fmv),
  proposedLoan: toOptionalNumber(record.proposedLoan),
  financeAgainstFmv: toOptionalNumber(record.financeAgainstFmv),
  loanInformation: record.loanInformation && {
    ...record.loanInformation,
    loanAmount: toOptionalNumber(record.loanInformation.loanAmount),
    expectedSalary: toOptionalNumber(record.loanInformation.expectedSalary),
  },
  personalGuarantee: record.personalGuarantee && {
    ...record.personalGuarantee,
    age: toOptionalNumber(record.personalGuarantee.age),
    netWorth: toOptionalNumber(record.personalGuarantee.netWorth),
  },
  insurance: record.insurance && {
    ...record.insurance,
    valueOfAssets: toOptionalNumber(record.insurance.valueOfAssets),
    sumOfInsurance: toOptionalNumber(record.insurance.sumOfInsurance),
    insuranceCoverage: toOptionalNumber(record.insurance.insuranceCoverage),
  },
  repaymentCapacity: record.repaymentCapacity && {
    ...record.repaymentCapacity,
    insuredAssets: toOptionalNumber(record.repaymentCapacity.insuredAssets),
    valueOfAssets: toOptionalNumber(record.repaymentCapacity.valueOfAssets),
    sumOfInsurance: toOptionalNumber(record.repaymentCapacity.sumOfInsurance),
    insuranceCoverage: toOptionalNumber(record.repaymentCapacity.insuranceCoverage),
  },
  familyMember: record.familyMember?.map((m) => ({ ...m, age: toOptionalNumber(m.age) })),
});

const mapEmiEntry = (e: EmiScheduleEntryRecord): EmiScheduleEntryRecord => ({
  ...e,
  emiAmount: toNumber(e.emiAmount),
  principalComponent: toNumber(e.principalComponent),
  interestComponent: toNumber(e.interestComponent),
  outstandingPrincipal: toNumber(e.outstandingPrincipal),
  paidAmount: toNumOrNull(e.paidAmount),
});

const mapPolicy = (p: InsurancePolicyRecord): InsurancePolicyRecord => ({
  ...p,
  sumInsured: toNumber(p.sumInsured),
  premiumAmount: toNumOrNull(p.premiumAmount),
});

const mapPartnerBreakdown = (row: CommissionPartnerBreakdownRow): CommissionPartnerBreakdownRow => ({
  ...row,
  rateValue: toNumber(row.rateValue),
  totalEarned: toNumber(row.totalEarned),
});

const mapPartner = (p: CommissionPartnerRecord): CommissionPartnerRecord => ({ ...p, rateValue: toNumber(p.rateValue) });

const mapCommissionEntry = (e: CommissionEntryRecord): CommissionEntryRecord => ({ ...e, amount: toNumber(e.amount) });

export const dashboardApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (builder) => ({
    // ─── 1. Overview ──────────────────────────────────────────────────────
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => "/dashboard/overview",
      transformResponse: (raw: DashboardOverview) => ({
        ...raw,
        portfolioTotal: toNumber(raw.portfolioTotal),
        overdueEmi: { ...raw.overdueEmi, amount: toNumber(raw.overdueEmi.amount) },
      }),
      providesTags: [{ type: "Dashboard", id: "overview" }],
    }),
    getCheckerQueue: builder.query<PaginatedData<CheckerQueueRow>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/overview/checker-queue", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<CheckerQueueRow>) => ({
        ...raw,
        data: raw.data.map((row) => ({
          ...row,
          loanInformation: row.loanInformation && { loanAmount: toNumOrNull(row.loanInformation.loanAmount) },
        })),
      }),
    }),
    getDashboardAlerts: builder.query<PaginatedData<DashboardAlert>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/overview/alerts", params: params ?? undefined }),
    }),

    // ─── 2. Applications ──────────────────────────────────────────────────
    getDashboardApplications: builder.query<PaginatedData<DashboardApplicationRow>, DashboardApplicationsQuery | void>({
      query: (params) => ({ url: "/dashboard/applications", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<DashboardApplicationRow>) => ({ ...raw, data: raw.data.map(mapApplicationRow) }),
      providesTags: (result) =>
        result
          ? [...result.data.map((row) => ({ type: "Dashboard" as const, id: row.id })), { type: "Dashboard" as const, id: "applications-list" }]
          : [{ type: "Dashboard" as const, id: "applications-list" }],
    }),
    getDashboardApplicationDetail: builder.query<InitiatorApplicationRecord, string>({
      query: (id) => `/dashboard/applications/${id}`,
      transformResponse: mapApplicationDetail,
      providesTags: (_r, _e, id) => [{ type: "Dashboard", id }],
    }),

    // ─── 3. Approval workflow ─────────────────────────────────────────────
    getApprovalSummary: builder.query<ApprovalSummary, string>({
      query: (applicationId) => `/dashboard/approval/${applicationId}/summary`,
      transformResponse: (raw: ApprovalSummary) => ({ ...raw, loanToValueRatio: toNumOrNull(raw.loanToValueRatio) }),
      providesTags: (_r, _e, applicationId) => [{ type: "Dashboard", id: `approval-summary-${applicationId}` }],
    }),
    getApprovalCreditScore: builder.query<CreditScoreResult, string>({
      query: (applicationId) => `/dashboard/approval/${applicationId}/credit-score`,
    }),
    getApprovalNrbChecklist: builder.query<NrbChecklist, string>({
      query: (applicationId) => `/dashboard/approval/${applicationId}/nrb-checklist`,
    }),
    getApprovalActivity: builder.query<PaginatedData<AuditLogRow>, { applicationId: string; page?: number; limit?: number }>({
      query: ({ applicationId, ...params }) => ({ url: `/dashboard/approval/${applicationId}/activity`, params }),
    }),

    // ─── 4. Disbursement ──────────────────────────────────────────────────
    getDisbursementPending: builder.query<PaginatedData<DisbursementPendingRow>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/disbursement/pending", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<DisbursementPendingRow>) => ({
        ...raw,
        data: raw.data.map((row) => ({ ...row, amount: toNumOrNull(row.amount) })),
      }),
      providesTags: [{ type: "Dashboard", id: "disbursement-pending" }],
    }),
    getDisbursementConditions: builder.query<DisbursementConditionRecord[], string>({
      query: (applicationId) => `/dashboard/disbursement/${applicationId}/conditions`,
      providesTags: (_r, _e, applicationId) => [{ type: "DisbursementCondition", id: applicationId }],
    }),
    addDisbursementCondition: builder.mutation<DisbursementConditionRecord, { applicationId: string; label: string }>({
      query: ({ applicationId, label }) => ({
        url: `/dashboard/disbursement/${applicationId}/conditions`,
        method: "POST",
        body: { label },
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [{ type: "DisbursementCondition", id: applicationId }],
    }),
    updateDisbursementCondition: builder.mutation<
      DisbursementConditionRecord,
      { applicationId: string; conditionId: string; status: string; remarks?: string }
    >({
      query: ({ applicationId, conditionId, ...body }) => ({
        url: `/dashboard/disbursement/${applicationId}/conditions/${conditionId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: "DisbursementCondition", id: applicationId },
        { type: "Dashboard", id: "disbursement-pending" },
      ],
    }),
    confirmDisbursement: builder.mutation<
      { disbursement: unknown; tranche: unknown },
      { applicationId: string; data: ConfirmDisbursementBody }
    >({
      query: ({ applicationId, data }) => ({
        url: `/dashboard/disbursement/${applicationId}/confirm`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: "Dashboard", id: "disbursement-pending" },
        { type: "Dashboard", id: "disbursement-history" },
        { type: "DisbursementCondition", id: applicationId },
      ],
    }),
    getDisbursementHistory: builder.query<PaginatedData<DisbursementTrancheRecord>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/disbursement/history", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<DisbursementTrancheRecord>) => ({
        ...raw,
        data: raw.data.map((t) => ({
          ...t,
          amount: toNumber(t.amount),
          commissionAmount: toNumOrNull(t.commissionAmount),
          disbursement: { ...t.disbursement, totalDisbursedAmount: toNumOrNull(t.disbursement.totalDisbursedAmount) },
        })),
      }),
      providesTags: [{ type: "Dashboard", id: "disbursement-history" }],
    }),

    // ─── 5. Repayment / EMI ───────────────────────────────────────────────
    generateEmiSchedule: builder.mutation<EmiScheduleEntryRecord[], string>({
      query: (applicationId) => ({ url: `/dashboard/repayment/${applicationId}/generate-schedule`, method: "POST" }),
      transformResponse: (raw: EmiScheduleEntryRecord[]) => raw.map(mapEmiEntry),
      invalidatesTags: (_r, _e, applicationId) => [{ type: "EmiSchedule", id: applicationId }],
    }),
    getEmiSchedule: builder.query<PaginatedData<EmiScheduleEntryRecord>, { applicationId: string; page?: number; limit?: number }>({
      query: ({ applicationId, ...params }) => ({ url: `/dashboard/repayment/${applicationId}/schedule`, params }),
      transformResponse: (raw: PaginatedData<EmiScheduleEntryRecord>) => ({ ...raw, data: raw.data.map(mapEmiEntry) }),
      providesTags: (_r, _e, { applicationId }) => [{ type: "EmiSchedule", id: applicationId }],
    }),
    getOverdueEmis: builder.query<PaginatedData<EmiScheduleEntryRecord>, Paged<{ bucket?: OverdueBucket }>>({
      query: (params) => ({ url: "/dashboard/repayment/overdue", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<EmiScheduleEntryRecord>) => ({ ...raw, data: raw.data.map(mapEmiEntry) }),
    }),
    getRepaymentOverview: builder.query<RepaymentOverview, void>({
      query: () => "/dashboard/repayment/overview",
      transformResponse: (raw: RepaymentOverview) => ({
        dueToday: { ...raw.dueToday, amount: toNumber(raw.dueToday.amount) },
        overdue1to30: { ...raw.overdue1to30, amount: toNumber(raw.overdue1to30.amount) },
        overdue31to90: { ...raw.overdue31to90, amount: toNumber(raw.overdue31to90.amount) },
        collectionEfficiency: raw.collectionEfficiency,
      }),
    }),
    markEmiPaid: builder.mutation<EmiScheduleEntryRecord, { entryId: string; applicationId: string; data: MarkEmiPaidBody }>({
      query: ({ entryId, data }) => ({ url: `/dashboard/repayment/schedule/${entryId}/mark-paid`, method: "PATCH", body: data }),
      transformResponse: mapEmiEntry,
      invalidatesTags: (_r, _e, { applicationId }) => [{ type: "EmiSchedule", id: applicationId }],
    }),
    getEmiNotificationTriggers: builder.query<EmiNotificationTrigger[], void>({
      query: () => "/dashboard/repayment/notification-triggers",
    }),

    // ─── 6. Notifications ─────────────────────────────────────────────────
    getNotificationLog: builder.query<PaginatedData<NotificationLogRow>, NotificationLogQuery | void>({
      query: (params) => ({ url: "/dashboard/notifications/log", params: params ?? undefined }),
    }),
    getNotificationTemplates: builder.query<PaginatedData<NotificationTemplateRecord>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/notifications/templates", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.data.map((t) => ({ type: "NotificationTemplate" as const, id: t.id })), { type: "NotificationTemplate" as const, id: "LIST" }]
          : [{ type: "NotificationTemplate" as const, id: "LIST" }],
    }),
    createNotificationTemplate: builder.mutation<NotificationTemplateRecord, CreateNotificationTemplateBody>({
      query: (body) => ({ url: "/dashboard/notifications/templates", method: "POST", body }),
      invalidatesTags: [{ type: "NotificationTemplate", id: "LIST" }],
    }),
    updateNotificationTemplate: builder.mutation<NotificationTemplateRecord, { id: string; data: UpdateNotificationTemplateBody }>({
      query: ({ id, data }) => ({ url: `/dashboard/notifications/templates/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "NotificationTemplate", id }, { type: "NotificationTemplate", id: "LIST" }],
    }),
    deleteNotificationTemplate: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/dashboard/notifications/templates/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "NotificationTemplate", id: "LIST" }],
    }),

    // ─── 7. Document center ───────────────────────────────────────────────
    verifyOfferLetter: builder.mutation<VerifyOfferLetterResult, VerifyOfferLetterBody>({
      query: (body) => ({ url: "/dashboard/documents/offer-letter/verify", method: "POST", body }),
    }),
    getDocumentVault: builder.query<PaginatedData<DocumentVaultRow>, DocumentVaultQuery | void>({
      query: (params) => ({ url: "/dashboard/documents/vault", params: params ?? undefined }),
    }),
    getGeneratedAgreements: builder.query<PaginatedData<GeneratedAgreementRecord>, Paged<{ applicationId?: string }>>({
      query: (params) => ({ url: "/dashboard/documents/agreements", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.data.map((a) => ({ type: "GeneratedAgreement" as const, id: a.id })), { type: "GeneratedAgreement" as const, id: "LIST" }]
          : [{ type: "GeneratedAgreement" as const, id: "LIST" }],
    }),
    createGeneratedAgreement: builder.mutation<GeneratedAgreementRecord, CreateGeneratedAgreementBody>({
      query: (body) => ({ url: "/dashboard/documents/agreements", method: "POST", body }),
      invalidatesTags: [{ type: "GeneratedAgreement", id: "LIST" }],
    }),
    sendAgreementToSign: builder.mutation<GeneratedAgreementRecord, string>({
      query: (id) => ({ url: `/dashboard/documents/agreements/${id}/send-to-sign`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "GeneratedAgreement", id }, { type: "GeneratedAgreement", id: "LIST" }],
    }),
    markAgreementSigned: builder.mutation<GeneratedAgreementRecord, string>({
      query: (id) => ({ url: `/dashboard/documents/agreements/${id}/mark-signed`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => [{ type: "GeneratedAgreement", id }, { type: "GeneratedAgreement", id: "LIST" }],
    }),

    // ─── 8. Insurance tracker ─────────────────────────────────────────────
    getInsuranceStats: builder.query<InsuranceStats, void>({
      query: () => "/dashboard/insurance/stats",
      providesTags: [{ type: "InsurancePolicy", id: "STATS" }],
    }),
    getInsurancePolicies: builder.query<PaginatedData<InsurancePolicyRecord>, Paged<{ applicationId?: string }>>({
      query: (params) => ({ url: "/dashboard/insurance/policies", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<InsurancePolicyRecord>) => ({ ...raw, data: raw.data.map(mapPolicy) }),
      providesTags: (result) =>
        result
          ? [...result.data.map((p) => ({ type: "InsurancePolicy" as const, id: p.id })), { type: "InsurancePolicy" as const, id: "LIST" }]
          : [{ type: "InsurancePolicy" as const, id: "LIST" }],
    }),
    createInsurancePolicy: builder.mutation<InsurancePolicyRecord, CreateInsurancePolicyBody>({
      query: (body) => ({ url: "/dashboard/insurance/policies", method: "POST", body }),
      transformResponse: mapPolicy,
      invalidatesTags: [{ type: "InsurancePolicy", id: "LIST" }, { type: "InsurancePolicy", id: "STATS" }],
    }),
    getInsurancePolicyDetail: builder.query<InsurancePolicyRecord, string>({
      query: (id) => `/dashboard/insurance/policies/${id}`,
      transformResponse: mapPolicy,
      providesTags: (_r, _e, id) => [{ type: "InsurancePolicy", id }],
    }),

    // ─── 9. Commission ────────────────────────────────────────────────────
    getCommissionSummary: builder.query<CommissionSummary, void>({
      query: () => "/dashboard/commission/summary",
      providesTags: [{ type: "Dashboard", id: "commission-summary" }],
    }),
    getCommissionByBank: builder.query<PaginatedData<CommissionPartnerBreakdownRow>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/commission/by-bank", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<CommissionPartnerBreakdownRow>) => ({ ...raw, data: raw.data.map(mapPartnerBreakdown) }),
      providesTags: [{ type: "Dashboard", id: "commission-by-bank" }],
    }),
    getCommissionByCollege: builder.query<PaginatedData<CommissionPartnerBreakdownRow>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/commission/by-college", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<CommissionPartnerBreakdownRow>) => ({ ...raw, data: raw.data.map(mapPartnerBreakdown) }),
      providesTags: [{ type: "Dashboard", id: "commission-by-college" }],
    }),
    getNrbCapCompliance: builder.query<PaginatedData<NrbCapComplianceRow>, Paged<object>>({
      query: (params) => ({ url: "/dashboard/commission/nrb-cap-compliance", params: params ?? undefined }),
    }),
    getCommissionPartners: builder.query<PaginatedData<CommissionPartnerRecord>, Paged<{ partnerType?: CommissionPartnerType }>>({
      query: (params) => ({ url: "/dashboard/commission/partners", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<CommissionPartnerRecord>) => ({ ...raw, data: raw.data.map(mapPartner) }),
      providesTags: (result) =>
        result
          ? [...result.data.map((p) => ({ type: "CommissionPartner" as const, id: p.id })), { type: "CommissionPartner" as const, id: "LIST" }]
          : [{ type: "CommissionPartner" as const, id: "LIST" }],
    }),
    createCommissionPartner: builder.mutation<CommissionPartnerRecord, CreateCommissionPartnerBody>({
      query: (body) => ({ url: "/dashboard/commission/partners", method: "POST", body }),
      transformResponse: mapPartner,
      invalidatesTags: [
        { type: "CommissionPartner", id: "LIST" },
        { type: "Dashboard", id: "commission-by-bank" },
        { type: "Dashboard", id: "commission-by-college" },
      ],
    }),
    updateCommissionPartner: builder.mutation<CommissionPartnerRecord, { id: string; data: UpdateCommissionPartnerBody }>({
      query: ({ id, data }) => ({ url: `/dashboard/commission/partners/${id}`, method: "PATCH", body: data }),
      transformResponse: mapPartner,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "CommissionPartner", id },
        { type: "CommissionPartner", id: "LIST" },
        { type: "Dashboard", id: "commission-by-bank" },
        { type: "Dashboard", id: "commission-by-college" },
      ],
    }),
    getCommissionEntries: builder.query<PaginatedData<CommissionEntryRecord>, Paged<{ partnerId?: string; status?: CommissionEntryStatus }>>({
      query: (params) => ({ url: "/dashboard/commission/entries", params: params ?? undefined }),
      transformResponse: (raw: PaginatedData<CommissionEntryRecord>) => ({ ...raw, data: raw.data.map(mapCommissionEntry) }),
      providesTags: (result) =>
        result
          ? [...result.data.map((e) => ({ type: "CommissionEntry" as const, id: e.id })), { type: "CommissionEntry" as const, id: "LIST" }]
          : [{ type: "CommissionEntry" as const, id: "LIST" }],
    }),
    createCommissionEntry: builder.mutation<CommissionEntryRecord, CreateCommissionEntryBody>({
      query: (body) => ({ url: "/dashboard/commission/entries", method: "POST", body }),
      transformResponse: mapCommissionEntry,
      invalidatesTags: [{ type: "CommissionEntry", id: "LIST" }, { type: "Dashboard", id: "commission-summary" }],
    }),
    updateCommissionEntry: builder.mutation<CommissionEntryRecord, { id: string; data: UpdateCommissionEntryBody }>({
      query: ({ id, data }) => ({ url: `/dashboard/commission/entries/${id}`, method: "PATCH", body: data }),
      transformResponse: mapCommissionEntry,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "CommissionEntry", id },
        { type: "CommissionEntry", id: "LIST" },
        { type: "Dashboard", id: "commission-summary" },
      ],
    }),

    // ─── 10. Audit ledger ─────────────────────────────────────────────────
    getAuditLog: builder.query<PaginatedData<AuditLogRow>, AuditQuery | void>({
      query: (params) => ({ url: "/dashboard/audit", params: params ?? undefined }),
    }),
    createManualAuditEntry: builder.mutation<AuditLogRow, ManualAuditEntryBody>({
      query: (body) => ({ url: "/dashboard/audit/manual-entry", method: "POST", body }),
    }),
    // Returns an object-URL for the downloaded CSV blob — trigger the download in the component.
    exportAuditCsv: builder.query<string, AuditQuery | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) search.set(key, String(value));
          });
        }
        const qs = search.toString();
        return {
          url: `/dashboard/audit/export/csv${qs ? `?${qs}` : ""}`,
          responseHandler: async (res: Response) => {
            const blob = await res.blob();
            return URL.createObjectURL(blob);
          },
          cache: "no-cache",
        };
      },
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetCheckerQueueQuery,
  useGetDashboardAlertsQuery,
  useGetDashboardApplicationsQuery,
  useGetDashboardApplicationDetailQuery,
  useGetApprovalSummaryQuery,
  useGetApprovalCreditScoreQuery,
  useGetApprovalNrbChecklistQuery,
  useGetApprovalActivityQuery,
  useGetDisbursementPendingQuery,
  useGetDisbursementConditionsQuery,
  useAddDisbursementConditionMutation,
  useUpdateDisbursementConditionMutation,
  useConfirmDisbursementMutation,
  useGetDisbursementHistoryQuery,
  useGenerateEmiScheduleMutation,
  useGetEmiScheduleQuery,
  useGetOverdueEmisQuery,
  useGetRepaymentOverviewQuery,
  useMarkEmiPaidMutation,
  useGetEmiNotificationTriggersQuery,
  useGetNotificationLogQuery,
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useVerifyOfferLetterMutation,
  useGetDocumentVaultQuery,
  useGetGeneratedAgreementsQuery,
  useCreateGeneratedAgreementMutation,
  useSendAgreementToSignMutation,
  useMarkAgreementSignedMutation,
  useGetInsuranceStatsQuery,
  useGetInsurancePoliciesQuery,
  useCreateInsurancePolicyMutation,
  useGetInsurancePolicyDetailQuery,
  useGetCommissionSummaryQuery,
  useGetCommissionByBankQuery,
  useGetCommissionByCollegeQuery,
  useGetNrbCapComplianceQuery,
  useGetCommissionPartnersQuery,
  useCreateCommissionPartnerMutation,
  useUpdateCommissionPartnerMutation,
  useGetCommissionEntriesQuery,
  useCreateCommissionEntryMutation,
  useUpdateCommissionEntryMutation,
  useGetAuditLogQuery,
  useCreateManualAuditEntryMutation,
  useLazyExportAuditCsvQuery,
} = dashboardApi;
