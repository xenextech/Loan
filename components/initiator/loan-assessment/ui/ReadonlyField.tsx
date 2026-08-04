"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SUMMARY_ITEM_TRUNCATE_LENGTH = 140;

interface ReadonlyFieldProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  emphasize?: boolean;
  className?: string;
}

/** Displays a calculated / non-editable value with the same rhythm as an input field. */
export function ReadonlyField({ label, value, hint, emphasize, className }: ReadonlyFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        className={cn(
          "h-8 flex items-center rounded-lg border border-dashed border-border bg-muted/40 px-2.5 text-sm",
          emphasize ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {value === undefined || value === null || value === "" ? "—" : value}
      </div>
      {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

/** Compact label/value pair used in review summaries. Long text values get a
 *  "View more" toggle instead of being permanently cut off — shared by every
 *  role's read-only assessment view (Initiator, Supporter, Checker, Approver),
 *  since they all render through the same AssessmentSummary. */
export function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = value === undefined || value === null || value === "";
  const isLongText = typeof value === "string" && value.length > SUMMARY_ITEM_TRUNCATE_LENGTH;
  const displayValue =
    isLongText && !expanded ? `${value.slice(0, SUMMARY_ITEM_TRUNCATE_LENGTH)}…` : value;

  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium leading-snug break-words", isEmpty ? "text-muted-foreground/60 italic" : "text-foreground")}>
        {isEmpty ? "Not provided" : displayValue}
      </p>
      {isLongText && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
}
