import { FileSignature } from "lucide-react";
import { SectionCard } from "../ui/SectionCard";
import { TextareaField } from "../fields/TextareaField";

export function Step8Recommendation() {
  return (
    <div className="space-y-5">
      <SectionCard icon={FileSignature} title="Loan Recommendation" description="The initiator's final write-up for Support and Approver review.">
        <div className="space-y-5">
          <TextareaField name="recommendation.termsAndConditions" label="Terms & Conditions" rows={4} placeholder="Key terms and conditions of the facility…" />
          <TextareaField name="recommendation.justificationOfLoan" label="Justification of Loan" rows={4} placeholder="Why this facility should be approved…" />
          <TextareaField name="recommendation.accountStrategy" label="Account Strategy" rows={4} placeholder="Planned account management strategy…" />
          <TextareaField name="recommendation.disbursementSection" label="Disbursement" rows={4} placeholder="Disbursement schedule and conditions precedent…" />
          <TextareaField name="recommendation.utilizationOfFund" label="Utilization of Fund" rows={4} placeholder="How the funds will be utilized…" />
          <TextareaField name="recommendation.conclusionAndRecommendation" label="Conclusion & Recommendation" rows={4} placeholder="Overall conclusion and final recommendation to the approving authority…" />
        </div>
      </SectionCard>
    </div>
  );
}
