"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, FileText, Plus, Loader2, Printer, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetDisbursementConditionsQuery,
  useAddDisbursementConditionMutation,
  useUpdateDisbursementConditionMutation,
  useConfirmDisbursementMutation,
} from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import { useDisbursementMonthlyStats } from "./useDisbursementMonthlyStats";
import { useDisbursementTrancheHistory } from "./useDisbursementTrancheHistory";
import { DisbursementStageTracker } from "./DisbursementStageTracker";
import { deriveReadiness } from "./types";

const TRANCHE_STATUS_CLASS: Record<string, string> = {
  CREDITED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  PENDING: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  FAILED: "bg-destructive/10 text-destructive",
};

export function DisbursementDetail({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  /** Only the Approver manages disbursement conditions/confirms tranches — the
   *  business requirement, not a real backend restriction (the controller is
   *  gated to every dashboard-staff role, not APPROVER-only). Everyone else
   *  gets a read-only view. */
  const canManage = basePath === "/approver";
  const [newConditionLabel, setNewConditionLabel] = useState("");
  const [trancheAmount, setTrancheAmount] = useState("");
  const [accountCredited, setAccountCredited] = useState("");

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: initiatorDetail, isLoading: initiatorLoading } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });
  const { data: conditions, isLoading: conditionsLoading } = useGetDisbursementConditionsQuery(id);
  const { rows: trancheRows, disbursementStatus, totalDisbursedAmount, isLoading: trancheLoading } = useDisbursementTrancheHistory(id);
  const [addCondition, { isLoading: adding }] = useAddDisbursementConditionMutation();
  const [updateCondition, { isLoading: updating }] = useUpdateDisbursementConditionMutation();
  const [confirmDisbursement, { isLoading: confirming }] = useConfirmDisbursementMutation();
  const monthlyStats = useDisbursementMonthlyStats();

  const isLoading = appLoading || initiatorLoading || conditionsLoading;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
      </div>
    );
  }

  if (!application) {
    const status = appError && "status" in appError ? appError.status : undefined;
    const message = status === 404 ? "Application not found." : "Couldn't load this application. Please try again.";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/disbursment`)}>
          Back to list
        </Button>
      </div>
    );
  }

  const rows = conditions ?? [];
  const enteredAmount = Number(trancheAmount);
  const doneCount = rows.filter((c) => c.status === "DONE").length;
  const progressPercent = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;
  const bankAccountReady = Boolean(initiatorDetail?.parentVerification?.bankAccountNumber);
  const readiness = deriveReadiness({ conditionsDone: doneCount, conditionsTotal: rows.length, bankAccountReady });
  const allDone = readiness === "ready";
  const executed = disbursementStatus !== null;
  // The backend never actually sets `Disbursement.status` to COMPLETED anywhere — it only
  // ever writes PENDING/PARTIAL. So "fully disbursed" is derived here from the real running
  // total against the approved credit limit, not from that status field.
  const creditLimit = application.creditLimit ?? 0;
  const fullyDisbursed = totalDisbursedAmount !== null && creditLimit > 0 && totalDisbursedAmount >= creditLimit;

  const stages = [
    { label: "Approved", done: true },
    { label: "Conditions Pending", done: rows.length > 0 },
    { label: "Conditions Completed", done: rows.length > 0 && doneCount === rows.length },
    { label: "Ready for Disbursement", done: readiness === "ready" },
    { label: "Disbursement Executed", done: executed },
    { label: "Completed", done: fullyDisbursed },
  ];

  const handleAddCondition = async () => {
    if (!newConditionLabel.trim()) return;
    try {
      await addCondition({ applicationId: id, label: newConditionLabel.trim() }).unwrap();
      setNewConditionLabel("");
    } catch {
      toast.error("Failed to add condition");
    }
  };

  const toggleCondition = async (conditionId: string, done: boolean) => {
    try {
      await updateCondition({ applicationId: id, conditionId, status: done ? "DONE" : "PENDING" }).unwrap();
    } catch {
      toast.error("Failed to update condition");
    }
  };

  const handleConfirm = async () => {
    if (!enteredAmount || enteredAmount <= 0) {
      toast.error("Enter a valid tranche amount");
      return;
    }
    try {
      await confirmDisbursement({
        applicationId: id,
        data: { trancheNumber: trancheRows.length + 1, amount: enteredAmount, accountCredited: accountCredited || undefined },
      }).unwrap();
      toast.success(`Disbursement of ${formatNPR(enteredAmount)} confirmed for ${application.applicationNumber}.`);
      setTrancheAmount("");
      setAccountCredited("");
    } catch {
      toast.error("Failed to confirm disbursement");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-serif"
    >
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 font-sans" onClick={() => router.push(`${basePath}/disbursment`)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline font-sans">
          <Printer className="w-3.5 h-3.5" /> Print voucher
        </button>
      </div>

      <div className="border-b border-border pb-4 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-bold text-foreground">
          Disbursement conditions — {application.applicationNumber}
          {application.fullName ? ` (${application.fullName})` : ""}
        </h1>
        <span className="text-sm text-muted-foreground font-sans">{doneCount} of {rows.length} done</span>
      </div>

      {!canManage && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2.5 font-sans">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Only the Approver manages conditions and confirms disbursement. This view is read-only.</p>
        </div>
      )}

      {/* Disbursement stage tracker */}
      <DisbursementStageTracker stages={stages} />

      {/* Conditions checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 font-sans">
          <Progress value={progressPercent} className="h-2" />
          <span className="text-xs font-semibold text-muted-foreground shrink-0 w-10 text-right">{progressPercent}%</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conditions added yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {rows.map((condition) => (
              <li key={condition.id} className="flex items-center justify-between gap-3 py-2.5">
                {canManage ? (
                  <label className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer">
                    <Checkbox
                      checked={condition.status === "DONE"}
                      disabled={updating}
                      onCheckedChange={(checked) => toggleCondition(condition.id, checked === true)}
                    />
                    <span className={cn("text-sm truncate", condition.status === "DONE" ? "text-foreground" : "text-muted-foreground")}>
                      {condition.label}
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Checkbox checked={condition.status === "DONE"} disabled />
                    <span className={cn("text-sm truncate", condition.status === "DONE" ? "text-foreground" : "text-muted-foreground")}>
                      {condition.label}
                    </span>
                  </div>
                )}
                <Badge
                  className={cn(
                    "border-0 text-[10px] font-semibold shrink-0 font-sans",
                    condition.status === "DONE"
                      ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success"
                      : condition.status === "MISSING"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
                  )}
                >
                  {condition.status === "DONE" ? "Done" : condition.status === "MISSING" ? "Missing" : "Pending"}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {canManage && (
          <div className="flex items-center gap-2 font-sans">
            <Input
              placeholder="Add a condition…"
              value={newConditionLabel}
              onChange={(e) => setNewConditionLabel(e.target.value)}
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddCondition()}
            />
            <Button size="sm" variant="outline" className="h-9 gap-1.5" disabled={adding || !newConditionLabel.trim()} onClick={handleAddCondition}>
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add
            </Button>
          </div>
        )}
      </div>

      {canManage &&
        (!allDone ? (
          <div className="flex items-start gap-2.5 rounded-md bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] px-4 py-3 font-sans">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              {!bankAccountReady
                ? "Cannot disburse — the parent's bank account is not on file yet."
                : `Cannot disburse until all ${rows.length} condition${rows.length === 1 ? "" : "s"} are met.`}
            </p>
          </div>
        ) : (
          /* Confirm disbursement */
          <div className="space-y-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Tranche amount (NPR)"
                value={trancheAmount}
                onChange={(e) => setTrancheAmount(e.target.value)}
                className="h-9 text-sm"
              />
              <Input
                placeholder="Account credited (optional)"
                value={accountCredited}
                onChange={(e) => setAccountCredited(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <button
              type="button"
              disabled={confirming || !trancheAmount}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[oklch(0.42_0.18_145)] hover:bg-[oklch(0.36_0.18_145)] text-white h-11 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleConfirm}
            >
              {confirming && <Loader2 className="w-4 h-4 animate-spin" />}
              {enteredAmount > 0 ? `Confirm disbursement — ${formatNPR(enteredAmount)}` : "Confirm disbursement"}
            </button>
          </div>
        ))}

      {/* This loan's own tranche history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-bold text-foreground">Tranche history</h2>
          {totalDisbursedAmount !== null && creditLimit > 0 && (
            <span className={cn("text-xs font-semibold font-sans", fullyDisbursed ? "text-[oklch(0.42_0.18_145)] dark:text-success" : "text-muted-foreground")}>
              {formatNPR(totalDisbursedAmount)} of {formatNPR(creditLimit)} disbursed
            </span>
          )}
        </div>
        {trancheLoading ? (
          <Skeleton className="h-16 rounded-lg" />
        ) : trancheRows.length === 0 ? (
          <p className="text-sm text-muted-foreground font-sans">No tranches disbursed yet for this loan.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Tranche</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">A/C credited</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Commission</TableHead>
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
                  <TableCell className="py-2.5 text-sm text-muted-foreground hidden sm:table-cell">{t.commissionLabel ?? "—"}</TableCell>
                  <TableCell className="py-2.5 text-right">
                    <Badge className={cn(TRANCHE_STATUS_CLASS[t.status], "border-0 text-[10px] font-semibold font-sans")}>{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Disbursement history this month */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-foreground">Disbursement history this month</h2>
        {monthlyStats.isLoading ? (
          <div className="grid grid-cols-2 gap-6 font-sans">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-sans">Total disbursed</p>
              <p className="text-base font-bold text-foreground">{monthlyStats.totalDisbursedLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans">No. of loans</p>
              <p className="text-base font-bold text-foreground">{monthlyStats.loanCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans">To college A/C</p>
              <p className="text-base font-bold text-foreground">{monthlyStats.toCollegeLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans">Direct to borrower</p>
              <p className="text-base font-bold text-foreground">{monthlyStats.toBorrowerLabel}</p>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground/80 italic">
          NRB: Education loans disbursed directly to college fee account to prevent fund diversion.
        </p>
      </div>
    </motion.div>
  );
}
