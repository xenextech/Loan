"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Gauge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { NumberField } from "../fields/NumberField";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import {
  PARENTS_BORROWINGS_WITH_BFIS_OPTIONS,
  SOURCE_OF_INCOME_OPTIONS,
  CREDIT_RISK_SCORING_OPTIONS,
  type LoanAssessmentFormValues,
} from "../schema";
import {
  calculateCreditScorePreview,
  type CreditScoreParameterKey,
} from "../creditScoreFormula";

const PARAMETER_LABEL: Record<CreditScoreParameterKey, string> = {
  creditLimit: "Credit Limit",
  dsgir: "DSGIR",
  operationOfInstitution: "Operation of Institution",
  satisfactoryPerformance: "Satisfactory Performance",
  parentsBorrowingsWithBFIs: "Parents Borrowings with BFIs",
  sourceOfIncome: "Source of Income",
};

const GRADE_LABEL: Record<string, string> = {
  A1: "Grade A1 — Low Risk",
  A2: "Grade A2 — Moderate Risk",
  A3: "Grade A3 — Medium Risk",
  A4: "Grade A4 — Medium-High Risk",
  NA: "Ungraded (≥80%)",
};

export function Step3CreditAssessment() {
  const { control, setValue } = useFormContext<LoanAssessmentFormValues>();
  const c = useWatch({ control, name: "creditAssessment" });

  const preview = useMemo(
    () =>
      calculateCreditScorePreview({
        creditLimit: c?.creditLimit === "" ? undefined : Number(c?.creditLimit),
        dsgir: c?.dsgir === "" ? undefined : Number(c?.dsgir),
        operationOfInstitution:
          c?.operationOfInstitution === "" ? undefined : Number(c?.operationOfInstitution),
        satisfactoryPerformance:
          c?.satisfactoryPerformance === "" ? undefined : Number(c?.satisfactoryPerformance),
        parentsBorrowingsWithBFIs: c?.parentsBorrowingsWithBFIs || undefined,
        sourceOfIncome: c?.sourceOfIncome || undefined,
      }),
    [
      c?.creditLimit,
      c?.dsgir,
      c?.operationOfInstitution,
      c?.satisfactoryPerformance,
      c?.parentsBorrowingsWithBFIs,
      c?.sourceOfIncome,
    ],
  );

  const applyCalculatedScore = () => {
    if (!preview) return;
    setValue("creditAssessment.totalScore", preview.totalWeightScore, { shouldDirty: true });
    setValue("creditAssessment.totalPercentage", preview.percentage, { shouldDirty: true });
    setValue("creditAssessment.riskGrade", GRADE_LABEL[preview.grade], { shouldDirty: true });
    setValue("creditAssessment.creditRiskScoring", preview.riskCategory, { shouldDirty: true });
  };

  return (
    <div className="space-y-5">
      <SectionCard icon={Gauge} title="Credit Scoring" description="Facility sizing and underwriting inputs.">
        <FormSection>
          <NumberField name="creditAssessment.creditLimit" label="Credit Limit" suffix="NPR" />
          <NumberField name="creditAssessment.loanToValueRatio" label="Loan to Value Ratio (%)" suffix="%" />
          <NumberField name="creditAssessment.dsgir" label="DSGIR (%)" suffix="%" />
          <NumberField name="creditAssessment.operationOfInstitution" label="Operation of Institution (Years)" />
          <NumberField name="creditAssessment.satisfactoryPerformance" label="Satisfactory Performance (Years)" />
          <SelectField
            name="creditAssessment.parentsBorrowingsWithBFIs"
            label="Parents/Subsidiaries Borrowings with BFIs"
            options={PARENTS_BORROWINGS_WITH_BFIS_OPTIONS}
          />
          <SelectField
            name="creditAssessment.sourceOfIncome"
            label="Source of Income"
            options={SOURCE_OF_INCOME_OPTIONS}
          />
          <NumberField name="creditAssessment.performanceYears" label="Performance Years (reference only)" />
          <NumberField name="creditAssessment.bankingRelationshipScore" label="Banking Relationship Score" />
          <NumberField name="creditAssessment.sourceOfIncomeScore" label="Source of Income Score (reference only)" />
        </FormSection>
      </SectionCard>

      <SectionCard
        title="Live Calculated Score"
        description="Weight × tier, computed from the fields above — the same formula the credit-scoring engine applies."
      >
        {!preview ? (
          <p className="text-sm text-muted-foreground">
            Enter at least one scoring field above (Credit Limit, DSGIR, Operation of Institution, Satisfactory
            Performance, Parents Borrowings, or Source of Income) to see the calculated score.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-border rounded-lg border border-border">
              {preview.breakdown.map((b) => (
                <div key={b.key} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="text-foreground">{PARAMETER_LABEL[b.key]}</span>
                  <span className="text-muted-foreground">
                    {b.point} pt × weight {b.weight} = <strong className="text-foreground">{b.weightScore}</strong>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Total: {preview.totalWeightScore} / {preview.maxPossibleScore}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {preview.percentage}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                {GRADE_LABEL[preview.grade]}
              </Badge>
              <Button type="button" size="sm" variant="outline" className="gap-1.5 ml-auto" onClick={applyCalculatedScore}>
                <Sparkles className="w-3.5 h-3.5" />
                Apply to Scoring Outcome
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Only parameters with a value are included — this preview will disagree with the final score if some
              fields above are still blank.
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Scoring Outcome" description="Final risk grade and aggregated scorecard result — auto-fill from the live calculation above, or set manually to override it.">
        <FormSection>
          <SelectField
            name="creditAssessment.creditRiskScoring"
            label="Credit Risk Scoring"
            options={CREDIT_RISK_SCORING_OPTIONS}
          />
          <TextField name="creditAssessment.riskGrade" label="Risk Grade" placeholder="e.g. Grade A" />
          <NumberField name="creditAssessment.totalScore" label="Total Score" />
          <NumberField name="creditAssessment.totalPercentage" label="Total Percentage" suffix="%" />
        </FormSection>
      </SectionCard>
    </div>
  );
}
