"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Users, Landmark } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { RepeatableTable, type RepeatableTableColumn } from "../ui/RepeatableTable";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { TextareaField } from "../fields/TextareaField";
import { FACILITY_STATUS_OPTIONS } from "../schema";
import type { LoanAssessmentFormValues } from "../schema";

const FEE_RATE = 0.0125; // 1.25%

interface Step3ApplicantBackgroundProps {
  /** The student's requested loan amount — the single source of truth for
   *  the "Limit" field on this step. Mirrors the prop Step 4 receives so
   *  that Limit is populated even when Step 4 has never been mounted yet. */
  applicationLoanAmount?: number;
}

export function Step3ApplicantBackground({ applicationLoanAmount }: Step3ApplicantBackgroundProps) {
  const { control, setValue, getValues } = useFormContext<LoanAssessmentFormValues>();

  const familyMembers = useFieldArray({ control, name: "applicantBackground.familyMembers" });
  const existingFacilities = useFieldArray({ control, name: "applicantBackground.existingFacilities" });

  // Prefer the prop (applicationLoanAmount) which is available immediately on
  // mount. Fall back to the form field (creditAssessment.creditLimit) which
  // Step4CreditAssessment writes — only populated after the user visits Step 4.
  const savedCreditLimit = useWatch({ control, name: "creditAssessment.creditLimit" });
  const effectiveLimit =
    typeof applicationLoanAmount === "number" && applicationLoanAmount > 0
      ? applicationLoanAmount
      : typeof savedCreditLimit === "number" && savedCreditLimit > 0
        ? savedCreditLimit
        : undefined;

  // Auto-populate limit and fee whenever the effective loan amount is known.
  // Only overwrite if the field is still blank — lets the user override without
  // their value being clobbered on re-render.
  useEffect(() => {
    if (typeof effectiveLimit !== "number" || effectiveLimit <= 0) return;

    const currentLimit = getValues("applicantBackground.limit");
    if (!currentLimit) {
      setValue("applicantBackground.limit", effectiveLimit, { shouldDirty: false });
    }

    const autoFee = Math.round(effectiveLimit * FEE_RATE * 100) / 100;
    const currentFee = getValues("applicantBackground.fee");
    if (!currentFee) {
      setValue("applicantBackground.fee", autoFee, { shouldDirty: false });
    }
  }, [effectiveLimit, getValues, setValue]);

  const familyColumns: RepeatableTableColumn[] = [
    { key: "personName", header: "Name", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.personName`} label="" placeholder="Name" /> },
    { key: "age", header: "Age", className: "w-20", render: (i) => <NumberField name={`applicantBackground.familyMembers.${i}.age`} label="" /> },
    { key: "qualification", header: "Qualification", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.qualification`} label="" placeholder="Qualification" /> },
    { key: "relationshipWithBorrower", header: "Relationship", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.relationshipWithBorrower`} label="" placeholder="e.g. Father" /> },
    { key: "occupationSocialInvolvement", header: "Occupation", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.occupationSocialInvolvement`} label="" placeholder="Occupation" /> },
  ];

  const facilityColumns: RepeatableTableColumn[] = [
    { key: "facilityType", header: "Facility Type", render: (i) => <TextField name={`applicantBackground.existingFacilities.${i}.facilityType`} label="" placeholder="e.g. Term Loan" /> },
    { key: "bank", header: "Bank / BFI", render: (i) => <TextField name={`applicantBackground.existingFacilities.${i}.bank`} label="" placeholder="Institution" /> },
    { key: "sanctionedLimit", header: "Sanctioned Limit", render: (i) => <NumberField name={`applicantBackground.existingFacilities.${i}.sanctionedLimit`} label="" /> },
    { key: "outstanding", header: "Outstanding", render: (i) => <NumberField name={`applicantBackground.existingFacilities.${i}.outstanding`} label="" /> },
    {
      key: "status",
      header: "Status",
      render: (i) => (
        <SelectField name={`applicantBackground.existingFacilities.${i}.status`} label="" options={FACILITY_STATUS_OPTIONS} />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <SectionCard icon={Users} title="Family Members" description="Immediate family and dependents of the applicant.">
        <RepeatableTable
          columns={familyColumns}
          rowCount={familyMembers.fields.length}
          onAdd={() =>
            familyMembers.append({
              personName: "",
              age: undefined,
              qualification: "",
              relationshipWithBorrower: "",
              occupationSocialInvolvement: "",
            })
          }
          onRemove={familyMembers.remove}
          addLabel="Add Family Member"
          emptyLabel="No family members added yet."
        />
      </SectionCard>

      <SectionCard icon={Landmark} title="This Facility" description="Terms of the credit facility being proposed under this application.">
        <FormSection columns={3}>
          <TextField name="applicantBackground.facility" label="Facility" placeholder="e.g. Term Loan" />
          <TextField name="applicantBackground.purpose" label="Purpose" placeholder="e.g. Tuition Fee Financing" />
          <div className="space-y-1.5">
            <NumberField name="applicantBackground.limit" label="Limit" suffix="NPR" />
            <p className="text-xs text-muted-foreground">Auto-filled from loan amount. Editable.</p>
          </div>
          <NumberField name="applicantBackground.period" label="Period" suffix="months" />
          <NumberField name="applicantBackground.interestRate" label="Interest Rate" suffix="%" />
          <div className="space-y-1.5">
            <NumberField name="applicantBackground.fee" label="Fee" suffix="NPR" />
            <p className="text-xs text-muted-foreground">
              Auto-calculated: Limit × 1.25%. Editable.
            </p>
          </div>
        </FormSection>
        <div className="mt-4">
          <TextareaField name="applicantBackground.remarks" label="Remarks" rows={3} />
        </div>
      </SectionCard>

      <SectionCard
        title="Existing Facilities"
        description="Other credit facilities currently held by the applicant or household at other banks/BFIs."
      >
        <RepeatableTable
          columns={facilityColumns}
          rowCount={existingFacilities.fields.length}
          onAdd={() =>
            existingFacilities.append({
              facilityType: "",
              bank: "",
              sanctionedLimit: undefined,
              outstanding: undefined,
              status: "PERFORMING",
            })
          }
          onRemove={existingFacilities.remove}
          addLabel="Add Facility"
          emptyLabel="No existing facilities recorded."
        />
      </SectionCard>
    </div>
  );
}
