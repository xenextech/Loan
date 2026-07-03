"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { AlertTriangle, ClipboardList } from "lucide-react";
import { AssessmentSummary } from "../ui/AssessmentSummary";
import type { LoanAssessmentFormValues } from "../schema";

const STEP_ID_BY_KEY: Record<string, number> = {
  applicantInfo: 1,
  nrbReporting: 2,
  creditAssessment: 3,
  applicantBackground: 4,
  security: 5,
  insuranceRepayment: 6,
  riskAssessment: 7,
  recommendation: 8,
  approval: 9,
};

const STEP_TITLE_BY_KEY: Record<string, string> = {
  applicantInfo: "Applicant Information",
  nrbReporting: "NRB Reporting",
  creditAssessment: "Credit Assessment",
  applicantBackground: "Applicant Background",
  security: "Security & Personal Guarantee",
  insuranceRepayment: "Insurance & Repayment Capacity",
  riskAssessment: "Risk Assessment",
  recommendation: "Loan Recommendation",
  approval: "Approval",
};

export function Step10ReviewSubmit({ onEdit }: { onEdit: (stepId: number) => void }) {
  const { formState } = useFormContext<LoanAssessmentFormValues>();

  const incompleteKeys = useMemo(() => Object.keys(formState.errors) as (keyof LoanAssessmentFormValues)[], [formState.errors]);

  return (
    <div className="space-y-5">
      {incompleteKeys.length > 0 && (
        <div className="rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[oklch(0.5_0.16_80)] shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Some required fields are missing</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {incompleteKeys.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className="underline underline-offset-2 hover:text-foreground"
                    onClick={() => onEdit(STEP_ID_BY_KEY[key] ?? 1)}
                  >
                    {STEP_TITLE_BY_KEY[key] ?? key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ClipboardList className="w-4 h-4" />
        Review every section below. Use Edit to jump back and make changes.
      </div>

      <AssessmentSummary onEdit={onEdit} />
    </div>
  );
}
