import { AuditLedgerDetail } from "@/components/initiator/audit/AuditLedgerDetail";

export const metadata = {
  title: "Audit Ledger — Unnati Credit Manager Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditLedgerDetail id={id} />;
}
