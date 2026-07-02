"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Gauge } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { ReadonlyField } from "../ui/ReadonlyField";
import { DSGIR_OPTIONS, PERFORMANCE_YEARS_OPTIONS, type LoanAssessmentFormValues } from "../schema";

const DSGIR_SCORE: Record<string, number> = {
  BELOW_40_PERCENT: 20,
  RANGE_40_TO_45_PERCENT: 10,
  ABOVE_45_PERCENT: 0,
};

const PERFORMANCE_SCORE: Record<string, number> = {
  ABOVE_3_YEARS: 20,
  ONE_TO_3_YEARS: 10,
  LESS_THAN_1_YEAR: 0,
};

function ltvScore(ltv?: number) {
  if (ltv === undefined || Number.isNaN(ltv)) return 0;
  if (ltv <= 50) return 20;
  if (ltv <= 75) return 10;
  return 0;
}

function gradeForPercentage(pct: number): { grade: string; label: string; tone: string } {
  if (pct >= 80) return { grade: "A", label: "Low Risk", tone: "text-[oklch(0.42_0.18_145)]" };
  if (pct >= 60) return { grade: "B", label: "Moderate Risk", tone: "text-primary" };
  if (pct >= 40) return { grade: "C", label: "Elevated Risk", tone: "text-[oklch(0.5_0.16_80)]" };
  return { grade: "D", label: "High Risk", tone: "text-destructive" };
}

export function Step3CreditAssessment() {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const creditAssessment = useWatch({ control, name: "creditAssessment" });

  const computed = useMemo(() => {
    const ltv = creditAssessment?.loanToValueRatio;
    const bankingRel = Number(creditAssessment?.bankingRelationshipScore) || 0;

    const dsgirPts = creditAssessment?.dsgir ? DSGIR_SCORE[creditAssessment.dsgir] : 0;
    const performancePts = creditAssessment?.performanceYears ? PERFORMANCE_SCORE[creditAssessment.performanceYears] : 0;
    const ltvPts = ltvScore(typeof ltv === "number" ? ltv : Number(ltv));
    const bankingRelPts = Math.max(0, Math.min(100, bankingRel)) * 0.4;

    const totalScore = Math.round(dsgirPts + performancePts + ltvPts + bankingRelPts);
    const percentage = totalScore; // max achievable score is normalized to 100
    const { grade, label, tone } = gradeForPercentage(percentage);

    return { totalScore, percentage, grade, label, tone };
  }, [creditAssessment]);

  return (
    <div className="space-y-5">
      <SectionCard icon={Gauge} title="Credit Assessment" description="Facility sizing and the inputs feeding the risk score.">
        <FormSection>
          <NumberField name="creditAssessment.creditLimit" label="Credit Limit" suffix="NPR" />
          <NumberField name="creditAssessment.loanToValueRatio" label="Loan to Value Ratio" suffix="%" />
          <SelectField name="creditAssessment.dsgir" label="DSGIR" options={DSGIR_OPTIONS} />
          <SelectField name="creditAssessment.performanceYears" label="Performance Years" options={PERFORMANCE_YEARS_OPTIONS} />
          <NumberField name="creditAssessment.bankingRelationshipScore" label="Banking Relationship Score" suffix="/ 100" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Calculated Credit Score" description="Read-only — derived automatically from the inputs above.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
          <ReadonlyField
            label="Risk Grade"
            value={<span className={computed.tone}>{`${computed.grade} — ${computed.label}`}</span>}
            emphasize
          />
          <ReadonlyField label="Total Score" value={`${computed.totalScore} / 100`} emphasize />
          <ReadonlyField label="Percentage" value={`${computed.percentage}%`} emphasize />
        </div>
      </SectionCard>
    </div>
  );
}
