"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2, ClipboardCheck, Eye, GitBranch, ThumbsDown, Undo2 } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import type { UserRole } from "@/types/api";
import { SectionCard } from "../ui/SectionCard";
import { ApprovalCard, type ApprovalAction } from "../ui/ApprovalCard";
import {
  INITIATOR_DESIGNATION_OPTIONS,
  SUPPORT_DESIGNATION_OPTIONS,
  CHECKER_DESIGNATION_OPTIONS,
  APPROVER_DESIGNATION_OPTIONS,
  type LoanAssessmentFormValues,
} from "../schema";
import type { ApprovalRole, ApprovalStatus } from "../types";

const DESIGNATION_OPTIONS_BY_ROLE: Record<ApprovalRole, readonly string[]> = {
  INITIATOR: INITIATOR_DESIGNATION_OPTIONS,
  SUPPORT: SUPPORT_DESIGNATION_OPTIONS,
  CHECKER: CHECKER_DESIGNATION_OPTIONS,
  APPROVER: APPROVER_DESIGNATION_OPTIONS,
};

const ROLE_LABELS: Record<ApprovalRole, string> = {
  INITIATOR: "Initiator",
  SUPPORT: "Support",
  CHECKER: "Checker",
  APPROVER: "Approver",
};

// Label for each card's name field — kept distinct from ROLE_LABELS (the card
// header) so each role reads its own name back, not a generic "Approver Name".
const NAME_FIELD_LABELS: Record<ApprovalRole, string> = {
  INITIATOR: "Initiator Name",
  SUPPORT: "Support Name",
  CHECKER: "Checker Name",
  APPROVER: "Approver Name",
};

const ROLE_KEY: Record<ApprovalRole, "initiator" | "support" | "checker" | "approver"> = {
  INITIATOR: "initiator",
  SUPPORT: "support",
  CHECKER: "checker",
  APPROVER: "approver",
};

// Maps the backend's account role (JWT/auth state) onto the wizard's local
// approval-chain role — CREDIT_MANAGER acts through the same "Checker" slot
// as CHECKER (see schema.prisma's LoanApplication comment: "CREDIT_MANAGER
// role is functionally the same actor as CHECKER — reuses checker* columns").
const BACKEND_ROLE_TO_APPROVAL_ROLE: Partial<Record<UserRole, ApprovalRole>> = {
  INITIATOR: "INITIATOR",
  SUPPORTER: "SUPPORT",
  CHECKER: "CHECKER",
  CREDIT_MANAGER: "CHECKER",
  APPROVER: "APPROVER",
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
  /** Defaults to the logged-in user's own role/name (from auth state) — pass
   *  explicit overrides only for a read-only preview of someone else's seat. */
  currentUserRole?: ApprovalRole;
  currentUserName?: string;
}

export function Step9Approval({ currentUserRole, currentUserName }: Step9ApprovalProps) {
  const { control, setValue, getValues } = useFormContext<LoanAssessmentFormValues>();
  const approval = useWatch({ control, name: "approval" });
  const authUser = useAppSelector((s) => s.auth.user);

  // Real logged-in staff account — fullName is now populated on the backend for
  // Initiator/Supporter/Checker/Approver users and returned by /auth/login and
  // /auth/me, so this is no longer a hardcoded mock. Falls back to email if the
  // account has no display name set yet, and to "INITIATOR" for any role this
  // wizard doesn't otherwise map (in practice only Initiators reach this screen).
  const resolvedRole = currentUserRole ?? (authUser?.role && BACKEND_ROLE_TO_APPROVAL_ROLE[authUser.role]) ?? "INITIATOR";
  const resolvedName = currentUserName ?? authUser?.fullName ?? authUser?.email ?? "";

  const isUnlocked = (role: ApprovalRole) => {
    if (role === "INITIATOR") return true;
    if (role === "SUPPORT") return approval?.initiator.status === "APPROVED";
    if (role === "CHECKER") return approval?.support.status === "APPROVED";
    return approval?.checker.status === "APPROVED";
  };

  const waitingMessage = (role: ApprovalRole) => {
    if (role === "SUPPORT") {
      // The gate clears once the Initiator approves — the message must reflect that,
      // otherwise it keeps telling a Support/Checker/Approver viewer to wait on a step that's done.
      return isUnlocked("SUPPORT") ? "Initiator has approved. Awaiting Support's review." : "Waiting for Initiator Approval.";
    }
    if (role === "CHECKER") {
      return isUnlocked("CHECKER") ? "Support has approved. Awaiting Checker's review." : "Waiting for Support Approval.";
    }
    if (role === "APPROVER") {
      return isUnlocked("APPROVER") ? "Checker has approved. Awaiting Approver's review." : "Waiting for Checker Approval.";
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
        approverName: current.approverName || resolvedName,
        approvedDate: todayISODate(),
      },
      { shouldDirty: true, shouldValidate: true },
    );

    if (status === "APPROVED") {
      const nextRole =
        role === "INITIATOR" ? "SUPPORT" : role === "SUPPORT" ? "CHECKER" : role === "CHECKER" ? "APPROVER" : null;
      if (nextRole) {
        const nextKey = ROLE_KEY[nextRole];
        const next = getValues(`approval.${nextKey}`);
        if (next.status === "WAITING") {
          setValue(`approval.${nextKey}`, { ...next, status: "PENDING" }, { shouldDirty: true });
        }
      }
    }
  };

  const roles: ApprovalRole[] = ["INITIATOR", "SUPPORT", "CHECKER", "APPROVER"];

  return (
    <div className="space-y-5">
      <SectionCard
        icon={GitBranch}
        title="Approval Chain"
        description="All four roles are shown so the full chain is visible. Approval is strictly sequential — no role can act before the previous one has approved."
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
                nameLabel={NAME_FIELD_LABELS[role]}
                status={entry.status}
                approverName={entry.approverName}
                approvedDate={entry.approvedDate}
                remarks={entry.remarks}
                signature={entry.signature}
                {...(role === "INITIATOR" && {
                  branchName: approval?.initiator?.branchName,
                  onBranchNameChange: (value: string) =>
                    setValue("approval.initiator.branchName", value, { shouldDirty: true }),
                })}
                designation={entry.designation}
                designationOptions={DESIGNATION_OPTIONS_BY_ROLE[role]}
                onDesignationChange={(value: string) =>
                  setValue(`approval.${key}.designation`, value, { shouldDirty: true })
                }
                isCurrentUserRole={role === resolvedRole}
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
