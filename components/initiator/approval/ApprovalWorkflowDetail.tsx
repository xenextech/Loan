"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Check, Undo2, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { useAppSelector } from "@/lib/hooks";
import {
  useGetDashboardApplicationDetailQuery,
  useGetApprovalSummaryQuery,
  useGetApprovalCreditScoreQuery,
  useGetApprovalNrbChecklistQuery,
  useGetApprovalActivityQuery,
  useSupportApplicationMutation,
  useCheckApplicationMutation,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useSendBackApplicationMutation,
} from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import { CreditScoringSection } from "./CreditScoringSection";
import { StageStepper, type LinearStage } from "./StageStepper";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "./stageBadge";
import { useActingRole, ROLE_OPTIONS } from "../hooks/useActingRole";
import type { ApplicationStage, ApprovalActionRole } from "@/types/dashboard";

// Mirrors the backend's `ALLOWED_FROM_STAGE` table (dashboard-approval.service.ts)
// so the primary action button can be disabled client-side with a helpful hint —
// the backend re-checks this itself regardless, so this is a UX nicety, not the
// source of truth.
const ALLOWED_FROM_STAGE: Record<"support" | "check" | "approve", (ApplicationStage | null)[]> = {
  support: [null, "INITIATED", "SENT_BACK"],
  check: ["SUPPORTED", "SENT_BACK"],
  approve: ["CHECKING"],
};

const PRIMARY_ACTION: Record<ApprovalActionRole, "support" | "check" | "approve"> = {
  SUPPORTER: "support",
  CHECKER: "check",
  CREDIT_MANAGER: "check",
  APPROVER: "approve",
};

const PRIMARY_ACTION_LABEL: Record<"support" | "check" | "approve", string> = {
  support: "Support",
  check: "Check",
  approve: "Approve",
};

/** REJECTED/SENT_BACK aren't linear steps — resolve the position to show on the
 *  stepper (SENT_BACK rewinds to `sentBackToStage`; REJECTED has no position). */
function resolveDisplayStage(stage: ApplicationStage | null | undefined, sentBackToStage: ApplicationStage | null | undefined): LinearStage | null {
  if (!stage || stage === "REJECTED") return null;
  if (stage === "SENT_BACK") {
    return sentBackToStage && sentBackToStage !== "REJECTED" && sentBackToStage !== "SENT_BACK" ? sentBackToStage : null;
  }
  return stage;
}

function getErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.join(", ");
    }
  }
  return undefined;
}

function SummaryRow({ label, value, success }: { label: string; value: React.ReactNode; success?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className={cn("font-medium truncate", success ? "text-[oklch(0.42_0.18_145)] dark:text-success" : "text-foreground")}>
        {value === undefined || value === null || value === "" ? "—" : value}
      </span>
    </div>
  );
}

export function ApprovalWorkflowDetail({ id }: { id: string }) {
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);

  const [selectedRole, setSelectedRole] = useActingRole();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [sendBackReason, setSendBackReason] = useState("");
  const [sendBackToStage, setSendBackToStage] = useState<ApplicationStage>("INITIATED");

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: summary, isLoading: summaryLoading } = useGetApprovalSummaryQuery(id);
  const { data: creditScore, isLoading: scoreLoading } = useGetApprovalCreditScoreQuery(id);
  const { data: checklist, isLoading: checklistLoading } = useGetApprovalNrbChecklistQuery(id);
  const { data: activity, isLoading: activityLoading } = useGetApprovalActivityQuery({ applicationId: id, page: 1, limit: 15 });
  const { data: initiatorDetail } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });

  const [support, { isLoading: supporting }] = useSupportApplicationMutation();
  const [check, { isLoading: checking }] = useCheckApplicationMutation();
  const [approve, { isLoading: approving }] = useApproveApplicationMutation();
  const [reject, { isLoading: rejecting }] = useRejectApplicationMutation();
  const [sendBack, { isLoading: sendingBack }] = useSendBackApplicationMutation();

  const isLoading = appLoading || summaryLoading || scoreLoading || checklistLoading;
  const isMutating = supporting || checking || approving || rejecting || sendingBack;

  const currentStage = application?.stage ?? null;
  const displayStage = useMemo(() => resolveDisplayStage(currentStage, application?.sentBackToStage), [currentStage, application?.sentBackToStage]);

  const primaryAction = PRIMARY_ACTION[selectedRole];
  const canReject = selectedRole !== "SUPPORTER";
  const primaryAllowed = ALLOWED_FROM_STAGE[primaryAction].includes(currentStage);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!application || !summary) {
    const status = appError && "status" in appError ? appError.status : undefined;
    const message =
      status === 404
        ? "Application not found."
        : status !== undefined
          ? `Couldn't load this application (error ${status}). Please try again.`
          : "Application not found";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/initiator/approval")}>
          Back to list
        </Button>
      </div>
    );
  }

  const collegeVerification = initiatorDetail?.collegeVerification;

  const runAction = async (action: "support" | "check" | "approve") => {
    try {
      if (action === "support") await support(id).unwrap();
      else if (action === "check") await check(id).unwrap();
      else await approve(id).unwrap();
      toast.success(`Application ${action === "support" ? "supported" : action === "check" ? "checked" : "approved"}.`);
    } catch (err) {
      toast.error(`Failed to ${action} application`, { description: getErrorMessage(err) ?? "Please try again." });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("A reason is required to reject.");
      return;
    }
    try {
      await reject({ applicationId: id, data: { reason: rejectReason.trim() } }).unwrap();
      toast.success("Application rejected.");
      setRejectOpen(false);
      setRejectReason("");
    } catch (err) {
      toast.error("Failed to reject application", { description: getErrorMessage(err) ?? "Please try again." });
    }
  };

  const handleSendBack = async () => {
    if (!sendBackReason.trim()) {
      toast.error("A reason is required to send back.");
      return;
    }
    try {
      await sendBack({ applicationId: id, data: { reason: sendBackReason.trim(), toStage: sendBackToStage } }).unwrap();
      toast.success("Application sent back.");
      setSendBackOpen(false);
      setSendBackReason("");
    } catch (err) {
      toast.error("Failed to send back application", { description: getErrorMessage(err) ?? "Please try again." });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/approval")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Approval Workflow</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Credit-Ops Review</p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-foreground font-mono">{summary.applicationNumber}</h2>
          <span className="text-sm text-muted-foreground truncate">— {application.fullName ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge variant="outline" className="text-xs font-medium">
            {application.branch ?? "—"}
          </Badge>
          <Badge className={cn(currentStage ? STAGE_BADGE_CLASS[currentStage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {currentStage ? STAGE_LABEL[currentStage] : NO_STAGE_LABEL}
          </Badge>
        </div>
      </div>

      {currentStage === "REJECTED" && (
        <div className="rounded-lg bg-destructive/10 border-l-4 border-destructive px-4 py-3">
          <p className="text-xs font-semibold text-destructive mb-1">Rejected</p>
          <p className="text-sm text-foreground">{application.rejectionReason ?? "No reason recorded."}</p>
          {application.rejectedAt && <p className="text-[11px] text-muted-foreground mt-1">{formatDate(application.rejectedAt)}</p>}
        </div>
      )}
      {currentStage === "SENT_BACK" && (
        <div className="rounded-lg bg-[var(--warning)]/10 border-l-4 border-[var(--warning)] px-4 py-3">
          <p className="text-xs font-semibold text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] mb-1">
            Sent back{application.sentBackToStage ? ` to ${STAGE_LABEL[application.sentBackToStage]}` : ""}
          </p>
          <p className="text-sm text-foreground">{application.sentBackReason ?? "No reason recorded."}</p>
          {application.sentBackAt && <p className="text-[11px] text-muted-foreground mt-1">{formatDate(application.sentBackAt)}</p>}
        </div>
      )}

      <StageStepper stage={displayStage} />

      <div>
        <h3 className="text-sm font-bold text-foreground mb-2.5">Borrower summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1.5">
          <SummaryRow label="Name" value={application.fullName} />
          <SummaryRow label="Identity / Citizenship No." value={summary.citizenshipNumber ?? summary.identityNumber} />
          <SummaryRow label="Branch" value={application.branch} />
          <SummaryRow label="Risk Grade" value={summary.riskGrade} success={Boolean(summary.riskGrade)} />
          <SummaryRow label="DSGIR" value={summary.dsgir !== null ? `${summary.dsgir}%` : undefined} />
          <SummaryRow label="Loan to Value" value={summary.loanToValueRatio !== null ? `${summary.loanToValueRatio}%` : undefined} />
          <SummaryRow label="Collateral" value={summary.collateralText} />
          <SummaryRow
            label="CICL"
            value={summary.ciclStatus === null ? undefined : summary.ciclStatus ? "Clear" : "Flagged"}
            success={summary.ciclStatus === true}
          />
          <SummaryRow label="Insurance" value={summary.insuranceAttached ? "Attached" : "Not attached"} success={summary.insuranceAttached} />
        </div>
      </div>

      {/* Offer letter verification — real college-verification data where available */}
      {collegeVerification && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">Offer letter verification</h3>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              College: <span className="font-medium text-foreground">{collegeVerification.collegeName ?? "—"}</span>
              <br />
              <span
                className={cn(
                  "font-medium inline-flex items-center gap-1",
                  collegeVerification.isApplicationVerified ? "text-[oklch(0.42_0.18_145)] dark:text-success" : "text-destructive",
                )}
              >
                {collegeVerification.isApplicationVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {collegeVerification.isApplicationVerified ? "Verified by college" : "Not yet verified by college"}
              </span>
            </p>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline shrink-0"
              onClick={() => router.push(`/initiator/document-center/${id}`)}
            >
              Verify in Document Center
            </button>
          </div>
        </div>
      )}

      {/* Approval actions — real, role-gated backend transitions. The dropdown only
          decides which buttons this screen shows; the backend still enforces the
          real permission from the logged-in user's JWT role. */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Approval action</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Acting as</span>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ApprovalActionRole)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {authUser && authUser.role !== selectedRole && (
          <p className="text-[11px] text-muted-foreground mb-3">
            You&apos;re signed in as <span className="font-medium text-foreground">{authUser.role}</span>. The backend will reject an action here
            unless your account actually holds the <span className="font-medium text-foreground">{selectedRole}</span> role.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            disabled={!primaryAllowed || isMutating}
            className="flex-1 gap-1.5 bg-[oklch(0.42_0.18_145)] hover:bg-[oklch(0.36_0.18_145)] text-white disabled:opacity-60"
            onClick={() => runAction(primaryAction)}
          >
            {supporting || checking || approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {PRIMARY_ACTION_LABEL[primaryAction]}
          </Button>
          {canReject && (
            <Button
              disabled={isMutating}
              variant="outline"
              className="flex-1 gap-1.5 border-destructive/30 bg-destructive/10 text-destructive"
              onClick={() => setRejectOpen((v) => !v)}
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
          )}
          <Button
            disabled={isMutating}
            variant="outline"
            className="flex-1 gap-1.5 border-[oklch(0.5_0.16_80)]/40 bg-[oklch(0.5_0.16_80)]/10 text-[oklch(0.4_0.16_80)]"
            onClick={() => setSendBackOpen((v) => !v)}
          >
            <Undo2 className="w-4 h-4" /> Send Back
          </Button>
        </div>
        {!primaryAllowed && (
          <p className="text-[11px] text-muted-foreground mt-2">
            {PRIMARY_ACTION_LABEL[primaryAction]} isn&apos;t valid from the current stage ({currentStage ? STAGE_LABEL[currentStage] : NO_STAGE_LABEL}).
          </p>
        )}

        {rejectOpen && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <Textarea
              placeholder="Reason for rejection…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" disabled={rejecting} onClick={handleReject} className="gap-1.5">
                {rejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sendBackOpen && (
          <div className="mt-3 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/5 p-3 space-y-2">
            <Textarea
              placeholder="Reason for sending back…"
              value={sendBackReason}
              onChange={(e) => setSendBackReason(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Send back to:</span>
              <Select value={sendBackToStage} onValueChange={(v) => setSendBackToStage(v as ApplicationStage)}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INITIATED">Initiator</SelectItem>
                  <SelectItem value="SUPPORTED">Supporter</SelectItem>
                  <SelectItem value="CHECKING">Checker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={sendingBack} onClick={handleSendBack} className="gap-1.5">
                {sendingBack && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Send Back
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSendBackOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {creditScore && checklist && <CreditScoringSection creditScore={creditScore} checklist={checklist.items} />}

      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Activity trail</h3>
        {activityLoading ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : !activity?.data.length ? (
          <p className="text-sm text-muted-foreground">No recorded activity for this application yet.</p>
        ) : (
          <ul className="space-y-3.5">
            {activity.data.map((event, i) => (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  {i < activity.data.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <Badge className="border-0 text-[10px] font-semibold mr-1.5 align-middle bg-muted text-muted-foreground">
                      {event.category}
                    </Badge>
                    <span className="font-semibold">{event.user?.email ?? "System"}</span> — {event.action.replaceAll("_", " ").toLowerCase()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(event.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
