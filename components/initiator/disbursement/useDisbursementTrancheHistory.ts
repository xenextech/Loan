import { useGetDisbursementHistoryQuery } from "@/lib/api/dashboardApi";
import { formatNPR, formatDate } from "@/lib/formatters";
import type { DisbursementStatus, TrancheStatus } from "@/types/dashboard";

export interface DisbursementTrancheHistoryRow {
  id: string;
  trancheLabel: string;
  amountLabel: string;
  date: string;
  accountCredited: string;
  commissionLabel: string | null;
  status: TrancheStatus;
}

/**
 * This loan's own tranche history — filtered client-side from the global,
 * paginated `/dashboard/disbursement/history` endpoint (there's no per-application
 * filter param on it). `limit` is capped at 100, the backend's `PaginationDto`
 * max (`@Max(100)`) — a higher value fails validation with a 400 and silently
 * yields no data. A given loan typically has only a handful of tranches, so this
 * is reliably complete in practice, unlike the "this month across every loan"
 * aggregate elsewhere in this module.
 */
export function useDisbursementTrancheHistory(applicationId: string, limit = 100): {
  rows: DisbursementTrancheHistoryRow[];
  /** The application's own `Disbursement.status`, or `null` if it has never been disbursed.
   *  Note: the backend only ever writes `PENDING`/`PARTIAL` here — nothing sets it to
   *  `COMPLETED`, so don't gate a "fully disbursed" UI signal on this alone; use
   *  `totalDisbursedAmount` against the application's credit limit instead. */
  disbursementStatus: DisbursementStatus | null;
  /** Running total disbursed so far for this loan, or `null` if never disbursed. */
  totalDisbursedAmount: number | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useGetDisbursementHistoryQuery({ page: 1, limit });

  const rows = (data?.data ?? []).filter((t) => t.disbursement.application.id === applicationId);

  return {
    rows: rows.map((t) => ({
      id: t.id,
      trancheLabel: `Tranche ${t.trancheNumber}`,
      amountLabel: formatNPR(t.amount),
      date: formatDate(t.disbursedAt),
      accountCredited: t.accountCredited ?? "—",
      commissionLabel: t.commissionAmount !== null ? formatNPR(t.commissionAmount) : null,
      status: t.status,
    })),
    disbursementStatus: rows[0]?.disbursement.status ?? null,
    totalDisbursedAmount: rows[0]?.disbursement.totalDisbursedAmount ?? null,
    isLoading,
  };
}
