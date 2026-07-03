import { ApprovalWorkflowList } from "@/components/initiator/approval/ApprovalWorkflowList";

export const metadata = {
  title: "Approval Workflow — Unnati Initiator Portal",
  description: "Applications moving through the credit approval pipeline.",
};

export default function ApprovalWorkflowPage() {
  return <ApprovalWorkflowList />;
}
