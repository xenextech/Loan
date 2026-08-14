"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Cloud, ClipboardCheck, Loader2, Save } from "lucide-react";
import { timeAgo } from "@/lib/formatters";
import { Stepper } from "./ui/Stepper";
import { STEPS, TOTAL_STEPS } from "./constants";
import { useLoanAssessmentForm } from "./useLoanAssessmentForm";
import type { LoanAssessmentFormValues, LoanAssessmentSubmitValues } from "./schema";
import { Step1ApplicantInfo } from "./steps/Step1ApplicantInfo";
import { Step2NrbReporting } from "./steps/Step2NrbReporting";
import { Step3ApplicantBackground } from "./steps/Step3ApplicantBackground";
import { Step4CreditAssessment } from "./steps/Step4CreditAssessment";
import { Step5SecurityGuarantee } from "./steps/Step5SecurityGuarantee";
import { Step6InsuranceRepayment } from "./steps/Step6InsuranceRepayment";
import { Step7RiskAssessment } from "./steps/Step7RiskAssessment";
import { Step8Recommendation } from "./steps/Step8Recommendation";
import { Step9Approval } from "./steps/Step9Approval";
import { Step10ReviewSubmit } from "./steps/Step10ReviewSubmit";

interface LoanAssessmentFormProps {
  applicationId: string;
  initialValues?: Partial<LoanAssessmentFormValues>;
  /** True once POST .../initiator has ever succeeded for this application — see useLoanAssessmentForm. */
  hasInitiatorInfo?: boolean;
  /** The student's requested loan amount (LoanInformation.loanAmount) — the single
   *  source of truth for Step 4's Credit Limit. Undefined/0 means it failed to load. */
  applicationLoanAmount?: number;
  /** True when Support/Approver sent the application back to the Initiator to
   *  fix and resend. Step 10 (Review & Submit) is a first-submission-only step —
   *  a resubmission ends at Step 9's Approval chain instead. */
  isResubmission?: boolean;
  onSubmitted?: (values: LoanAssessmentSubmitValues) => void;
}

export function LoanAssessmentForm({
  applicationId,
  initialValues,
  hasInitiatorInfo = false,
  applicationLoanAmount,
  isResubmission = false,
  onSubmitted,
}: LoanAssessmentFormProps) {
  const steps = isResubmission ? STEPS.slice(0, TOTAL_STEPS - 1) : STEPS;
  const totalSteps = steps.length;

  const {
    form,
    currentStep,
    maxStepReached,
    goToStep,
    goPrev,
    submitStepAndAdvance,
    isSyncingStep,
    saveDraft,
    submit,
    lastSavedAt,
  } = useLoanAssessmentForm(applicationId, initialValues, hasInitiatorInfo, applicationLoanAmount, totalSteps);

  const step = steps[currentStep - 1];
  const isLastStep = currentStep === totalSteps;

  const isFirstStep = currentStep === 1 && !hasInitiatorInfo;


  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const handleSubmit = async () => {
    await submit(async (values) => {
      toast.success("Loan Assessment submitted", {
        description: "The application has moved to Support for review.",
      });
      onSubmitted?.(values);
    });
  };

  return (
    <Form {...form}>
      <div className="space-y-5">
        <div ref={topRef} />
        <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
          <Stepper steps={steps} currentStep={currentStep} maxStepReached={maxStepReached} onStepClick={goToStep} />
        </div>

        <div>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1">
            Step {currentStep} of {totalSteps}
          </p>
          <h2 className="text-lg font-bold text-foreground">{step.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentStep === 1 && <Step1ApplicantInfo />}
            {currentStep === 2 && <Step2NrbReporting />}
            {currentStep === 3 && <Step3ApplicantBackground applicationLoanAmount={applicationLoanAmount} />}
            {currentStep === 4 && <Step4CreditAssessment applicationLoanAmount={applicationLoanAmount} />}
            {currentStep === 5 && <Step5SecurityGuarantee />}
            {currentStep === 6 && <Step6InsuranceRepayment />}
            {currentStep === 7 && <Step7RiskAssessment />}
            {currentStep === 8 && <Step8Recommendation />}
            {currentStep === 9 && <Step9Approval />}
            {currentStep === 10 && !isResubmission && <Step10ReviewSubmit onEdit={goToStep} />}
          </motion.div>
        </AnimatePresence>

        {/* Right padding on lg+ keeps the primary actions clear of the fixed ContactWidget bubble docked at bottom-right. */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-sm lg:pr-24">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentStep === 1 || isSyncingStep}
            className="gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {currentStep === 1 ? "Back" : "Previous"}
          </Button>

          <div className="flex items-center gap-3 order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start">
            {lastSavedAt && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Cloud className="w-3.5 h-3.5" />
                Saved {timeAgo(lastSavedAt.toISOString())}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 order-2 sm:order-3">
            <Button type="button" variant="ghost" size="sm" onClick={saveDraft} disabled={isSyncingStep} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </Button>
            {isLastStep ? (
              <Button type="button" size="sm" onClick={handleSubmit} className="gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Submit Loan Assessment
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={submitStepAndAdvance} disabled={isSyncingStep} className="gap-1.5">
                {isSyncingStep ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {isFirstStep ? "Submitting…" : "Updating…"}
                  </>
                ) : (
                  <>
                    {isFirstStep ? "Next" : "Update"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
