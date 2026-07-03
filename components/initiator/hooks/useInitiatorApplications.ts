import { useGetCollegeVerifiedApplicationsQuery } from "@/lib/api/initiatorApi";
import type { InitiatorApplicationListItem } from "../types/initiator";

/**
 * Returns the list of applications verified by a college, awaiting
 * Initiator review — backed by GET /applications/initiator/college-verified.
 */
export function useInitiatorApplications(): {
  data: InitiatorApplicationListItem[];
  isLoading: boolean;
} {
  const { data, isLoading } = useGetCollegeVerifiedApplicationsQuery();

  return {
    data: data?.items ?? [],
    isLoading,
  };
}
