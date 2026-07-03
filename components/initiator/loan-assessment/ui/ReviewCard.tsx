import { Pencil, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  title: string;
  stepId: number;
  /** Omit to render a pure read-only card with no Edit button (e.g. a Supporter/Approver review view). */
  onEdit?: (stepId: number) => void;
  incomplete?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ReviewCard({ title, stepId, onEdit, incomplete, children, className }: ReviewCardProps) {
  return (
    <Card className={cn("border-border shadow-none", className)}>
      <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          {title}
          {incomplete && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.5_0.16_80)] bg-[var(--warning)]/15 px-1.5 py-0.5 rounded-full">
              <AlertTriangle className="w-2.5 h-2.5" />
              Incomplete
            </span>
          )}
        </CardTitle>
        {onEdit && (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => onEdit(stepId)}>
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-4">
        {children}
      </CardContent>
    </Card>
  );
}
