import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types/application";
import { Clock, CheckCircle2, XCircle, FileText, Send } from "lucide-react";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-muted text-muted-foreground border-0",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    className: "bg-primary/10 text-primary border-0",
  },
  under_review: {
    label: "Under Review",
    icon: Clock,
    className: "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-0",
  },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status];
  return (
    <Badge className={`${className} font-semibold text-xs gap-1.5`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
