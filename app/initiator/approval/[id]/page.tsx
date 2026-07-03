import { ApprovalWorkflowDetail } from "@/components/initiator/approval/ApprovalWorkflowDetail";

export const metadata = {
  title: "Approval Workflow — Unnati Initiator Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApprovalWorkflowDetail id={id} />;
}
