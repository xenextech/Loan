"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { id: 1, label: "About You", shortLabel: "About" },
  { id: 2, label: "Identity", shortLabel: "Identity" },
  { id: 3, label: "Family & Education", shortLabel: "Family" },
  { id: 4, label: "Review & Submit", shortLabel: "Review" },
];

interface WizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps: number[];
}

export default function WizardProgress({
  currentStep,
  onStepClick,
  completedSteps,
}: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Mobile: vertical compact */}
      <div className="flex sm:hidden items-center justify-between px-4 py-3 bg-muted/50 rounded-xl">
        <span className="text-sm font-semibold text-foreground">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {STEPS[currentStep - 1].label}
        </span>
        <span className="text-sm font-semibold text-primary">
          {Math.round(((currentStep - 1) / STEPS.length) * 100 + 25)}%
        </span>
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center w-full">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1.5 group",
                  isClickable && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200",
                    isCurrent &&
                      "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25",
                    isCompleted &&
                      !isCurrent &&
                      "bg-primary/10 border-primary text-primary group-hover:bg-primary group-hover:text-primary-foreground",
                    !isCurrent && !isCompleted && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <span>{step.id}</span>
                  )}

                  {/* Pulse ring for current */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && !isCurrent && "text-primary/70",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-3 mt-[-18px]">
                  <div className="h-px bg-border relative overflow-hidden">
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-primary"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ transformOrigin: "left" }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
