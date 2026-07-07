import { useGetDisbursementHistoryQuery } from "@/lib/api/dashboardApi";
import { formatNPR, formatDate } from "@/lib/formatters";
import type { TrancheStatus } from "@/types/dashboard";

/** Row shown in the "Disbursement tracker" — recent tranches across every loan,
 *  GET /dashboard/disbursement/history. */
export interface DisbursementTrackerRow {
  id: string;
  date: string;
  refNo: string;
  borrowerName: string;
  trancheLabel: string;
  amountLabel: string;
  accountCredited: string;
  status: TrancheStatus;
}

export function useDisbursementTracker(limit = 5): {
  data: DisbursementTrackerRow[];
  isLoading: boolean;
} {
  const { data, isLoading } = useGetDisbursementHistoryQuery({ page: 1, limit });

  return {
    data: (data?.data ?? []).map((tranche) => ({
      id: tranche.id,
      date: formatDate(tranche.disbursedAt),
      refNo: tranche.disbursement.application.applicationNumber,
      borrowerName: tranche.disbursement.application.fullName ?? "—",
      trancheLabel: `Tranche ${tranche.trancheNumber}`,
      amountLabel: formatNPR(tranche.amount),
      accountCredited: tranche.accountCredited ?? "—",
      status: tranche.status,
    })),
    isLoading,
  };
}
