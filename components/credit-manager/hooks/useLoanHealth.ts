import { useGetEmiScheduleQuery } from "@/lib/api/dashboardApi";
import { useDisbursementTrancheHistory } from "@/components/initiator/disbursement/useDisbursementTrancheHistory";
import { NRB_CLASS_LABEL } from "@/components/initiator/emi-schedule/nrbClassificationBadge";
import type { NrbLoanClassification } from "@/types/dashboard";
import type { CreditManagerLoanHealth, LoanActionNeeded } from "../types/creditManager";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Per-loan repayment health — derived client-side from this loan's own EMI
 * schedule and disbursement history (both already fetched per-loan elsewhere
 * in the app, so this adds no N+1 concern beyond the two queries a single
 * loan's detail page already needs). Nothing here is a fabricated number —
 * every figure traces back to real `EmiScheduleEntry`/`DisbursementTranche` rows.
 */
export function useLoanHealth(applicationId: string, nrbClassification: NrbLoanClassification | undefined): {
  health: CreditManagerLoanHealth;
  actionsNeeded: LoanActionNeeded[];
} {
  const { data: schedule, isLoading: scheduleLoading } = useGetEmiScheduleQuery({ applicationId, page: 1, limit: 100 });
  const { disbursementStatus, isLoading: disbursementLoading } = useDisbursementTrancheHistory(applicationId);

  const entries = schedule?.data ?? [];
  const totalInstallments = entries.length;
  const paidEntries = entries.filter((e) => e.status === "PAID");
  const paidInstallments = paidEntries.length;
  const remainingInstallments = totalInstallments - paidInstallments;
  const completionPercent = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;

  const upcoming = entries
    .filter((e) => e.status === "UPCOMING" || e.status === "PARTIAL" || e.status === "OVERDUE")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const nextDueDate = upcoming[0]?.dueDate ?? null;

  const paidSortedByDate = [...paidEntries].filter((e) => e.paidDate).sort(
    (a, b) => new Date(b.paidDate as string).getTime() - new Date(a.paidDate as string).getTime(),
  );
  const lastPaymentDate = paidSortedByDate[0]?.paidDate ?? null;

  // outstandingPrincipal on an entry is the balance remaining *after* that
  // installment — so the highest-numbered PAID entry's value is the loan's
  // real current outstanding balance. Null (no payments yet) lets the caller
  // fall back to the full credit limit.
  const highestPaid = [...paidEntries].sort((a, b) => b.installmentNumber - a.installmentNumber)[0];
  const outstandingBalance = highestPaid?.outstandingPrincipal ?? null;

  const overdueSorted = entries
    .filter((e) => e.status === "OVERDUE")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const dpd = overdueSorted[0] ? Math.floor((new Date().getTime() - new Date(overdueSorted[0].dueDate).getTime()) / MS_PER_DAY) : 0;

  const emiAmount = entries[0]?.emiAmount ?? null;

  const actionsNeeded: LoanActionNeeded[] = [];
  if (dpd > 0) {
    actionsNeeded.push({ label: `Overdue ${dpd} day${dpd === 1 ? "" : "s"}`, severity: dpd >= 90 ? "high" : "medium" });
  }
  if (nrbClassification && nrbClassification !== "PASS") {
    actionsNeeded.push({ label: `NRB classification: ${NRB_CLASS_LABEL[nrbClassification]}`, severity: "high" });
  }
  if (totalInstallments === 0) {
    actionsNeeded.push({ label: "EMI schedule not generated", severity: "medium" });
  }
  if (disbursementStatus === null) {
    actionsNeeded.push({ label: "Disbursement not yet started", severity: "medium" });
  }

  return {
    health: {
      totalInstallments,
      paidInstallments,
      remainingInstallments,
      completionPercent,
      nextDueDate,
      lastPaymentDate,
      outstandingBalance,
      dpd,
      emiAmount,
      isLoading: scheduleLoading || disbursementLoading,
    },
    actionsNeeded,
  };
}
