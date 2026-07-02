"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import { SectionCard } from "../ui/SectionCard";
import { RepeatableTable, type RepeatableTableColumn } from "../ui/RepeatableTable";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { DateField } from "../fields/DateField";
import type { LoanAssessmentFormValues } from "../schema";

function SecurityLtvCell({ index }: { index: number }) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const row = useWatch({ control, name: `security.securities.${index}` });
  const fmv = Number(row?.fmv);
  const proposedLoan = Number(row?.proposedLoan);
  const ltv = fmv > 0 && proposedLoan >= 0 ? Math.round((proposedLoan / fmv) * 1000) / 10 : undefined;

  return (
    <div className="h-8 flex items-center rounded-lg border border-dashed border-border bg-muted/40 px-2.5 text-sm text-muted-foreground min-w-20">
      {ltv === undefined ? "—" : `${ltv}%`}
    </div>
  );
}

export function Step5SecurityGuarantee() {
  const { control } = useFormContext<LoanAssessmentFormValues>();

  const securities = useFieldArray({ control, name: "security.securities" });
  const guarantors = useFieldArray({ control, name: "security.guarantors" });

  const securityColumns: RepeatableTableColumn[] = [
    { key: "securityDetails", header: "Security Details", render: (i) => <TextField name={`security.securities.${i}.securityDetails`} label="" placeholder="Description of security" /> },
    { key: "fmv", header: "FMV", render: (i) => <NumberField name={`security.securities.${i}.fmv`} label="" /> },
    { key: "proposedLoan", header: "Proposed Loan", render: (i) => <NumberField name={`security.securities.${i}.proposedLoan`} label="" /> },
    { key: "ltv", header: "Loan to Value", render: (i) => <SecurityLtvCell index={i} /> },
  ];

  const guarantorColumns: RepeatableTableColumn[] = [
    { key: "guarantorName", header: "Guarantor", render: (i) => <TextField name={`security.guarantors.${i}.guarantorName`} label="" placeholder="Full name" /> },
    { key: "relationship", header: "Relationship", render: (i) => <TextField name={`security.guarantors.${i}.relationship`} label="" placeholder="e.g. Father" /> },
    { key: "age", header: "Age", className: "w-16", render: (i) => <NumberField name={`security.guarantors.${i}.age`} label="" /> },
    { key: "netWorth", header: "Net Worth", render: (i) => <NumberField name={`security.guarantors.${i}.netWorth`} label="" /> },
    { key: "consent", header: "Consent", render: (i) => <SelectField name={`security.guarantors.${i}.consent`} label="" options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} placeholder="—" /> },
    { key: "ciclStatus", header: "CICL Status", render: (i) => <TextField name={`security.guarantors.${i}.ciclStatus`} label="" placeholder="Clear / Listed" /> },
    { key: "ciclRemarks", header: "CICL Remarks", render: (i) => <TextField name={`security.guarantors.${i}.ciclRemarks`} label="" placeholder="Remarks" /> },
    { key: "blacklistedDate", header: "Blacklisted Date", render: (i) => <DateField name={`security.guarantors.${i}.blacklistedDate`} label="" /> },
    { key: "releasedDate", header: "Released Date", render: (i) => <DateField name={`security.guarantors.${i}.releasedDate`} label="" /> },
  ];

  return (
    <div className="space-y-5">
      <SectionCard icon={ShieldCheck} title="Security" description="Collateral pledged against this facility.">
        <RepeatableTable
          columns={securityColumns}
          rowCount={securities.fields.length}
          onAdd={() => securities.append({ securityDetails: "", fmv: undefined, proposedLoan: undefined })}
          onRemove={securities.remove}
          addLabel="Add Security"
          emptyLabel="No securities added yet."
        />
      </SectionCard>

      <SectionCard title="Personal Guarantee" description="Guarantors backing the facility.">
        <RepeatableTable
          columns={guarantorColumns}
          rowCount={guarantors.fields.length}
          onAdd={() =>
            guarantors.append({
              guarantorName: "",
              relationship: "",
              age: undefined,
              netWorth: undefined,
              consent: undefined,
              ciclStatus: "",
              ciclRemarks: "",
              blacklistedDate: "",
              releasedDate: "",
            })
          }
          onRemove={guarantors.remove}
          addLabel="Add Guarantor"
          emptyLabel="No guarantors added yet."
        />
      </SectionCard>
    </div>
  );
}
