import { Gauge } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { NumberField } from "../fields/NumberField";
import { TextField } from "../fields/TextField";

export function Step3CreditAssessment() {
  return (
    <div className="space-y-5">
      <SectionCard icon={Gauge} title="Credit Scoring" description="Facility sizing and underwriting inputs.">
        <FormSection>
          <NumberField name="creditAssessment.creditLimit" label="Credit Limit" suffix="NPR" />
          <NumberField name="creditAssessment.loanToValueRatio" label="Loan to Value Ratio (%)" suffix="%" />
          <NumberField name="creditAssessment.dsgir" label="DSGIR (%)" suffix="%" />
          <NumberField name="creditAssessment.performanceYears" label="Performance Years" />
          <NumberField name="creditAssessment.bankingRelationshipScore" label="Banking Relationship Score" />
          <TextField name="creditAssessment.parentsBorrowingsWithBFIs" label="Parents/Subsidiaries Borrowings with BFIs" placeholder="e.g. 1200000" />
          <NumberField name="creditAssessment.sourceOfIncomeScore" label="Source of Income Score" />
          <NumberField name="creditAssessment.operationOfInstitution" label="Operation of Institution" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Scoring Outcome" description="Final risk grade and aggregated scorecard result.">
        <FormSection>
          <TextField name="creditAssessment.creditRiskScoring" label="Credit Risk Scoring" placeholder="e.g. Low Risk Profile" />
          <TextField name="creditAssessment.riskGrade" label="Risk Grade" placeholder="e.g. Grade A" />
          <NumberField name="creditAssessment.totalScore" label="Total Score" />
          <NumberField name="creditAssessment.totalPercentage" label="Total Percentage" suffix="%" />
        </FormSection>
      </SectionCard>
    </div>
  );
}
