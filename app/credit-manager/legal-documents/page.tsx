import { LegalDocumentsList } from "@/components/credit-manager/legal-documents/LegalDocumentsList";

export const metadata = {
  title: "Legal Documents — Unnati Credit Manager Portal",
  description: "Generate and track loan legal documents ahead of disbursement.",
};

export default function CreditManagerLegalDocumentsPage() {
  return <LegalDocumentsList />;
}
