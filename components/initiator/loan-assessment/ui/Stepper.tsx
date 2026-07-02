"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "../constants";

interface StepperProps {
  currentStep: number;
  maxStepReached: number;
  onStepClick: (step: number) => void;
}

export function Stepper({ currentStep, maxStepReached, onStepClick }: StepperProps) {
  return (
    <div className="w-full">
      {/* Mobile: compact current-step indicator */}
      <div className="flex sm:hidden items-center justify-between px-4 py-3 bg-muted/50 rounded-xl">
        <span className="text-sm font-semibold text-foreground">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm text-muted-foreground truncate max-w-[55%]">
          {STEPS[currentStep - 1]?.shortLabel}
        </span>
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-start w-full overflow-x-auto no-scrollbar pb-1">
        {STEPS.map((step, idx) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = step.id < currentStep || (step.id <= maxStepReached && step.id < currentStep);
          const isClickable = step.id <= maxStepReached;

          return (
            <div key={step.id} className="flex items-start flex-1 last:flex-none min-w-[84px]">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1.5 group w-full",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200 shrink-0",
                    isCurrent && "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25",
                    isCompleted && !isCurrent && "bg-primary/10 border-primary text-primary",
                    !isCurrent && !isCompleted && isClickable && "bg-muted border-border text-muted-foreground group-hover:border-primary/40",
                    !isCurrent && !isCompleted && !isClickable && "bg-muted/50 border-border/60 text-muted-foreground/50",
                  )}
                >
                  {isCompleted && !isCurrent ? <Check className="w-3.5 h-3.5" /> : <span>{step.id}</span>}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight px-0.5",
                    isCurrent && "text-primary",
                    isCompleted && !isCurrent && "text-primary/70",
                    !isCurrent && !isCompleted && "text-muted-foreground",
                  )}
                >
                  {step.shortLabel}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <div className="flex-1 mt-4 mx-1">
                  <div className="h-px bg-border relative overflow-hidden">
                    {step.id < currentStep && <div className="absolute inset-0 bg-primary" />}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 hidden sm:block h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
