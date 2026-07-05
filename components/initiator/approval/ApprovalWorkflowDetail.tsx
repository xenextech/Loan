"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Check, Undo2, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetApprovalSummaryQuery,
  useGetApprovalCreditScoreQuery,
  useGetApprovalNrbChecklistQuery,
  useGetApprovalActivityQuery,
} from "@/lib/api/dashboardApi";
import { useGetInitiatorApplicationDetailQuery } from "@/lib/api/initiatorApi";
import { CreditScoringSection } from "./CreditScoringSection";
import { StageStepper } from "./StageStepper";
import type { ApprovalStage } from "./types";

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

/** Illustrative — the backend has no persisted per-role workflow state yet.
 *  Initiator is shown done since the application reached submission; the rest
 *  are shown awaiting since there's no real Supporter/Checker/Approver sign-off field. */
const realDataStages = (): ApprovalStage[] => [
  { role: "INITIATOR", roleLabel: "Initiator", actorName: "Initiator", actorTitle: "RO", status: "DONE", comment: "Application submitted and picked up for review." },
  { role: "SUPPORTER", roleLabel: "Supporter", actorName: "—", actorTitle: "Support", status: "AWAITING" },
  { role: "CHECKER", roleLabel: "Checker", actorName: "—", actorTitle: "CRD", status: "AWAITING" },
  { role: "APPROVER", roleLabel: "Approver", actorName: "—", actorTitle: "Approver", status: "AWAITING" },
];

export function ApprovalWorkflowDetail({ id }: { id: string }) {
  const router = useRouter();
  const [checkerComment, setCheckerComment] = useState("");

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: summary, isLoading: summaryLoading } = useGetApprovalSummaryQuery(id);
  const { data: creditScore, isLoading: scoreLoading } = useGetApprovalCreditScoreQuery(id);
  const { data: checklist, isLoading: checklistLoading } = useGetApprovalNrbChecklistQuery(id);
  const { data: activity, isLoading: activityLoading } = useGetApprovalActivityQuery({ applicationId: id, page: 1, limit: 15 });
  const { data: initiatorDetail } = useGetInitiatorApplicationDetailQuery(id, { skip: !id });

  const isLoading = appLoading || summaryLoading || scoreLoading || checklistLoading;

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/approval")}>
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
          <Badge className="border-0 font-semibold text-xs bg-primary/10 text-primary">{summary.status}</Badge>
        </div>
      </div>

      {/* Stage tracker — illustrative, see note above realDataStages() */}
      <StageStepper stages={realDataStages()} />

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

      {/* Checker comments + actions — visual only, no forward/send-back/reject
          mutation exists on the backend yet; see the module README's note that
          this screen is read-only by design. */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Checker comments</h3>
        <Textarea
          placeholder="Enter your credit assessment, conditions, or reason for send-back…"
          value={checkerComment}
          onChange={(e) => setCheckerComment(e.target.value)}
          rows={3}
          className="text-sm mb-3"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button disabled className="flex-1 gap-1.5 bg-[oklch(0.42_0.18_145)] text-white opacity-60">
            <Check className="w-4 h-4" /> Forward to approver
          </Button>
          <Button disabled variant="outline" className="flex-1 gap-1.5 border-[oklch(0.5_0.16_80)]/40 bg-[oklch(0.5_0.16_80)]/10 text-[oklch(0.4_0.16_80)] opacity-60">
            <Undo2 className="w-4 h-4" /> Send back to supporter
          </Button>
          <Button disabled variant="outline" className="flex-1 gap-1.5 border-destructive/30 bg-destructive/10 text-destructive opacity-60">
            <XCircle className="w-4 h-4" /> Reject
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Not wired to a backend workflow action yet — there&apos;s no forward/send-back/reject endpoint on the API.
        </p>
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
