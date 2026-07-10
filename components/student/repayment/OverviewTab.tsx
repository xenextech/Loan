import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import type { RepaymentTrackerData } from "@/types/api";
import {
  REPAYMENT_STATUS_BADGE_CLASS,
  REPAYMENT_STATUS_LABEL,
} from "./repaymentBadges";
import {
  Wallet,
  Banknote,
  Percent,
  CalendarClock,
  Hourglass,
  Receipt,
  CalendarDays,
  Timer,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="px-5 py-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-xl font-bold text-foreground tabular-nums mb-0.5">
          {value}
        </p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {sub && (
          <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

function daysRemainingLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) return "—";
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} overdue`;
  if (daysRemaining === 0) return "Due today";
  return `Due in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
}

export function OverviewTab({ repayment }: { repayment: RepaymentTrackerData }) {
  const { loanSummary, nextPayment, progress, schedule } = repayment;
  // All installments carry the same EMI amount except (occasionally) the
  // last one — nextPayment.amount is the accurate "next" figure, falling
  // back to the first schedule row once every installment is settled (no
  // "next" unpaid entry left).
  const emiAmount = nextPayment.amount ?? schedule[0]?.emiAmount ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Loan Amount" value={formatNPR(loanSummary.approvedAmount)} />
        <StatCard icon={Banknote} label="Final Disbursement Amount" value={formatNPR(loanSummary.finalDisbursementAmount)} />
        <StatCard icon={Percent} label="Interest Rate" value={`${loanSummary.interestRate}%`} sub={loanSummary.interestFrequency} />
        <StatCard icon={CalendarClock} label="Loan Tenure" value={`${loanSummary.tenureMonths} months`} />
        <StatCard icon={Hourglass} label="Grace Period" value={`${loanSummary.gracePeriodMonths} months`} />
        <StatCard icon={Receipt} label="EMI Amount" value={emiAmount !== null ? formatNPR(emiAmount) : "—"} sub={loanSummary.repaymentFrequency} />
        <StatCard icon={Wallet} label="Total Repayment Amount" value={formatNPR(loanSummary.totalRepayable)} />
        <StatCard icon={Wallet} label="Outstanding Balance" value={formatNPR(progress.outstandingBalance)} />
        <StatCard icon={CalendarDays} label="Next EMI Date" value={formatDate(nextPayment.dueDate)} sub={daysRemainingLabel(nextPayment.daysRemaining)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-foreground">Repayment Progress</h3>
              <Badge className={cn(REPAYMENT_STATUS_BADGE_CLASS[nextPayment.status], "border-0 font-semibold")}>
                {REPAYMENT_STATUS_LABEL[nextPayment.status]}
              </Badge>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {progress.paidInstallments} of {progress.totalInstallments} installments paid
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {progress.totalInstallments > 0
                    ? Math.round((progress.paidInstallments / progress.totalInstallments) * 100)
                    : 0}
                  %
                </p>
              </div>
              <Progress
                value={progress.totalInstallments > 0 ? (progress.paidInstallments / progress.totalInstallments) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Remaining Installments</p>
                <p className="text-sm font-semibold text-foreground">{progress.remainingInstallments}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-sm font-semibold text-foreground">{formatNPR(progress.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Next Payment</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(nextPayment.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-semibold text-foreground">
                  {nextPayment.amount !== null ? formatNPR(nextPayment.amount) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Days Until Due</p>
                <p className="text-sm font-semibold text-foreground">{daysRemainingLabel(nextPayment.daysRemaining)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>
                <p className="text-sm font-semibold text-foreground">{REPAYMENT_STATUS_LABEL[nextPayment.status]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
