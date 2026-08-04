"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ShieldCheck, UserCheck } from "lucide-react";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { DateField } from "../fields/DateField";
import { ReadonlyField } from "../ui/ReadonlyField";
import { YES_NO_OPTIONS } from "../schema";
import type { LoanAssessmentFormValues } from "../schema";

const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

export function Step5SecurityGuarantee() {
  const { control, setValue } = useFormContext<LoanAssessmentFormValues>();
  const security = useWatch({ control, name: "security" });
  const blacklistedStatus = useWatch({ control, name: "applicantInfo.blacklistedStatus" });
  const familyMembers = useWatch({ control, name: "applicantBackground.familyMembers" });
  const guarantorRelationship = security?.guarantor?.relationship;
  const guarantorName = security?.guarantor?.nameOfGuarantor;

  // Guarantor is very often a family member — Step 4's Family Members table
  // already has Father/Mother/Grandfather names (pre-filled from the student's
  // own application, or entered/edited by the Initiator). Typing a matching
  // relationship here auto-fills the name from that table instead of
  // re-typing it, but only while the name field is still blank — once the
  // Initiator has entered/edited a name, this never overwrites it again.
  useEffect(() => {
    if (guarantorName || !guarantorRelationship) return;
    const match = familyMembers?.find(
      (m) => m.relationshipWithBorrower?.trim().toLowerCase() === guarantorRelationship.trim().toLowerCase(),
    );
    if (match?.personName) {
      setValue("security.guarantor.nameOfGuarantor", match.personName, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guarantorRelationship]);

  const fmv = Number(security?.fmv);
  const proposedLoan = Number(security?.proposedLoan);
  const calculatedLtv = fmv > 0 && proposedLoan >= 0 ? Math.round((proposedLoan / fmv) * 1000) / 10 : undefined;

  return (
    <div className="space-y-5">
      <SectionCard icon={ShieldCheck} title="Security" description="Collateral pledged against this facility. The backend stores a single security record per application.">
        <FormSection>
          <TextField name="security.securityDetails" label="Security Details" placeholder="Description of security" />
          <NumberField name="security.fmv" label="Fair Market Value (FMV)" suffix="NPR" />
          <NumberField name="security.proposedLoan" label="Proposed Loan" suffix="NPR" />
          <NumberField name="security.financeAgainstFmv" label="Finance Against FMV" suffix="%" />
        </FormSection>
        <div className="mt-4">
          <ReadonlyField
            label="Calculated Loan to Income"
            value={calculatedLtv === undefined ? "—" : `${calculatedLtv}%`}
            hint="Proposed loan ÷ FMV — for reference, enter the approved figure into Finance Against FMV above."
          />
        </div>
      </SectionCard>

      <SectionCard icon={UserCheck} title="Personal Guarantee" description="The backend stores a single guarantor per application.">
        <FormSection>
          <TextField name="security.guarantor.nameOfGuarantor" label="Guarantor Name" placeholder="Full name" />
          <TextField name="security.guarantor.relationship" label="Relationship" placeholder="e.g. Father" />
          <NumberField name="security.guarantor.age" label="Age" />
          <NumberField name="security.guarantor.netWorth" label="Net Worth" suffix="NPR" />
          <SelectField name="security.guarantor.guarantorConsent" label="Guarantor Consent" options={toOptions(YES_NO_OPTIONS)} />
          <SelectField name="security.guarantor.ciclStatus" label="CICL Status Clear" options={toOptions(YES_NO_OPTIONS)} />
          {blacklistedStatus === "BLACKLISTED" && (
            <DateField name="security.guarantor.blackListedDate" label="Blacklisted Date" />
          )}
          <DateField name="security.guarantor.releasedDate" label="Released Date" />
        </FormSection>
        <div className="mt-4">
          <TextareaField name="security.guarantor.ciclRemarks" label="CICL Remarks" rows={3} />
        </div>
      </SectionCard>
    </div>
  );
}
