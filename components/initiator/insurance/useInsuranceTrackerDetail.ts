import { getMockInsuranceTracker } from "./mockInsuranceTracker";
import type { InsuranceTrackerDetail } from "./types";

/**
 * Returns the insurance-tracker portfolio stats + policy list. Mock-only for now —
 * see `mockInsuranceTracker.ts`.
 */
export function useInsuranceTrackerDetail(): {
  data: InsuranceTrackerDetail;
  isLoading: boolean;
} {
  return {
    data: getMockInsuranceTracker(),
    isLoading: false,
  };
}
