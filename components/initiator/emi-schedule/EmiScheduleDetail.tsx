"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import { useInitiatorApplicationDetail } from "@/components/initiator/hooks/useInitiatorApplicationDetail";
import { useEmiScheduleDetail } from "./useEmiScheduleDetail";
import { buildAmortizationSchedule, SHARED_FIELDS } from "./mockEmiSchedules";
import type { EmiScheduleDetail as EmiScheduleDetailData, OverdueBucket } from "./types";

const BUCKET_BADGE_CLASS: Record<OverdueBucket, string> = {
  "1-30d bucket": "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  "31-90d bucket": "bg-[var(--warning)]/20 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  "Near NPA": "bg-destructive/10 text-destructive",
};

const DEFAULT_RATE_PERCENT = 9.0;
const DEFAULT_TERM_MONTHS = 60;

export function EmiScheduleDetail({ id }: { id: string }) {
  const router = useRouter();

  // The EMI schedule demo dataset is mock-only (no backend yet for amortization or
  // repayment tracking). Real application IDs fall through to the real initiator-detail
  // endpoint below, rendered with a generic amortization scaffold built off the real
  // loan amount.
  const { data: mockDetail, isLoading: mockLoading } = useEmiScheduleDetail(id);
  const {
    data: realDetail,
    isLoading: realLoading,
    errorStatus,
  } = useInitiatorApplicationDetail(mockDetail ? "" : id);

  if (mockLoading || (!mockDetail && realLoading)) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!mockDetail && !realDetail) {
    const message =
      errorStatus === 404
        ? "This application has no initiator record yet — it may not have been picked up for review."
        : errorStatus !== undefined
          ? `Couldn't load this application (error ${errorStatus}). Please try again.`
          : "EMI schedule not found";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/initiator/emi-schedule")}>
          Back to list
        </Button>
      </div>
    );
  }

  const detail: EmiScheduleDetailData = mockDetail
    ? mockDetail
    : {
        id: realDetail!.id,
        loanRef: realDetail!.applicationNumber,
        borrowerName: realDetail!.studentName,
        amountLabel: formatNPR(realDetail!.loanAmount),
        termMonths: DEFAULT_TERM_MONTHS,
        emiLabel: formatNPR(realDetail!.loanAmount / DEFAULT_TERM_MONTHS),
        rateLabel: `${DEFAULT_RATE_PERCENT.toFixed(2)}%`,
        startDateLabel: "Not yet disbursed",
        endDateLabel: "—",
        schedule: buildAmortizationSchedule(realDetail!.loanAmount, DEFAULT_RATE_PERCENT, DEFAULT_TERM_MONTHS, new Date()),
        ...SHARED_FIELDS,
      };
  const isMockDemo = !!mockDetail;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/emi-schedule")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">EMI Schedule and Repayment</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Education Loan Repayment</p>
      </div>

      {!isMockDemo && (
        <p className="text-xs text-muted-foreground -mt-3">
          This loan hasn&apos;t been disbursed yet, so the schedule below is illustrative — built from the requested
          loan amount at a placeholder rate/term until real terms and a repayment-tracking API exist.
        </p>
      )}

      {/* Portfolio stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">EMI due today</p>
          <p className="text-2xl font-bold text-foreground">{detail.emiDueTodayLabel}</p>
          <p className="text-xs text-[oklch(0.42_0.18_145)] dark:text-success mt-0.5">{detail.emiDueTodayAccounts} accounts</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Overdue 1-30 days</p>
          <p className="text-2xl font-bold text-destructive">{detail.overdue1to30Label}</p>
          <p className="text-xs text-destructive mt-0.5">{detail.overdue1to30Accounts} accounts</p>
        </div>
      </div>

      {/* EMI schedule for this loan */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">EMI schedule — {detail.loanRef}</h3>
          <p className="text-xs text-muted-foreground">
            {detail.borrowerName} · {detail.amountLabel} · {detail.termMonths} months
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
          <span>
            <span className="font-semibold text-foreground">EMI:</span> {detail.emiLabel}
          </span>
          <span>
            <span className="font-semibold text-foreground">Rate:</span> {detail.rateLabel}
          </span>
          <span>
            <span className="font-semibold text-foreground">Start:</span> {detail.startDateLabel}
          </span>
          <span>
            <span className="font-semibold text-foreground">End:</span> {detail.endDateLabel}
          </span>
        </div>

        <div className="overflow-auto max-h-96 border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs pl-3">#</TableHead>
                <TableHead className="text-xs">Due date</TableHead>
                <TableHead className="text-xs text-right">Principal</TableHead>
                <TableHead className="text-xs text-right">Interest</TableHead>
                <TableHead className="text-xs text-right">EMI</TableHead>
                <TableHead className="text-xs text-right">Balance</TableHead>
                <TableHead className="text-xs pr-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.schedule.map((row) => (
                <TableRow key={row.installmentNo} className="border-border">
                  <TableCell className="text-xs text-muted-foreground pl-3">{row.installmentNo}</TableCell>
                  <TableCell className="text-xs text-foreground">{row.dueDateLabel}</TableCell>
                  <TableCell className="text-xs text-right text-foreground">{row.principal.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right text-foreground">{row.interest.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right font-semibold text-foreground">{row.emi.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">{row.balance.toLocaleString()}</TableCell>
                  <TableCell className="pr-3">
                    {row.status !== "—" ? (
                      <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold">{row.status}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Auto-generates full {detail.termMonths}-month amortization. Penal interest @2% above contracted rate applied
          on overdue days per NRB directive.
        </p>
      </div>

      {/* Overdue accounts */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Overdue accounts</h3>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Loan ref</TableHead>
              <TableHead className="text-xs">Borrower</TableHead>
              <TableHead className="text-xs">EMI</TableHead>
              <TableHead className="text-xs">Overdue days</TableHead>
              <TableHead className="text-xs">Penal int.</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.overdueAccounts.map((account) => (
              <TableRow key={account.id} className="border-border">
                <TableCell className="text-xs font-mono font-semibold text-foreground">{account.loanRef}</TableCell>
                <TableCell className="text-sm text-foreground">{account.borrowerName}</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{account.emiLabel}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{account.overdueDays}d</TableCell>
                <TableCell className="text-xs text-muted-foreground">{account.penalInterestLabel}</TableCell>
                <TableCell>
                  <Badge className={cn(BUCKET_BADGE_CLASS[account.bucket], "border-0 text-[10px] font-semibold")}>{account.bucket}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    {account.actionLabel}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30 px-4 py-2.5">
          <p className="text-xs text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]">
            NRB reclassification: &gt;90 days → Substandard. &gt;180d → Doubtful. &gt;365d → Loss. Provision: 25% / 50%
            / 100%.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
