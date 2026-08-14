import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Eye, Hourglass, MapPinCheck, Undo2, XCircle } from "lucide-react";
import type { ApprovalRole, ApprovalStatus } from "../types";
import { cn } from "@/lib/utils";

export const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  },
  WAITING: {
    label: "Waiting",
    icon: Hourglass,
    className: "bg-muted text-muted-foreground",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Eye,
    className: "bg-primary/10 text-primary",
  },
  FIELD_VERIFIED: {
    label: "Field Verified",
    icon: MapPinCheck,
    className: "bg-primary/10 text-primary",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-[var(--success)]",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
  SENT_BACK: {
    label: "Sent Back",
    icon: Undo2,
    className: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  },
};

// The terminal "APPROVED" status reads differently per role — the Initiator
// "initiates", Support "supports", the Checker/Credit Manager "checks", and
// only the Approver actually "approves". Every other status is shared as-is.
const APPROVED_LABEL_BY_ROLE: Record<ApprovalRole, string> = {
  INITIATOR: "Initiated",
  SUPPORT: "Supported",
  CHECKER: "Checked",
  APPROVER: "Approved",
};

export function getApprovalStatusLabel(role: ApprovalRole, status: ApprovalStatus): string {
  if (status === "APPROVED") return APPROVED_LABEL_BY_ROLE[role];
  return APPROVAL_STATUS_CONFIG[status].label;
}

export function ApprovalStatusBadge({
  role,
  status,
  className,
}: {
  role: ApprovalRole;
  status: ApprovalStatus;
  className?: string;
}) {
  const config = APPROVAL_STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge className={cn(config.className, "border-0 font-semibold text-xs gap-1.5", className)}>
      <Icon className="w-3 h-3" />
      {getApprovalStatusLabel(role, status)}
    </Badge>
  );
}
