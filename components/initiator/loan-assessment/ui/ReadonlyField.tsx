import { cn } from "@/lib/utils";

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

/** Compact label/value pair used in review summaries. */
export function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  const isEmpty = value === undefined || value === null || value === "";
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium leading-snug break-words", isEmpty ? "text-muted-foreground/60 italic" : "text-foreground")}>
        {isEmpty ? "Not provided" : value}
      </p>
    </div>
  );
}
