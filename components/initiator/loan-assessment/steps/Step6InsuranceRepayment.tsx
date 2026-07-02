"use client";

import { useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { HeartPulse } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { RepeatableTable, type RepeatableTableColumn } from "../ui/RepeatableTable";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { DateField } from "../fields/DateField";
import { ReadonlyField } from "../ui/ReadonlyField";
import type { LoanAssessmentFormValues } from "../schema";

export function Step6InsuranceRepayment() {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const insurances = useFieldArray({ control, name: "insuranceRepayment.insurances" });
  const repaymentCapacity = useWatch({ control, name: "insuranceRepayment.repaymentCapacity" });

  const insuranceColumns: RepeatableTableColumn[] = [
    { key: "insuranceType", header: "Insurance Type", render: (i) => <TextField name={`insuranceRepayment.insurances.${i}.insuranceType`} label="" placeholder="e.g. Life, Credit" /> },
    { key: "insurer", header: "Insurer", render: (i) => <TextField name={`insuranceRepayment.insurances.${i}.insurer`} label="" placeholder="Insurance company" /> },
    { key: "sumAssured", header: "Sum Assured", render: (i) => <NumberField name={`insuranceRepayment.insurances.${i}.sumAssured`} label="" /> },
    { key: "premiumAmount", header: "Premium", render: (i) => <NumberField name={`insuranceRepayment.insurances.${i}.premiumAmount`} label="" /> },
    { key: "policyNumber", header: "Policy Number", render: (i) => <TextField name={`insuranceRepayment.insurances.${i}.policyNumber`} label="" placeholder="Policy #" /> },
    { key: "expiryDate", header: "Expiry Date", render: (i) => <DateField name={`insuranceRepayment.insurances.${i}.expiryDate`} label="" /> },
  ];

  const computed = useMemo(() => {
    const income = Number(repaymentCapacity?.monthlyIncome) || 0;
    const obligations = Number(repaymentCapacity?.existingObligations) || 0;
    const emi = Number(repaymentCapacity?.proposedEmi) || 0;

    const netDisposableIncome = income - obligations - emi;
    const totalDebt = obligations + emi;
    const dscr = totalDebt > 0 ? Math.round((income / totalDebt) * 100) / 100 : undefined;

    return { netDisposableIncome, dscr };
  }, [repaymentCapacity]);

  return (
    <div className="space-y-5">
      <SectionCard icon={HeartPulse} title="Insurance" description="Insurance cover held against the applicant or the security.">
        <RepeatableTable
          columns={insuranceColumns}
          rowCount={insurances.fields.length}
          onAdd={() =>
            insurances.append({ insuranceType: "", insurer: "", sumAssured: undefined, premiumAmount: undefined, policyNumber: "", expiryDate: "" })
          }
          onRemove={insurances.remove}
          addLabel="Add Insurance"
          emptyLabel="No insurance policies added yet."
        />
      </SectionCard>

      <SectionCard title="Repayment Capacity" description="Monthly cash-flow inputs — the two fields below are calculated.">
        <div className="space-y-4">
          <FormSection columns={3}>
            <NumberField name="insuranceRepayment.repaymentCapacity.monthlyIncome" label="Monthly Income" suffix="NPR" />
            <NumberField name="insuranceRepayment.repaymentCapacity.existingObligations" label="Existing Obligations" suffix="NPR" />
            <NumberField name="insuranceRepayment.repaymentCapacity.proposedEmi" label="Proposed EMI" suffix="NPR" />
          </FormSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 pt-1 border-t border-border/70">
            <ReadonlyField
              label="Net Disposable Income"
              value={`NPR ${computed.netDisposableIncome.toLocaleString("en-IN")}`}
              hint="Monthly income less existing obligations and the proposed EMI."
              emphasize
            />
            <ReadonlyField
              label="Debt Service Coverage Ratio"
              value={computed.dscr === undefined ? "—" : computed.dscr.toFixed(2)}
              hint="Monthly income ÷ (existing obligations + proposed EMI)."
              emphasize
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
