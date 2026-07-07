import { useGetDisbursementHistoryQuery } from "@/lib/api/dashboardApi";
import { formatNPRShort } from "@/lib/formatters";

/**
 * Best-effort "this month" disbursement summary — computed client-side from the
 * paginated tranche-history endpoint (no dedicated monthly-aggregate endpoint
 * exists on the backend). Known limitations, accepted deliberately:
 *  - `limit` is capped at 100, the backend's `PaginationDto` max (`@Max(100)`) —
 *    a higher value fails validation with a 400 and silently yields no data.
 *    A month with more tranches than that will undercount.
 *  - `accountCredited` is free text, not a structured destination field, so the
 *    college-vs-borrower split is a case-insensitive text match on "college" —
 *    anything else (including empty) is bucketed as "direct to borrower".
 */
export function useDisbursementMonthlyStats(limit = 100): {
  totalDisbursedLabel: string;
  loanCount: number;
  toCollegeLabel: string;
  toBorrowerLabel: string;
  isLoading: boolean;
} {
  const { data, isLoading } = useGetDisbursementHistoryQuery({ page: 1, limit });

  const now = new Date();
  const thisMonth = (data?.data ?? []).filter((tranche) => {
    if (tranche.status !== "CREDITED" || !tranche.disbursedAt) return false;
    const d = new Date(tranche.disbursedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const loanIds = new Set(thisMonth.map((t) => t.disbursement.application.id));
  const totalDisbursed = thisMonth.reduce((sum, t) => sum + t.amount, 0);
  const toCollege = thisMonth
    .filter((t) => t.accountCredited?.toLowerCase().includes("college"))
    .reduce((sum, t) => sum + t.amount, 0);
  const toBorrower = totalDisbursed - toCollege;

  return {
    totalDisbursedLabel: formatNPRShort(totalDisbursed),
    loanCount: loanIds.size,
    toCollegeLabel: formatNPRShort(toCollege),
    toBorrowerLabel: formatNPRShort(toBorrower),
    isLoading,
  };
}
