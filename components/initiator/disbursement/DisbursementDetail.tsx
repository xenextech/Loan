"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { useAppSelector } from "@/lib/hooks";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, FileText, Plus, Loader2, Printer, AlertTriangle, Lock, ChevronLeft, ChevronRight, PhoneCall, ShieldAlert, Mail, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetDisbursementConditionsQuery,
  useAddDisbursementConditionMutation,
  useUpdateDisbursementConditionMutation,
  useConfirmDisbursementMutation,
  useGetCollectionActivityQuery,
  useRecordCollectionActivityMutation,
  useFlagLoanNeedsReviewMutation,
  useNotifyLoanServicingBorrowerMutation,
} from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import { useDisbursementMonthlyStats } from "./useDisbursementMonthlyStats";
import { useDisbursementTrancheHistory } from "./useDisbursementTrancheHistory";
import { DisbursementStageTracker } from "./DisbursementStageTracker";
import { deriveReadiness } from "./types";
import { ROLE_LABEL } from "@/components/student/tracker/trackerBadge";
import type { CollectionActivityType } from "@/types/dashboard";
import type { UserRole } from "@/types/api";

const ASSIGNABLE_REVIEW_ROLES: UserRole[] = ["INITIATOR", "SUPPORTER", "CHECKER", "APPROVER", "CREDIT_MANAGER"];

const TRANCHE_STATUS_CLASS: Record<string, string> = {
  CREDITED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  PENDING: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  FAILED: "bg-destructive/10 text-destructive",
};

const ACTIVITY_TYPE_LABEL: Record<CollectionActivityType, string> = {
  CALL: "Phone call",
  SMS: "SMS",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  VISIT: "Field visit",
  NOTE: "Note",
  OTHER: "Other",
};

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number") return `Request failed with status ${status}. Please try again.`;
  }
  return "Something went wrong. Please try again.";
}

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
  const [activityPage, setActivityPage] = useState(1);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState<CollectionActivityType>("CALL");
  const [followUpContactedPerson, setFollowUpContactedPerson] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewAssignedRole, setReviewAssignedRole] = useState<UserRole | undefined>(undefined);
  const [notifyConfirmOpen, setNotifyConfirmOpen] = useState(false);
  const currentUserRole = useAppSelector((s) => s.auth.user?.role);

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: initiatorDetail, isLoading: initiatorLoading } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });
  const { data: conditions, isLoading: conditionsLoading } = useGetDisbursementConditionsQuery(id);
  const { rows: trancheRows, disbursementStatus, totalDisbursedAmount, isLoading: trancheLoading } = useDisbursementTrancheHistory(id);
  const [addCondition, { isLoading: adding }] = useAddDisbursementConditionMutation();
  const [updateCondition, { isLoading: updating }] = useUpdateDisbursementConditionMutation();
  const [confirmDisbursement, { isLoading: confirming }] = useConfirmDisbursementMutation();
  const monthlyStats = useDisbursementMonthlyStats();
  const { data: activityLog, isLoading: activityLoading } = useGetCollectionActivityQuery(
    { applicationId: id, page: activityPage, limit: 20 },
    { skip: !id },
  );
  const [recordActivity, { isLoading: followingUp }] = useRecordCollectionActivityMutation();
  const [flagNeedsReview, { isLoading: flagging }] = useFlagLoanNeedsReviewMutation();
  const [notifyBorrower, { isLoading: notifying }] = useNotifyLoanServicingBorrowerMutation();

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
      toast.success("Condition added.");
      setNewConditionLabel("");
    } catch (err) {
      toast.error("Failed to add condition", { description: getApiErrorMessage(err) });
    }
  };

  const toggleCondition = async (conditionId: string, done: boolean) => {
    try {
      await updateCondition({ applicationId: id, conditionId, status: done ? "DONE" : "PENDING" }).unwrap();
      toast.success(done ? "Condition marked done." : "Condition marked pending.");
    } catch (err) {
      toast.error("Failed to update condition", { description: getApiErrorMessage(err) });
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
    } catch (err) {
      toast.error("Failed to confirm disbursement", { description: getApiErrorMessage(err) });
    }
  };

  const handleFollowUp = async () => {
    if (!followUpNotes.trim()) {
      toast.error("Enter a note describing the follow-up");
      return;
    }
    try {
      await recordActivity({
        applicationId: id,
        data: {
          activityType: followUpType,
          notes: followUpNotes.trim(),
          contactedPerson: followUpContactedPerson.trim() || undefined,
        },
      }).unwrap();
      toast.success("Follow-up logged successfully.");
      setFollowUpOpen(false);
      setFollowUpType("CALL");
      setFollowUpContactedPerson("");
      setFollowUpNotes("");
      setActivityPage(1);
    } catch (err) {
      toast.error("Failed to log follow-up", { description: getApiErrorMessage(err) });
    }
  };

  const handleFlagReview = async () => {
    if (!reviewReason.trim()) {
      toast.error("Enter a reason for flagging this loan");
      return;
    }
    if (!reviewAssignedRole) {
      toast.error("Select a role to assign this review to");
      return;
    }
    try {
      await flagNeedsReview({
        applicationId: id,
        data: { reason: reviewReason.trim(), assignedRole: reviewAssignedRole },
      }).unwrap();
      toast.success("Loan flagged for review.");
      setReviewOpen(false);
      setReviewReason("");
      setReviewAssignedRole(undefined);
    } catch (err) {
      toast.error("Failed to flag this loan for review", { description: getApiErrorMessage(err) });
    }
  };

  const handleResendNotification = async () => {
    try {
      const result = await notifyBorrower(id).unwrap();
      const notifiedParts = [
        result.studentNotified ? "the student" : null,
        result.parentNotified ? `the parent (via ${result.parentChannel ?? "SMS"})` : null,
      ].filter((p): p is string => p !== null);

      if (notifiedParts.length > 0) {
        toast.success("Reminder sent", { description: `We've kindly notified ${notifiedParts.join(" and ")} about this repayment.` });
      } else {
        toast.warning("Couldn't reach anyone", {
          description: "No verified email or phone is on file for the student or parent yet, so we weren't able to send a reminder.",
        });
      }
    } catch (err) {
      toast.error("We couldn't resend the notification", { description: getApiErrorMessage(err) });
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans space-y-3">
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans space-y-3">
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

      {/* Collection activity history */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-base font-bold text-foreground">Collection activity history</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setFollowUpOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Follow up for repayment
            </Button>
          </div>
        </div>
        {activityLoading ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : !activityLog || activityLog.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collection activity recorded yet for application ID: {id.slice(0, 8)}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Contacted Person</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                    <TableHead className="text-xs">Logged By</TableHead>
                    <TableHead className="text-xs">Recorded At</TableHead>
                    <TableHead className="text-xs">Activity ID</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLog.data.map((a) => (
                    <TableRow key={a.id} className="border-border">
                      <TableCell className="py-2.5 text-xs">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {ACTIVITY_TYPE_LABEL[a.activityType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{a.contactedPerson ?? "—"}</TableCell>
                      <TableCell className="py-2.5 text-xs text-foreground max-w-xs">{a.notes}</TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground font-mono" title={a.createdByUserId}>
                        {a.createdByUserId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground font-mono" title={a.id}>
                        {a.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7" aria-label="Row actions">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setNotifyConfirmOpen(true)}>
                              Resend Notification
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {activityLog.meta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Page {activityLog.meta.page} of {activityLog.meta.totalPages} — {activityLog.meta.total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={!activityLog.meta.hasPrev}
                    onClick={() => setActivityPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={!activityLog.meta.hasNext}
                    onClick={() => setActivityPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Resend notification confirmation */}
      <AlertDialog open={notifyConfirmOpen} onOpenChange={setNotifyConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend repayment reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will kindly send another repayment reminder email to the student (and parent, where a contact is on file) for{" "}
              {application.applicationNumber}. Please use this thoughtfully — sending too many reminders in a short time may feel
              intrusive to the borrower.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={notifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResendNotification} disabled={notifying} className="gap-1.5">
              {notifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Yes, resend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag for review */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <ShieldAlert className="h-4 w-4 text-gray-700" />
              </div>

              <h2 className="text-base font-semibold text-gray-900">
                Needs Review
              </h2>
            </div>

            <p className="pl-9 max-w-2xl text-sm leading-6 text-gray-600">
              Manually escalate this loan—for example, repeated missed
              installments, collection escalation, or restructuring is required.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setReviewAssignedRole(currentUserRole);
              setReviewOpen(true);
            }}
            className="h-10 rounded-lg border-2 border-black bg-white px-4 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Flag for Review
          </Button>
        </div>
      </div>

      {/* Flag for review modal */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md font-sans">
          <DialogHeader>
            <DialogTitle>Flag loan for review</DialogTitle>
            <DialogDescription>Escalate {application.applicationNumber} for manual review.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                rows={3}
                className="text-sm"
                placeholder="e.g. Three consecutive missed installments."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assigned Role</Label>
              <Select
                value={reviewAssignedRole ?? ""}
                onValueChange={(v) => setReviewAssignedRole(v as UserRole)}
              >
                <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_REVIEW_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{ROLE_LABEL[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={flagging}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFlagReview}
              disabled={flagging || !reviewReason.trim() || !reviewAssignedRole}
              className="gap-1.5"
            >
              {flagging && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Flag for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow up for repayment modal */}
      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent className="sm:max-w-md font-sans">
          <DialogHeader>
            <DialogTitle>Follow up for repayment</DialogTitle>
            <DialogDescription>Log a collection follow-up for {application.applicationNumber}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Activity Type</Label>
              <Select value={followUpType} onValueChange={(v) => setFollowUpType(v as CollectionActivityType)}>
                <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_TYPE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contacted Person (optional)</Label>
              <Input
                value={followUpContactedPerson}
                onChange={(e) => setFollowUpContactedPerson(e.target.value)}
                placeholder="student / parent"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                rows={3}
                className="text-sm"
                placeholder="What was discussed / next steps…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpOpen(false)} disabled={followingUp}>
              Cancel
            </Button>
            <Button onClick={handleFollowUp} disabled={followingUp || !followUpNotes.trim()} className="gap-1.5">
              {followingUp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
