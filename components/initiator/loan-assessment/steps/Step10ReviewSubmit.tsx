"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertTriangle, ClipboardList } from "lucide-react";
import { ReviewCard } from "../ui/ReviewCard";
import { SummaryItem } from "../ui/ReadonlyField";
import { ApprovalStatusBadge } from "../ui/StatusBadge";
import {
  DSGIR_OPTIONS,
  PERFORMANCE_YEARS_OPTIONS,
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

const STEP_ID_BY_KEY: Record<string, number> = {
  applicantInfo: 1,
  nrbReporting: 2,
  creditAssessment: 3,
  applicantBackground: 4,
  security: 5,
  insuranceRepayment: 6,
  riskAssessment: 7,
  recommendation: 8,
  approval: 9,
};

const STEP_TITLE_BY_KEY: Record<string, string> = {
  applicantInfo: "Applicant Information",
  nrbReporting: "NRB Reporting",
  creditAssessment: "Credit Assessment",
  applicantBackground: "Applicant Background",
  security: "Security & Personal Guarantee",
  insuranceRepayment: "Insurance & Repayment Capacity",
  riskAssessment: "Risk Assessment",
  recommendation: "Loan Recommendation",
  approval: "Approval",
};

export function Step10ReviewSubmit({ onEdit }: { onEdit: (stepId: number) => void }) {
  const { control, formState } = useFormContext<LoanAssessmentFormValues>();
  const values = useWatch({ control });

  const incompleteKeys = useMemo(() => Object.keys(formState.errors) as (keyof LoanAssessmentFormValues)[], [formState.errors]);

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
      {incompleteKeys.length > 0 && (
        <div className="rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[oklch(0.5_0.16_80)] shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Some required fields are missing</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {incompleteKeys.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className="underline underline-offset-2 hover:text-foreground"
                    onClick={() => onEdit(STEP_ID_BY_KEY[key] ?? 1)}
                  >
                    {STEP_TITLE_BY_KEY[key] ?? key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ClipboardList className="w-4 h-4" />
        Review every section below. Use Edit to jump back and make changes.
      </div>

      <ReviewCard title={STEPS[0].title} stepId={1} onEdit={onEdit} incomplete={incompleteKeys.includes("applicantInfo")}>
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
        <SummaryItem label="Sector Classification" value={n?.sectorClassification} />
        <SummaryItem label="Loan Type" value={n?.loanType} />
        <SummaryItem label="Purpose of Loan" value={n?.purposeOfLoan} />
        <SummaryItem label="Loan Classification" value={n?.loanClassification} />
        <SummaryItem label="Interest Rate Type" value={n?.interestRateType} />
        <SummaryItem label="Effective Interest Rate" value={n?.effectiveInterestRate !== undefined ? `${n.effectiveInterestRate}%` : undefined} />
      </ReviewCard>

      <ReviewCard title={STEPS[2].title} stepId={3} onEdit={onEdit}>
        <SummaryItem label="Credit Limit" value={c?.creditLimit !== undefined ? `NPR ${c.creditLimit}` : undefined} />
        <SummaryItem label="Loan to Value Ratio" value={c?.loanToValueRatio !== undefined ? `${c.loanToValueRatio}%` : undefined} />
        <SummaryItem label="DSGIR" value={optionLabel(DSGIR_OPTIONS, c?.dsgir)} />
        <SummaryItem label="Performance Years" value={optionLabel(PERFORMANCE_YEARS_OPTIONS, c?.performanceYears)} />
        <SummaryItem label="Banking Relationship Score" value={c?.bankingRelationshipScore} />
      </ReviewCard>

      <ReviewCard title={STEPS[3].title} stepId={4} onEdit={onEdit}>
        <SummaryItem label="Family Members" value={`${bg?.familyMembers?.length ?? 0} recorded`} />
        <SummaryItem label="Existing Facilities" value={`${bg?.existingFacilities?.length ?? 0} recorded`} />
      </ReviewCard>

      <ReviewCard title={STEPS[4].title} stepId={5} onEdit={onEdit}>
        <SummaryItem label="Securities Pledged" value={`${s?.securities?.length ?? 0} recorded`} />
        <SummaryItem label="Guarantors" value={`${s?.guarantors?.length ?? 0} recorded`} />
      </ReviewCard>

      <ReviewCard title={STEPS[5].title} stepId={6} onEdit={onEdit}>
        <SummaryItem label="Insurance Policies" value={`${ir?.insurances?.length ?? 0} recorded`} />
        <SummaryItem label="Monthly Income" value={ir?.repaymentCapacity?.monthlyIncome} />
        <SummaryItem label="Proposed EMI" value={ir?.repaymentCapacity?.proposedEmi} />
      </ReviewCard>

      <ReviewCard title={STEPS[6].title} stepId={7} onEdit={onEdit}>
        <SummaryItem label="Money Laundering / TF Risk" value={truncate(r?.moneyLaunderingRisk)} />
        <SummaryItem label="Waiver" value={truncate(r?.waiver)} />
        <SummaryItem label="Banking Relationship" value={truncate(r?.bankingRelationshipRisk)} />
        <SummaryItem label="Key Credit Risk Mitigation" value={truncate(r?.keyCreditRiskMitigation)} />
      </ReviewCard>

      <ReviewCard title={STEPS[7].title} stepId={8} onEdit={onEdit}>
        <SummaryItem label="Justification" value={truncate(rec?.justification)} />
        <SummaryItem label="Account Strategy" value={truncate(rec?.accountStrategy)} />
        <SummaryItem label="Disbursement" value={truncate(rec?.disbursement)} />
        <SummaryItem label="Recommendation" value={truncate(rec?.recommendation)} />
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
          <span className="text-[11px] text-muted-foreground w-16">Approver</span>
          <ApprovalStatusBadge status={ap?.approver?.status ?? "WAITING"} />
        </div>
      </ReviewCard>
    </div>
  );
}
