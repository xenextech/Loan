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
  isError: boolean;
  refetch: () => void;
} {
  const { data, isLoading, isError, refetch } = useGetInitiatorQueueQuery();

  return {
    data: data?.items ?? [],
    isLoading,
    // Surfaced so the queue can distinguish "request failed" from "genuinely
    // zero results" instead of showing the same empty state for both.
    isError,
    refetch,
  };
}
