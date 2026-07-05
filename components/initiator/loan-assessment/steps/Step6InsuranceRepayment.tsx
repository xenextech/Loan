"use client";

import { HeartPulse, Wallet } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { TextareaField } from "../fields/TextareaField";

export function Step6InsuranceRepayment() {
  return (
    <div className="space-y-5">
      <SectionCard icon={HeartPulse} title="Insurance" description="Insurance cover held against the applicant or the security. The backend stores a single insurance record per application.">
        <FormSection>
          <TextField name="insuranceRepayment.insurance.insuredAssets" label="Insured Assets" placeholder="e.g. Commercial building structures" />
          <NumberField name="insuranceRepayment.insurance.valueOfAssets" label="Value of Assets" suffix="NPR" />
          <NumberField name="insuranceRepayment.insurance.sumOfInsurance" label="Sum of Insurance" suffix="NPR" />
          <NumberField name="insuranceRepayment.insurance.insuranceCoverage" label="Insurance Coverage" suffix="%" />
        </FormSection>
        <div className="mt-4">
          <TextareaField name="insuranceRepayment.insurance.insuranceRemarks" label="Insurance Remarks" rows={3} />
        </div>
      </SectionCard>

      <SectionCard icon={Wallet} title="Repayment Capacity" description="The backend stores a single repayment capacity record per application, separate from the insurance record above.">
        <FormSection>
          <NumberField name="insuranceRepayment.repaymentCapacity.insuredAssets" label="Insured Assets" />
          <NumberField name="insuranceRepayment.repaymentCapacity.valueOfAssets" label="Value of Assets" suffix="NPR" />
          <NumberField name="insuranceRepayment.repaymentCapacity.sumOfInsurance" label="Sum of Insurance" suffix="NPR" />
          <NumberField name="insuranceRepayment.repaymentCapacity.insuranceCoverage" label="Insurance Coverage" suffix="%" />
        </FormSection>
        <div className="mt-4">
          <TextareaField name="insuranceRepayment.repaymentCapacity.insuranceRemarks" label="Remarks" rows={3} />
        </div>
      </SectionCard>
    </div>
  );
}
