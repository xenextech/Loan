import ApproverApplicationDetails from "@/components/approver/ApplicationDetails";

export const metadata = {
  title: "Application Detail — Unnati Approver Portal",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApproverApplicationDetails id={id} />;
}
