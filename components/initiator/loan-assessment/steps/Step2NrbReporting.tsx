import { Landmark } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";

export function Step2NrbReporting() {
  return (
    <div className="space-y-5">
      <SectionCard
        icon={Landmark}
        title="Basel Classification"
        description="Basel exposure classification and risk weight used for NRB capital adequacy reporting."
      >
        <FormSection>
          <TextField name="nrbReporting.baselClassification" label="Basel Classification" placeholder="e.g. Regulatory Retail Claims" />
          <NumberField name="nrbReporting.baselRiskWeight" label="Basel Risk Weight" suffix="%" />
        </FormSection>
      </SectionCard>

      <SectionCard title="NRB Directive Codes" description="NRB Directive 9.3 (sector/product) and 9.4 (security type) codes.">
        <FormSection columns={3}>
          <TextField name="nrbReporting.nrb93SectorCode" label="NRB 9.3 Sector Code" placeholder="e.g. SEC-12" />
          <TextField name="nrbReporting.nrb93KaProductCode" label="NRB 9.3(Ka) Product Code" placeholder="e.g. PROD-05" />
          <TextField name="nrbReporting.nrb94SecurityTypeCode" label="NRB 9.4 Security Type Code" placeholder="e.g. SEC-TYP-01" />
        </FormSection>
      </SectionCard>

      <SectionCard title="SIS Classification" description="Statistical Information System codes reported to NRB.">
        <FormSection columns={3}>
          <TextField name="nrbReporting.sis0IndustrialClassification" label="SIS 0 — Industrial Classification" placeholder="e.g. SIS-IND-45" />
          <TextField name="nrbReporting.sis1ProductType" label="SIS 1 — Product Type" placeholder="e.g. SIS-PT-02" />
          <TextField name="nrbReporting.sis2Sector" label="SIS 2 — Sector" placeholder="e.g. Private Sector" />
          <TextField name="nrbReporting.sis3Security" label="SIS 3 — Security" placeholder="e.g. Real Estate Mortgage" />
          <TextField name="nrbReporting.sis4InstitutionalGroupingOfBorrower" label="SIS 4 — Institutional Grouping of Borrower" placeholder="e.g. Non-Financial Corporation" />
          <TextField name="nrbReporting.sis9PriorityLending" label="SIS 9 — Priority Lending" placeholder="e.g. Agriculture-01" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Green Finance" description="Green Finance taxonomy tagging, where applicable.">
        <FormSection columns={3}>
          <TextField name="nrbReporting.greenFinanceEconomicSector" label="Economic Sector" placeholder="e.g. Renewable Energy" />
          <TextField name="nrbReporting.greenFinanceSubSector" label="Sub-Sector" placeholder="e.g. Solar Power" />
          <TextField name="nrbReporting.greenFinanceTaxonomyTag" label="Taxonomy Tag" placeholder="e.g. TAX-GREEN-2026" />
        </FormSection>
      </SectionCard>
    </div>
  );
}
