import { EmiScheduleList } from "@/components/credit-manager/emi-schedule/EmiScheduleList";

export const metadata = {
  title: "EMI Schedule — Unnati Credit Manager Portal",
  description: "Repayment schedules and overdue tracking.",
};

export default function CreditManagerEmiScheduleListPage() {
  return <EmiScheduleList />;
}
