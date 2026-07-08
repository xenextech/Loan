"use client";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { ArrowLeft, FileText, AlertTriangle, Users, GraduationCap, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetApplicationFullDetailQuery,
  useGetEmiNotificationTriggersQuery,
} from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import { useDisbursementTrancheHistory } from "@/components/initiator/disbursement/useDisbursementTrancheHistory";
import StudentInfoCard from "@/components/initiator/components/StudentInfoCard";
import ParentVerificationCard from "@/components/initiator/components/ParentVerificationCard";
import CollegeReviewCard from "@/components/initiator/components/CollegeReviewCard";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import { NRB_CLASS_LABEL, NRB_CLASS_BADGE_CLASS } from "@/components/initiator/emi-schedule/nrbClassificationBadge";
import { useLoanHealth } from "./hooks/useLoanHealth";
import LoanServicingPanel from "./loan-servicing/LoanServicingPanel";

const TRANCHE_STATUS_CLASS: Record<string, string> = {
  CREDITED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  PENDING: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  FAILED: "bg-destructive/10 text-destructive",
};

const LOAN_ACCOUNT_STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  CLEARED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  NEEDS_REVIEW: "bg-destructive/10 text-destructive",
};

const LOAN_ACCOUNT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  CLEARED: "Cleared",
  NEEDS_REVIEW: "Needs Review",
};

export default function CreditManagerLoanDetail({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: initiatorDetail, isLoading: initiatorLoading } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });
  const { data: fullDetail, isLoading: fullDetailLoading } = useGetApplicationFullDetailQuery({ applicationId: id }, { skip: !id });
  const { rows: trancheRows, isLoading: trancheLoading } = useDisbursementTrancheHistory(id);
  const { data: triggers } = useGetEmiNotificationTriggersQuery();
  const { health, actionsNeeded } = useLoanHealth(id, application?.nrbClassification);

  const isLoading = appLoading || initiatorLoading || fullDetailLoading;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!application || !initiatorDetail) {
    const status = appError && "status" in appError ? appError.status : undefined;
    const message = status === 404 ? "Application not found." : "Couldn't load this loan. Please try again.";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/applications`)}>
          Back to portfolio
        </Button>
      </div>
    );
  }

  const nrbClassification = application.nrbClassification ?? "PASS";
  const outstandingBalance = health.outstandingBalance ?? application.creditLimit ?? 0;
  const tenureLabel = application.period
    ? `${application.period} ${application.periodUnit === "YEAR" ? (application.period === 1 ? "year" : "years") : application.period === 1 ? "month" : "months"}`
    : "—";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/applications`)}>
        <ArrowLeft className="w-4 h-4" /> Back to portfolio
      </Button>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-lg font-bold text-foreground font-mono">{application.applicationNumber}</h1>
          <span className="text-sm text-muted-foreground truncate">— {application.fullName ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {fullDetail?.loanAccount && (
            <Badge className={cn(LOAN_ACCOUNT_STATUS_CLASS[fullDetail.loanAccount.status], "border-0 font-semibold text-xs")}>
              {LOAN_ACCOUNT_STATUS_LABEL[fullDetail.loanAccount.status]}
            </Badge>
          )}
          <Badge className={cn(NRB_CLASS_BADGE_CLASS[nrbClassification], "border-0 font-semibold text-xs")}>
            {NRB_CLASS_LABEL[nrbClassification]}
          </Badge>
          <Badge className={cn(application.stage ? STAGE_BADGE_CLASS[application.stage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {application.stage ? STAGE_LABEL[application.stage] : NO_STAGE_LABEL}
          </Badge>
        </div>
      </div>

      {actionsNeeded.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">Action Needed</h2>
          <div className="flex flex-wrap gap-2">
            {actionsNeeded.map((action) => (
              <span
                key={action.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                  action.severity === "high" ? "bg-destructive/10 text-destructive" : "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> {action.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Loan details */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Loan Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Loan Amount</p>
            <p className="text-sm font-semibold text-foreground">{formatNPR(application.creditLimit ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="text-sm font-semibold text-foreground">{application.interestRate !== undefined && application.interestRate !== null ? `${application.interestRate}%` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EMI Amount</p>
            <p className="text-sm font-semibold text-foreground">{health.emiAmount !== null ? formatNPR(health.emiAmount) : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Loan Tenure</p>
            <p className="text-sm font-semibold text-foreground">{tenureLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Grace Period</p>
            <p className="text-sm font-semibold text-foreground">
              {fullDetail?.loanAccount ? `${fullDetail.loanAccount.gracePeriodMonths} month(s)` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            <p className="text-sm font-semibold text-foreground">{formatNPR(outstandingBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">DSGIR</p>
            <p className="text-sm font-semibold text-foreground">{application.dsgir !== null && application.dsgir !== undefined ? `${application.dsgir}%` : "Not assessed"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">LTV</p>
            <p className="text-sm font-semibold text-foreground">{application.loanToValueRatio !== null && application.loanToValueRatio !== undefined ? `${application.loanToValueRatio}%` : "Not assessed"}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Installment progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-bold text-foreground">Installment Progress</h2>
          {health.dpd > 0 && (
            <Badge className="bg-destructive/10 text-destructive border-0 text-xs font-semibold">{health.dpd} days past due</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Progress value={health.completionPercent} className="h-2" />
          <span className="text-xs font-semibold text-muted-foreground shrink-0 w-10 text-right">{health.completionPercent}%</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Installments</p>
            <p className="text-sm font-semibold text-foreground">{health.totalInstallments}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-sm font-semibold text-foreground">{health.paidInstallments}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-sm font-semibold text-foreground">{health.remainingInstallments}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Due Date</p>
            <p className="text-sm font-semibold text-foreground">{health.nextDueDate ? formatDate(health.nextDueDate) : "—"}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Last payment: {health.lastPaymentDate ? formatDate(health.lastPaymentDate) : "No payments recorded yet"}</p>
      </div>

      <Separator />

      {/* Loan Servicing */}
      <LoanServicingPanel
        applicationId={id}
        loanAccount={fullDetail?.loanAccount}
        disbursementAmount={fullDetail?.disbursement?.totalDisbursedAmount ?? application.creditLimit ?? null}
      />

      <Separator />

      {/* Student / Parent / College */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Student Information</h2>
        </div>
        <StudentInfoCard student={initiatorDetail.studentInfo} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Parent / Guardian Information</h2>
        </div>
        <ParentVerificationCard verification={initiatorDetail.parentVerification} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <School className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">College Information</h2>
        </div>
        <CollegeReviewCard verification={initiatorDetail.collegeVerification} />
      </div>

      <Separator />

      {/* Disbursement / tranche history */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Disbursement History</h2>
        {trancheLoading ? (
          <Skeleton className="h-16 rounded-lg" />
        ) : trancheRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tranches disbursed yet for this loan.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Tranche</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">A/C credited</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trancheRows.map((t) => (
                <TableRow key={t.id} className="border-border">
                  <TableCell className="py-2.5 text-sm text-foreground">{t.trancheLabel}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground">{t.date}</TableCell>
                  <TableCell className="py-2.5 text-sm text-foreground">{t.amountLabel}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground hidden sm:table-cell">{t.accountCredited}</TableCell>
                  <TableCell className="py-2.5 text-right">
                    <Badge className={cn(TRANCHE_STATUS_CLASS[t.status], "border-0 text-[10px] font-semibold")}>{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Notification reference */}
      {triggers && triggers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Parent &amp; Student Notification Schedule</h2>
          <p className="text-xs text-muted-foreground">
            System-wide reminder rules (not configurable per loan) — the actual channel used per reminder is SMS + WhatsApp where a phone number is on file.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {triggers.map((t) => (
              <li key={t.trigger} className="flex items-center justify-between gap-3 text-xs px-3 py-2 rounded-lg bg-muted/40">
                <span className="font-medium text-foreground">{t.trigger}</span>
                <span className="text-muted-foreground">{t.messageType}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
