import { RepaymentMonitoringList } from "@/components/credit-manager/repayment-monitoring/RepaymentMonitoringList";

export const metadata = {
  title: "Repayment Monitoring — Unnati Credit Manager Portal",
  description: "Monitor repayment health across the approved loan portfolio.",
};

export default function CreditManagerRepaymentMonitoringPage() {
  return <RepaymentMonitoringList />;
}
