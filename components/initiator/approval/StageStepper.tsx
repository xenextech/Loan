import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/** The 4 linear approval stages this stepper visualizes — REJECTED/SENT_BACK
 *  are terminal/side states rendered by the parent as a banner instead. */
export type LinearStage = "INITIATED" | "SUPPORTED" | "CHECKING" | "APPROVED";

const STEPS: { stage: LinearStage; roleLabel: string }[] = [
  { stage: "INITIATED", roleLabel: "Initiator" },
  { stage: "SUPPORTED", roleLabel: "Supporter" },
  { stage: "CHECKING", roleLabel: "Checker" },
  { stage: "APPROVED", roleLabel: "Approver" },
];

/**
 * Horizontal step tracker driven by the application's real `stage` field.
 * `stage` here is the *resolved* linear stage to display — null/INITIATED
 * means only the Initiator step is done; APPROVED means all four are done.
 */
export function StageStepper({ stage }: { stage: LinearStage | null }) {
  // How many of the 4 steps are complete, per the same stage semantics the
  // backend's `ALLOWED_FROM_STAGE` transition table uses.
  const doneCount = stage === null || stage === "INITIATED" ? 1 : STEPS.findIndex((s) => s.stage === stage) + 1;

  return (
    <div className="flex items-stretch rounded-lg border border-border overflow-hidden">
      {STEPS.map((step, i) => {
        const isDone = i < doneCount;
        const isActive = i === doneCount && doneCount < STEPS.length;
        return (
          <div key={step.stage} className="flex-1 min-w-0 border-r border-border last:border-r-0">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-3 text-center",
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
                  isActive ? "text-primary" : isDone ? "text-[oklch(0.42_0.18_145)] dark:text-success" : "text-muted-foreground",
                )}
              >
                {step.roleLabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
