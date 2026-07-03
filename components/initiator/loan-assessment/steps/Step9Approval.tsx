"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2, ClipboardCheck, Eye, GitBranch, ThumbsDown, Undo2 } from "lucide-react";
import { SectionCard } from "../ui/SectionCard";
import { ApprovalCard, type ApprovalAction } from "../ui/ApprovalCard";
import type { LoanAssessmentFormValues } from "../schema";
import type { ApprovalRole, ApprovalStatus } from "../types";
import { CURRENT_USER_ROLE, CURRENT_USER_NAME } from "../constants";

const ROLE_LABELS: Record<ApprovalRole, string> = {
  INITIATOR: "Initiator",
  SUPPORT: "Support",
  APPROVER: "Approver",
};

const ROLE_KEY: Record<ApprovalRole, "initiator" | "support" | "approver"> = {
  INITIATOR: "initiator",
  SUPPORT: "support",
  APPROVER: "approver",
};

// Initiator/Approver make a single up-or-down call; Support has two non-terminal
// checkpoints (Review, Field Verify) before its own final Support/Send Back decision.
const APPROVE_REJECT_ACTIONS: ApprovalAction[] = [
  { label: "Approve", status: "APPROVED", icon: CheckCircle2 },
  { label: "Reject", status: "REJECTED", icon: ThumbsDown, variant: "destructive" },
];

const SUPPORT_ACTIONS: ApprovalAction[] = [
  { label: "Mark Reviewed", status: "UNDER_REVIEW", icon: Eye, variant: "outline" },
  { label: "Field Verify", status: "FIELD_VERIFIED", icon: ClipboardCheck, variant: "outline" },
  { label: "Support", status: "APPROVED", icon: CheckCircle2 },
  { label: "Send Back", status: "SENT_BACK", icon: Undo2, variant: "destructive" },
];

const todayISODate = () => new Date().toISOString().slice(0, 10);

interface Step9ApprovalProps {
  /** Defaults to the module-wide Initiator constants — Supporter/Approver views pass their own. */
  currentUserRole?: ApprovalRole;
  currentUserName?: string;
}

export function Step9Approval({ currentUserRole = CURRENT_USER_ROLE, currentUserName = CURRENT_USER_NAME }: Step9ApprovalProps) {
  const { control, setValue, getValues } = useFormContext<LoanAssessmentFormValues>();
  const approval = useWatch({ control, name: "approval" });

  const isUnlocked = (role: ApprovalRole) => {
    if (role === "INITIATOR") return true;
    if (role === "SUPPORT") return approval?.initiator.status === "APPROVED";
    return approval?.support.status === "APPROVED";
  };

  const waitingMessage = (role: ApprovalRole) => {
    if (role === "SUPPORT") {
      // The gate clears once the Initiator approves — the message must reflect that,
      // otherwise it keeps telling a Support/Approver viewer to wait on a step that's done.
      return isUnlocked("SUPPORT") ? "Initiator has approved. Awaiting Support's review." : "Waiting for Initiator Approval.";
    }
    if (role === "APPROVER") {
      return isUnlocked("APPROVER") ? "Support has approved. Awaiting Approver's review." : "Waiting for Support Approval.";
    }
    return undefined;
  };

  const decide = (role: ApprovalRole, status: ApprovalStatus) => {
    const key = ROLE_KEY[role];
    const current = getValues(`approval.${key}`);
    setValue(
      `approval.${key}`,
      {
        ...current,
        status,
        approverName: current.approverName || currentUserName,
        approvedDate: todayISODate(),
      },
      { shouldDirty: true, shouldValidate: true },
    );

    if (status === "APPROVED") {
      const nextRole = role === "INITIATOR" ? "SUPPORT" : role === "SUPPORT" ? "APPROVER" : null;
      if (nextRole) {
        const nextKey = ROLE_KEY[nextRole];
        const next = getValues(`approval.${nextKey}`);
        if (next.status === "WAITING") {
          setValue(`approval.${nextKey}`, { ...next, status: "PENDING" }, { shouldDirty: true });
        }
      }
    }
  };

  const roles: ApprovalRole[] = ["INITIATOR", "SUPPORT", "APPROVER"];

  return (
    <div className="space-y-5">
      <SectionCard
        icon={GitBranch}
        title="Approval Chain"
        description="All three roles are shown so the full chain is visible. Approval is strictly sequential — no role can act before the previous one has approved."
      >
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => {
            const key = ROLE_KEY[role];
            const entry = approval?.[key];
            if (!entry) return null;
            return (
              <ApprovalCard
                key={role}
                role={role}
                roleLabel={ROLE_LABELS[role]}
                status={entry.status}
                approverName={entry.approverName}
                approvedDate={entry.approvedDate}
                remarks={entry.remarks}
                signature={entry.signature}
                isCurrentUserRole={role === currentUserRole}
                isUnlocked={isUnlocked(role)}
                waitingMessage={waitingMessage(role)}
                actions={role === "SUPPORT" ? SUPPORT_ACTIONS : APPROVE_REJECT_ACTIONS}
                onRemarksChange={(value) => setValue(`approval.${key}.remarks`, value, { shouldDirty: true })}
                onSignatureChange={(value) => setValue(`approval.${key}.signature`, value, { shouldDirty: true })}
                onAction={(status) => decide(role, status)}
              />
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
