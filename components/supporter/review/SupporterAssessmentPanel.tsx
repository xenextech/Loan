"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, GraduationCap, School, Users } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  AssessmentSummary,
  loanAssessmentSchema,
  mergeDefaults,
  type LoanAssessmentFormValues,
} from "@/components/initiator/loan-assessment";
import StudentInfoCard from "@/components/initiator/components/StudentInfoCard";
import ParentVerificationCard from "@/components/initiator/components/ParentVerificationCard";
import CollegeReviewCard from "@/components/initiator/components/CollegeReviewCard";
import { SupporterApprovalActions } from "./SupporterApprovalActions";
import { formatDate } from "@/lib/formatters";
import { STAGE_LABEL } from "@/components/initiator/approval/stageBadge";
import type { SupporterApplicationDetail } from "../types/supporter";

/**
 * Left column of the Support review layout — every prior stage's information,
 * read-only, followed by the Supporter's own real Support/Send Back actions.
 * Student/Parent/College cards and the Initiator's Loan Assessment are reused
 * verbatim from the Initiator module; nothing here is editable.
 */
export function SupporterAssessmentPanel({ detail }: { detail: SupporterApplicationDetail }) {
  const form = useForm<LoanAssessmentFormValues>({
    resolver: zodResolver(loanAssessmentSchema),
    defaultValues: mergeDefaults(detail.assessment),
  });

  return (
    <div>
      <div className="md:sticky md:top-0 z-10 px-5 lg:px-6 py-3 border-b border-border bg-card flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-primary shrink-0" />
        <h2 className="text-sm font-bold text-foreground">Support Review</h2>
      </div>

      <Form {...form}>
        <div className="p-5 lg:p-6 space-y-5">
          {detail.stage === "SENT_BACK" && (
            <div className="rounded-lg bg-[var(--warning)]/10 border-l-4 border-[var(--warning)] px-4 py-3">
              <p className="text-xs font-semibold text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] mb-1">
                Sent back{detail.sentBackToStage ? ` to ${STAGE_LABEL[detail.sentBackToStage]}` : ""}
              </p>
              <p className="text-sm text-foreground">{detail.sentBackReason ?? "No reason recorded."}</p>
              {detail.sentBackAt && <p className="text-[11px] text-muted-foreground mt-1">{formatDate(detail.sentBackAt)}</p>}
            </div>
          )}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">1. Student Information</h3>
            </div>
            <StudentInfoCard student={detail.studentInfo} documents={detail.documents.student} />
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">2. Parent Information</h3>
            </div>
            <ParentVerificationCard verification={detail.parentVerification} documents={detail.documents.parent} />
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <School className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">3. College Information</h3>
            </div>
            <CollegeReviewCard verification={detail.collegeVerification} />
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">4. Initiator Information</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Displayed exactly as submitted by the Initiator. Every field below is read-only — Support cannot modify any value.
            </p>
            <AssessmentSummary />
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Support Decision</h3>
            <SupporterApprovalActions applicationId={detail.id} stage={detail.stage} />
          </section>
        </div>
      </Form>
    </div>
  );
}
