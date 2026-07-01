import { getMockInitiatorApplicationById } from "../mock/mockApplications";
import type { InitiatorApplicationDetail } from "../types/initiator";

/**
 * Returns the full application detail (student info + college verification
 * + initiator verification) for the details page. Shaped like an RTK Query
 * hook so it can be swapped for `useGetInitiatorApplicationDetailQuery(id)`
 * once the backend endpoint exists.
 */
export function useInitiatorApplicationDetail(id: string): {
  data: InitiatorApplicationDetail | undefined;
  isLoading: boolean;
} {
  return {
    data: getMockInitiatorApplicationById(id),
    isLoading: false,
  };
}
