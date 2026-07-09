"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateInitiatorApplicationMutation, useUpdateInitiatorApplicationMutation } from "@/lib/api/initiatorApi";
import { loanAssessmentSchema, type LoanAssessmentFormValues, type LoanAssessmentSubmitValues } from "./schema";
import { DEFAULT_LOAN_ASSESSMENT_VALUES, DRAFT_STORAGE_PREFIX, STEP_FIELD_PATHS, TOTAL_STEPS } from "./constants";

const AUTOSAVE_DEBOUNCE_MS = 1500;

function getApiErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.join(", ");
    }
  }
  return undefined;
}

/** Deep-merges saved partial assessment values with the full default shape — exported so any
 *  read-only consumer (e.g. the Supporter's assessment view) can safely render `LoanAssessmentFormValues`
 *  without duplicating the merge logic. */
export function mergeDefaults(overrides?: Partial<LoanAssessmentFormValues>): LoanAssessmentFormValues {
  if (!overrides) return DEFAULT_LOAN_ASSESSMENT_VALUES;
  return {
    ...DEFAULT_LOAN_ASSESSMENT_VALUES,
    ...overrides,
    applicantInfo: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.applicantInfo, ...overrides.applicantInfo },
    approval: {
      initiator: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.initiator, ...overrides.approval?.initiator },
      support: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.support, ...overrides.approval?.support },
      checker: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.checker, ...overrides.approval?.checker },
      approver: { ...DEFAULT_LOAN_ASSESSMENT_VALUES.approval.approver, ...overrides.approval?.approver },
    },
  };
}

/**
 * Owns the single React Hook Form instance for the whole multi-step assessment,
 * plus step navigation, per-step validation, and draft persistence.
 * `initialValues` seeds the form with whatever the backend already has saved
 * (see `toAssessmentInitialValues` in `lib/api/transforms.ts`); a same-device
 * `localStorage` draft layers on top of that for unsaved edits since the last
 * successful PATCH, keyed by application id.
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

  const [createInitiatorApplication, { isLoading: isCreatingStep }] = useCreateInitiatorApplicationMutation();
  const [updateInitiatorApplication, { isLoading: isUpdatingStep }] = useUpdateInitiatorApplicationMutation();
  const isSyncingStep = isCreatingStep || isUpdatingStep;

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

  /**
   * Drives the primary step button (Step 1 = "Next", every step after = "Update").
   * Step 1 creates the initiator record on the backend (Basic Information only,
   * per the create DTO). Every step after that PATCHes the same record with the
   * full accumulated form state — not just the current step's slice — so the
   * backend stays in sync regardless of which step was last edited. Only
   * advances to the next step once the request succeeds.
   */
  const submitStepAndAdvance = useCallback(async () => {
    if (isSyncingStep) return false; // guard against double-submit while a request is in flight
    if (currentStep >= TOTAL_STEPS) return false; // Review step submits via `submit()` instead

    const fields = STEP_FIELD_PATHS[currentStep] ?? [];
    const valid = fields.length ? await form.trigger(fields) : true;
    if (!valid) {
      toast.error("Please fix the highlighted fields before continuing.");
      return false;
    }

    try {
      if (currentStep === 1) {
        await createInitiatorApplication({ applicationId, data: form.getValues("applicantInfo") }).unwrap();
      } else {
        await updateInitiatorApplication({ applicationId, data: form.getValues() }).unwrap();
      }
    } catch (err) {
      toast.error(currentStep === 1 ? "Failed to submit applicant information" : "Failed to update the assessment", {
        description: getApiErrorMessage(err) ?? "Please try again.",
      });
      return false;
    }

    const next = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(next);
    setMaxStepReached((prev) => Math.max(prev, next));
    return true;
  }, [isSyncingStep, currentStep, form, applicationId, createInitiatorApplication, updateInitiatorApplication]);

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
      if (isSyncingStep) return false;
      const valid = await form.trigger();
      if (!valid) {
        await goToStep(TOTAL_STEPS);
        toast.error("Some required fields are missing", {
          description: "Review the highlighted sections before submitting.",
        });
        return false;
      }

      // Final consolidated PATCH — guarantees the backend has every step's latest
      // values even if the user jumped between steps via the Stepper instead of
      // clicking "Update" on each one.
      try {
        await updateInitiatorApplication({ applicationId, data: form.getValues() }).unwrap();
      } catch (err) {
        toast.error("Failed to save the assessment", { description: getApiErrorMessage(err) ?? "Please try again." });
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
    [form, goToStep, storageKey, isSyncingStep, applicationId, updateInitiatorApplication],
  );

  return useMemo(
    () => ({
      form,
      currentStep,
      maxStepReached,
      goToStep,
      goNext,
      goPrev,
      submitStepAndAdvance,
      isSyncingStep,
      saveDraft,
      submit,
      lastSavedAt,
      isDraftLoaded,
    }),
    [
      form,
      currentStep,
      maxStepReached,
      goToStep,
      goNext,
      goPrev,
      submitStepAndAdvance,
      isSyncingStep,
      saveDraft,
      submit,
      lastSavedAt,
      isDraftLoaded,
    ],
  );
}
