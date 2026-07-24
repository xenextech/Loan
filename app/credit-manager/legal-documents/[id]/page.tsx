import { LegalDocumentGenerator } from "@/components/credit-manager/legal-documents/LegalDocumentGenerator";

export const metadata = {
  title: "Legal Documents — Unnati Credit Manager Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LegalDocumentGenerator id={id} />;
}
