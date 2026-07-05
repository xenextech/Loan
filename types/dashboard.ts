// Wire shapes for the credit-ops dashboard module (`/dashboard/*`).
// See edu-loan-backend/src/modules/dashboard/README.md for the authoritative contract.

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

export interface DashboardApplicationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  dateFrom?: string;
  dateTo?: string;
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
  createdAt: string;
  updatedAt: string;
  application?: ApplicationRef;
}

export type OverdueBucket = "1-30" | "31-90" | "90+";

export interface RepaymentOverview {
  dueToday: { amount: number; count: number };
  overdue1to30: { amount: number; count: number };
  overdue31to90: { amount: number; count: number };
  collectionEfficiency: number | null;
}

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
