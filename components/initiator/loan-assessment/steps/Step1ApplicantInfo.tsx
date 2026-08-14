import { UserRound } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { SectionCard, FormSection } from "../ui/SectionCard";
import { TextField } from "../fields/TextField";
import { NumberField } from "../fields/NumberField";
import { DateField } from "../fields/DateField";
import { SelectField } from "../fields/SelectField";
import { BANKING_RELATIONSHIP_OPTIONS, BLACKLISTED_STATUS_OPTIONS, type LoanAssessmentFormValues } from "../schema";

export function Step1ApplicantInfo() {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const bankingRelationship = useWatch({ control, name: "applicantInfo.bankingRelationship" });
  const hasExistingAccount = bankingRelationship === "EXISTING";

  return (
    <div className="space-y-5">
      <SectionCard icon={UserRound} title="Applicant Identity" description="Core KYC details for the borrower.">
        <FormSection>
          <TextField name="applicantInfo.customerName" label="Customer Name" placeholder="Full legal name" required />
          <DateField name="applicantInfo.relationshipStartDate" label="Relationship Start Date" />
          <TextField name="applicantInfo.group" label="Group" placeholder="e.g. Individual, Corporate" />
          <TextField name="applicantInfo.obligorNumber" label="Obligor Number" placeholder="Core banking obligor ID" />
          <TextField name="applicantInfo.contactNumber" label="Contact Number" placeholder="98XXXXXXXX" type="tel" required />
          <TextField name="applicantInfo.profession" label="Profession" placeholder="e.g. Student, Salaried" />
          <TextField name="applicantInfo.repaymentSource" label="Repayment Source" placeholder="e.g. Parental income, Salary" />
          <TextField name="applicantInfo.citizenshipNumber" label="Citizenship Number" placeholder="e.g. 12-34-56-7890" />
          <DateField name="applicantInfo.citizenshipIssuedDate" label="Citizenship Issued Date" />
          <TextField name="applicantInfo.citizenshipIssuedPlace" label="Citizenship Issued Place" placeholder="District" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Addresses">
        <FormSection>
          <TextField name="applicantInfo.permanentAddress" label="Permanent Address" placeholder="Ward, Municipality, District" />
          <TextField name="applicantInfo.correspondenceAddress" label="Correspondence Address" placeholder="Ward, Municipality, District" />
        </FormSection>
      </SectionCard>

      <SectionCard title="Identification & Standing">
        <FormSection>
          <TextField name="applicantInfo.nationalId" label="National ID" placeholder="Citizenship / National ID number" required />
          <TextField name="applicantInfo.pan" label="PAN" placeholder="Permanent Account Number" />
          <TextField name="applicantInfo.license" label="License" placeholder="Driving license number, if any" />
          <SelectField
            name="applicantInfo.bankingRelationship"
            label="Banking Relationship"
            options={BANKING_RELATIONSHIP_OPTIONS}
          />
          <SelectField
            name="applicantInfo.blacklistedStatus"
            label="Blacklisted Status"
            options={BLACKLISTED_STATUS_OPTIONS}
          />
        </FormSection>
      </SectionCard>

      {hasExistingAccount && (
        <SectionCard
          title="Existing Bank Account Details"
          description="Required since Banking Relationship is Existing."
        >
          <FormSection>
            <TextField
              name="applicantInfo.existingBankName"
              label="Bank Name"
              placeholder="e.g. Nepal Bank Limited"
              required
            />
            <TextField
              name="applicantInfo.existingBankAccountNumber"
              label="Account Number"
              placeholder="e.g. 0123456789012"
              required
            />
            <NumberField
              name="applicantInfo.existingBankSavingsAmount"
              label="Savings"
              suffix="NPR"
            />
            <NumberField
              name="applicantInfo.existingBankLoanAmount"
              label="Loan Amount"
              suffix="NPR"
            />
          </FormSection>
        </SectionCard>
      )}
    </div>
  );
}
