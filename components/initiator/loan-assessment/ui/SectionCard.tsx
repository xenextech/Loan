import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("border-border shadow-none", className)}>
      <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{title}</span>
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground/80 mt-1 normal-case font-normal">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className={cn("p-5", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/** Grid wrapper for grouping related fields inside a SectionCard. */
export function FormSection({
  title,
  columns = 2,
  children,
  className,
}: {
  title?: string;
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  const colClass = columns === 1 ? "sm:grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      <div className={cn("grid grid-cols-1 gap-x-5 gap-y-4", colClass)}>{children}</div>
    </div>
  );
}
