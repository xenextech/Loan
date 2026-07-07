import { ApprovalWorkflowList } from "@/components/initiator/approval/ApprovalWorkflowList";

export const metadata = {
  title: "Approval Workflow — Unnati Checker Portal",
  description: "Applications moving through the credit approval pipeline.",
};

export default function CheckerApprovalWorkflowPage() {
  return <ApprovalWorkflowList />;
}
