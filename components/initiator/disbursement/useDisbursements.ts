import { useGetDisbursementPendingQuery } from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { DisbursementListRow } from "./types";

/** Approved applications not yet fully disbursed — GET /dashboard/disbursement/pending. */
export function useDisbursements(page = 1, limit = 20): {
  data: DisbursementListRow[];
  isLoading: boolean;
  total: number;
} {
  const { data, isLoading } = useGetDisbursementPendingQuery({ page, limit });

  return {
    data: (data?.data ?? []).map((row) => ({
      id: row.applicationId,
      refNo: row.refNo ?? "—",
      borrowerName: row.borrower ?? "—",
      amountLabel: row.amount !== null ? formatNPR(row.amount) : "—",
      conditionsDone: row.conditionsDone,
      conditionsTotal: row.conditionsTotal,
      status: row.status,
    })),
    isLoading,
    total: data?.meta.total ?? 0,
  };
}
