import { ApprovalWorkflowList } from "@/components/initiator/approval/ApprovalWorkflowList";

export const metadata = {
  title: "Approval Workflow — Unnati Credit Manager Portal",
  description: "Applications moving through the credit approval pipeline.",
};

export default function CreditManagerApprovalWorkflowPage() {
  return <ApprovalWorkflowList />;
}
