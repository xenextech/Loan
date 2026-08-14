"use client";

import { Building2, Lock, ShieldCheck, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { SignaturePlaceholder } from "@/components/initiator/loan-assessment/ui/SignaturePlaceholder";
import type { ApprovalStageActor } from "@/types/dashboard";

interface RoleApprovalCardProps {
  roleLabel: string;
  /** Real stage badge (from `stageBadge.ts`) — kept as the single source of truth for
   *  status, instead of introducing a second, mock status vocabulary here. */
  statusBadge: React.ReactNode;
  actionable: boolean;
  waitingMessage?: string;
  /** Who last performed this role's action, and when — from `ApprovalSummary.approvals`
   *  (stamped server-side from the signed-in account, never a typed value). Renders a
   *  "Supported by …" line when present; omit or pass null while the stage hasn't happened. */
  completedBy?: ApprovalStageActor | null;
  /** Branch/designation the acting role records for their own decision — sent to the
   *  backend with the actual transition call (support/check/approve/reject/send-back),
   *  unlike attestationName below. Optional: omit both to hide this row entirely. */
  branchName?: string;
  onBranchNameChange?: (value: string) => void;
  designation?: string;
  designationOptions?: readonly string[];
  onDesignationChange?: (value: string) => void;
  /** Typed digital-signature placeholder shown above the action buttons — sent to
   *  the backend as `signature` on the actual transition call, alongside branchName/
   *  designation, and stored on that role's own *Signature column. The actor of
   *  record (who/when) is still always the signed-in account, never this value. */
  attestationName: string;
  onAttestationNameChange: (value: string) => void;
  children: React.ReactNode;
}

/**
 * Shared card shell for the Supporter's and Checker's own single-role decision —
 * visually modeled on `ApprovalCard` (the Initiator wizard's mock Approval Chain
 * step): locked/unlocked look, real stage badge, and a typed digital-signature
 * field. Unlike the wizard's mock, this card is driven entirely by the real
 * `ApplicationStage` and its buttons call the real backend mutations.
 */
export function RoleApprovalCard({
  roleLabel,
  statusBadge,
  actionable,
  waitingMessage,
  completedBy,
  branchName,
  onBranchNameChange,
  designation,
  designationOptions,
  onDesignationChange,
  attestationName,
  onAttestationNameChange,
  children,
}: RoleApprovalCardProps) {
  const showBranchName = onBranchNameChange !== undefined;
  const showDesignation = onDesignationChange !== undefined;

  return (
    <div className={cn("rounded-xl border transition-opacity", actionable ? "border-border bg-card" : "border-border/70 bg-muted/20")}>
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", actionable ? "bg-primary/10" : "bg-muted")}>
            {actionable ? <ShieldCheck className="w-3.5 h-3.5 text-primary" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{roleLabel}</p>
        </div>
        {statusBadge}
      </div>

      <div className="p-4 space-y-4">
        {completedBy && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-foreground">
            <UserRound className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span>
              {roleLabel} by <span className="font-semibold">{completedBy.name ?? "—"}</span>
              {completedBy.post && <span className="text-muted-foreground"> ({completedBy.post})</span>}
              {completedBy.branch && <span className="text-muted-foreground"> · {completedBy.branch}</span>}
              {completedBy.approvedAt && <span className="text-muted-foreground"> · {formatDate(completedBy.approvedAt)}</span>}
            </span>
          </div>
        )}

        {!actionable && waitingMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {waitingMessage}
          </div>
        )}

        {actionable && (
          <>
            {(showBranchName || showDesignation) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {showBranchName && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" /> Branch Name
                    </Label>
                    <Input
                      value={branchName ?? ""}
                      onChange={(e) => onBranchNameChange?.(e.target.value)}
                      placeholder="e.g. Kathmandu Branch"
                      className="h-8"
                    />
                  </div>
                )}
                {showDesignation && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Designation</Label>
                    <Select value={designation || undefined} onValueChange={(value) => onDesignationChange?.(value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {(designationOptions ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Digital Signature</Label>
              <SignaturePlaceholder value={attestationName} onChange={onAttestationNameChange} />
              <p className="text-[11px] text-muted-foreground/70">
                Saved alongside your decision. The system always records your signed-in account as the actual approver of record —
                this typed value is stored as a signature only, not used to identify who acted.
              </p>
            </div>
            {children}
          </>
        )}
      </div>
    </div>
  );
}
