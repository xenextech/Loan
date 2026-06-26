"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setStep,
  setApplicationId,
  updateStepData,
  setAutoSaveStatus,
  setSubmitted,
} from "@/lib/store/applicationSlice";
import {
  useCreateDraftMutation,
  useSaveStep1Mutation,
  useSaveStep2Mutation,
  useSaveStep3Mutation,
  useSubmitApplicationMutation,
} from "@/lib/api/applicationApi";
import WizardProgress from "./WizardProgress";
import AutoSaveIndicator from "./AutoSaveIndicator";
import Step1AboutYou from "./steps/Step1AboutYou";
import Step2Identity from "./steps/Step2Identity";
import Step3FamilyEducation from "./steps/Step3FamilyEducation";
import Step4ReviewSubmit, {
  type Step4Declaration,
} from "./steps/Step4ReviewSubmit";
import SubmissionSuccess from "./SubmissionSuccess";
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
} from "@/lib/validations/schemas";
import { GraduationCap, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const slideVariants = {
  enter: { opacity: 0, x: 48 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
};

export default function ApplicationWizard() {
  const dispatch = useAppDispatch();
  const {
    applicationId,
    currentStep,
    formData,
    autoSaveStatus,
    lastSavedAt,
    hasUnsavedChanges,
    submittedApplicationNumber,
  } = useAppSelector((s) => s.application);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createDraft, { isLoading: isCreating }] = useCreateDraftMutation();
  const [saveStep1, { isLoading: isSaving1 }] = useSaveStep1Mutation();
  const [saveStep2, { isLoading: isSaving2 }] = useSaveStep2Mutation();
  const [saveStep3, { isLoading: isSaving3 }] = useSaveStep3Mutation();
  const [submitApplication, { isLoading: isSubmitting }] =
    useSubmitApplicationMutation();

  const isSaving = isSaving1 || isSaving2 || isSaving3;

  // Create a new draft application when the wizard first mounts
  useEffect(() => {
    if (applicationId) return;
    createDraft()
      .unwrap()
      .then((app) => {
        dispatch(
          setApplicationId({ id: app.id, number: app.applicationNumber }),
        );
      })
      .catch(() => {
        toast.error(
          "Failed to start application. Please refresh and try again.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save — fires 3 s after the last form change
  const triggerAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !applicationId) return;
    dispatch(setAutoSaveStatus("saving"));
    try {
      // Save whichever step the user is currently on
      if (currentStep === 1 && formData.step1) {
        await saveStep1({
          id: applicationId,
          data: formData.step1 as Step1FormData,
        }).unwrap();
      } else if (currentStep === 2 && formData.step2) {
        await saveStep2({
          id: applicationId,
          data: formData.step2 as Step2FormData,
        }).unwrap();
      } else if (currentStep === 3 && formData.step3) {
        await saveStep3({
          id: applicationId,
          data: formData.step3 as Step3FormData,
        }).unwrap();
      }
      dispatch(setAutoSaveStatus("saved"));
    } catch {
      dispatch(setAutoSaveStatus("error"));
    }
  }, [
    hasUnsavedChanges,
    applicationId,
    currentStep,
    formData,
    dispatch,
    saveStep1,
    saveStep2,
    saveStep3,
  ]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSaveTimer.current && clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(triggerAutoSave, 3000);
    }
    return () => {
      autoSaveTimer.current && clearTimeout(autoSaveTimer.current);
    };
  }, [hasUnsavedChanges, triggerAutoSave]);

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const goNext = (step: number) => {
    setDirection(1);
    setCompletedSteps((prev) => [...new Set([...prev, step])]);
    dispatch(setStep(step + 1));
  };

  const goPrev = (step: number) => {
    setDirection(-1);
    dispatch(setStep(step - 1));
  };

  // ─── Step handlers (save to backend then advance) ─────────────────────────

  const handleStep1 = async (data: Step1FormData) => {
    dispatch(updateStepData({ step: "step1", data }));
    if (applicationId) {
      try {
        await saveStep1({ id: applicationId, data }).unwrap();
        dispatch(setAutoSaveStatus("saved"));
      } catch {
        toast.error("Failed to save step 1. Your data is kept locally.");
      }
    }
    goNext(1);
  };

  const handleStep2 = async (data: Step2FormData) => {
    dispatch(updateStepData({ step: "step2", data }));
    if (applicationId) {
      try {
        await saveStep2({ id: applicationId, data }).unwrap();
        dispatch(setAutoSaveStatus("saved"));
      } catch {
        toast.error("Failed to save step 2. Your data is kept locally.");
      }
    }
    goNext(2);
  };

  const handleStep3 = async (data: Step3FormData) => {
    dispatch(updateStepData({ step: "step3", data }));
    if (applicationId) {
      try {
        await saveStep3({ id: applicationId, data }).unwrap();
        dispatch(setAutoSaveStatus("saved"));
      } catch {
        toast.error("Failed to save step 3. Your data is kept locally.");
      }
    }
    goNext(3);
  };

  const handleSubmit = async (decl: Step4Declaration) => {
    if (!applicationId || applicationId === "undefined") {
      toast.error("Application session lost. Please refresh.");
      return;
    }
    if (!decl?.informationAccurate || !decl?.authorizeVerification) {
      toast.error("Please agree to both declarations before submitting.");
      return;
    }
    try {
      const result = await submitApplication({
        id: applicationId,
        informationAccurate: decl.informationAccurate,
        authorizeVerification: decl.authorizeVerification,
      }).unwrap();
      dispatch(setSubmitted({ applicationNumber: result.applicationNumber }));
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (submittedApplicationNumber) {
    return (
      <SubmissionSuccess
        applicationNumber={submittedApplicationNumber}
        loanAmount={formData.step1?.loanAmount ?? 0}
        courseName={formData.step1?.courseName ?? ""}
        submittedAt={new Date().toISOString()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <GraduationCap className="w-5 h-5 text-primary" />
              GenZ Loan Edu Loan
            </Link>
            <AutoSaveIndicator
              status={isSaving ? "saving" : autoSaveStatus}
              lastSavedAt={lastSavedAt}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveNow={triggerAutoSave}
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Save & Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <WizardProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={(s) => {
              setDirection(s < currentStep ? -1 : 1);
              dispatch(setStep(s));
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {isCreating ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Preparing your application…
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Step header */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                  Step {currentStep} of 4
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {currentStep === 1 && "Tell us about yourself"}
                  {currentStep === 2 && "Verify your identity"}
                  {currentStep === 3 && "Family & education details"}
                  {currentStep === 4 && "Review & submit"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5">
                  {currentStep === 1 &&
                    "Enter your personal contact information and your study plans."}
                  {currentStep === 2 &&
                    "Upload your identity documents. We'll auto-fill details using OCR."}
                  {currentStep === 3 &&
                    "Provide your family background and education fee information."}
                  {currentStep === 4 &&
                    "Review your application carefully before final submission."}
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm px-6 sm:px-8 py-8">
                {currentStep === 1 && (
                  <Step1AboutYou
                    defaultValues={formData.step1}
                    onNext={handleStep1}
                    onDataChange={(data) =>
                      dispatch(updateStepData({ step: "step1", data }))
                    }
                  />
                )}
                {currentStep === 2 && (
                  <Step2Identity
                    defaultValues={formData.step2}
                    onNext={handleStep2}
                    onPrev={() => goPrev(2)}
                    onDataChange={(data) =>
                      dispatch(updateStepData({ step: "step2", data }))
                    }
                  />
                )}
                {currentStep === 3 && (
                  <Step3FamilyEducation
                    defaultValues={formData.step3}
                    onNext={handleStep3}
                    onPrev={() => goPrev(3)}
                    onDataChange={(data) =>
                      dispatch(updateStepData({ step: "step3", data }))
                    }
                  />
                )}
                {currentStep === 4 && (
                  <Step4ReviewSubmit
                    formData={formData}
                    isSubmitting={isSubmitting}
                    onPrev={() => goPrev(4)}
                    onEdit={(s) => {
                      setDirection(-1);
                      dispatch(setStep(s));
                    }}
                    onSubmit={handleSubmit}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
