import {
  useGetDashboardApplicationsQuery,
  useGetRepaymentOverviewQuery,
  useGetDashboardAlertsQuery,
} from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";

/**
 * Portfolio-wide summary cards — deliberately limited to what's cheaply
 * computable from existing aggregate endpoints (one request each, no N+1
 * fetching across the portfolio). Per-loan breakdowns (Performing vs
 * Non-Performing counts, Active vs Cleared, total outstanding) would need
 * either a new backend aggregate endpoint or fetching every approved loan's
 * full detail individually — out of scope here; see the loan detail page for
 * that data on a per-loan basis instead, where it's already being fetched anyway.
 */
export function useCreditManagerSummary(): {
  totalApprovedLoans: number;
  overdueInstallmentCount: number;
  overdueAmountLabel: string;
  insuranceExpiringCount: number;
  ciclFlagCount: number;
  collectionEfficiency: number | null;
  isLoading: boolean;
} {
  const { data: portfolio, isLoading: portfolioLoading } = useGetDashboardApplicationsQuery({
    page: 1,
    limit: 1,
    filter: "disbursement",
  });
  const { data: overview, isLoading: overviewLoading } = useGetRepaymentOverviewQuery();
  const { data: alerts, isLoading: alertsLoading } = useGetDashboardAlertsQuery({ page: 1, limit: 100 });

  const overdueInstallmentCount =
    (overview?.overdue1to30.count ?? 0) +
    (overview?.overdue31to90.count ?? 0) +
    (overview?.overdue91to180.count ?? 0) +
    (overview?.overdue181to365.count ?? 0) +
    (overview?.overdue365Plus.count ?? 0);

  const overdueAmount =
    (overview?.overdue1to30.amount ?? 0) +
    (overview?.overdue31to90.amount ?? 0) +
    (overview?.overdue91to180.amount ?? 0) +
    (overview?.overdue181to365.amount ?? 0) +
    (overview?.overdue365Plus.amount ?? 0);

  const alertRows = alerts?.data ?? [];

  return {
    totalApprovedLoans: portfolio?.meta.total ?? 0,
    overdueInstallmentCount,
    overdueAmountLabel: formatNPR(overdueAmount),
    insuranceExpiringCount: alertRows.filter((a) => a.type === "INSURANCE_EXPIRING").length,
    ciclFlagCount: alertRows.filter((a) => a.type === "CICL_FLAG").length,
    collectionEfficiency: overview?.collectionEfficiency ?? null,
    isLoading: portfolioLoading || overviewLoading || alertsLoading,
  };
}
