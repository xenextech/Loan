"use client";

import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NumberField } from "../fields/NumberField";
import type { AutoCalculatedField, AutoCalculatedFieldName } from "../useAutoCalculatedField";

interface AutoCalculatedNumberFieldProps {
  name: AutoCalculatedFieldName;
  label: string;
  suffix?: string;
  /** The controller returned by `useAutoCalculatedField` for this same field. */
  state: AutoCalculatedField;
  /** How the number is arrived at — shown whenever the field is auto-filled. */
  formula: string;
  /** Human-readable names of the inputs still needed before the value can be derived. */
  missingInputs?: string[];
}

/**
 * A numeric field that fills itself in from a formula but stays editable.
 * The status line underneath is the whole point: an assessor must be able to
 * tell at a glance whether the number in front of them was derived or typed,
 * and get back to the derived one in a single click.
 */
export function AutoCalculatedNumberField({
  name,
  label,
  suffix,
  state,
  formula,
  missingInputs,
}: AutoCalculatedNumberFieldProps) {
  const hasMissingInputs = !state.isOverridden && !state.isAutoFilled && !!missingInputs?.length;

  return (
    <div className="space-y-1.5">
      <NumberField name={name} label={label} suffix={suffix} />

      {state.isAutoFilled && (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium">
            Auto-calculated
          </Badge>
          <span>{formula}</span>
        </p>
      )}

      {state.isOverridden && (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-medium">
            Manual override
          </Badge>
          <button
            type="button"
            onClick={state.recalculate}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Recalculate
          </button>
        </p>
      )}

      {hasMissingInputs && (
        <p className="text-xs text-muted-foreground/80">
          Auto-calculates once you fill in: {missingInputs!.join(", ")}.
        </p>
      )}
    </div>
  );
}
