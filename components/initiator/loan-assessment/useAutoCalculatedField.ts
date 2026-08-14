"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext, useWatch, type FieldPathByValue } from "react-hook-form";
import type { LoanAssessmentFormValues } from "./schema";

/**
 * Only the schema's `optionalNumber` fields can be auto-calculated. Narrowing to
 * them (rather than accepting any `FieldPath`) is what lets `setValue` below
 * stay type-checked instead of leaning on a cast.
 */
export type AutoCalculatedFieldName = FieldPathByValue<
  LoanAssessmentFormValues,
  string | number | undefined
>;

/** Numeric form values are compared loosely — the field round-trips through a string input. */
const EPSILON = 0.005;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function matches(formValue: unknown, computed: number | undefined): boolean {
  if (computed === undefined) return isBlank(formValue);
  if (isBlank(formValue)) return false;
  const num = Number(formValue);
  return Number.isFinite(num) && Math.abs(num - computed) < EPSILON;
}

export interface AutoCalculatedField {
  /** The assessor has typed their own value; the formula is no longer writing to the field. */
  isOverridden: boolean;
  /** The field currently holds a live, formula-derived value. */
  isAutoFilled: boolean;
  /** Drop the override and put the computed value back (no-op while nothing is computable). */
  recalculate: () => void;
}

/**
 * Keeps a numeric form field in sync with a derived value, while still letting
 * the assessor overrule it — a credit file often needs a judgement call the
 * formula can't see (an undocumented obligation, a co-borrower's income).
 *
 * Behaviour:
 *  - Writes `computed` into the field whenever it changes, and clears the field
 *    if the inputs behind it go away (so a stale number can never quietly keep
 *    feeding the credit score).
 *  - The first time the field's value stops matching what this hook last wrote,
 *    that's a human edit: the hook backs off permanently until `recalculate()`.
 *  - A value already present when the hook mounts that the formula does not
 *    itself produce is treated as an existing override, so reopening a saved
 *    assessment (or stepping away and back) never silently rewrites it.
 */
export function useAutoCalculatedField(
  name: AutoCalculatedFieldName,
  computed: number | undefined,
): AutoCalculatedField {
  const { control, setValue } = useFormContext<LoanAssessmentFormValues>();
  const current = useWatch({ control, name });

  // Only consider it an initial manual override if:
  // 1. We have a computed value available right now (computed !== undefined)
  // 2. The field already contains a non-blank value
  // 3. That value does NOT match the computed value
  // If computed is undefined on mount (e.g. inputs still loading), it is NOT an override.
  const [isOverridden, setIsOverridden] = useState(() => {
    if (computed === undefined) return false;
    return !isBlank(current) && !matches(current, computed);
  });

  const overriddenRef = useRef(isOverridden);
  const lastWrittenRef = useRef<number | undefined>(undefined);

  // Keep ref in sync with state
  useEffect(() => {
    overriddenRef.current = isOverridden;
  }, [isOverridden]);

  // Detect a manual edit:
  // When current changes and doesn't match what the hook wrote or what was computed
  useEffect(() => {
    if (overriddenRef.current) return;

    if (lastWrittenRef.current !== undefined) {
      if (!matches(current, lastWrittenRef.current)) {
        overriddenRef.current = true;
        setIsOverridden(true);
      }
      return;
    }

    if (computed !== undefined && !isBlank(current) && !matches(current, computed)) {
      overriddenRef.current = true;
      setIsOverridden(true);
    }
  }, [current, computed]);

  // Push the derived value in (or clear if computed becomes undefined and was previously written by this hook)
  useEffect(() => {
    if (overriddenRef.current) return;

    if (computed === undefined) {
      if (lastWrittenRef.current === undefined) return;
      if (!matches(current, lastWrittenRef.current)) return;
      lastWrittenRef.current = undefined;
      setValue(name, "", { shouldDirty: true });
      return;
    }

    lastWrittenRef.current = computed;
    if (matches(current, computed)) return;
    setValue(name, computed, { shouldDirty: true });
  }, [computed, current, name, setValue]);

  const recalculate = useCallback(() => {
    overriddenRef.current = false;
    setIsOverridden(false);
    lastWrittenRef.current = computed;
    if (computed !== undefined) {
      setValue(name, computed, { shouldDirty: true, shouldValidate: true });
    }
  }, [computed, name, setValue]);

  return {
    isOverridden,
    isAutoFilled: !isOverridden && computed !== undefined,
    recalculate,
  };
}
