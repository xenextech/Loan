"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ThumbsDown, Undo2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayName } from "@/lib/formatters";
import { useAppSelector } from "@/lib/hooks";
import { useApproveApplicationMutation, useRejectApplicationMutation, useSendBackApplicationMutation } from "@/lib/api/dashboardApi";
import { RoleApprovalCard } from "@/components/initiator/approval/RoleApprovalCard";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import type { ApplicationStage } from "@/types/dashboard";

/** Stages the backend allows the `approve` transition from (`ALLOWED_FROM_STAGE.approve`
 *  in dashboard-approval.service.ts). Reject/Send Back have no stage restriction
 *  server-side, but are gated to the same set here so the Approver only sees actions
 *  once an application has actually reached their desk. */
const APPROVE_ACTIONABLE_STAGES: ReadonlyArray<ApplicationStage | null> = ["CHECKING"];

// Only the Approver gets to choose which earlier role a send-back returns to —
// Support/Checker's own send-back is untouched and always defaults to the
// Initiator. The backend already accepts an arbitrary `toStage` on send-back
// (SendBackApplicationDto) and stores it as `sentBackToStage`, purely as a
// record of intent shown in the "Sent back to X" banner every review screen
// already renders — re-entry itself isn't gated by this value (support()/
// check() both accept resuming from SENT_BACK), so this only has to give each
// choice its own distinct, sensibly-labelled stage rather than model exact
// routing. Values reuse each role's own ApplicationStage rather than adding
// a new enum for this alone.
const SEND_BACK_TARGETS: { value: ApplicationStage; label: string }[] = [
  { value: "INITIATED", label: "Initiator" },
  { value: "SUPPORTED", label: "Supporter" },
  { value: "CHECKING", label: "Checker" },
];

function getApiErrorMessage(err: unknown): string | undefined {
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

/**
 * The Approver's actions on an application: `approve` (final sign-off, creates the
 * loan account), `reject`, and `send-back` — all three gated server-side to include
 * `@Roles(APPROVER)`. This is the last human decision point in the workflow.
 */
export function ApproverApprovalActions({ applicationId, stage }: { applicationId: string; stage: ApplicationStage | null }) {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);
  const userDisplayName = displayName(currentUser, "your account");
  const [attestationName, setAttestationName] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [sendBackReason, setSendBackReason] = useState("");
  const [sendBackTarget, setSendBackTarget] = useState<ApplicationStage>("INITIATED");

  const [approveApplication, { isLoading: isApproving }] = useApproveApplicationMutation();
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation();
  const [sendBackApplication, { isLoading: isSendingBack }] = useSendBackApplicationMutation();

  const actionable = APPROVE_ACTIONABLE_STAGES.includes(stage);
  const isSigned = attestationName.trim().length > 0;

  const handleApprove = async () => {
    try {
      await approveApplication(applicationId).unwrap();
      toast.success("Application approved", { description: "A loan account has been created." });
      setApproveOpen(false);
      router.push("/approver");
    } catch (err) {
      toast.error("Failed to approve this application", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await rejectApplication({ applicationId, data: { reason: rejectReason.trim() } }).unwrap();
      toast.success("Application rejected");
      setRejectOpen(false);
      setRejectReason("");
      router.push("/approver");
    } catch (err) {
      toast.error("Failed to reject this application", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  const handleSendBack = async () => {
    if (!sendBackReason.trim()) return;
    const targetLabel = SEND_BACK_TARGETS.find((t) => t.value === sendBackTarget)?.label ?? "Initiator";
    try {
      await sendBackApplication({ applicationId, data: { reason: sendBackReason.trim(), toStage: sendBackTarget } }).unwrap();
      toast.success("Application sent back", { description: `Returned to the ${targetLabel} for corrections.` });
      setSendBackOpen(false);
      setSendBackReason("");
      setSendBackTarget("INITIATED");
      router.push("/approver");
    } catch (err) {
      toast.error("Failed to send this application back", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  return (
    <>
      <RoleApprovalCard
        roleLabel="Approver"
        statusBadge={
          <Badge className={cn(stage ? STAGE_BADGE_CLASS[stage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {stage ? STAGE_LABEL[stage] : NO_STAGE_LABEL}
          </Badge>
        }
        actionable={actionable}
        waitingMessage={
          actionable ? undefined : `This application is at the ${stage ? STAGE_LABEL[stage] : "Not started"} stage — no Approver action is available here.`
        }
        attestationName={attestationName}
        onAttestationNameChange={setAttestationName}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            disabled={!isSigned}
            className="gap-1.5 bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white"
            onClick={() => setApproveOpen(true)}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </Button>
          <Button size="sm" variant="destructive" disabled={!isSigned} className="gap-1.5" onClick={() => setRejectOpen(true)}>
            <ThumbsDown className="w-3.5 h-3.5" /> Reject
          </Button>
          <Button size="sm" variant="outline" disabled={!isSigned} className="gap-1.5" onClick={() => setSendBackOpen(true)}>
            <Undo2 className="w-3.5 h-3.5" /> Send Back
          </Button>
        </div>
        {!isSigned && (
          <p className="text-[11px] text-muted-foreground/70">Type your name above ({userDisplayName}) to enable these actions.</p>
        )}
      </RoleApprovalCard>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This is the final sign-off — it creates the loan account and cannot be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white gap-1.5"
            >
              {isApproving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this application?</AlertDialogTitle>
            <AlertDialogDescription>This permanently rejects the application. Please provide a reason.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              Reason (required)
            </Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this application is being rejected…"
              className="mt-2 resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={sendBackOpen} onOpenChange={setSendBackOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this application back</AlertDialogTitle>
            <AlertDialogDescription>Choose who needs to act on it next, and provide a reason.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <Label htmlFor="send-back-target" className="text-sm font-medium">
                Send back to
              </Label>
              <Select value={sendBackTarget} onValueChange={(value) => setSendBackTarget(value as ApplicationStage)}>
                <SelectTrigger id="send-back-target" className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEND_BACK_TARGETS.map((target) => (
                    <SelectItem key={target.value} value={target.value}>
                      {target.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="send-back-reason" className="text-sm font-medium">
                Reason (required)
              </Label>
              <Textarea
                id="send-back-reason"
                value={sendBackReason}
                onChange={(e) => setSendBackReason(e.target.value)}
                placeholder="Explain what needs to be corrected…"
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingBack}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendBack} disabled={isSendingBack || !sendBackReason.trim()} className="gap-1.5">
              {isSendingBack && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Send Back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
