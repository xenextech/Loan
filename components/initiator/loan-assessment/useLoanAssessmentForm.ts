"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loanAssessmentSchema, type LoanAssessmentFormValues, type LoanAssessmentSubmitValues } from "./schema";
import { DEFAULT_LOAN_ASSESSMENT_VALUES, DRAFT_STORAGE_PREFIX, STEP_FIELD_PATHS, TOTAL_STEPS } from "./constants";

const AUTOSAVE_DEBOUNCE_MS = 1500;

function mergeDefaults(overrides?: Partial<LoanAssessmentFormValues>): LoanAssessmentFormValues {
  if (!overrides) return DEFAULT_LOAN_ASSESSMENT_VALUES;
  return {
    ...DEFAULT_LOAN_ASSESSMENT_VALUES,
    ...overrides,
    applicantInfo: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.applicantInfo, ...overrides.applicantInfo },
    approval: {
      initiator: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.initiator, ...overrides.approval?.initiator },
      support: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.support, ...overrides.approval?.support },
      approver: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.approver, ...overrides.approval?.approver },
    },
  };
}

/**
 * Owns the single React Hook Form instance for the whole multi-step assessment,
 * plus step navigation, per-step validation, and draft persistence.
 * Draft storage is `localStorage` today, keyed by application id — swap the two
 * marked spots for real `GET/PUT /initiator/applications/:id/assessment` calls
 * once the backend endpoint exists; nothing else in the form needs to change.
 */
export function useLoanAssessmentForm(applicationId: string, initialValues?: Partial<LoanAssessmentFormValues>) {
  const storageKey = `${DRAFT_STORAGE_PREFIX}${applicationId}`;

  const form = useForm<LoanAssessmentFormValues>({
    resolver: zodResolver(loanAssessmentSchema),
    defaultValues: mergeDefaults(initialValues),
    mode: "onBlur",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Load a locally-saved draft on mount, if one exists (API integration point #1).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw) as LoanAssessmentFormValues;
        form.reset(mergeDefaults(draft));
      }
    } catch {
      // Corrupt/legacy draft — ignore and start fresh.
    } finally {
      setIsDraftLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Silent autosave to localStorage (API integration point #2). Subscribes to
  // RHF's change stream directly instead of a reactive `watch()`/`useWatch()`
  // value, so field edits don't force this whole hook's consumers to re-render.
  useEffect(() => {
    if (!isDraftLoaded) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const subscription = form.watch((values) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(values));
          setLastSavedAt(new Date());
        } catch {
          // Storage unavailable (e.g. private browsing quota) — non-fatal.
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [form, isDraftLoaded, storageKey]);

  const goToStep = useCallback(
    async (target: number) => {
      const clamped = Math.min(Math.max(target, 1), TOTAL_STEPS);
      if (clamped > currentStep) {
        const fields = STEP_FIELD_PATHS[currentStep] ?? [];
        const valid = fields.length ? await form.trigger(fields) : true;
        if (!valid) {
          toast.error("Please fix the highlighted fields before continuing.");
          return false;
        }
      }
      if (clamped === TOTAL_STEPS) {
        await form.trigger();
      }
      setCurrentStep(clamped);
      setMaxStepReached((prev) => Math.max(prev, clamped));
      return true;
    },
    [currentStep, form],
  );

  const goNext = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const goPrev = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  const saveDraft = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(form.getValues()));
      setLastSavedAt(new Date());
      toast.success("Draft saved", { description: "Your progress has been saved on this device." });
    } catch {
      toast.error("Could not save draft. Please try again.");
    }
  }, [form, storageKey]);

  const submit = useCallback(
    async (onValid: (values: LoanAssessmentSubmitValues) => void | Promise<void>) => {
      const valid = await form.trigger();
      if (!valid) {
        await goToStep(TOTAL_STEPS);
        toast.error("Some required fields are missing", {
          description: "Review the highlighted sections before submitting.",
        });
        return false;
      }
      // Full form already validated above — parse to get the clean, coerced payload.
      await onValid(loanAssessmentSchema.parse(form.getValues()));
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Non-fatal.
      }
      return true;
    },
    [form, goToStep, storageKey],
  );

  return useMemo(
    () => ({
      form,
      currentStep,
      maxStepReached,
      goToStep,
      goNext,
      goPrev,
      saveDraft,
      submit,
      lastSavedAt,
      isDraftLoaded,
    }),
    [form, currentStep, maxStepReached, goToStep, goNext, goPrev, saveDraft, submit, lastSavedAt, isDraftLoaded],
  );
}
