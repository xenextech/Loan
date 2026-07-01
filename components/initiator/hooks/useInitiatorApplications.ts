import { getMockInitiatorApplications } from "../mock/mockApplications";
import type { InitiatorApplicationListItem } from "../types/initiator";

/**
 * Returns the list of applications verified by a college, awaiting
 * Initiator review. Shaped like an RTK Query hook (`{ data, isLoading }`)
 * so it can be swapped for `useGetInitiatorApplicationsQuery` once the
 * backend endpoint exists, without touching call sites.
 */
export function useInitiatorApplications(): {
  data: InitiatorApplicationListItem[];
  isLoading: boolean;
} {
  return {
    data: getMockInitiatorApplications(),
    isLoading: false,
  };
}
