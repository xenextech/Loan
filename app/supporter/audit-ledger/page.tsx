import { AuditLedgerList } from "@/components/initiator/audit/AuditLedgerList";

export const metadata = {
  title: "Audit Ledger — Unnati Supporter Portal",
  description: "Immutable action log across all users and branches.",
};

export default function SupporterAuditLedgerListPage() {
  return <AuditLedgerList />;
}
