"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, XCircle, CheckCircle2, Undo2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, displayName } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetApprovalSummaryQuery,
  useGetApprovalCreditScoreQuery,
  useGetApprovalNrbChecklistQuery,
  useGetApprovalActivityQuery,
  useResubmitApplicationMutation,
} from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { CreditScoringSection } from "./CreditScoringSection";
import { StageStepper, type LinearStage } from "./StageStepper";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "./stageBadge";
import type { ApplicationStage } from "@/types/dashboard";

/** REJECTED/SENT_BACK aren't linear steps — resolve the position to show on the
 *  stepper (SENT_BACK rewinds to `sentBackToStage`; REJECTED has no position). */
function resolveDisplayStage(stage: ApplicationStage | null | undefined, sentBackToStage: ApplicationStage | null | undefined): LinearStage | null {
  if (!stage || stage === "REJECTED") return null;
  if (stage === "SENT_BACK") {
    return sentBackToStage && sentBackToStage !== "REJECTED" && sentBackToStage !== "SENT_BACK" ? sentBackToStage : null;
  }
  return stage;
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

/**
 * Read-only for the Initiator's own role — support/check/approve/reject/
 * send-back are all gated to Supporter/Checker/Credit Manager/Approver only.
 * The one exception is `resubmit`: when a send-back targets the Initiator
 * specifically (`sentBackToStage === "INITIATED"`), nothing else advances
 * the stage — the Initiator has no *Status column in the approval chain —
 * so a "Resubmit for Review" action is shown in that case only, and it
 * routes straight back to the Approver (skipping Supporter/Checker) if the
 * Approver was the one who sent it back.
 */
export function ApprovalWorkflowDetail({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: summary, isLoading: summaryLoading } = useGetApprovalSummaryQuery(id);
  const { data: creditScore, isLoading: scoreLoading } = useGetApprovalCreditScoreQuery(id);
  const { data: checklist, isLoading: checklistLoading } = useGetApprovalNrbChecklistQuery(id);
  const { data: activity, isLoading: activityLoading } = useGetApprovalActivityQuery({ applicationId: id, page: 1, limit: 15 });
  const { data: initiatorDetail } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });
  const [resubmitApplication, { isLoading: resubmitting }] = useResubmitApplicationMutation();

  const isLoading = appLoading || summaryLoading || scoreLoading || checklistLoading;

  const handleResubmit = async () => {
    try {
      const result = await resubmitApplication(id).unwrap();
      toast.success("Resubmitted", {
        description:
          result.stage === "CHECKING"
            ? "Sent back by the Approver — returned directly to them, skipping the Supporter and Checker."
            : "Moved to the Supporter queue.",
      });
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
          ? String((err.data as { message?: unknown }).message)
          : "Please try again.";
      toast.error("Failed to resubmit", { description: message });
    }
  };

  const currentStage = application?.stage ?? null;
  const displayStage = useMemo(() => resolveDisplayStage(currentStage, application?.sentBackToStage), [currentStage, application?.sentBackToStage]);

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
        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/approval`)}>
          Back to list
        </Button>
      </div>
    );
  }

  const collegeVerification = initiatorDetail?.collegeVerification;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/approval`)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Approval Workflow</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Credit-Ops Review · Read-only</p>
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
          {application.sentBackToStage === "INITIATED" && (
            <div className="mt-3 pt-3 border-t border-[var(--warning)]/20">
              <p className="text-xs text-muted-foreground mb-2">
                Once you&apos;ve made the necessary corrections, resubmit to continue the approval chain.
              </p>
              <Button size="sm" className="gap-1.5" disabled={resubmitting} onClick={handleResubmit}>
                {resubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                Resubmit for Review
              </Button>
            </div>
          )}
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
          <SummaryRow label="Loan to Income Ratio" value={summary.loanToValueRatio !== null ? `${summary.loanToValueRatio}%` : undefined} />
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
              onClick={() => router.push(`${basePath}/document-center/${id}`)}
            >
              Verify in Document Center
            </button>
          </div>
        </div>
      )}

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
                    <span className="font-semibold">{displayName(event.user, "System")}</span> — {event.action.replaceAll("_", " ").toLowerCase()}
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
