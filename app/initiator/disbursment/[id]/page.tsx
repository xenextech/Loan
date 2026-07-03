import { DisbursementDetail } from "@/components/initiator/disbursement/DisbursementDetail";

export const metadata = {
  title: "Disbursement — Unnati Initiator Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DisbursementDetail id={id} />;
}
