import type { NrbLoanClassification } from "@/types/dashboard";

/** NRB loan classification — driven by the oldest unpaid installment's days-overdue,
 *  recomputed daily by the backend cron. Shared across every role portal that shows
 *  loan health (EMI Schedule detail, Credit Manager dashboard). */
export const NRB_CLASS_LABEL: Record<NrbLoanClassification, string> = {
  PASS: "Pass",
  SUBSTANDARD: "Substandard",
  DOUBTFUL: "Doubtful",
  LOSS: "Loss",
};

export const NRB_CLASS_BADGE_CLASS: Record<NrbLoanClassification, string> = {
  PASS: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  SUBSTANDARD: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  DOUBTFUL: "bg-destructive/10 text-destructive",
  LOSS: "bg-destructive/20 text-destructive",
};

/** Common industry shorthand: PASS is performing, everything else is non-performing.
 *  Derived from the classification above — there's no separate NPA flag in the backend. */
export function isPerformingClassification(classification: NrbLoanClassification): boolean {
  return classification === "PASS";
}
