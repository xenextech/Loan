import {
  CheckCircle2,
  XCircle,
  Settings2,
  CalendarClock,
  BellRing,
  FileText,
  Bell,
  type LucideIcon,
} from "lucide-react";

export type NotificationCategory =
  | "LOAN_APPROVED"
  | "LOAN_REJECTED"
  | "LOAN_CLEARED"
  | "LOAN_CONFIGURATION"
  | "EMI_SCHEDULE"
  | "REPAYMENT_REMINDER"
  | "APPLICATION_SUBMITTED"
  | "GENERAL";

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  LOAN_APPROVED: "Loan Approved",
  LOAN_REJECTED: "Application Rejected",
  LOAN_CLEARED: "Loan Cleared",
  LOAN_CONFIGURATION: "Loan Configuration Completed",
  EMI_SCHEDULE: "EMI Schedule Generated",
  REPAYMENT_REMINDER: "Repayment Reminder",
  APPLICATION_SUBMITTED: "Application Submitted",
  GENERAL: "General Announcement",
};

export const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  LOAN_APPROVED: CheckCircle2,
  LOAN_REJECTED: XCircle,
  LOAN_CLEARED: CheckCircle2,
  LOAN_CONFIGURATION: Settings2,
  EMI_SCHEDULE: CalendarClock,
  REPAYMENT_REMINDER: BellRing,
  APPLICATION_SUBMITTED: FileText,
  GENERAL: Bell,
};

export const CATEGORY_BADGE_CLASS: Record<NotificationCategory, string> = {
  LOAN_APPROVED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  LOAN_REJECTED: "bg-destructive/10 text-destructive",
  LOAN_CLEARED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  LOAN_CONFIGURATION: "bg-primary/10 text-primary",
  EMI_SCHEDULE: "bg-primary/10 text-primary",
  REPAYMENT_REMINDER: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  APPLICATION_SUBMITTED: "bg-primary/10 text-primary",
  GENERAL: "bg-muted text-muted-foreground",
};

// The backend's Notification model has no category/type discriminator beyond
// DATABASE|EMAIL (delivery channel, not content) — title/message are free
// text composed ad-hoc by NotificationsService. This infers a display
// category from that text so the UI can still show a meaningful icon/label;
// order matters (more specific patterns are checked first).
export function inferNotificationCategory(title: string, message: string): NotificationCategory {
  const text = `${title} ${message}`.toLowerCase();

  if (/reject/.test(text)) return "LOAN_REJECTED";
  if (/clear/.test(text)) return "LOAN_CLEARED";
  if (/approved/.test(text)) return "LOAN_APPROVED";
  if (/(servicing|configur|finaliz)/.test(text)) return "LOAN_CONFIGURATION";
  if (/(emi|schedule|installment)/.test(text)) return "EMI_SCHEDULE";
  if (/(remind|due|overdue|penal|payment)/.test(text)) return "REPAYMENT_REMINDER";
  if (/submit/.test(text)) return "APPLICATION_SUBMITTED";
  return "GENERAL";
}
