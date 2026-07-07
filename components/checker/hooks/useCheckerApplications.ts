import { useGetDashboardApplicationsQuery } from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { CheckerApplicationListItem } from "../types/checker";

/** Stages the backend allows the `check` transition from (`ALLOWED_FROM_STAGE.check`
 *  in dashboard-approval.service.ts) — an application only reaches the Checker's
 *  queue once the Supporter has supported it (or it's been sent back to this stage). */
const CHECK_ACTIONABLE_STAGES = ["SUPPORTED", "SENT_BACK"] as const;

/**
 * Applications ready for the Checker's review — i.e. supported by the Supporter and
 * still awaiting (or sent back for) Check action. Backed by the same
 * GET /dashboard/applications endpoint the Approval Workflow queue uses.
 *
 * The endpoint has no stage filter, so the stage filter below is applied
 * client-side — `limit` is capped at 100, the backend's `PaginationDto` max
 * (`@Max(100)`); a higher value fails validation with a 400 and silently
 * yields no data.
 */
export function useCheckerApplications(): {
  data: CheckerApplicationListItem[];
  isLoading: boolean;
  total: number;
} {
  const { data, isLoading } = useGetDashboardApplicationsQuery({ page: 1, limit: 100 });

  const actionable = (data?.data ?? []).filter((app) =>
    (CHECK_ACTIONABLE_STAGES as readonly (string | null)[]).includes(app.stage),
  );

  return {
    data: actionable.map((app) => ({
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
    total: actionable.length,
  };
}
