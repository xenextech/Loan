import { RepaymentMonitoringDetail } from "@/components/credit-manager/repayment-monitoring/RepaymentMonitoringDetail";

export const metadata = {
  title: "Repayment Monitoring — Unnati Credit Manager Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RepaymentMonitoringDetail id={id} />;
}
