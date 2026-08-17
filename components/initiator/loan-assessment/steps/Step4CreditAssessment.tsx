"use client";

import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Gauge, Sparkles, AlertTriangle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { ReadonlyField } from "../ui/ReadonlyField";
import { AutoCalculatedNumberField } from "../ui/AutoCalculatedNumberField";
import { NumberField } from "../fields/NumberField";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { formatNPR } from "@/lib/formatters";
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
import { calculateAffordability, MISSING_INPUT_LABEL } from "../affordabilityFormula";
import { useAutoCalculatedField } from "../useAutoCalculatedField";

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

interface Step4CreditAssessmentProps {
  /** The student's requested loan amount from the application (LoanInformation.loanAmount)
   *  — the single source of truth for Credit Limit. Undefined/0 means it failed to load. */
  applicationLoanAmount?: number;
}

export function Step4CreditAssessment({ applicationLoanAmount }: Step4CreditAssessmentProps) {
  const { control, setValue } = useFormContext<LoanAssessmentFormValues>();
  const c = useWatch({ control, name: "creditAssessment" });

  const interestRate = useWatch({ control, name: "applicantBackground.interestRate" });
  const tenureMonths = useWatch({ control, name: "applicantBackground.period" });
  const existingFacilities = useWatch({ control, name: "applicantBackground.existingFacilities" });

  const hasValidLoanAmount = typeof applicationLoanAmount === "number" && applicationLoanAmount > 0;

  useEffect(() => {
    if (!hasValidLoanAmount) return;
    setValue("creditAssessment.creditLimit", applicationLoanAmount, { shouldDirty: true });
  }, [hasValidLoanAmount, applicationLoanAmount, setValue]);

  const effectiveCreditLimit =
    hasValidLoanAmount
      ? applicationLoanAmount
      : typeof c?.creditLimit === "number" && c?.creditLimit > 0
        ? c?.creditLimit
        : undefined;

  const affordability = useMemo(
    () =>
      calculateAffordability({
        creditLimit: effectiveCreditLimit,
        annualIncome: c?.income,
        interestRate,
        tenureMonths,
        existingFacilities,
      }),
    [effectiveCreditLimit, c?.income, interestRate, tenureMonths, existingFacilities],
  );

  const missingLabels = affordability.missingForDsgir.map((key) => MISSING_INPUT_LABEL[key]);
  const missingForLoanToIncome = affordability.missingForDsgir
    .filter((key) => key === "creditLimit" || key === "annualIncome")
    .map((key) => MISSING_INPUT_LABEL[key]);

  const loanToIncomeField = useAutoCalculatedField(
    "creditAssessment.loanToValueRatio",
    affordability.loanToIncomeRatio,
  );
  const dsgirField = useAutoCalculatedField("creditAssessment.dsgir", affordability.dsgir);

  const preview = useMemo(
    () =>
      calculateCreditScorePreview({
        creditLimit: effectiveCreditLimit,
        dsgir: c?.dsgir === "" ? undefined : Number(c?.dsgir) || affordability.dsgir,
        operationOfInstitution:
          c?.operationOfInstitution === "" ? undefined : Number(c?.operationOfInstitution),
        satisfactoryPerformance:
          c?.satisfactoryPerformance === "" ? undefined : Number(c?.satisfactoryPerformance),
        parentsBorrowingsWithBFIs: c?.parentsBorrowingsWithBFIs || undefined,
        sourceOfIncome: c?.sourceOfIncome || undefined,
      }),
    [
      effectiveCreditLimit,
      c?.dsgir,
      affordability.dsgir,
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
      {!hasValidLoanAmount && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            The application&apos;s requested loan amount could not be loaded, so Credit Limit cannot be set.
            Assessment submission is blocked until this is resolved — refresh the page, or check that the
            application has a loan amount recorded in Step 1.
          </p>
        </div>
      )}

      <SectionCard icon={Gauge} title="Credit Scoring" description="Facility sizing and underwriting inputs.">
        <FormSection>
          <ReadonlyField
            label="Requested Loan Amount"
            value={hasValidLoanAmount ? formatNPR(applicationLoanAmount) : undefined}
            hint="From the student's original application."
          />
          <ReadonlyField
            label="Credit Limit"
            value={hasValidLoanAmount ? formatNPR(applicationLoanAmount) : undefined}
            hint="Automatically set to the requested loan amount — cannot be edited independently."
            emphasize
          />
          <div className="space-y-1.5">
            <NumberField name="creditAssessment.income" label="Income" suffix="NPR" />
            <p className="text-xs text-muted-foreground/80">
              Gross <strong>annual</strong> income — drives both ratios below.
            </p>
          </div>
          <AutoCalculatedNumberField
            name="creditAssessment.loanToValueRatio"
            label="Loan to Income Ratio (%)"
            suffix="%"
            state={loanToIncomeField}
            formula="Credit Limit ÷ annual income"
            missingInputs={missingForLoanToIncome}
          />
          <AutoCalculatedNumberField
            name="creditAssessment.dsgir"
            label="DSGIR (%)"
            suffix="%"
            state={dsgirField}
            formula="Total monthly debt obligations ÷ gross monthly income"
            missingInputs={missingLabels}
          />
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
        icon={Calculator}
        title="Debt Service Derivation"
        description="How DSGIR above is arrived at — repayment terms come from “This Facility” on Step 3."
      >
        {affordability.dsgir === undefined ? (
          <p className="text-sm text-muted-foreground">
            DSGIR needs {missingLabels.join(", ")}. Fill those in and the ratio, along with the
            monthly instalment behind it, will be worked out here.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-border rounded-lg border border-border">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-foreground">
                  EMI on this facility
                  <span className="block text-xs text-muted-foreground">
                    {formatNPR(Number(c?.creditLimit) || 0)} at {interestRate}% over {tenureMonths} months
                  </span>
                </span>
                <span className="font-medium text-foreground">
                  {formatNPR(affordability.proposedEmi ?? 0)}/mo
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-foreground">
                  Existing obligations
                  <span className="block text-xs text-muted-foreground">
                    {affordability.existingObligationCount === 0
                      ? "No live facilities recorded on Step 3"
                      : `${affordability.existingObligationCount} facility(ies), estimated on the same rate and term`}
                  </span>
                </span>
                <span className="font-medium text-foreground">
                  {formatNPR(affordability.existingMonthlyObligation)}/mo
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-foreground">Total monthly debt obligations</span>
                <span className="font-semibold text-foreground">
                  {formatNPR(affordability.totalMonthlyDebtService ?? 0)}/mo
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-foreground">
                  Gross monthly income
                  <span className="block text-xs text-muted-foreground">
                    Annual income ÷ 12
                  </span>
                </span>
                <span className="font-medium text-foreground">
                  {formatNPR(affordability.grossMonthlyIncome ?? 0)}/mo
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-xs">DSGIR: {affordability.dsgir}%</Badge>
              <Badge variant="outline" className="text-xs">
                Loan to Income: {affordability.loanToIncomeRatio}%
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Existing facilities carry no rate or residual term of their own, so their servicing
              cost is estimated on this facility&apos;s terms using the outstanding balance (or the
              sanctioned limit where no balance is recorded). Closed facilities are excluded.
            </p>
          </div>
        )}
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
