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

const toOptions = (values: readonly string[]) =>
  values.map((v) => ({ value: v, label: v }));

export function Step5SecurityGuarantee() {
  const { control, setValue } = useFormContext<LoanAssessmentFormValues>();
  const security = useWatch({ control, name: "security" });
  const blacklistedStatus = useWatch({
    control,
    name: "applicantInfo.blacklistedStatus",
  });
  const familyMembers = useWatch({
    control,
    name: "applicantBackground.familyMembers",
  });
  const guarantorRelationship = security?.guarantor?.relationship;
  const guarantorName = security?.guarantor?.nameOfGuarantor;

  useEffect(() => {
    if (guarantorName || !guarantorRelationship) return;
    const match = familyMembers?.find(
      (m) =>
        m.relationshipWithBorrower?.trim().toLowerCase() ===
        guarantorRelationship.trim().toLowerCase(),
    );
    if (match?.personName) {
      setValue("security.guarantor.nameOfGuarantor", match.personName, {
        shouldDirty: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guarantorRelationship]);

  const fmv = Number(security?.fmv);
  const proposedLoan = Number(security?.proposedLoan);
  const calculatedLtv =
    fmv > 0 && proposedLoan >= 0
      ? Math.round((proposedLoan / fmv) * 1000) / 10
      : undefined;

  return (
    <div className="space-y-5">
      <SectionCard
        icon={ShieldCheck}
        title="Security"
        description="Collateral pledged against this facility. The backend stores a single security record per application."
      >
        <FormSection>
          <TextField
            name="security.securityDetails"
            label="Security Details"
            placeholder="Description of security"
          />
          <NumberField
            name="security.fmv"
            label="Fair Market Value (FMV)"
            suffix="NPR"
          />
          <NumberField
            name="security.proposedLoan"
            label="Proposed Loan"
            suffix="NPR"
          />
          <NumberField
            name="security.financeAgainstFmv"
            label="Finance Against FMV"
            suffix="%"
          />
        </FormSection>
        <div className="mt-4">
          <ReadonlyField
            label="Calculated Loan to Income"
            value={calculatedLtv === undefined ? "—" : `${calculatedLtv}%`}
            hint="Proposed loan / FMV — for reference, enter the approved figure into Finance Against FMV above."
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={UserCheck}
        title="Personal Guarantee"
        description="The backend stores a single guarantor per application."
      >
        <FormSection columns={1}>
          <SelectField
            name="security.guarantor.guarantorConsent"
            label="Legal Obligation"
            options={toOptions(YES_NO_OPTIONS)}
          />
        </FormSection>

        {security?.guarantor?.guarantorConsent === "Yes" && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Legal Obligation Consent
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Whose consent is required for this legal obligation?
              </p>
            </div>
            <FormSection>
              <TextField
                name="security.guarantor.relationship"
                label="Relationship"
                placeholder="e.g. Father"
              />
              <TextField
                name="security.guarantor.nameOfGuarantor"
                label="Name"
                placeholder="Full name"
              />
              <NumberField name="security.guarantor.age" label="Age" />
              <NumberField
                name="security.guarantor.netWorth"
                label="Net Worth"
                suffix="NPR"
              />
            </FormSection>
          </div>
        )}

        <FormSection className="mt-4">
          <SelectField
            name="security.guarantor.ciclStatus"
            label="CICL Status Clear"
            options={toOptions(YES_NO_OPTIONS)}
          />
          {blacklistedStatus === "BLACKLISTED" && (
            <DateField
              name="security.guarantor.blackListedDate"
              label="Blacklisted Date"
            />
          )}
          <DateField
            name="security.guarantor.releasedDate"
            label="Released Date"
          />
        </FormSection>
        <div className="mt-4">
          <TextareaField
            name="security.guarantor.ciclRemarks"
            label="CICL Remarks"
            rows={3}
          />
        </div>
      </SectionCard>
    </div>
  );
}
