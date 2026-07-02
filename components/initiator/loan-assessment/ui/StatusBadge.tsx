import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Hourglass, XCircle } from "lucide-react";
import type { ApprovalStatus } from "../types";
import { cn } from "@/lib/utils";

const CONFIG: Record<ApprovalStatus, { label: string; icon: React.ElementType; className: string }> = {
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
};

export function ApprovalStatusBadge({ status, className }: { status: ApprovalStatus; className?: string }) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge className={cn(config.className, "border-0 font-semibold text-xs gap-1.5", className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
