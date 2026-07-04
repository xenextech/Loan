import { getMockCommission } from "./mockCommission";
import type { CommissionDetail } from "./types";

/**
 * Returns the commission-management dashboard (bank/college commission, follow-up
 * commission, NRB cap exposure). Mock-only for now — see `mockCommission.ts`.
 */
export function useCommissionDetail(): {
  data: CommissionDetail;
  isLoading: boolean;
} {
  return {
    data: getMockCommission(),
    isLoading: false,
  };
}
