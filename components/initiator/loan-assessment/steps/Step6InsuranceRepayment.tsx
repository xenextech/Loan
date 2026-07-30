"use client";

import { HeartPulse, Wallet } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { DateField } from "../fields/DateField";
import { TextareaField } from "../fields/TextareaField";

export function Step6InsuranceRepayment() {
  return (
    <div className="space-y-5">
      <SectionCard icon={HeartPulse} title="Insurance" description="Insurance cover held against the applicant or the security. The backend stores a single insurance record per application.">
        <FormSection>
          <TextField name="insuranceRepayment.insurance.insuredName" label="Insured Name" placeholder="e.g. Ram Prasad Sharma" />
          <TextField name="insuranceRepayment.insurance.insuranceCompanyName" label="Insurance Company Name" placeholder="e.g. IME General Insurance" />
          <NumberField name="insuranceRepayment.insurance.sumInsured" label="Sum Insured" suffix="NPR" />
          <DateField name="insuranceRepayment.insurance.maturityDate" label="Maturity Date" />
          <TextField name="insuranceRepayment.insurance.policyNo" label="Policy No." placeholder="e.g. IMG-PROP-2080-092" />
        </FormSection>
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
