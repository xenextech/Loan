import ApplicationDetail from "@/components/admin/ApplicationDetail";

export const metadata = {
  title: "Application Detail — GenZ Loan Admin",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetail id={id} />;
}
