import CheckerApplicationDetails from "@/components/checker/ApplicationDetails";

export const metadata = {
  title: "Application Detail — Unnati Checker Portal",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CheckerApplicationDetails id={id} />;
}
