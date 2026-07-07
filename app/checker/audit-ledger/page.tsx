import { AuditLedgerList } from "@/components/initiator/audit/AuditLedgerList";

export const metadata = {
  title: "Audit Ledger — Unnati Checker Portal",
  description: "Immutable action log across all users and branches.",
};

export default function CheckerAuditLedgerListPage() {
  return <AuditLedgerList />;
}
