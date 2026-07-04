import InitiatorApplicationDetails from "@/components/initiator/ApplicationDetails";

export const metadata = {
  title: "Application Detail — Unnati Initiator Portal",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InitiatorApplicationDetails id={id} />;
}
