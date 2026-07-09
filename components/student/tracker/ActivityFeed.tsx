import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { TrackerStage } from "@/types/api";
import { STAGE_STATUS_BADGE_CLASS, STAGE_STATUS_LABEL } from "./trackerBadge";

/**
 * Reverse-chronological activity feed derived from the tracker's own
 * `timeline[]` — the backend has no separate student-facing audit-log
 * endpoint (the raw AuditLog trail at /dashboard/approval/:id/activity is
 * staff-only), so completed/rejected/sent-back stages double as the history.
 */
export function ActivityFeed({ timeline }: { timeline: TrackerStage[] }) {
  const events = timeline
    .filter((s) => s.completedAt)
    .slice()
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No activity recorded yet.</p>;
  }

  return (
    <ul className="space-y-3.5">
      {events.map((event, i) => (
        <li key={event.key} className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-1 min-w-0">
            <p className="text-sm text-foreground">
              <Badge className={cn(STAGE_STATUS_BADGE_CLASS[event.status], "border-0 text-[10px] font-semibold mr-1.5 align-middle")}>
                {STAGE_STATUS_LABEL[event.status]}
              </Badge>
              <span className="font-semibold">{event.label}</span>
              {event.completedBy && <> — {event.completedBy}</>}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(event.completedAt)}</p>
            {event.reason && <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{event.reason}&rdquo;</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
