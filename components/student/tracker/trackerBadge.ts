import type { TrackerStageStatus, TrackerOverallStatus, UserRole } from "@/types/api";

/** Shared label/badge styling for the student Application Tracker — mirrors
 *  the STAGE_LABEL/STAGE_BADGE_CLASS pattern used by the initiator approval
 *  module (components/initiator/approval/stageBadge.ts). */
export const STAGE_STATUS_LABEL: Record<TrackerStageStatus, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
  REJECTED: "Rejected",
  SENT_BACK: "Sent Back",
  SKIPPED: "Skipped",
};

export const STAGE_STATUS_BADGE_CLASS: Record<TrackerStageStatus, string> = {
  COMPLETED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  IN_PROGRESS: "bg-primary/10 text-primary",
  PENDING: "bg-muted text-muted-foreground",
  REJECTED: "bg-destructive/10 text-destructive",
  SENT_BACK: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  SKIPPED: "bg-muted text-muted-foreground",
};

export const OVERALL_STATUS_LABEL: Record<TrackerOverallStatus, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  REJECTED: "Rejected",
  SENT_BACK: "Sent Back",
  COMPLETED: "Completed",
};

export const OVERALL_STATUS_BADGE_CLASS: Record<TrackerOverallStatus, string> = {
  DRAFT: "bg-amber-500/10 text-amber-600",
  IN_PROGRESS: "bg-primary/10 text-primary",
  REJECTED: "bg-destructive/10 text-destructive",
  SENT_BACK: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  COMPLETED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: "Student",
  ADMIN: "Admin",
  PARENT: "Parent",
  COLLEGE: "College",
  INITIATOR: "Initiator",
  CHECKER: "Checker",
  SUPPORTER: "Supporter",
  APPROVER: "Approver",
  CREDIT_MANAGER: "Credit Manager",
};
