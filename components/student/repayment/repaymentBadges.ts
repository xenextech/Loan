import type { EmiStatus } from "@/types/dashboard";
import type { RepaymentStatus } from "@/types/api";

// Same soft-tinted color idiom used across the app for status badges
// (see components/initiator/emi-schedule/EmiScheduleDetail.tsx) — kept as a
// local copy rather than a cross-role import since staff/student components
// don't share a dependency today.
export const EMI_STATUS_BADGE_CLASS: Record<EmiStatus, string> = {
  UPCOMING: "bg-muted text-muted-foreground",
  PAID: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  OVERDUE: "bg-destructive/10 text-destructive",
  PARTIAL:
    "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
};

export const EMI_STATUS_LABEL: Record<EmiStatus, string> = {
  UPCOMING: "Upcoming",
  PAID: "Paid",
  OVERDUE: "Overdue",
  PARTIAL: "Partial",
};

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
