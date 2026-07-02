import { AlertOctagon } from "lucide-react";
import { SectionCard } from "../ui/SectionCard";
import { TextareaField } from "../fields/TextareaField";

export function Step7RiskAssessment() {
  return (
    <div className="space-y-5">
      <SectionCard icon={AlertOctagon} title="Risk Assessment" description="Narrative risk analysis for the credit committee.">
        <div className="space-y-5">
          <TextareaField
            name="riskAssessment.moneyLaunderingRisk"
            label="Money Laundering / Terrorist Financing Risks"
            description="The KYC procedure for the client has been completed as a comprehensive screening confirmed that the individual is not listed under any blacklists, Politically Exposed Persons (PEPs), domestic or foreign PEP registries, NRB Rokka restrictions, or multiple account databases. The proposed agriculture loan amount will be utilized for the agriculture expenses as mentioned in the plan sheet. Thus, there will not be any money laundering and terrorist financing risk."
            placeholder="Assess ML/TF risk exposure for this applicant and facility…"
            rows={4}
          />
          <TextareaField
            name="riskAssessment.waiver"
            label="Waiver"
            placeholder="Document any policy waivers sought and their justification…"
            rows={4}
          />
          <TextareaField
            name="riskAssessment.bankingRelationshipRisk"
            label="Banking Relationship"
            placeholder="Assess the strength and risk of the banking relationship…"
            rows={4}
          />
          <TextareaField
            name="riskAssessment.keyCreditRiskMitigation"
            label="Key Credit Risk Mitigation"
            placeholder="Summarize the key mitigants applied to this credit…"
            rows={4}
          />
        </div>
      </SectionCard>
    </div>
  );
}
