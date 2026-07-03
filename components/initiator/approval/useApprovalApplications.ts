import { useInitiatorApplications } from "@/components/initiator/hooks/useInitiatorApplications";
import { formatNPR } from "@/lib/formatters";
import type { ApprovalListItem } from "./types";

const daysSince = (iso: string): number => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24)));
};

/**
 * Real applications awaiting initiator review, presented in the approval-workflow shape —
 * backed by GET /applications/initiator/college-verified (same source as the Applications
 * page). There's no backend endpoint yet for the Checker/Approver/credit-scoring stages
 * this module visualizes, so every row is honestly a single "Awaiting Review" stage until
 * that data exists.
 */
export function useApprovalApplications(): {
  data: ApprovalListItem[];
  isLoading: boolean;
} {
  const { data, isLoading } = useInitiatorApplications();

  return {
    data: data.map((app) => ({
      id: app.id,
      refNo: app.applicationNumber,
      borrowerName: app.studentName,
      branch: app.collegeName,
      loanType: app.program,
      amountLabel: formatNPR(app.loanAmount),
      grade: "—",
      stageLabel: "Awaiting Review",
      dsgirLabel: "—",
      ltvLabel: "—",
      daysOpen: daysSince(app.collegeVerifiedAt),
    })),
    isLoading,
  };
}
