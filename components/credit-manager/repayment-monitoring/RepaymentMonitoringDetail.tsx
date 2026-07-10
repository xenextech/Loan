"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileText,
  Wallet,
  CalendarDays,
  Receipt,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CalendarX2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import { useGetRepaymentStatusQuery, useGetEmiScheduleQuery } from "@/lib/api/dashboardApi";
import {
  REPAYMENT_STATUS_BADGE_CLASS,
  REPAYMENT_STATUS_LABEL,
  LOAN_ACCOUNT_STATUS_BADGE_CLASS,
  LOAN_ACCOUNT_STATUS_LABEL,
} from "./monitoringBadges";
import { STATUS_BADGE_CLASS as EMI_STATUS_BADGE_CLASS } from "@/components/initiator/emi-schedule/EmiScheduleDetail";

const SCHEDULE_PAGE_SIZE = 20;

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/** Per-application repayment monitoring view for the Credit Manager — renders
 *  GET /dashboard/repayment/{applicationId}/status (aging counts, outstanding
 *  balance, next due date, penal interest) plus the paginated schedule from
 *  GET /dashboard/repayment/{applicationId}/schedule. */
export function RepaymentMonitoringDetail({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [page, setPage] = useState(1);

  const { data: status, isLoading, error, refetch, isFetching } = useGetRepaymentStatusQuery(id, { skip: !id });
  const { data: schedule, isLoading: scheduleLoading } = useGetEmiScheduleQuery(
    { applicationId: id, page, limit: SCHEDULE_PAGE_SIZE },
    { skip: !id },
  );
  const scheduleRows = schedule?.data ?? [];
  const totalPages = schedule?.meta.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!status) {
    const httpStatus = error && "status" in error ? error.status : undefined;
    const message = httpStatus === 404 ? "Application not found." : "Couldn't load repayment monitoring for this loan.";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}>
            Retry
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/repayment-monitoring`)}>
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  const completionPercent =
    status.totalInstallments > 0 ? Math.round((status.paidInstallments / status.totalInstallments) * 100) : 0;

  const breakdown = [
    { label: "Total", value: status.totalInstallments, dot: "bg-muted-foreground/50" },
    { label: "Paid", value: status.paidInstallments, dot: "bg-[var(--success)]" },
    { label: "Upcoming", value: status.upcomingInstallments, dot: "bg-primary" },
    { label: "Overdue", value: status.overdueInstallments, dot: "bg-destructive" },
    { label: "Partial", value: status.partialInstallments, dot: "bg-[var(--warning)]" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/repayment-monitoring`)}>
        <ArrowLeft className="w-4 h-4" /> Back to list
      </Button>

      {/* Hero — identity, status, progress, and the figures that matter most */}
      <Card
        className={cn(
          "border-border overflow-hidden border-l-4",
          status.repaymentStatus === "OVERDUE"
            ? "border-l-destructive"
            : status.repaymentStatus === "NEEDS_REVIEW"
              ? "border-l-warning"
              : status.repaymentStatus === "CLEARED"
                ? "border-l-primary"
                : "border-l-success",
        )}
      >
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground truncate">{status.borrowerName ?? "—"}</p>
                <p className="text-xs text-muted-foreground font-mono">{status.applicationNumber ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {status.loanAccountStatus && (
                <Badge className={cn(LOAN_ACCOUNT_STATUS_BADGE_CLASS[status.loanAccountStatus], "border-0 font-semibold text-xs")}>
                  {LOAN_ACCOUNT_STATUS_LABEL[status.loanAccountStatus]}
                </Badge>
              )}
              <Badge className={cn(REPAYMENT_STATUS_BADGE_CLASS[status.repaymentStatus], "border-0 font-semibold text-xs")}>
                {REPAYMENT_STATUS_LABEL[status.repaymentStatus]}
              </Badge>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-muted-foreground">Repayment Progress</p>
              <p className="text-xs font-semibold text-foreground">
                {completionPercent}% · {status.paidInstallments}/{status.totalInstallments} installments
              </p>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
            <InfoItem icon={Wallet} label="Outstanding Balance" value={formatNPR(status.outstandingBalance)} />
            <InfoItem icon={Coins} label="Total Repayable" value={formatNPR(status.totalRepayable)} />
            <InfoItem icon={CheckCircle2} label="Total Paid" value={formatNPR(status.totalPaid)} />
            <InfoItem icon={CalendarDays} label="Next Due Date" value={status.nextDueDate ? formatDate(status.nextDueDate) : "—"} />
            <InfoItem
              icon={Receipt}
              label="Next Due Amount"
              value={status.nextDueAmount !== null ? formatNPR(status.nextDueAmount) : "—"}
            />
          </div>
        </CardContent>
      </Card>

      {status.overdueInstallments > 0 && (
        <div className="rounded-lg border-l-4 border-destructive bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-destructive mb-1">
              {status.overdueInstallments} installment{status.overdueInstallments === 1 ? "" : "s"} overdue
            </p>
            <p className="text-sm text-foreground">
              Oldest overdue since {formatDate(status.oldestOverdueDueDate)} — {status.daysOverdue} day{status.daysOverdue === 1 ? "" : "s"} past due.
              Penal interest accrued: <span className="font-semibold">{formatNPR(status.penalInterestAccrued)}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Installment breakdown — a slim reference strip, not competing with the hero above */}
      <Card className="border-border shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-5 divide-x divide-border">
            {breakdown.map((b) => (
              <div key={b.label} className="px-2 py-4 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums">{b.value}</p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", b.dot)} />
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amortization schedule — GET /dashboard/repayment/:applicationId/schedule,
          paginated server-side (same source EmiScheduleDetail uses). */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-bold text-foreground">Installment Schedule</h2>
          {schedule && <p className="text-xs text-muted-foreground">{schedule.meta.total} installment{schedule.meta.total === 1 ? "" : "s"}</p>}
        </div>
        {scheduleLoading ? (
          <Skeleton className="h-52 rounded-lg" />
        ) : scheduleRows.length === 0 ? (
          <Card className="border-border shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <CalendarX2 className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No schedule generated for this application yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-none">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border bg-muted/40">
                      <TableHead className="text-xs pl-5">#</TableHead>
                      <TableHead className="text-xs">Due Date</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Principal</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Interest</TableHead>
                      <TableHead className="text-xs">EMI</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Balance</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Penal Interest</TableHead>
                      <TableHead className="text-xs text-right pr-5">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleRows.map((entry) => (
                      <TableRow key={entry.id} className="border-border">
                        <TableCell className="pl-5 text-xs text-muted-foreground">{entry.installmentNumber}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(entry.dueDate)}</TableCell>
                        <TableCell className="text-xs text-foreground hidden sm:table-cell">{formatNPR(entry.principalComponent)}</TableCell>
                        <TableCell className="text-xs text-foreground hidden sm:table-cell">{formatNPR(entry.interestComponent)}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{formatNPR(entry.emiAmount)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{formatNPR(entry.outstandingPrincipal)}</TableCell>
                        <TableCell className="text-xs font-semibold text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] hidden md:table-cell">
                          {entry.penalInterestAccrued > 0 ? formatNPR(entry.penalInterestAccrued) : "—"}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Badge className={cn(EMI_STATUS_BADGE_CLASS[entry.status], "border-0 text-[10px] font-semibold")}>{entry.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
