"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ReviewCard } from "./ReviewCard";
import { SummaryItem } from "./ReadonlyField";
import { ApprovalStatusBadge } from "./StatusBadge";
import {
  BANKING_RELATIONSHIP_OPTIONS,
  BLACKLISTED_STATUS_OPTIONS,
  type LoanAssessmentFormValues,
} from "../schema";
import { STEPS } from "../constants";

function optionLabel(options: readonly { value: string; label: string }[], value?: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function truncate(text?: string, max = 140) {
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

interface AssessmentSummaryProps {
  /** Omit for a pure read-only summary (no per-card Edit button) — e.g. Supporter/Approver review. */
  onEdit?: (stepId: number) => void;
}

/**
 * Read-only summary of every loan-assessment section (Steps 1-8) plus the approval
 * chain's current statuses. Shared by the Initiator's own Step 10 "Review & Submit"
 * (with `onEdit` wired to jump back) and the Supporter/Approver review screens
 * (without `onEdit`, so no card can be edited).
 */
export function AssessmentSummary({ onEdit }: AssessmentSummaryProps) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const values = useWatch({ control });

  const a = values.applicantInfo;
  const n = values.nrbReporting;
  const c = values.creditAssessment;
  const bg = values.applicantBackground;
  const s = values.security;
  const ir = values.insuranceRepayment;
  const r = values.riskAssessment;
  const rec = values.recommendation;
  const ap = values.approval;

  return (
    <div className="space-y-5">
      <ReviewCard title={STEPS[0].title} stepId={1} onEdit={onEdit}>
        <SummaryItem label="Customer Name" value={a?.customerName} />
        <SummaryItem label="Contact Number" value={a?.contactNumber} />
        <SummaryItem label="National ID" value={a?.nationalId} />
        <SummaryItem label="Group" value={a?.group} />
        <SummaryItem label="Profession" value={a?.profession} />
        <SummaryItem label="Banking Relationship" value={optionLabel(BANKING_RELATIONSHIP_OPTIONS, a?.bankingRelationship)} />
        <SummaryItem label="Blacklisted Status" value={optionLabel(BLACKLISTED_STATUS_OPTIONS, a?.blacklistedStatus)} />
        <SummaryItem label="Repayment Source" value={a?.repaymentSource} />
      </ReviewCard>

      <ReviewCard title={STEPS[1].title} stepId={2} onEdit={onEdit}>
        <SummaryItem label="Basel Classification" value={n?.baselClassification} />
        <SummaryItem label="Basel Risk Weight" value={n?.baselRiskWeight !== undefined ? `${n.baselRiskWeight}%` : undefined} />
        <SummaryItem label="NRB 9.3 Sector Code" value={n?.nrb93SectorCode} />
        <SummaryItem label="NRB 9.4 Security Type Code" value={n?.nrb94SecurityTypeCode} />
        <SummaryItem label="SIS 2 — Sector" value={n?.sis2Sector} />
        <SummaryItem label="Green Finance Sector" value={n?.greenFinanceEconomicSector} />
      </ReviewCard>

      <ReviewCard title={STEPS[2].title} stepId={3} onEdit={onEdit}>
        <SummaryItem label="Credit Limit" value={c?.creditLimit !== undefined ? `NPR ${c.creditLimit}` : undefined} />
        <SummaryItem label="Loan to Value Ratio (%)" value={c?.loanToValueRatio !== undefined ? `${c.loanToValueRatio}%` : undefined} />
        <SummaryItem label="DSGIR (%)" value={c?.dsgir !== undefined ? `${c.dsgir}%` : undefined} />
        <SummaryItem label="Performance Years" value={c?.performanceYears} />
        <SummaryItem label="Banking Relationship Score" value={c?.bankingRelationshipScore} />
        <SummaryItem label="Parents Borrowings with BFIs" value={c?.parentsBorrowingsWithBFIs} />
        <SummaryItem label="Source of Income Score" value={c?.sourceOfIncomeScore} />
        <SummaryItem label="Risk Grade" value={c?.riskGrade} />
        <SummaryItem label="Total Score" value={c?.totalScore} />
      </ReviewCard>

      <ReviewCard title={STEPS[3].title} stepId={4} onEdit={onEdit}>
        <SummaryItem label="Family Members" value={`${bg?.familyMembers?.length ?? 0} recorded`} />
        <SummaryItem label="Existing Facilities (local only)" value={`${bg?.existingFacilities?.length ?? 0} recorded`} />
        <SummaryItem label="This Facility" value={bg?.facility} />
        <SummaryItem label="Purpose" value={bg?.purpose} />
        <SummaryItem label="Limit" value={bg?.limit !== undefined ? `NPR ${bg.limit}` : undefined} />
        <SummaryItem label="Interest Rate" value={bg?.interestRate !== undefined ? `${bg.interestRate}%` : undefined} />
      </ReviewCard>

      <ReviewCard title={STEPS[4].title} stepId={5} onEdit={onEdit}>
        <SummaryItem label="Security Details" value={s?.securityDetails} />
        <SummaryItem label="FMV" value={s?.fmv !== undefined ? `NPR ${s.fmv}` : undefined} />
        <SummaryItem label="Proposed Loan" value={s?.proposedLoan !== undefined ? `NPR ${s.proposedLoan}` : undefined} />
        <SummaryItem label="Guarantor" value={s?.guarantor?.nameOfGuarantor} />
        <SummaryItem label="Guarantor Consent" value={s?.guarantor?.guarantorConsent} />
      </ReviewCard>

      <ReviewCard title={STEPS[5].title} stepId={6} onEdit={onEdit}>
        <SummaryItem label="Insured Assets" value={ir?.insurance?.insuredAssets} />
        <SummaryItem label="Sum of Insurance" value={ir?.insurance?.sumOfInsurance !== undefined ? `NPR ${ir.insurance.sumOfInsurance}` : undefined} />
        <SummaryItem label="Repayment Capacity — Value of Assets" value={ir?.repaymentCapacity?.valueOfAssets !== undefined ? `NPR ${ir.repaymentCapacity.valueOfAssets}` : undefined} />
      </ReviewCard>

      <ReviewCard title={STEPS[6].title} stepId={7} onEdit={onEdit}>
        <SummaryItem label="AML / CFT Risk" value={truncate(r?.amlRisk)} />
        <SummaryItem label="Waiver" value={truncate(r?.waiver)} />
        <SummaryItem label="Banking Relationship" value={truncate(r?.bankingRelationshipRemarks)} />
        <SummaryItem label="Key Credit Risk Mitigation" value={truncate(r?.keyCreditRiskMitigation)} />
      </ReviewCard>

      <ReviewCard title={STEPS[7].title} stepId={8} onEdit={onEdit}>
        <SummaryItem label="Justification of Loan" value={truncate(rec?.justificationOfLoan)} />
        <SummaryItem label="Account Strategy" value={truncate(rec?.accountStrategy)} />
        <SummaryItem label="Disbursement" value={truncate(rec?.disbursementSection)} />
        <SummaryItem label="Conclusion & Recommendation" value={truncate(rec?.conclusionAndRecommendation)} />
      </ReviewCard>

      <ReviewCard title={STEPS[8].title} stepId={9} onEdit={onEdit}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-16">Initiator</span>
          <ApprovalStatusBadge status={ap?.initiator?.status ?? "PENDING"} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-16">Support</span>
          <ApprovalStatusBadge status={ap?.support?.status ?? "WAITING"} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-16">Checker</span>
          <ApprovalStatusBadge status={ap?.checker?.status ?? "WAITING"} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-16">Approver</span>
          <ApprovalStatusBadge status={ap?.approver?.status ?? "WAITING"} />
        </div>
      </ReviewCard>
    </div>
  );
}
