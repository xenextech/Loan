import { DocumentCenterDetail } from "@/components/initiator/document/DocumentCenterDetail";

export const metadata = {
  title: "Document Center — Unnati Checker Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentCenterDetail id={id} />;
}
