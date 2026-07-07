import { useGetDashboardApplicationDetailQuery } from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import type { CheckerApplicationDetail } from "../types/checker";

/**
 * Combines the two queries the review screen needs: the full read-only
 * initiator record (student/parent/college/documents/assessment, via
 * GET /applications/:id/initiator) and the real workflow-stage fields
 * (stage/branch/rejection/send-back reasons, via GET /dashboard/applications/:id) —
 * the same pair the Supporter and Initiator review screens use.
 */
export function useCheckerApplicationDetail(id: string): {
  data: CheckerApplicationDetail | undefined;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id, { skip: !id });
  const { data: initiatorDetail, isLoading: detailLoading, error: detailError } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });

  const isNotFound = [appError, detailError].some((e) => Boolean(e) && "status" in (e as object) && (e as { status?: number }).status === 404);

  const data: CheckerApplicationDetail | undefined =
    application && initiatorDetail
      ? {
          ...initiatorDetail,
          stage: application.stage ?? null,
          branch: application.branch,
          rejectionReason: application.rejectionReason,
          rejectedAt: application.rejectedAt,
          sentBackReason: application.sentBackReason,
          sentBackAt: application.sentBackAt,
          sentBackToStage: application.sentBackToStage,
        }
      : undefined;

  return {
    data,
    isLoading: appLoading || detailLoading,
    isNotFound,
  };
}
