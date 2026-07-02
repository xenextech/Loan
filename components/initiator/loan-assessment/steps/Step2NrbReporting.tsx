import { Landmark } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { ComboboxField } from "../fields/ComboboxField";
import { SelectField } from "../fields/SelectField";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { TextareaField } from "../fields/TextareaField";
import {
  SECTOR_CLASSIFICATION_OPTIONS,
  LOAN_TYPE_OPTIONS,
  PURPOSE_OF_LOAN_OPTIONS,
  SECURITY_TYPE_OPTIONS,
  INTEREST_RATE_TYPE_OPTIONS,
  CREDIT_RATING_AGENCY_OPTIONS,
  LOAN_CLASSIFICATION_OPTIONS,
  YES_NO_OPTIONS,
} from "../schema";

const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

export function Step2NrbReporting() {
  return (
    <div className="space-y-5">
      <SectionCard
        icon={Landmark}
        title="Classification"
        description="Regulatory classification for the NRB return. Fields with search support long option lists."
      >
        <FormSection>
          <ComboboxField name="nrbReporting.sectorClassification" label="Sector Classification" options={SECTOR_CLASSIFICATION_OPTIONS} />
          <TextField name="nrbReporting.productCode" label="Product Code" placeholder="Core banking product code" />
          <ComboboxField name="nrbReporting.loanType" label="Loan Type" options={LOAN_TYPE_OPTIONS} />
          <ComboboxField name="nrbReporting.purposeOfLoan" label="Purpose of Loan" options={PURPOSE_OF_LOAN_OPTIONS} />
          <ComboboxField name="nrbReporting.securityType" label="Security Type" options={SECURITY_TYPE_OPTIONS} />
          <SelectField name="nrbReporting.interestRateType" label="Interest Rate Type" options={toOptions(INTEREST_RATE_TYPE_OPTIONS)} />
        </FormSection>
      </SectionCard>

      <SectionCard title="Pricing">
        <FormSection columns={3}>
          <NumberField name="nrbReporting.baseRate" label="Base Rate" suffix="%" />
          <NumberField name="nrbReporting.premium" label="Premium" suffix="%" />
          <NumberField name="nrbReporting.effectiveInterestRate" label="Effective Interest Rate" suffix="%" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Credit Rating & Classification">
        <FormSection>
          <ComboboxField name="nrbReporting.creditRatingAgency" label="Credit Rating Agency" options={CREDIT_RATING_AGENCY_OPTIONS} />
          <TextField name="nrbReporting.creditRatingGrade" label="Credit Rating Grade" placeholder="e.g. A+, BBB" />
          <ComboboxField name="nrbReporting.loanClassification" label="Loan Classification" options={LOAN_CLASSIFICATION_OPTIONS} />
          <NumberField name="nrbReporting.provisioningPercentage" label="Provisioning" suffix="%" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Compliance Flags">
        <FormSection columns={3}>
          <SelectField name="nrbReporting.restructured" label="Restructured" options={toOptions(YES_NO_OPTIONS)} />
          <SelectField name="nrbReporting.rescheduled" label="Rescheduled" options={toOptions(YES_NO_OPTIONS)} />
          <SelectField name="nrbReporting.insiderLending" label="Insider Lending" options={toOptions(YES_NO_OPTIONS)} />
        </FormSection>
        <FormSection columns={1} className="mt-4">
          <TextField name="nrbReporting.singleObligorLimitStatus" label="Single Obligor Limit Status" placeholder="Within Limit / Exceeds Limit" />
          <TextareaField name="nrbReporting.regulatoryReportingRemarks" label="Regulatory Reporting Remarks" rows={4} />
        </FormSection>
      </SectionCard>
    </div>
  );
}
