import { getMockSupporterApplicationById } from "../mock/mockSupporterApplications";
import type { SupporterApplicationDetail } from "../types/supporter";

/**
 * Returns the full application detail (student info + college verification +
 * the Initiator's complete Loan Assessment) for the Support review page.
 * Shaped like an RTK Query hook so it can be swapped for
 * `useGetSupporterApplicationDetailQuery(id)` once the backend endpoint exists.
 */
export function useSupporterApplicationDetail(id: string): {
  data: SupporterApplicationDetail | undefined;
  isLoading: boolean;
} {
  return {
    data: getMockSupporterApplicationById(id),
    isLoading: false,
  };
}
