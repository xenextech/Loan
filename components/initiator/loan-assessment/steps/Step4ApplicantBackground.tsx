"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Users } from "lucide-react";
import { SectionCard } from "../ui/SectionCard";
import { RepeatableTable, type RepeatableTableColumn } from "../ui/RepeatableTable";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import type { LoanAssessmentFormValues } from "../schema";

export function Step4ApplicantBackground() {
  const { control } = useFormContext<LoanAssessmentFormValues>();

  const familyMembers = useFieldArray({ control, name: "applicantBackground.familyMembers" });
  const existingFacilities = useFieldArray({ control, name: "applicantBackground.existingFacilities" });

  const familyColumns: RepeatableTableColumn[] = [
    { key: "name", header: "Name", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.name`} label="" placeholder="Name" /> },
    { key: "age", header: "Age", className: "w-20", render: (i) => <NumberField name={`applicantBackground.familyMembers.${i}.age`} label="" /> },
    { key: "qualification", header: "Qualification", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.qualification`} label="" placeholder="Qualification" /> },
    { key: "relationship", header: "Relationship", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.relationship`} label="" placeholder="e.g. Father" /> },
    { key: "occupation", header: "Occupation", render: (i) => <TextField name={`applicantBackground.familyMembers.${i}.occupation`} label="" placeholder="Occupation" /> },
  ];

  const facilityColumns: RepeatableTableColumn[] = [
    { key: "facilityType", header: "Facility Type", render: (i) => <TextField name={`applicantBackground.existingFacilities.${i}.facilityType`} label="" placeholder="e.g. Term Loan" /> },
    { key: "bank", header: "Bank / BFI", render: (i) => <TextField name={`applicantBackground.existingFacilities.${i}.bank`} label="" placeholder="Institution" /> },
    { key: "sanctionedLimit", header: "Sanctioned Limit", render: (i) => <NumberField name={`applicantBackground.existingFacilities.${i}.sanctionedLimit`} label="" /> },
    { key: "outstanding", header: "Outstanding", render: (i) => <NumberField name={`applicantBackground.existingFacilities.${i}.outstanding`} label="" /> },
    { key: "status", header: "Status", render: (i) => <TextField name={`applicantBackground.existingFacilities.${i}.status`} label="" placeholder="e.g. Performing" /> },
  ];

  return (
    <div className="space-y-5">
      <SectionCard icon={Users} title="Family Members" description="Immediate family and dependents of the applicant.">
        <RepeatableTable
          columns={familyColumns}
          rowCount={familyMembers.fields.length}
          onAdd={() => familyMembers.append({ name: "", age: undefined, qualification: "", relationship: "", occupation: "" })}
          onRemove={familyMembers.remove}
          addLabel="Add Family Member"
          emptyLabel="No family members added yet."
        />
      </SectionCard>

      <SectionCard title="Existing Facilities" description="Other credit facilities currently held by the applicant or household.">
        <RepeatableTable
          columns={facilityColumns}
          rowCount={existingFacilities.fields.length}
          onAdd={() => existingFacilities.append({ facilityType: "", bank: "", sanctionedLimit: undefined, outstanding: undefined, status: "" })}
          onRemove={existingFacilities.remove}
          addLabel="Add Facility"
          emptyLabel="No existing facilities recorded."
        />
      </SectionCard>
    </div>
  );
}
