import type { AuditLedgerData, AuditLogEntry } from "./types";

/**
 * Standing in for a future immutable audit-ledger backend module (full-metadata action
 * logging across all users/branches) — none of that exists on the API yet. Swap
 * `useAuditLedger` for a real RTK Query hook once it does; the call signature already
 * matches.
 */

const ENTRIES: AuditLogEntry[] = [
  {
    id: "audit-1",
    timestampLabel: "29 Jun 13:05",
    user: "prem.napit",
    role: "Approver",
    actionLabel: "APPROVE",
    details: "LN-20260624-093727 · Rs 7.1L · Sharada Sah Godh · Agri loan. Apply pricing: Base Rate + 1% premium. Birgunj branch.",
    category: "Approvals",
  },
  {
    id: "audit-2",
    timestampLabel: "29 Jun 12:59",
    user: "priti.basnyat",
    role: "Supporter",
    actionLabel: "SUPPORT",
    details: "LN-20260624-093727 · CRAD conditions: monitor repayment from start. Agri plan sheet mandatory. Recommended.",
    category: "Approvals",
  },
  {
    id: "audit-3",
    timestampLabel: "29 Jun 12:48",
    user: "roshan.bohara",
    role: "Initiator",
    actionLabel: "SUBMIT",
    details: "LN-20260624-093727 · Initial submission. Field visit 18 Jun 2026. Collateral: Piparpati Jabdi Ward 6, Bara. All 8 documents uploaded.",
    category: "Approvals",
  },
  {
    id: "audit-4",
    timestampLabel: "29 Jun 11:30",
    user: "system",
    role: "Auto",
    actionLabel: "DISBURSEMENT",
    details: "Rs 7,10,000 credited to Sharada Sah Godh A/C. Commission Rs 710 → Unnati. Notification sent: SMS + WhatsApp + App.",
    category: "Disbursements",
  },
  {
    id: "audit-5",
    timestampLabel: "29 Jun 09:00",
    user: "system",
    role: "Auto",
    actionLabel: "NOTIFICATION SENT",
    details: "EMI reminder (1 month) · 142 borrowers · WhatsApp + App. Delivery rate: 98.6%.",
    category: "System changes",
  },
  {
    id: "audit-6",
    timestampLabel: "28 Jun 16:00",
    user: "prem.napit",
    role: "Checker",
    actionLabel: "SEND BACK",
    details: "LN-2081-0148 · Sent back to Supporter. Reason: Trace map missing for Plot 781. Re-upload and resubmit within 2 business days.",
    category: "Approvals",
  },
  {
    id: "audit-7",
    timestampLabel: "28 Jun 14:22",
    user: "credit.risk",
    role: "Checker",
    actionLabel: "CICL FRAUD FLAG",
    details: "LN-2081-0142 · Ramesh Thapa · CIC bureau hit: adverse entry at 3 BFIs. Application frozen. AML team notified. STR consideration raised.",
    category: "System changes",
  },
  {
    id: "audit-8",
    timestampLabel: "28 Jun 10:00",
    user: "genzloan.admin",
    role: "Platform",
    actionLabel: "COMMISSION INVOICE",
    details: "Invoice INV-2081-042 · BFCL · Rs 14,200 · 14 loans disbursed Jun week 3. Due: 15 Ashadh 2081.",
    category: "Commission",
  },
  {
    id: "audit-9",
    timestampLabel: "27 Jun 09:00",
    user: "system",
    role: "Auto",
    actionLabel: "INSURANCE ALERT",
    details: "Policy IMG-PROP-2080-092 · Sita Devi · LN-2081-0089. Expiring 8 days. Email + WhatsApp sent to borrower and branch manager.",
    category: "System changes",
  },
  {
    id: "audit-10",
    timestampLabel: "26 Jun 08:15",
    user: "system",
    role: "Auto",
    actionLabel: "EMI COLLECTED",
    details: "LN-2081-0089 · Rs 8,200 · Sita Devi · Auto-debit successful. Balance updated.",
    category: "Repayments",
  },
];

const AUDIT_LEDGER: AuditLedgerData = {
  hoVisibilityLabel: "On",
  footerNote:
    "All audit entries are logged with full metadata: IP address, device, geolocation, session ID. Head Office has read-only access to all branches. Entries can be edited with mandatory reason field — edit history preserved. Export formats: PDF, CSV, NRB-standard XML.",
  entries: ENTRIES,
};

export function getMockAuditLedger(): AuditLedgerData {
  return AUDIT_LEDGER;
}
