import { useInitiatorApplications } from "@/components/initiator/hooks/useInitiatorApplications";
import { formatNPR } from "@/lib/formatters";

export interface InsuranceQueueItem {
  id: string;
  refNo: string;
  borrowerName: string;
  collegeName: string;
  program: string;
  amountLabel: string;
  stageLabel: string;
  daysOpen: number;
}

const daysSince = (iso: string): number => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24)));
};

/**
 * Real applications, presented as the insurance-checker queue — backed by the same
 * GET /applications/initiator/college-verified endpoint the other initiator modules use.
 * There's no backend endpoint yet for policy attachment or expiry tracking, so every row
 * is honestly a single "Awaiting Review" stage until that data exists.
 */
export function useInsuranceList(): {
  data: InsuranceQueueItem[];
  isLoading: boolean;
} {
  const { data, isLoading } = useInitiatorApplications();

  return {
    data: data.map((app) => ({
      id: app.id,
      refNo: app.applicationNumber,
      borrowerName: app.studentName,
      collegeName: app.collegeName,
      program: app.program,
      amountLabel: formatNPR(app.loanAmount),
      stageLabel: "Awaiting Review",
      daysOpen: daysSince(app.collegeVerifiedAt),
    })),
    isLoading,
  };
}
