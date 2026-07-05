import type { ApplicationStage } from "@/types/dashboard";

/** Shared label/badge styling for `ApplicationStage` — used by the Applications
 *  list, Approval Workflow list/detail, and the stage stepper. */
export const STAGE_LABEL: Record<ApplicationStage, string> = {
  INITIATED: "Initiated",
  SUPPORTED: "Supported",
  CHECKING: "Checking",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SENT_BACK: "Sent Back",
};

export const STAGE_BADGE_CLASS: Record<ApplicationStage, string> = {
  INITIATED: "bg-primary/10 text-primary",
  SUPPORTED: "bg-primary/10 text-primary",
  CHECKING: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  APPROVED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  REJECTED: "bg-destructive/10 text-destructive",
  SENT_BACK: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
};

export const NO_STAGE_LABEL = "Not started";
export const NO_STAGE_BADGE_CLASS = "bg-muted text-muted-foreground";
