import { Gauge } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { NumberField } from "../fields/NumberField";

export function Step3CreditAssessment() {
  return (
    <div className="space-y-5">
      <SectionCard icon={Gauge} title="Credit Assessment" description="Facility sizing and underwriting inputs.">
        <FormSection>
          <NumberField name="creditAssessment.creditLimit" label="Credit Limit" suffix="NPR" />
          <NumberField name="creditAssessment.loanToValueRatio" label="Loan to Value Ratio (%)" suffix="%" />
          <NumberField name="creditAssessment.dsgir" label="DSGIR (%)" suffix="%" />
          <NumberField name="creditAssessment.performanceYears" label="Performance Years" />
          <NumberField name="creditAssessment.bankingRelationshipScore" label="Banking Relationship" />
          <NumberField name="creditAssessment.parentsBorrowingsWithBfis" label="Parents Borrowings with BFIs" />
          <NumberField name="creditAssessment.sourceOfIncome" label="Source of Income" />
          <NumberField name="creditAssessment.collegeOperations" label="Operations of the College / Institution" />
        </FormSection>
      </SectionCard>
    </div>
  );
}
