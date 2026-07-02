// Core domain types for the Loan Assessment Report.
// Mirrors the eventual Prisma model — keep this the single source of truth
// for the shape of the form so the Zod schema and API layer can both derive from it.

export type ApprovalRole = "INITIATOR" | "SUPPORT" | "APPROVER";

export type ApprovalStatus = "PENDING" | "WAITING" | "APPROVED" | "REJECTED";

export interface ApprovalEntry {
  approverName: string;
  role: ApprovalRole;
  status: ApprovalStatus;
  approvedDate?: string;
  remarks?: string;
  signature?: string;
}

/** Ordered so index comparisons double as "comes before" checks. */
export const APPROVAL_SEQUENCE: ApprovalRole[] = ["INITIATOR", "SUPPORT", "APPROVER"];

export interface StepDefinition {
  id: number;
  key: string;
  title: string;
  shortLabel: string;
  description: string;
}
