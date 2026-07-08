// Wire shapes for the credit-ops dashboard module (`/dashboard/*`).
// See edu-loan-backend/src/modules/dashboard/README.md for the authoritative contract.

import type { PaginatedData } from "./api";

// ─── Shared enums (mirror backend Prisma enums exactly) ───────────────────────

export type NotificationChannel = "APP" | "EMAIL" | "SMS" | "WHATSAPP";
export type NotificationDeliveryStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";
export type DisbursementConditionStatus = "PENDING" | "DONE" | "MISSING";
export type DisbursementStatus = "PENDING" | "PARTIAL" | "COMPLETED";
export type TrancheStatus = "PENDING" | "CREDITED" | "FAILED";
export type EmiStatus = "UPCOMING" | "PAID" | "OVERDUE" | "PARTIAL";
export type GeneratedAgreementType = "LOAN_AGREEMENT" | "GUARANTEE_DEED" | "HYPOTHECATION" | "PROMISSORY_NOTE";
export type GeneratedAgreementStatus = "DRAFT" | "PENDING_SIGNATURE" | "SIGNED" | "ACTIVE";
export type CommissionPartnerType = "BANK" | "COLLEGE";
export type CommissionRateType = "FLAT" | "PERCENTAGE";
export type CommissionEntryStatus = "PENDING" | "INVOICE_DUE" | "PAID";
export type AuditCategory = "APPROVAL" | "DISBURSEMENT" | "REPAYMENT" | "COMMISSION" | "SYSTEM";
export type InsurancePolicyStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
export type LoanAccountStatus = "ACTIVE" | "CLEARED" | "NEEDS_REVIEW";
export type CollectionActivityType = "CALL" | "SMS" | "EMAIL" | "WHATSAPP" | "VISIT" | "NOTE" | "OTHER";

// Bank approval workflow stage — separate from ApplicationStatus (DRAFT/SUBMITTED).
// `null` means the application hasn't entered the workflow yet.
export type ApplicationStage = "INITIATED" | "SUPPORTED" | "CHECKING" | "APPROVED" | "REJECTED" | "SENT_BACK";

/** Roles that participate in the approval-transition endpoints (`/dashboard/approval/:id/...`). */
export type ApprovalActionRole = "SUPPORTER" | "CHECKER" | "CREDIT_MANAGER" | "APPROVER";

export interface AuditUserRef {
  id: string;
  email: string;
  role: string;
}

export interface ApplicationRef {
  id: string;
  applicationNumber: string;
  fullName: string | null;
}

// ─── 1. Overview ────────────────────────────────────────────────────────────

export interface DashboardOverview {
  portfolioTotal: number;
  pendingMyActionCount: number;
  overdueEmi: { count: number; amount: number };
  commissionThisMonth: { total: number; fromBanks: number; fromColleges: number };
  approvalPipeline: { approximate: true; initiated: number; supported: number; approved: number };
  alerts: DashboardAlert[];
}

export type DashboardAlertType = "CICL_FLAG" | "INSURANCE_EXPIRING" | "EMI_OVERDUE";

export interface DashboardAlert {
  type: DashboardAlertType;
  applicationId: string;
  message: string;
}

export interface CheckerQueueRow {
  id: string;
  applicationNumber: string | null;
  fullName: string | null;
  branch: string | null;
  riskGrade: string | null;
  submittedAt: string | null;
  loanInformation: { loanAmount: number | null } | null;
}

// ─── 2. Applications ────────────────────────────────────────────────────────

/** Server-side stage filter — "my-queue" depends on the requesting staff role
 *  (SUPPORTER sees INITIATED, CREDIT_MANAGER/CHECKER sees SUPPORTED, APPROVER sees
 *  CHECKING); "disbursement" returns stage: APPROVED (i.e. the approved-loan
 *  portfolio, the data source for the Credit Manager dashboard). */
export type DashboardApplicationsFilter =
  | "my-queue"
  | "pending"
  | "approval"
  | "disbursement"
  | "rejected"
  | "sent-back"
  | "action-needed"
  | "pending-disbursement"
  | "disbursed";

export interface DashboardApplicationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  dateFrom?: string;
  dateTo?: string;
  filter?: DashboardApplicationsFilter;
}

export interface DashboardApplicationRow {
  id: string;
  refNo: string | null;
  date: string;
  borrower: string | null;
  branch: string | null;
  type: string | null;
  amount: number | null;
  grade: string | null;
  status: "DRAFT" | "SUBMITTED";
  stage: ApplicationStage | null;
  dsgir: number | null;
  ltv: number | null;
  daysOpen: number;
  loanAccountStatus: LoanAccountStatus | null;
  borrowerNotifiedAt: string | null;
  disbursementStatus: "PENDING" | "PARTIAL" | "COMPLETED" | null;
}

// ─── Pipeline stats (this calendar month) ──────────────────────────────────
export interface PipelineStatsThisMonth {
  initiated: number;
  supported: number;
  checked: number;
  approved: number;
  rejected: number;
  approvalRate: number | null;
  avgProcessingTimeDays: number | null;
}

// ─── 3. Approval workflow ───────────────────────────────────────────────────

export interface ApprovalSummary {
  applicationId: string;
  applicationNumber: string | null;
  status: string;
  dsgir: number | null;
  loanToValueRatio: number | null;
  ciclStatus: boolean | null;
  ciclRemarks: string | null;
  identityType: string | null;
  identityNumber: string | null;
  citizenshipNumber: string | null;
  riskGrade: string | null;
  collateralText: string | null;
  insuranceAttached: boolean;
}

export interface RejectApplicationBody {
  reason: string;
}

export interface SendBackApplicationBody {
  reason: string;
  toStage?: ApplicationStage;
}

export interface CreditScoreResult {
  overall: {
    score: number;
    weight: number;
    percentage: number;
    grade: string;
    riskCategory: string;
  };
}

export interface NrbChecklistItem {
  label: string;
  tracked: boolean;
  value: boolean | number | null;
}

export interface NrbChecklist {
  applicationId: string;
  items: NrbChecklistItem[];
}

export interface AuditLogRow {
  id: string;
  userId: string;
  applicationId: string | null;
  action: string;
  category: AuditCategory;
  payload: Record<string, unknown> | null;
  createdAt: string;
  user: AuditUserRef;
}

// ─── 4. Disbursement ────────────────────────────────────────────────────────

export interface DisbursementPendingRow {
  applicationId: string;
  refNo: string | null;
  borrower: string | null;
  amount: number | null;
  conditionsDone: number;
  conditionsTotal: number;
  status: DisbursementStatus;
  /** Whether the parent's bank account is on file — `confirm()` rejects the
   *  disbursement server-side if this is false, regardless of conditions. */
  bankAccountReady: boolean;
}

export interface DisbursementConditionRecord {
  id: string;
  applicationId: string;
  label: string;
  status: DisbursementConditionStatus;
  remarks: string | null;
  completedAt: string | null;
  completedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmDisbursementBody {
  trancheNumber: number;
  amount: number;
  accountCredited?: string;
  commissionAmount?: number;
  date?: string;
}

export interface DisbursementRecord {
  id: string;
  applicationId: string;
  status: DisbursementStatus;
  totalDisbursedAmount: number | null;
  initiatedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

/** The tranche as `confirm()` actually returns it — no nested `disbursement.application`
 *  join (unlike `getHistory`'s rows, which come from a query that does join it). */
export interface DisbursementTrancheBase {
  id: string;
  disbursementId: string;
  trancheNumber: number;
  amount: number;
  accountCredited: string | null;
  status: TrancheStatus;
  disbursedAt: string | null;
  commissionAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmDisbursementResult {
  disbursement: DisbursementRecord;
  tranche: DisbursementTrancheBase;
}

export interface DisbursementTrancheRecord {
  id: string;
  disbursementId: string;
  trancheNumber: number;
  amount: number;
  accountCredited: string | null;
  status: TrancheStatus;
  disbursedAt: string | null;
  commissionAmount: number | null;
  createdAt: string;
  updatedAt: string;
  disbursement: {
    id: string;
    applicationId: string;
    status: DisbursementStatus;
    totalDisbursedAmount: number | null;
    application: ApplicationRef;
  };
}

// ─── 5. Repayment / EMI ─────────────────────────────────────────────────────

export interface EmiScheduleEntryRecord {
  id: string;
  applicationId: string;
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  outstandingPrincipal: number;
  status: EmiStatus;
  paidAmount: number | null;
  paidDate: string | null;
  /** Running penal-interest balance — accrued daily while OVERDUE at
   *  (contract interest rate + 2%) simple daily interest on `emiAmount`. */
  penalInterestAccrued: number;
  createdAt: string;
  updatedAt: string;
  application?: ApplicationRef;
}

/** NRB-aligned aging buckets (days overdue). */
export type OverdueBucket = "1-30" | "31-90" | "91-180" | "181-365" | "365+";

export interface RepaymentOverview {
  dueToday: { amount: number; count: number };
  overdue1to30: { amount: number; count: number };
  overdue31to90: { amount: number; count: number };
  overdue91to180: { amount: number; count: number };
  overdue181to365: { amount: number; count: number };
  overdue365Plus: { amount: number; count: number };
  collectionEfficiency: number | null;
}

/** NRB loan classification — driven by the oldest unpaid installment's
 *  days-overdue, recomputed daily. Display label only; doesn't gate behavior. */
export type NrbLoanClassification = "PASS" | "SUBSTANDARD" | "DOUBTFUL" | "LOSS";

export interface MarkEmiPaidBody {
  paidAmount: number;
  paidDate: string;
}

export interface EmiNotificationTrigger {
  trigger: string;
  messageType: string;
}

// ─── 6. Notifications ───────────────────────────────────────────────────────

export interface NotificationLogQuery {
  page?: number;
  limit?: number;
  channel?: NotificationChannel;
  deliveryStatus?: NotificationDeliveryStatus;
  applicationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationLogRow {
  id: string;
  userId: string;
  applicationId: string | null;
  type: "DATABASE" | "EMAIL";
  channel: NotificationChannel | null;
  deliveryStatus: NotificationDeliveryStatus | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateRecord {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject: string | null;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationTemplateBody {
  name: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  isActive?: boolean;
}

export type UpdateNotificationTemplateBody = Partial<CreateNotificationTemplateBody>;

// ─── 7. Document center ─────────────────────────────────────────────────────

export interface VerifyOfferLetterBody {
  applicationId: string;
  refOrQrToken: string;
}

export interface VerifyOfferLetterResult {
  matched: boolean;
  offerLetter: Record<string, unknown> | null;
  verification: Record<string, unknown> | null;
}

export interface DocumentVaultQuery {
  page?: number;
  limit?: number;
  applicationId?: string;
  documentType?: string;
}

export interface DocumentVaultRow {
  id: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  uploadedAt: string;
  application: ApplicationRef;
}

export interface GeneratedAgreementRecord {
  id: string;
  applicationId: string;
  agreementType: GeneratedAgreementType;
  status: GeneratedAgreementStatus;
  templateSnapshot: Record<string, unknown> | null;
  documentUrl: string | null;
  generatedByUserId: string;
  sentToSignAt: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  application: ApplicationRef;
}

export interface CreateGeneratedAgreementBody {
  applicationId: string;
  agreementType: GeneratedAgreementType;
}

// ─── 8. Insurance tracker ───────────────────────────────────────────────────

export interface InsuranceStats {
  activeCount: number;
  expiringIn30DaysCount: number;
  expiredCount: number;
  sumInsuredToLoanRatio: number | null;
}

export interface InsurancePolicyRecord {
  id: string;
  applicationId: string;
  policyNumber: string;
  insurer: string;
  policyType: string | null;
  sumInsured: number;
  premiumAmount: number | null;
  startDate: string | null;
  expiryDate: string;
  addedByUserId: string;
  createdAt: string;
  updatedAt: string;
  status: InsurancePolicyStatus;
  application: ApplicationRef;
}

export interface CreateInsurancePolicyBody {
  applicationId: string;
  policyNumber: string;
  insurer: string;
  policyType?: string;
  sumInsured: number;
  premiumAmount?: number;
  startDate?: string;
  expiryDate: string;
}

// ─── 9. Commission ──────────────────────────────────────────────────────────

export interface CommissionSummary {
  totalEarned: number;
  fromBanks: number;
  fromColleges: number;
  pendingPayment: number;
}

export interface CommissionPartnerBreakdownRow {
  id: string;
  name: string;
  rateType: CommissionRateType;
  rateValue: number;
  mouReference: string | null;
  isActive: boolean;
  loans: number;
  totalEarned: number;
}

export interface NrbCapComplianceRow {
  applicationId: string;
  refNo: string | null;
  borrower: string | null;
  creditLimit: number;
  nrbCapAmount: number;
  utilizationPercent: number;
  compliant: boolean;
}

export interface CommissionPartnerRecord {
  id: string;
  partnerType: CommissionPartnerType;
  name: string;
  rateType: CommissionRateType;
  rateValue: number;
  mouReference: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommissionPartnerBody {
  partnerType: CommissionPartnerType;
  name: string;
  rateType: CommissionRateType;
  rateValue: number;
  mouReference?: string;
  isActive?: boolean;
}

export type UpdateCommissionPartnerBody = Partial<CreateCommissionPartnerBody>;

export interface CommissionEntryRecord {
  id: string;
  applicationId: string | null;
  partnerId: string;
  amount: number;
  month: string;
  status: CommissionEntryStatus;
  invoiceRef: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  partner: { name: string; partnerType: CommissionPartnerType };
}

export interface CreateCommissionEntryBody {
  applicationId?: string;
  partnerId: string;
  amount: number;
  month: string;
  invoiceRef?: string;
}

export interface UpdateCommissionEntryBody {
  status?: CommissionEntryStatus;
  invoiceRef?: string;
}

// ─── 10. Audit ledger ────────────────────────────────────────────────────────

export interface AuditQuery {
  page?: number;
  limit?: number;
  category?: AuditCategory;
  userId?: string;
  applicationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ManualAuditEntryBody {
  action: string;
  category: AuditCategory;
  applicationId?: string;
  remarks?: string;
  payload?: Record<string, unknown>;
}

// ─── 11. Merged application detail (GET /dashboard/applications/:id/detail) ────

export type RepaymentFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface LoanAccountRecord {
  id: string;
  applicationId: string;
  loanAccountNumber: string;
  status: LoanAccountStatus;
  // Loan servicing configuration (Credit Manager, post-approval). The approved
  // principal is never overridden here — only rate/tenure/grace/start-date are
  // Credit-Manager-adjustable; `null` means not yet configured.
  finalInterestRate: number | null;
  finalTenureMonths: number | null;
  repaymentFrequency: RepaymentFrequency;
  gracePeriodMonths: number;
  emiStartDate: string | null;
  firstDueDate: string | null;
  configuredByUserId: string | null;
  configuredAt: string | null;
  borrowerNotifiedAt: string | null;
  clearedAt: string | null;
  reviewReason: string | null;
  reviewRequestedByUserId: string | null;
  reviewRequestedAt: string | null;
  reviewResolvedByUserId: string | null;
  reviewResolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── 12. Loan Servicing (Credit Manager, post-approval) ───────────────────────

export interface ConfigureLoanServicingBody {
  finalInterestRate?: number;
  finalTenureMonths?: number;
  repaymentFrequency?: RepaymentFrequency;
  gracePeriodMonths?: number;
  emiStartDate?: string;
}

export interface ConfigureLoanServicingResult extends LoanAccountRecord {
  installmentAmount: number;
  totalRepayable: number;
  numberOfInstallments: number;
  disbursementAmount: number;
}

export interface NotifyBorrowerResult {
  studentNotified: boolean;
  parentNotified: boolean;
  parentChannel: "SMS" | "WHATSAPP" | null;
}

export interface CollectionActivityRecord {
  id: string;
  applicationId: string;
  createdByUserId: string;
  activityType: CollectionActivityType;
  notes: string;
  contactedPerson: string | null;
  createdAt: string;
}

export interface RecordCollectionActivityBody {
  activityType: CollectionActivityType;
  notes: string;
  contactedPerson?: string;
}

export interface FlagNeedsReviewBody {
  reason: string;
}

export interface ResolveReviewBody {
  resolutionNotes?: string;
}

/** The one merged-detail endpoint that includes `loanAccount` — every other
 *  per-application query (`getOne`) omits it. Used sparingly (one call per loan
 *  detail view, not for portfolio-wide lists) to avoid N+1 fetching. */
export interface ApplicationFullDetail {
  application: import("./api").InitiatorApplicationRecord;
  loanAccount: LoanAccountRecord | null;
  disbursement: { status: "PENDING" | "PARTIAL" | "COMPLETED"; totalDisbursedAmount: number | null } | null;
  creditScore: CreditScoreResult | null;
  activity: PaginatedData<AuditLogRow>;
}
