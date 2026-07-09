import { useGetInitiatorQueueQuery } from "@/lib/api/initiatorApi";
import type { InitiatorApplicationListItem } from "../types/initiator";

/**
 * Returns the Initiator's work queue — college-verified applications awaiting
 * review, plus Initiator-created applications (which never go through college
 * verification) — backed by GET /applications/initiator/queue.
 */
export function useInitiatorApplications(): {
  data: InitiatorApplicationListItem[];
  isLoading: boolean;
} {
  const { data, isLoading } = useGetInitiatorQueueQuery();

  return {
    data: data?.items ?? [],
    isLoading,
  };
}
