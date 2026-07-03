import { getMockDisbursementById } from "./mockDisbursements";
import type { DisbursementDetail } from "./types";

/**
 * Returns the disbursement workspace (conditions checklist, commission line, tranche
 * tracker) for a single loan. Mock-only for now — see `mockDisbursements.ts`.
 */
export function useDisbursementDetail(id: string): {
  data: DisbursementDetail | undefined;
  isLoading: boolean;
} {
  return {
    data: getMockDisbursementById(id),
    isLoading: false,
  };
}
