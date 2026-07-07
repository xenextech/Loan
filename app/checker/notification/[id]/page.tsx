import { NotificationCenterDetail } from "@/components/initiator/notification/NotificationCenterDetail";

export const metadata = {
  title: "Notification Center — Unnati Checker Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NotificationCenterDetail id={id} />;
}
