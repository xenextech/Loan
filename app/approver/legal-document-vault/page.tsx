import { LegalDocumentVaultList } from "@/components/initiator/legal-document-vault/LegalDocumentVaultList";

export const metadata = {
  title: "Legal Document Vault — Unnati Approver Portal",
  description: "Legal documents forwarded to you for physical signature collection.",
};

export default function ApproverLegalDocumentVaultPage() {
  return <LegalDocumentVaultList />;
}
