import { getMockApprovalApplicationById } from "./mockApprovalApplications";
import type { ApprovalDetail } from "./types";

/**
 * Returns the full approval-workflow detail (stage-by-stage decisions, credit scoring
 * breakdown, NRB compliance checklist, activity trail) for a single application. Shaped
 * like an RTK Query hook (`{ data, isLoading }`) so it can be swapped for a real endpoint
 * later without touching call sites.
 */
export function useApprovalApplicationDetail(id: string): {
  data: ApprovalDetail | undefined;
  isLoading: boolean;
} {
  return {
    data: getMockApprovalApplicationById(id),
    isLoading: false,
  };
}
