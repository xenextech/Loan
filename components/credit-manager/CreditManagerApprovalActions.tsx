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
import { ThumbsDown, Undo2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayName } from "@/lib/formatters";
import { useAppSelector } from "@/lib/hooks";
import { useRejectApplicationMutation, useSendBackApplicationMutation } from "@/lib/api/dashboardApi";
import { RoleApprovalCard } from "@/components/initiator/approval/RoleApprovalCard";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import type { ApplicationStage } from "@/types/dashboard";

/** Credit Manager's queue is scoped to APPROVED loans awaiting servicing/disbursement
 *  (see buildFilterWhere()'s 'my-queue' special case in dashboard-applications.service.ts)
 *  — reject/send-back have no stage restriction server-side, but are gated to that same
 *  scope here so these actions only appear once an application is actually on the Credit
 *  Manager's desk. */
const CREDIT_MANAGER_ACTIONABLE_STAGES: ReadonlyArray<ApplicationStage | null> = ["APPROVED"];

const CREDIT_MANAGER_DESIGNATION_OPTIONS = ["Documentation", "Disbursement"] as const;

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
 * The Credit Manager's actions on an application: `reject` and `send-back` only
 * (both gated server-side to include `@Roles(CREDIT_MANAGER)`) — there is no
 * `check`/`approve` route for this role, since CHECKER already owns `check`.
 */
export function CreditManagerApprovalActions({ applicationId, stage }: { applicationId: string; stage: ApplicationStage | null }) {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);
  const userDisplayName = displayName(currentUser, "your account");
  const [attestationName, setAttestationName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [designation, setDesignation] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [sendBackReason, setSendBackReason] = useState("");

  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation();
  const [sendBackApplication, { isLoading: isSendingBack }] = useSendBackApplicationMutation();

  const actionable = CREDIT_MANAGER_ACTIONABLE_STAGES.includes(stage);
  const isSigned = attestationName.trim().length > 0;

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await rejectApplication({
        applicationId,
        data: {
          reason: rejectReason.trim(),
          branchName: branchName.trim() || undefined,
          designation: designation || undefined,
          signature: attestationName.trim() || undefined,
        },
      }).unwrap();
      toast.success("Application rejected");
      setRejectOpen(false);
      setRejectReason("");
      router.push("/credit-manager");
    } catch (err) {
      toast.error("Failed to reject this application", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  const handleSendBack = async () => {
    if (!sendBackReason.trim()) return;
    try {
      await sendBackApplication({
        applicationId,
        data: {
          reason: sendBackReason.trim(),
          branchName: branchName.trim() || undefined,
          designation: designation || undefined,
          signature: attestationName.trim() || undefined,
        },
      }).unwrap();
      toast.success("Application sent back", { description: "Returned to the Initiator for corrections." });
      setSendBackOpen(false);
      setSendBackReason("");
      router.push("/credit-manager");
    } catch (err) {
      toast.error("Failed to send this application back", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  return (
    <>
      <RoleApprovalCard
        roleLabel="Credit Manager"
        statusBadge={
          <Badge className={cn(stage ? STAGE_BADGE_CLASS[stage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {stage ? STAGE_LABEL[stage] : NO_STAGE_LABEL}
          </Badge>
        }
        actionable={actionable}
        waitingMessage={
          actionable
            ? undefined
            : `This application is at the ${stage ? STAGE_LABEL[stage] : "Not started"} stage — no Credit Manager action is available here.`
        }
        branchName={branchName}
        onBranchNameChange={setBranchName}
        designation={designation}
        designationOptions={CREDIT_MANAGER_DESIGNATION_OPTIONS}
        onDesignationChange={setDesignation}
        attestationName={attestationName}
        onAttestationNameChange={setAttestationName}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
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

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this application?</AlertDialogTitle>
            <AlertDialogDescription>This permanently rejects the application. Please provide a reason.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="cm-reject-reason" className="text-sm font-medium">
              Reason (required)
            </Label>
            <Textarea
              id="cm-reject-reason"
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
            <AlertDialogTitle>Send back to Initiator</AlertDialogTitle>
            <AlertDialogDescription>This returns the application to the Initiator for corrections. Please provide a reason.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="cm-send-back-reason" className="text-sm font-medium">
              Reason (required)
            </Label>
            <Textarea
              id="cm-send-back-reason"
              value={sendBackReason}
              onChange={(e) => setSendBackReason(e.target.value)}
              placeholder="Explain what needs to be corrected…"
              className="mt-2 resize-none"
              rows={3}
            />
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
