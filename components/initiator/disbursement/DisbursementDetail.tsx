"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import { ArrowLeft, FileText, Check, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import { useInitiatorApplicationDetail } from "@/components/initiator/hooks/useInitiatorApplicationDetail";
import { useDisbursementDetail } from "./useDisbursementDetail";
import { getMockDisbursements, getMockTrancheHistory, getMockMonthlyStats } from "./mockDisbursements";
import { DEFAULT_CONDITIONS } from "./defaultDisbursementConditions";
import type { DisbursementDetail as DisbursementDetailData, DisbursementStatus } from "./types";

const STATUS_BADGE_CLASS: Record<DisbursementStatus, string> = {
  Ready: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  Conditions: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Blocked: "bg-destructive/10 text-destructive",
};

const TRANCHE_STATUS_CLASS: Record<string, string> = {
  Confirmed: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  "Pending ack": "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
};

/** "Rs 7,10,000" — Nepali/Indian digit grouping (3, then 2s), matching the reference voucher. */
const toNepaliGrouped = (n: number): string => {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${last3}`;
};

export function DisbursementDetail({ id }: { id: string }) {
  const router = useRouter();

  // The disbursement demo dataset is mock-only (no backend yet for conditions tracking,
  // commission accrual, or tranche history). Real application IDs fall through to the real
  // initiator-detail endpoint below, rendered with a generic conditions/commission scaffold.
  const { data: mockDetail, isLoading: mockLoading } = useDisbursementDetail(id);
  const {
    data: realDetail,
    isLoading: realLoading,
    errorStatus,
  } = useInitiatorApplicationDetail(mockDetail ? "" : id);
  const [confirmed, setConfirmed] = useState(false);

  if (mockLoading || (!mockDetail && realLoading)) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!mockDetail && !realDetail) {
    const message =
      errorStatus === 404
        ? "This application has no initiator record yet — it may not have been picked up for review."
        : errorStatus !== undefined
          ? `Couldn't load this application (error ${errorStatus}). Please try again.`
          : "Disbursement not found";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/initiator/disbursment")}>
          Back to list
        </Button>
      </div>
    );
  }

  const detail: DisbursementDetailData = mockDetail
    ? mockDetail
    : {
        id: realDetail!.id,
        loanRef: realDetail!.applicationNumber,
        borrowerName: realDetail!.studentName,
        amountLabel: formatNPR(realDetail!.loanAmount),
        amountValue: realDetail!.loanAmount,
        statusHeaderLabel: "Awaiting conditions verification",
        conditions: DEFAULT_CONDITIONS,
        commissionLabel: `Commission: Rs ${toNepaliGrouped(realDetail!.loanAmount * 0.001)} (0.1% of ${formatNPR(realDetail!.loanAmount)} per MOU) → credited to Unnati on disbursement`,
        otherPending: getMockDisbursements(),
        tracker: getMockTrancheHistory(),
        monthlyStats: getMockMonthlyStats(),
      };
  const isMockDemo = !!mockDetail;

  const allDone = detail.conditions.every((c) => c.done);

  const handleConfirm = () => {
    setConfirmed(true);
    toast.success(`Disbursement of Rs ${toNepaliGrouped(detail.amountValue)} confirmed for ${detail.loanRef}.`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8  space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/disbursment")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Disbursement</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Education Loan Disbursement</p>
      </div>

      {!isMockDemo && (
        <p className="text-xs text-muted-foreground -mt-3">
          Conditions, commission, and tranche history shown below are illustrative — this application isn&apos;t backed
          by a real disbursement-tracking API yet.
        </p>
      )}

      {/* Pending disbursements */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Pending disbursements</h3>
          <p className="text-xs text-muted-foreground">{detail.statusHeaderLabel}</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Loan ref</TableHead>
                <TableHead className="text-xs">Borrower</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Conditions</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.otherPending.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("border-border cursor-pointer hover:bg-muted/40", row.id === detail.id && "bg-muted/30")}
                  onClick={() => row.id !== detail.id && router.push(`/initiator/disbursment/${row.id}`)}
                >
                  <TableCell className="text-xs font-mono font-semibold text-foreground">{row.loanRef}</TableCell>
                  <TableCell className="text-sm text-foreground">{row.borrowerName}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{row.amountLabel}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.conditionsLabel}</TableCell>
                  <TableCell>
                    <Badge className={cn(STATUS_BADGE_CLASS[row.status], "border-0 text-[10px] font-semibold")}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/initiator/disbursment/${row.id}`);
                      }}
                    >
                      {row.status === "Ready" && row.id !== detail.id ? "Disburse" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Disbursement conditions for this loan */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Disbursement conditions — {detail.loanRef}</h3>
          <p className="text-xs text-muted-foreground">
            {detail.borrowerName} · {detail.amountLabel}
          </p>
        </div>

        <ul className="space-y-2 mb-5">
          {detail.conditions.map((condition) => (
            <li key={condition.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 min-w-0">
                {condition.done ? (
                  <Check className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                )}
                <span className={cn("truncate", condition.done ? "text-foreground" : "text-muted-foreground")}>{condition.label}</span>
              </span>
              <Badge
                className={cn(
                  condition.done ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success" : "bg-muted text-muted-foreground",
                  "border-0 text-[10px] font-semibold shrink-0",
                )}
              >
                {condition.done ? "Done" : "Pending"}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            disabled={!allDone || confirmed}
            className="flex-1 w-full gap-1.5 bg-[oklch(0.42_0.18_145)] hover:bg-[oklch(0.36_0.18_145)] text-white h-11 disabled:opacity-60"
            onClick={handleConfirm}
          >
            {confirmed ? "Disbursement confirmed" : `Confirm disbursement — Rs ${toNepaliGrouped(detail.amountValue)}`}
          </Button>
          <button type="button" className="text-xs font-medium text-primary hover:underline shrink-0 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print voucher
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{detail.commissionLabel}</p>
      </div>

      {/* Disbursement history this month */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Disbursement history this month</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total disbursed</p>
            <p className="text-xl font-bold text-foreground">{detail.monthlyStats.totalDisbursedLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">No. of loans</p>
            <p className="text-xl font-bold text-foreground">{detail.monthlyStats.loanCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">To college A/C</p>
            <p className="text-xl font-bold text-foreground">{detail.monthlyStats.toCollegeAccountLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Direct to borrower</p>
            <p className="text-xl font-bold text-foreground">{detail.monthlyStats.directToBorrowerLabel}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          NRB: Education loans disbursed directly to college fee account to prevent fund diversion.
        </p>
      </div>

      {/* Disbursement tracker */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Disbursement tracker</h3>
          <button type="button" className="text-xs font-medium text-primary hover:underline">
            All tranches
          </button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Loan ref</TableHead>
                <TableHead className="text-xs">Borrower</TableHead>
                <TableHead className="text-xs">Tranche</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">A/C credited</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.tracker.map((tranche, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="text-xs text-muted-foreground">{tranche.dateLabel}</TableCell>
                  <TableCell className="text-xs font-mono font-semibold text-foreground">{tranche.loanRef}</TableCell>
                  <TableCell className="text-sm text-foreground">{tranche.borrowerName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tranche.tranche}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{tranche.amountLabel}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tranche.accountCredited}</TableCell>
                  <TableCell>
                    <Badge className={cn(TRANCHE_STATUS_CLASS[tranche.status], "border-0 text-[10px] font-semibold")}>{tranche.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
}
