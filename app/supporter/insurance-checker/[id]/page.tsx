import { InsuranceTrackerDetail } from "@/components/initiator/insurance/InsuranceTrackerDetail";

export const metadata = {
  title: "Insurance Tracker — Unnati Supporter Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InsuranceTrackerDetail id={id} />;
}
