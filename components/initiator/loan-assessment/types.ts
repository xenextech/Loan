// Core domain types for the Loan Assessment Report.
// Mirrors the eventual Prisma model — keep this the single source of truth
// for the shape of the form so the Zod schema and API layer can both derive from it.

export type ApprovalRole = "INITIATOR" | "SUPPORT" | "APPROVER";

/**
 * PENDING/WAITING/APPROVED/REJECTED are shared by every role. UNDER_REVIEW and
 * FIELD_VERIFIED are non-terminal, Support-only checkpoints on the way to a final
 * Support/Send Back decision; SENT_BACK is Support's terminal "kick it back" outcome
 * (kept distinct from REJECTED so its badge/copy reads correctly).
 */
export type ApprovalStatus =
  | "PENDING"
  | "WAITING"
  | "UNDER_REVIEW"
  | "FIELD_VERIFIED"
  | "APPROVED"
  | "REJECTED"
  | "SENT_BACK";

/** Statuses that lock an approval card — no further action editing once reached. */
export const TERMINAL_APPROVAL_STATUSES: ApprovalStatus[] = ["APPROVED", "REJECTED", "SENT_BACK"];

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
