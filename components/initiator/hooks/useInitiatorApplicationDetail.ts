import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import type { InitiatorApplicationDetail } from "../types/initiator";

/**
 * Returns the full application detail (student info + college verification
 * + documents) for the review page — backed by GET /applications/:id/initiator.
 */
export function useInitiatorApplicationDetail(id: string): {
  data: InitiatorApplicationDetail | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });

  return {
    data,
    isLoading,
  };
}
