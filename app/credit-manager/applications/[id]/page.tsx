import CreditManagerLoanDetail from "@/components/credit-manager/LoanDetail";

export const metadata = {
  title: "Loan Detail — Unnati Credit Manager Portal",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreditManagerLoanDetail id={id} />;
}
