import { CommissionDetail } from "@/components/initiator/commission/CommissionDetail";

export const metadata = {
  title: "Commission Management — Unnati Credit Manager Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommissionDetail id={id} />;
}
