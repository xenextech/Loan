"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setStep,
  setApplicationId,
  updateStepData,
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
import { BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
    submittedApplicationNumber,
    submissionLinks,
  } = useAppSelector((s) => s.application);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const [createDraft, { isLoading: isCreating }] = useCreateDraftMutation();
  const [saveStep1, { isLoading: isSaving1 }] = useSaveStep1Mutation();
  const [saveStep2, { isLoading: isSaving2 }] = useSaveStep2Mutation();
  const [saveStep3, { isLoading: isSaving3 }] = useSaveStep3Mutation();
  const [submitApplication, { isLoading: isSubmitting }] =
    useSubmitApplicationMutation();

  // Create draft on mount
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y < 10) {
        setHidden(false);
      } else if (y > lastScrollY.current + 4 && y > 80) {
        setHidden(true);
      } else if (y < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const goNext = useCallback(
    (step: number) => {
      setDirection(1);
      setCompletedSteps((prev) => [...new Set([...prev, step])]);
      dispatch(setStep(step + 1));
    },
    [dispatch],
  );

  const goPrev = (step: number) => {
    setDirection(-1);
    dispatch(setStep(step - 1));
  };

  // ─── Step handlers — save fires ONLY on Continue click ───────────────────

  const handleStep1 = async (data: Step1FormData) => {
    dispatch(updateStepData({ step: "step1", data }));
    if (applicationId) {
      try {
        await saveStep1({ id: applicationId, data }).unwrap();
      } catch {
        toast.error("Failed to save. Your data is kept locally.");
      }
    }
    goNext(1);
  };

  const handleStep2 = async (data: Step2FormData) => {
    dispatch(updateStepData({ step: "step2", data }));
    if (applicationId) {
      try {
        await saveStep2({ id: applicationId, data }).unwrap();
      } catch {
        toast.error("Failed to save. Your data is kept locally.");
      }
    }
    goNext(2);
  };

  const handleStep3 = async (data: Step3FormData) => {
    dispatch(updateStepData({ step: "step3", data }));
    if (applicationId) {
      try {
        await saveStep3({ id: applicationId, data }).unwrap();
      } catch {
        toast.error("Failed to save. Your data is kept locally.");
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
      dispatch(
        setSubmitted({
          applicationNumber: result.applicationNumber,
          parentLink: result.parentLink,
          collegeLink: result.collegeLink,
        }),
      );
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
        parentLink={submissionLinks?.parentLink ?? undefined}
        collegeLink={submissionLinks?.collegeLink ?? undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Fixed header with hide-on-scroll behaviour */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40"
        animate={{ y: hidden ? "-100%" : 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div
          className={`transition-all duration-200 border-b border-border ${
            scrolled
              ? "bg-card/97 backdrop-blur-md shadow-sm shadow-black/6 border-zinc-200/80"
              : "bg-card shadow-sm"
          }`}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Image
                  src="/logo-white-bg.svg"
                  alt="Logo"
                  width={120}
                  height={120}
                />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="h-14" />

      {/* Progress */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
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
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
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
                    isSaving={isSaving1}
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
                    isSaving={isSaving2}
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
                    isSaving={isSaving3}
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
