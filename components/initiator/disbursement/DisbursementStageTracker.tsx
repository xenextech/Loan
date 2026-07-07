import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DisbursementStage {
  label: string;
  done: boolean;
}

/**
 * Visual tracker for a single loan's disbursement journey. Each stage's
 * checkmark is computed independently (not a single cumulative index) —
 * the backend's `confirm()` never actually checks conditions-completeness
 * before allowing a tranche, so it's honestly possible for e.g. "Disbursement
 * Executed" to be done while "Conditions Completed" isn't. Showing that
 * mismatch plainly is more useful than forcing artificial linearity.
 */
export function DisbursementStageTracker({ stages }: { stages: DisbursementStage[] }) {
  return (
    <div className="flex items-stretch rounded-lg border border-border overflow-hidden font-sans">
      {stages.map((stage, i) => (
        <div key={stage.label} className={cn("flex-1 min-w-0", i < stages.length - 1 && "border-r border-border")}>
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-3 text-center",
              stage.done ? "bg-[var(--success)]/10" : "bg-muted/30",
            )}
          >
            {stage.done ? (
              <Check className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            <p className={cn("text-[11px] font-semibold leading-tight", stage.done ? "text-[oklch(0.42_0.18_145)] dark:text-success" : "text-muted-foreground")}>
              {stage.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
