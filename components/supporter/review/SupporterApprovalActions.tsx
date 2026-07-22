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
import { CheckCircle2, Undo2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayName } from "@/lib/formatters";
import { useAppSelector } from "@/lib/hooks";
import { useSupportApplicationMutation, useSendBackApplicationMutation, useGetApprovalSummaryQuery } from "@/lib/api/dashboardApi";
import { RoleApprovalCard } from "@/components/initiator/approval/RoleApprovalCard";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import type { ApplicationStage } from "@/types/dashboard";

/** Stages the backend allows the `support` transition from (`ALLOWED_FROM_STAGE.support`
 *  in dashboard-approval.service.ts). */
const SUPPORT_ACTIONABLE_STAGES: ReadonlyArray<ApplicationStage | null> = [null, "INITIATED", "SENT_BACK"];

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
 * The Supporter's only two actions on an application, exactly matching what the
 * backend permits for the SUPPORTER role: `support` and `send-back` (both gated
 * server-side by `@Roles(SUPPORTER, ...)`). No Check/Approve/Reject controls —
 * those belong to Credit Manager/Checker and Approver dashboards.
 */
export function SupporterApprovalActions({ applicationId, stage }: { applicationId: string; stage: ApplicationStage | null }) {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);
  const userDisplayName = displayName(currentUser, "your account");
  const [attestationName, setAttestationName] = useState("");
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [reason, setReason] = useState("");

  const [supportApplication, { isLoading: isSupporting }] = useSupportApplicationMutation();
  const [sendBackApplication, { isLoading: isSendingBack }] = useSendBackApplicationMutation();
  // Who last supported this application, and when — invalidated automatically
  // after `supportApplication` succeeds (see approvalTransitionTags), so this
  // refetches and shows the name without a page reload.
  const { data: summary } = useGetApprovalSummaryQuery(applicationId);

  const actionable = SUPPORT_ACTIONABLE_STAGES.includes(stage);
  const isSigned = attestationName.trim().length > 0;

  const handleSupport = async () => {
    try {
      await supportApplication(applicationId).unwrap();
      toast.success("Application supported", { description: "Moved to the Checker/Credit Manager queue." });
      setSupportOpen(false);
      router.push("/supporter");
    } catch (err) {
      toast.error("Failed to support this application", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  const handleSendBack = async () => {
    if (!reason.trim()) return;
    try {
      await sendBackApplication({ applicationId, data: { reason: reason.trim() } }).unwrap();
      toast.success("Application sent back", { description: "Returned to the Initiator for corrections." });
      setSendBackOpen(false);
      setReason("");
      router.push("/supporter");
    } catch (err) {
      toast.error("Failed to send this application back", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  return (
    <>
      <RoleApprovalCard
        roleLabel="Support"
        statusBadge={
          <Badge className={cn(stage ? STAGE_BADGE_CLASS[stage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {stage ? STAGE_LABEL[stage] : NO_STAGE_LABEL}
          </Badge>
        }
        actionable={actionable}
        waitingMessage={
          actionable ? undefined : `This application is at the ${stage ? STAGE_LABEL[stage] : "Not started"} stage — no Support action is available here.`
        }
        completedBy={summary?.approvals.supporter}
        attestationName={attestationName}
        onAttestationNameChange={setAttestationName}
      >
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            disabled={!isSigned}
            className="gap-1.5 bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white"
            onClick={() => setSupportOpen(true)}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Support
          </Button>
          <Button size="sm" variant="outline" disabled={!isSigned} className="gap-1.5" onClick={() => setSendBackOpen(true)}>
            <Undo2 className="w-3.5 h-3.5" /> Send Back
          </Button>
        </div>
        {!isSigned && (
          <p className="text-[11px] text-muted-foreground/70">Type your name above ({userDisplayName}) to enable these actions.</p>
        )}
      </RoleApprovalCard>

      <AlertDialog open={supportOpen} onOpenChange={setSupportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Support this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the application forward to the Checker/Credit Manager stage. This action cannot be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSupporting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSupport}
              disabled={isSupporting}
              className="bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white gap-1.5"
            >
              {isSupporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Support
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
            <Label htmlFor="send-back-reason" className="text-sm font-medium">
              Reason (required)
            </Label>
            <Textarea
              id="send-back-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what needs to be corrected…"
              className="mt-2 resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingBack}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendBack} disabled={isSendingBack || !reason.trim()} className="gap-1.5">
              {isSendingBack && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Send Back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
