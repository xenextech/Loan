"use client";

import type { LucideIcon } from "lucide-react";
import { Building2, Lock, ShieldCheck, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ApprovalRole, ApprovalStatus } from "../types";
import { TERMINAL_APPROVAL_STATUSES } from "../types";
import { DESIGNATION_OPTIONS } from "../schema";
import { ApprovalStatusBadge, APPROVAL_STATUS_CONFIG } from "./StatusBadge";
import { SignaturePlaceholder } from "./SignaturePlaceholder";

/** One action button on an editable card — e.g. Approve/Reject, or Support's Review/Field Verify/Support/Send Back. */
export interface ApprovalAction {
  label: string;
  status: ApprovalStatus;
  icon: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
}

interface ApprovalCardProps {
  role: ApprovalRole;
  roleLabel: string;
  /** Label for the name field — role-specific ("Initiator Name", "Approver Name", etc). */
  nameLabel: string;
  status: ApprovalStatus;
  approverName?: string;
  approvedDate?: string;
  remarks?: string;
  signature?: string;
  /** Only the Initiator's card collects these — undefined/no handlers on the other three roles. */
  branchName?: string;
  designation?: string;
  onBranchNameChange?: (value: string) => void;
  onDesignationChange?: (value: string) => void;
  /** This is the approval card belonging to the logged-in user. */
  isCurrentUserRole: boolean;
  /** Sequential gate: true once every prior role in the chain has approved. */
  isUnlocked: boolean;
  waitingMessage?: string;
  /** Action buttons shown while the card is editable — role-specific (2 for Initiator/Approver, 4 for Support). */
  actions: ApprovalAction[];
  onRemarksChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  onAction: (status: ApprovalStatus) => void;
}

export function ApprovalCard({
  role,
  roleLabel,
  nameLabel,
  status,
  approverName,
  approvedDate,
  remarks,
  signature,
  branchName,
  designation,
  onBranchNameChange,
  onDesignationChange,
  isCurrentUserRole,
  isUnlocked,
  waitingMessage,
  actions,
  onRemarksChange,
  onSignatureChange,
  onAction,
}: ApprovalCardProps) {
  const showBranchDesignation = onBranchNameChange !== undefined || onDesignationChange !== undefined;
  const isDecided = TERMINAL_APPROVAL_STATUSES.includes(status);
  const isEditable = isCurrentUserRole && isUnlocked && !isDecided;
  const isDisabledCard = !isCurrentUserRole || !isUnlocked;
  const decidedConfig = APPROVAL_STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "rounded-xl border transition-opacity",
        isDisabledCard ? "border-border/70 bg-muted/20 opacity-60 cursor-not-allowed" : "border-border bg-card",
      )}
      aria-disabled={isDisabledCard}
    >
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isDisabledCard ? "bg-muted" : "bg-primary/10",
            )}
          >
            {isDisabledCard ? (
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{roleLabel}</p>
            <p className="text-[11px] text-muted-foreground">{role}</p>
          </div>
        </div>
        <ApprovalStatusBadge status={status} />
      </div>

      <div className="p-4 space-y-4">
        {isDisabledCard && waitingMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {waitingMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <User2 className="w-3 h-3" /> {nameLabel}
            </Label>
            <Input value={approverName ?? ""} disabled className="h-8 bg-muted/40" readOnly />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Approval Date</Label>
            <Input value={approvedDate ?? ""} disabled className="h-8 bg-muted/40" readOnly placeholder="Not yet approved" />
          </div>
        </div>

        {showBranchDesignation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Branch Name
              </Label>
              <Input
                value={branchName ?? ""}
                onChange={(e) => onBranchNameChange?.(e.target.value)}
                disabled={!isEditable}
                placeholder={isEditable ? "e.g. Kathmandu Branch" : "Not set"}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Designation</Label>
              <Select
                value={designation || undefined}
                onValueChange={(value) => onDesignationChange?.(value)}
                disabled={!isEditable}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Remarks</Label>
          <Textarea
            value={remarks ?? ""}
            onChange={(e) => onRemarksChange(e.target.value)}
            disabled={!isEditable}
            placeholder={isEditable ? "Add remarks for this approval…" : "No remarks yet"}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Digital Signature</Label>
          <SignaturePlaceholder value={signature} onChange={onSignatureChange} disabled={!isEditable} />
        </div>

        {isDecided && (
          <div className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-xs", decidedConfig.className)}>
            <decidedConfig.icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {decidedConfig.label} by <strong>{approverName || roleLabel}</strong>
              {approvedDate ? ` on ${approvedDate}` : ""}.
            </span>
          </div>
        )}

        {isEditable && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((action) => (
              <Button
                key={action.label}
                type="button"
                size="sm"
                variant={action.variant ?? "default"}
                onClick={() => onAction(action.status)}
                className="gap-1.5"
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
