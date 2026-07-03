"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Check, Undo2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatNPR } from "@/lib/formatters";
import { useInitiatorApplicationDetail } from "@/components/initiator/hooks/useInitiatorApplicationDetail";
import { useApprovalApplicationDetail } from "./useApprovalApplicationDetail";
import { StageStepper } from "./StageStepper";
import { CreditScoringSection } from "./CreditScoringSection";
import { DEFAULT_CREDIT_SCORE, DEFAULT_COMPLIANCE_CHECKS } from "./defaultCreditScore";
import type { ApprovalRoleKey, ApprovalStage } from "./types";
import { Separator } from "radix-ui";

const STAGE_BADGE_CLASS: Record<string, string> = {
  Checking: "bg-primary/10 text-primary",
  Approved: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  "CICL Hold": "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Escalated: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Rejected: "bg-destructive/10 text-destructive",
  "Sent Back": "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Disbursed: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  "Awaiting Review": "bg-primary/10 text-primary",
};

const ROLE_BADGE_CLASS: Record<ApprovalRoleKey, string> = {
  INITIATOR: "bg-primary/10 text-primary",
  SUPPORTER: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  CHECKER: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  APPROVER: "bg-muted text-muted-foreground",
};

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

const realDataStages = (): ApprovalStage[] => [
  {
    role: "INITIATOR",
    roleLabel: "Initiator",
    actorName: "Initiator",
    actorTitle: "RO",
    status: "DONE",
    comment: "Application verified by the college and picked up for initiator review.",
  },
  { role: "SUPPORTER", roleLabel: "Supporter", actorName: "—", actorTitle: "Support", status: "AWAITING" },
  { role: "CHECKER", roleLabel: "Checker", actorName: "—", actorTitle: "CRD", status: "AWAITING" },
  { role: "APPROVER", roleLabel: "Approver", actorName: "—", actorTitle: "Approver", status: "AWAITING" },
];

export function ApprovalWorkflowDetail({ id }: { id: string }) {
  const router = useRouter();

  // The workflow demo dataset is mock-only (no backend yet for Checker/CICL/credit-scoring
  // stages). Real application IDs fall through to the real initiator-detail endpoint below,
  // rendered as a trimmed view of only what's actually real.
  const { data: mockDetail, isLoading: mockLoading } = useApprovalApplicationDetail(id);
  const {
    data: realDetail,
    isLoading: realLoading,
    errorStatus,
  } = useInitiatorApplicationDetail(mockDetail ? "" : id);

  const [stages, setStages] = useState<ApprovalStage[] | undefined>(mockDetail?.stages);
  const [stageLabel, setStageLabel] = useState(mockDetail?.stageLabel);
  const [checkerComment, setCheckerComment] = useState("");
  const [decided, setDecided] = useState(false);

  const activeStages = stages ?? mockDetail?.stages;
  const activeStageLabel = stageLabel ?? mockDetail?.stageLabel;

  const decideChecker = (action: "forward" | "sendBack" | "reject") => {
    if (!activeStages) return;
    const now = new Date().toISOString();
    const comment =
      checkerComment.trim() ||
      (action === "forward" ? "Reviewed and forwarded to approver." : action === "sendBack" ? "Sent back to supporter for clarification." : "Rejected — does not meet policy.");

    const next = activeStages.map((stage) => {
      if (stage.role === "CHECKER") {
        return { ...stage, status: "DONE" as const, comment, decidedAt: now };
      }
      if (stage.role === "APPROVER" && action === "forward") {
        return { ...stage, status: "ACTIVE" as const };
      }
      if (stage.role === "SUPPORTER" && action === "sendBack") {
        return { ...stage, status: "ACTIVE" as const, comment: undefined, decidedAt: undefined };
      }
      return stage;
    });

    setStages(next);
    setStageLabel(action === "forward" ? "Checking" : action === "sendBack" ? "Sent Back" : "Rejected");
    setDecided(true);
    toast.success(
      action === "forward" ? "Forwarded to approver." : action === "sendBack" ? "Sent back to supporter." : "Application rejected.",
    );
  };

  if (mockLoading || (!mockDetail && realLoading)) {
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

  if (!mockDetail && !realDetail) {
    const message =
      errorStatus === 404
        ? "This application has no initiator record yet — it may not have been picked up for review."
        : errorStatus !== undefined
          ? `Couldn't load this application (error ${errorStatus}). Please try again.`
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

  // ─── Real application, no mock demo data: trimmed view of only what's real ──────────────
  if (!mockDetail && realDetail) {
    const stageBadge = realDetail.workflowStage || "Awaiting Review";
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/approval")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div>
          <h1 className="text-lg font-bold text-foreground">Approval Workflow</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Education Loan Review</p>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-bold text-foreground font-mono">{realDetail.applicationNumber}</h2>
            <span className="text-sm text-muted-foreground truncate">— {realDetail.studentName}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Badge variant="outline" className="text-xs font-medium">
              {realDetail.program} · {formatNPR(realDetail.loanAmount)}
            </Badge>
            <Badge className={cn(STAGE_BADGE_CLASS[stageBadge] ?? "bg-primary/10 text-primary", "border-0 font-semibold text-xs")}>
              {stageBadge}
            </Badge>
          </div>
        </div>

        <StageStepper stages={realDataStages()} />

        <div>
          <h3 className="text-sm font-bold text-foreground mb-2.5">Borrower summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1.5">
            <SummaryRow label="Name" value={realDetail.studentName} />
            <SummaryRow label="Identity / Citizenship No." value={realDetail.studentInfo.identityNumber} />
            <SummaryRow label="College" value={realDetail.collegeName} />
            <SummaryRow label="Program" value={realDetail.program} />
            <SummaryRow label="Loan Amount" value={formatNPR(realDetail.loanAmount)} />
            <SummaryRow label="Phone Number" value={realDetail.studentInfo.phoneNumber} />
            <SummaryRow label="College Verified On" value={formatDate(realDetail.collegeVerifiedAt)} />
            <SummaryRow label="Workflow Stage" value={realDetail.workflowStage} success />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Credit scoring shown below is illustrative — it isn&apos;t backed by a real per-application scoring API yet.
        </p>

        <CreditScoringSection creditScore={DEFAULT_CREDIT_SCORE} complianceChecks={DEFAULT_COMPLIANCE_CHECKS} />
      </motion.div>
    );
  }

  // ─── Mock demo application: full illustrative workflow ──────────────────────────────────
  const detail = mockDetail!;
  const checkerStage = activeStages?.find((s) => s.role === "CHECKER");
  const isCheckerTurn = !decided && checkerStage?.status === "ACTIVE" && (detail.stageLabel === "Checking" || detail.stageLabel === "CICL Hold");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/approval")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Approval Workflow</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Education Loan Review</p>
      </div>

      {/* App + borrower row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-foreground font-mono">{detail.refNo}</h2>
          <span className="text-sm text-muted-foreground truncate">— {detail.borrowerName}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge variant="outline" className="text-xs font-medium">
            {detail.loanType} · {detail.amountLabel}
          </Badge>
          <Badge className={cn(STAGE_BADGE_CLASS[activeStageLabel ?? detail.stageLabel], "border-0 font-semibold text-xs")}>
            {activeStageLabel}
          </Badge>
        </div>
      </div>

      {/* Horizontal stage tracker */}
      {activeStages && <StageStepper stages={activeStages} />}

      {/* Borrower summary */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2.5">Borrower summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1.5">
          <SummaryRow label="Name" value={detail.borrowerName} />
          <SummaryRow label="Citizenship" value={detail.citizenshipNumber} />
          <SummaryRow label="DSGIR" value={detail.dsgirLabel} />
          <SummaryRow label="Risk grade" value={detail.riskGrade} success />
          <SummaryRow label="LTV" value={detail.ltvLabel} />
          <SummaryRow label="Collateral" value={detail.collateral} />
          <SummaryRow label="CICL" value={detail.ciclStatus} success={detail.ciclStatus === "Clear"} />
          <SummaryRow label="Insurance" value={detail.insuranceStatus} success={detail.insuranceStatus === "Attached"} />
        </div>
      </div>

      {/* Offer letter verification */}
      {detail.offerLetterRef !== "N/A" && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">Offer letter verification</h3>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              College offer letter verified via QR scan
              <br />
              <span
                className={cn(
                  "font-medium",
                  detail.offerLetterVerified ? "text-[oklch(0.42_0.18_145)] dark:text-success" : "text-destructive",
                )}
              >
                {detail.offerLetterVerified ? "✓" : "✗"} {detail.offerLetterRef} — {detail.offerLetterVerified ? "Valid" : "Unverified"} ·{" "}
                {detail.offerLetterCollege}
              </span>
            </p>
            <button type="button" className="text-xs font-medium text-primary hover:underline shrink-0">
              Re-verify
            </button>
          </div>
        </div>
      )}

      {/* Checker comments + actions, only while it's the Checker's turn */}
      {isCheckerTurn && (
        <>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Checker comments</h3>
            <Textarea
              placeholder="Enter your credit assessment, conditions, or reason for send-back…"
              value={checkerComment}
              onChange={(e) => setCheckerComment(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 gap-1.5 bg-[oklch(0.42_0.18_145)] hover:bg-[oklch(0.36_0.18_145)] text-white"
              onClick={() => decideChecker("forward")}
            >
              <Check className="w-4 h-4" /> Forward to approver
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5 border-[oklch(0.5_0.16_80)]/40 bg-[oklch(0.5_0.16_80)]/10 text-[oklch(0.4_0.16_80)] hover:bg-[oklch(0.5_0.16_80)]/20"
              onClick={() => decideChecker("sendBack")}
            >
              <Undo2 className="w-4 h-4" /> Send back to supporter
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => decideChecker("reject")}
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
          </div>
        </>
      )}

      {/* Activity trail */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Activity trail</h3>
        <ul className="space-y-3.5">
          {detail.activity.map((event, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                {i < detail.activity.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-1 min-w-0">
                <p className="text-sm text-foreground">
                  <Badge className={cn(ROLE_BADGE_CLASS[event.role], "border-0 text-[10px] font-semibold mr-1.5 align-middle")}>
                    {event.roleLabel}
                  </Badge>
                  <span className="font-semibold">{event.actorName}</span> — {event.action}
                  {event.note ? <span className="text-muted-foreground">. &ldquo;{event.note}&rdquo;</span> : null}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(event.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
        
      <CreditScoringSection creditScore={detail.creditScore} complianceChecks={detail.complianceChecks} />
    </motion.div>
  );
}
