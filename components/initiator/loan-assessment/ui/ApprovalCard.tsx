"use client";

import { CheckCircle2, Lock, ShieldCheck, ThumbsDown, User2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ApprovalRole, ApprovalStatus } from "../types";
import { ApprovalStatusBadge } from "./StatusBadge";
import { SignaturePlaceholder } from "./SignaturePlaceholder";

interface ApprovalCardProps {
  role: ApprovalRole;
  roleLabel: string;
  status: ApprovalStatus;
  approverName?: string;
  approvedDate?: string;
  remarks?: string;
  signature?: string;
  /** This is the approval card belonging to the logged-in user. */
  isCurrentUserRole: boolean;
  /** Sequential gate: true once every prior role in the chain has approved. */
  isUnlocked: boolean;
  waitingMessage?: string;
  onRemarksChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalCard({
  role,
  roleLabel,
  status,
  approverName,
  approvedDate,
  remarks,
  signature,
  isCurrentUserRole,
  isUnlocked,
  waitingMessage,
  onRemarksChange,
  onSignatureChange,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const isDecided = status === "APPROVED" || status === "REJECTED";
  const isEditable = isCurrentUserRole && isUnlocked && !isDecided;
  const isDisabledCard = !isCurrentUserRole || !isUnlocked;

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
              <User2 className="w-3 h-3" /> Approver Name
            </Label>
            <Input value={approverName ?? ""} disabled className="h-8 bg-muted/40" readOnly />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Approval Date</Label>
            <Input value={approvedDate ?? ""} disabled className="h-8 bg-muted/40" readOnly placeholder="Not yet approved" />
          </div>
        </div>

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
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
              status === "APPROVED" ? "bg-[var(--success)]/10 text-[oklch(0.42_0.18_145)]" : "bg-destructive/10 text-destructive",
            )}
          >
            {status === "APPROVED" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            )}
            <span>
              {status === "APPROVED" ? "Approved" : "Rejected"} by <strong>{approverName || roleLabel}</strong>
              {approvedDate ? ` on ${approvedDate}` : ""}.
            </span>
          </div>
        )}

        {isEditable && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" size="sm" onClick={onApprove} className="gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={onReject} className="gap-1.5">
              <ThumbsDown className="w-3.5 h-3.5" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
