import { getMockEmiScheduleById } from "./mockEmiSchedules";
import type { EmiScheduleDetail } from "./types";

/**
 * Returns the EMI amortization schedule + overdue accounts view for a single loan.
 * Mock-only for now — see `mockEmiSchedules.ts`.
 */
export function useEmiScheduleDetail(id: string): {
  data: EmiScheduleDetail | undefined;
  isLoading: boolean;
} {
  return {
    data: getMockEmiScheduleById(id),
    isLoading: false,
  };
}
