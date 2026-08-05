"use client";

import { Landmark } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { SelectWithOtherField } from "../fields/SelectWithOtherField";
import { NumberField } from "../fields/NumberField";
import {
  BASEL_CLASSIFICATION_OPTIONS,
  NRB_93_SECTOR_CODE_OPTIONS,
  NRB_93_KA_PRODUCT_CODE_OPTIONS,
  NRB_94_SECURITY_TYPE_CODE_OPTIONS,
  SIS_1_PRODUCT_TYPE_OPTIONS,
  SIS_2_SECTOR_OPTIONS,
  SIS_3_SECURITY_OPTIONS,
  SIS_4_INSTITUTIONAL_GROUPING_OPTIONS,
  type LoanAssessmentFormValues,
} from "../schema";

export function Step2NrbReporting() {
  const { setValue } = useFormContext<LoanAssessmentFormValues>();

  return (
    <div className="space-y-5">
      <SectionCard
        icon={Landmark}
        title="Basel Classification"
        description="Basel exposure classification and risk weight used for NRB capital adequacy reporting."
      >
        <FormSection>
          <SelectWithOtherField
            name="nrbReporting.baselClassification"
            label="Basel Classification"
            options={BASEL_CLASSIFICATION_OPTIONS}
            onOptionSelect={(value) => {
              const match = BASEL_CLASSIFICATION_OPTIONS.find((opt) => opt.value === value);
              if (match) {
                setValue("nrbReporting.baselRiskWeight", match.riskWeight, { shouldDirty: true });
              }
            }}
          />
          <NumberField name="nrbReporting.baselRiskWeight" label="Basel Risk Weight" suffix="%" />
        </FormSection>
      </SectionCard>

      <SectionCard title="NRB Directive Codes" description="NRB Directive 9.3 (sector/product) and 9.4 (security type) codes.">
        <FormSection columns={3}>
          <SelectWithOtherField name="nrbReporting.nrb93SectorCode" label="NRB 9.3 Sector Code" options={NRB_93_SECTOR_CODE_OPTIONS} />
          <SelectWithOtherField
            name="nrbReporting.nrb93KaProductCode"
            label="NRB 9.3(Ka) Product Code"
            options={NRB_93_KA_PRODUCT_CODE_OPTIONS}
          />
          <SelectWithOtherField
            name="nrbReporting.nrb94SecurityTypeCode"
            label="NRB 9.4 Security Type Code"
            options={NRB_94_SECURITY_TYPE_CODE_OPTIONS}
          />
        </FormSection>
      </SectionCard>

      <SectionCard title="SIS Classification" description="Statistical Information System codes reported to NRB.">
        <FormSection columns={3}>
          <SelectWithOtherField name="nrbReporting.sis1ProductType" label="SIS 1 — Product Type" options={SIS_1_PRODUCT_TYPE_OPTIONS} />
          <SelectWithOtherField name="nrbReporting.sis2Sector" label="SIS 2 — Sector" options={SIS_2_SECTOR_OPTIONS} />
          <SelectWithOtherField name="nrbReporting.sis3Security" label="SIS 3 — Security" options={SIS_3_SECURITY_OPTIONS} />
          <SelectWithOtherField
            name="nrbReporting.sis4InstitutionalGroupingOfBorrower"
            label="SIS 4 — Institutional Grouping of Borrower"
            options={SIS_4_INSTITUTIONAL_GROUPING_OPTIONS}
          />
        </FormSection>
      </SectionCard>
    </div>
  );
}
