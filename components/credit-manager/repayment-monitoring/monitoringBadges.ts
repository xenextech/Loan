import type { RepaymentStatus, LoanAccountStatus } from "@/types/dashboard";

// Same soft-tinted color idiom used across the dashboard for status badges
// (see components/initiator/emi-schedule/EmiScheduleDetail.tsx).
export const REPAYMENT_STATUS_BADGE_CLASS: Record<RepaymentStatus, string> = {
  NOT_CONFIGURED: "bg-muted text-muted-foreground",
  ON_TRACK: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  OVERDUE: "bg-destructive/10 text-destructive",
  NEEDS_REVIEW:
    "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  CLEARED: "bg-primary/10 text-primary",
};

export const REPAYMENT_STATUS_LABEL: Record<RepaymentStatus, string> = {
  NOT_CONFIGURED: "Not Configured",
  ON_TRACK: "On Track",
  OVERDUE: "Overdue",
  NEEDS_REVIEW: "Needs Review",
  CLEARED: "Cleared",
};

export const LOAN_ACCOUNT_STATUS_BADGE_CLASS: Record<LoanAccountStatus, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  CLEARED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  NEEDS_REVIEW: "bg-destructive/10 text-destructive",
};

export const LOAN_ACCOUNT_STATUS_LABEL: Record<LoanAccountStatus, string> = {
  ACTIVE: "Active",
  CLEARED: "Cleared",
  NEEDS_REVIEW: "Needs Review",
};
