import { getMockSupporterApplications } from "../mock/mockSupporterApplications";
import type { SupporterApplicationListItem } from "../types/supporter";

/**
 * Returns the list of applications approved by the Initiator, awaiting
 * Support review. Shaped like an RTK Query hook (`{ data, isLoading }`) so it
 * can be swapped for `useGetSupporterApplicationsQuery` once the backend
 * endpoint exists, without touching call sites.
 */
export function useSupporterApplications(): {
  data: SupporterApplicationListItem[];
  isLoading: boolean;
} {
  return {
    data: getMockSupporterApplications(),
    isLoading: false,
  };
}
