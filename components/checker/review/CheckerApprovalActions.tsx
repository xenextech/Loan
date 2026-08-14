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
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayName } from "@/lib/formatters";
import { useAppSelector } from "@/lib/hooks";
import { useCheckApplicationMutation } from "@/lib/api/dashboardApi";
import { RoleApprovalCard } from "@/components/initiator/approval/RoleApprovalCard";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import type { ApplicationStage } from "@/types/dashboard";

/** Stages the backend allows the `check` transition from (`ALLOWED_FROM_STAGE.check`
 *  in dashboard-approval.service.ts). */
const CHECK_ACTIONABLE_STAGES: ReadonlyArray<ApplicationStage | null> = ["SUPPORTED", "SENT_BACK"];

// Only one option "for now" — expand this list as more designations apply.
const CHECKER_DESIGNATION_OPTIONS = ["BM"] as const;

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
 * The Checker's only action on an application: a single tick marking it as checked
 * (`check`, gated server-side to `@Roles(CHECKER)` — Credit Manager no longer shares
 * this route). No Send Back/Reject controls here — those belong to the Supporter and
 * Approver dashboards.
 */
export function CheckerApprovalActions({ applicationId, stage }: { applicationId: string; stage: ApplicationStage | null }) {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);
  const userDisplayName = displayName(currentUser, "your account");
  const [attestationName, setAttestationName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [designation, setDesignation] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [checkApplication, { isLoading: isChecking }] = useCheckApplicationMutation();

  const actionable = CHECK_ACTIONABLE_STAGES.includes(stage);
  const isSigned = attestationName.trim().length > 0;

  const handleCheck = async () => {
    try {
      await checkApplication({
        applicationId,
        data: {
          branchName: branchName.trim() || undefined,
          designation: designation || undefined,
          signature: attestationName.trim() || undefined,
        },
      }).unwrap();
      toast.success("Application checked", { description: "Moved to the Approver queue." });
      setConfirmOpen(false);
      router.push("/checker");
    } catch (err) {
      toast.error("Failed to check this application", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  return (
    <>
      <RoleApprovalCard
        roleLabel="Checker"
        statusBadge={
          <Badge className={cn(stage ? STAGE_BADGE_CLASS[stage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {stage ? STAGE_LABEL[stage] : NO_STAGE_LABEL}
          </Badge>
        }
        actionable={actionable}
        waitingMessage={
          actionable ? undefined : `This application is at the ${stage ? STAGE_LABEL[stage] : "Not started"} stage — no Check action is available here.`
        }
        branchName={branchName}
        onBranchNameChange={setBranchName}
        designation={designation}
        designationOptions={CHECKER_DESIGNATION_OPTIONS}
        onDesignationChange={setDesignation}
        attestationName={attestationName}
        onAttestationNameChange={setAttestationName}
      >
        <Button
          size="sm"
          disabled={!isSigned}
          className="gap-1.5 bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white"
          onClick={() => setConfirmOpen(true)}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Checked
        </Button>
        {!isSigned && (
          <p className="text-[11px] text-muted-foreground/70">Type your name above ({userDisplayName}) to enable this action.</p>
        )}
      </RoleApprovalCard>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this application as checked?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the application forward to the Approver stage. This action cannot be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChecking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCheck}
              disabled={isChecking}
              className="bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white gap-1.5"
            >
              {isChecking && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
