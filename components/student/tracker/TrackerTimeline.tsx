"use client";
import { useState } from "react";
import { Check, Circle, XCircle, Undo2, MinusCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import type { TrackerStage, TrackerStageStatus } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { STAGE_STATUS_LABEL, STAGE_STATUS_BADGE_CLASS, ROLE_LABEL } from "./trackerBadge";

const DOT_CLASS: Record<TrackerStageStatus, string> = {
  COMPLETED: "bg-[var(--success)] text-white",
  IN_PROGRESS: "bg-primary text-primary-foreground",
  PENDING: "bg-muted text-muted-foreground border border-border",
  REJECTED: "bg-destructive text-white",
  SENT_BACK: "bg-[var(--warning)] text-white",
  SKIPPED: "bg-muted text-muted-foreground border border-border",
};

function StageIcon({ status }: { status: TrackerStageStatus }) {
  const cls = "w-3.5 h-3.5";
  switch (status) {
    case "COMPLETED":
      return <Check className={cls} />;
    case "IN_PROGRESS":
      return <span className="w-2 h-2 rounded-full bg-current animate-pulse" />;
    case "REJECTED":
      return <XCircle className={cls} />;
    case "SENT_BACK":
      return <Undo2 className={cls} />;
    case "SKIPPED":
      return <MinusCircle className={cls} />;
    case "PENDING":
    default:
      return <Circle className={cls} />;
  }
}

function StageRow({ stage, isLast, defaultOpen }: { stage: TrackerStage; isLast: boolean; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasDetails = Boolean(stage.completedAt || stage.completedBy || stage.reason);

  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center shrink-0">
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", DOT_CLASS[stage.status])}>
          <StageIcon status={stage.status} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
      </div>

      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
        <button
          type="button"
          disabled={!hasDetails}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center justify-between gap-3 text-left rounded-lg -mx-2 px-2 py-1.5 transition-colors",
            hasDetails && "hover:bg-muted/50",
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{stage.label}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[stage.role]}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={cn(STAGE_STATUS_BADGE_CLASS[stage.status], "border-0 text-[10px] font-semibold")}>
              {STAGE_STATUS_LABEL[stage.status]}
            </Badge>
            {hasDetails && (
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
            )}
          </div>
        </button>

        {open && hasDetails && (
          <div className="mt-1.5 ml-0 space-y-2 text-xs">
            {stage.completedBy && (
              <p className="text-muted-foreground">
                By <span className="font-medium text-foreground">{stage.completedBy}</span>
                {stage.completedAt && <> on {formatDate(stage.completedAt)}</>}
              </p>
            )}
            {!stage.completedBy && stage.completedAt && (
              <p className="text-muted-foreground">{formatDate(stage.completedAt)}</p>
            )}
            {stage.reason && (
              <div
                className={cn(
                  "rounded-md border-l-4 px-3 py-2",
                  stage.status === "REJECTED"
                    ? "bg-destructive/10 border-destructive text-destructive"
                    : "bg-[var(--warning)]/10 border-[var(--warning)] text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
                )}
              >
                {stage.reason}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Vertical lifecycle timeline for the student Application Tracker. Driven
 * entirely by the backend's `ApplicationTrackerResponseDto.timeline` — no
 * stage is invented on the frontend.
 */
export function TrackerTimeline({ timeline, currentStageKey }: { timeline: TrackerStage[]; currentStageKey: string | null }) {
  return (
    <div>
      {timeline.map((stage, i) => (
        <StageRow
          key={stage.key}
          stage={stage}
          isLast={i === timeline.length - 1}
          defaultOpen={stage.key === currentStageKey || stage.status === "REJECTED" || stage.status === "SENT_BACK"}
        />
      ))}
    </div>
  );
}
