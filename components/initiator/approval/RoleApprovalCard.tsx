"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SignaturePlaceholder } from "@/components/initiator/loan-assessment/ui/SignaturePlaceholder";

interface RoleApprovalCardProps {
  roleLabel: string;
  /** Real stage badge (from `stageBadge.ts`) — kept as the single source of truth for
   *  status, instead of introducing a second, mock status vocabulary here. */
  statusBadge: React.ReactNode;
  actionable: boolean;
  waitingMessage?: string;
  /** Typed personal confirmation shown above the action buttons — see caption below
   *  for why this isn't sent to the backend (there is no field for it there; the
   *  actor of record is always the signed-in account, not this free-typed value). */
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
  attestationName,
  onAttestationNameChange,
  children,
}: RoleApprovalCardProps) {
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
        {!actionable && waitingMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {waitingMessage}
          </div>
        )}

        {actionable && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Digital Signature</Label>
              <SignaturePlaceholder value={attestationName} onChange={onAttestationNameChange} />
              <p className="text-[11px] text-muted-foreground/70">
                This confirms your decision on screen. The system always records your signed-in account as the actual approver of record —
                the backend has no field to override that with a typed name.
              </p>
            </div>
            {children}
          </>
        )}
      </div>
    </div>
  );
}
