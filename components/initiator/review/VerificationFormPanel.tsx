"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Lock } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  AssessmentSummary,
  LoanAssessmentForm,
  loanAssessmentSchema,
  mergeDefaults,
  type LoanAssessmentFormValues,
} from "../loan-assessment";
import { toDateInputValue } from "@/lib/api/transforms";
import { STAGE_LABEL, NO_STAGE_LABEL } from "@/components/initiator/approval/stageBadge";
import type { InitiatorApplicationDetail } from "../types/initiator";


export function VerificationFormPanel({ detail }: { detail: InitiatorApplicationDetail }) {
  const router = useRouter();

  // A resubmission (Support/Approver sent it back to the Initiator to fix and
  // resend) skips the final Review & Submit step — it's only shown the first
  // time an application is ever taken through the assessment.
  const isResubmission = detail.stage === "SENT_BACK" && detail.sentBackToStage === "INITIATED";

  // Mirrors ApplicationInitiatorService.assertInitiatorCanEdit() on the backend:
  // once another role has started acting on the application, the Initiator can
  // no longer edit it — unless it's been sent back specifically to them.
  const isEditable = detail.stage === null || detail.stage === undefined || detail.stage === "INITIATED" || isResubmission;

  const readOnlyForm = useForm<LoanAssessmentFormValues>({
    resolver: zodResolver(loanAssessmentSchema),
    defaultValues: mergeDefaults(detail.assessment),
  });

  return (
    <div>
      <div className="md:sticky md:top-0 z-10 px-5 lg:px-6 py-3 border-b border-border bg-card flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-primary shrink-0" />
        <h2 className="text-sm font-bold text-foreground">Verification Form</h2>
      </div>

      {isEditable ? (
        <div className="p-5 lg:p-6">
          <LoanAssessmentForm
            applicationId={detail.id}
            hasInitiatorInfo={detail.hasInitiatorInfo}
            applicationLoanAmount={detail.loanAmount}
            applicationEstimatedEmi={detail.estimatedEmi}
            isResubmission={isResubmission}
            onSubmitted={() => router.push("/initiator")}
            initialValues={{
              ...detail.assessment,
              applicantInfo: {

                ...detail.assessment.applicantInfo,
                customerName: detail.assessment.applicantInfo?.customerName || detail.studentName,
                contactNumber: detail.assessment.applicantInfo?.contactNumber || detail.studentInfo.phoneNumber,
                nationalId: detail.assessment.applicantInfo?.nationalId || detail.studentInfo.identityNumber || "",
                citizenshipNumber: detail.assessment.applicantInfo?.citizenshipNumber || detail.studentInfo.identityNumber || "",
                citizenshipIssuedPlace: detail.assessment.applicantInfo?.citizenshipIssuedPlace || detail.studentInfo.issuedDistrict || "",
                citizenshipIssuedDate:
                  detail.assessment.applicantInfo?.citizenshipIssuedDate || toDateInputValue(detail.studentInfo.issuedDate),
                profession: detail.assessment.applicantInfo?.profession || detail.studentInfo.occupation || "",
              },
            }}
          />
        </div>
      ) : (
        <Form {...readOnlyForm}>
          <div className="p-5 lg:p-6 space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              This application is currently at the {detail.stage ? STAGE_LABEL[detail.stage] : NO_STAGE_LABEL} stage and can no
              longer be edited. It can only be updated again if it&apos;s sent back to you for review.
            </div>
            <AssessmentSummary />
          </div>
        </Form>
      )}
    </div>
  );
}
