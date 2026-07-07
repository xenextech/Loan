import { useGetDashboardApplicationsQuery } from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { ApproverApplicationListItem } from "../types/approver";

/** Stages the backend allows the `approve` transition from (`ALLOWED_FROM_STAGE.approve`
 *  in dashboard-approval.service.ts) — an application only reaches the Approver's
 *  queue once the Checker has checked it. */
const APPROVE_ACTIONABLE_STAGES = ["CHECKING"] as const;

/**
 * Applications ready for the Approver's review — i.e. checked by the Checker and
 * still awaiting Approve/Reject/Send Back. Backed by the same
 * GET /dashboard/applications endpoint the Approval Workflow queue uses.
 *
 * The endpoint has no stage filter, so the stage filter below is applied
 * client-side — `limit` is capped at 100, the backend's `PaginationDto` max
 * (`@Max(100)`); a higher value fails validation with a 400 and silently
 * yields no data.
 */
export function useApproverApplications(): {
  data: ApproverApplicationListItem[];
  isLoading: boolean;
  total: number;
} {
  const { data, isLoading } = useGetDashboardApplicationsQuery({ page: 1, limit: 100 });

  const actionable = (data?.data ?? []).filter((app) =>
    (APPROVE_ACTIONABLE_STAGES as readonly (string | null)[]).includes(app.stage),
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
