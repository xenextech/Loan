export type AuditRole = "Approver" | "Supporter" | "Initiator" | "Checker" | "Auto" | "Platform";

export type AuditCategory = "Approvals" | "Disbursements" | "Repayments" | "Commission" | "System changes";

export interface AuditLogEntry {
  id: string;
  timestampLabel: string;
  user: string;
  role: AuditRole;
  actionLabel: string;
  details: string;
  category: AuditCategory;
}

export interface AuditLedgerData {
  hoVisibilityLabel: string;
  footerNote: string;
  entries: AuditLogEntry[];
}
