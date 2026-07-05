import { useGetDashboardApplicationsQuery } from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { ApprovalListItem } from "./types";

/**
 * Every submitted application in the credit-ops pipeline, presented in the
 * approval-workflow shape — backed by GET /dashboard/applications, which now
 * returns the real bank approval `stage` alongside `status`.
 */
export function useApprovalApplications(page = 1, limit = 20): {
  data: ApprovalListItem[];
  isLoading: boolean;
  total: number;
} {
  const { data, isLoading } = useGetDashboardApplicationsQuery({ page, limit });

  return {
    data: (data?.data ?? []).map((app) => ({
      id: app.id,
      refNo: app.refNo ?? "—",
      borrowerName: app.borrower ?? "—",
      branch: app.branch ?? "—",
      loanType: app.type ?? "—",
      amountLabel: app.amount !== null ? formatNPR(app.amount) : "—",
      grade: app.grade ?? "—",
      stage: app.stage,
      dsgirLabel: app.dsgir !== null ? `${app.dsgir}%` : "—",
      ltvLabel: app.ltv !== null ? `${app.ltv}%` : "—",
      daysOpen: app.daysOpen,
    })),
    isLoading,
    total: data?.meta.total ?? 0,
  };
}
