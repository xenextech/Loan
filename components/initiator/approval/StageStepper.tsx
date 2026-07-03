import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalStage } from "./types";

/** Compact horizontal step tracker: Initiator -> Supporter -> Checker -> Approver. */
export function StageStepper({ stages }: { stages: ApprovalStage[] }) {
  return (
    <div className="flex items-stretch rounded-lg border border-border overflow-hidden">
      {stages.map((stage, i) => {
        const isDone = stage.status === "DONE";
        const isActive = stage.status === "ACTIVE";
        return (
          <div key={stage.role} className="flex items-center flex-1 min-w-0">
            <div
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 text-center min-w-0",
                isDone && "bg-[var(--success)]/10",
                isActive && "bg-primary/10 ring-1 ring-inset ring-primary",
                !isDone && !isActive && "bg-muted/30",
              )}
            >
              {isDone ? (
                <Check className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success" />
              ) : isActive ? (
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <p
                className={cn(
                  "text-xs font-semibold",
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-[oklch(0.42_0.18_145)] dark:text-success"
                      : "text-muted-foreground",
                )}
              >
                {stage.roleLabel}
              </p>
              <p className="text-[10px] text-muted-foreground truncate max-w-full">
                {stage.actorName} · {stage.actorTitle}
              </p>
            </div>
            {i < stages.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mx-0.5" />}
          </div>
        );
      })}
    </div>
  );
}
