import { useGetDashboardApplicationsQuery } from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { SupporterApplicationListItem } from "../types/supporter";

/** Stages the backend allows the `support` transition from (`ALLOWED_FROM_STAGE.support`
 *  in dashboard-approval.service.ts) — a `null` stage means the application hasn't
 *  entered the workflow yet but has already cleared Initiator review. */
const SUPPORT_ACTIONABLE_STAGES = [null, "INITIATED", "SENT_BACK"] as const;

/**
 * Applications ready for the Supporter's review — i.e. cleared by the Initiator and
 * still awaiting (or sent back for) Support action. Backed by the same
 * GET /dashboard/applications endpoint the Approval Workflow queue uses.
 *
 * The endpoint has no stage filter, so the stage filter below is applied
 * client-side — `limit` is capped at 100, the backend's `PaginationDto` max
 * (`@Max(100)`); a higher value fails validation with a 400 and silently
 * yields no data.
 */
export function useSupporterApplications(): {
  data: SupporterApplicationListItem[];
  isLoading: boolean;
  total: number;
} {
  const { data, isLoading } = useGetDashboardApplicationsQuery({ page: 1, limit: 100 });

  const actionable = (data?.data ?? []).filter((app) =>
    (SUPPORT_ACTIONABLE_STAGES as readonly (string | null)[]).includes(app.stage),
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
