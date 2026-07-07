import { ApprovalWorkflowList } from "@/components/initiator/approval/ApprovalWorkflowList";

export const metadata = {
  title: "Approval Workflow — Unnati Approver Portal",
  description: "Applications moving through the credit approval pipeline.",
};

export default function ApproverApprovalWorkflowPage() {
  return <ApprovalWorkflowList />;
}
