import { LegalDocumentVaultList } from "@/components/initiator/legal-document-vault/LegalDocumentVaultList";

export const metadata = {
  title: "Legal Document Vault — Unnati Supporter Portal",
  description: "Legal documents forwarded to you for physical signature collection.",
};

export default function SupporterLegalDocumentVaultPage() {
  return <LegalDocumentVaultList />;
}
