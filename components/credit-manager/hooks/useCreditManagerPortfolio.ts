import { useGetDashboardApplicationsQuery } from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { DashboardApplicationsFilter } from "@/types/dashboard";
import type { CreditManagerPortfolioRow } from "../types/creditManager";

/**
 * The Credit Manager's approved-loan portfolio — every application at stage
 * APPROVED, i.e. cleared the whole Initiator→Supporter→Checker/Credit
 * Manager→Approver chain and now under post-approval monitoring. Backed by
 * `GET /dashboard/applications?filter=disbursement` by default, the same real
 * server-side filter the backend already uses to mean "approved, on the way
 * to/through disbursement" (`buildFilterWhere`'s `'disbursement'` case returns
 * `stage: APPROVED` — confirmed by reading `dashboard-applications.service.ts`).
 * `filter` can be overridden to one of the narrower stage: APPROVED sub-filters
 * (`action-needed` / `pending-disbursement` / `disbursed`) for the Applications
 * tabs, which all still scope to the same approved portfolio.
 */
export function useCreditManagerPortfolio(
  page = 1,
  limit = 20,
  search?: string,
  filter: DashboardApplicationsFilter = "disbursement",
): {
  data: CreditManagerPortfolioRow[];
  isLoading: boolean;
  total: number;
} {
  const { data, isLoading } = useGetDashboardApplicationsQuery({
    page,
    limit,
    search: search || undefined,
    filter,
  });

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
