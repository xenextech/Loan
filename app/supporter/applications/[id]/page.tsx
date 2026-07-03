import SupporterApplicationDetails from "@/components/supporter/ApplicationDetails";

export const metadata = {
  title: "Application Detail — GenZ Loan Supporter Portal",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupporterApplicationDetails id={id} />;
}
