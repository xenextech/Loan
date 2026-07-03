"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, GraduationCap, School } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/lib/hooks";
import {
  AssessmentSummary,
  loanAssessmentSchema,
  Step9Approval,
  type LoanAssessmentFormValues,
} from "@/components/initiator/loan-assessment";
import StudentInfoCard from "@/components/initiator/components/StudentInfoCard";
import CollegeReviewCard from "@/components/initiator/components/CollegeReviewCard";
import type { SupporterApplicationDetail } from "../types/supporter";

/**
 * Left column of the Support review layout. Read-only Student Information and
 * College Verification (Sections 1 & 2, reused verbatim from the Initiator module),
 * followed by the complete Initiator Loan Assessment exactly as submitted (Section 3,
 * every field disabled) and the shared Approval Chain — which only unlocks the
 * Support card here, since `currentUserRole="SUPPORT"` is passed to `Step9Approval`.
 */
export function SupporterAssessmentPanel({ detail }: { detail: SupporterApplicationDetail }) {
  const supporterEmail = useAppSelector((s) => s.auth.user?.email);

  const form = useForm<LoanAssessmentFormValues>({
    resolver: zodResolver(loanAssessmentSchema),
    defaultValues: detail.loanAssessment,
  });

  return (
    <div>
      <div className="md:sticky md:top-0 z-10 px-5 lg:px-6 py-3 border-b border-border bg-card flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-primary shrink-0" />
        <h2 className="text-sm font-bold text-foreground">Support Review</h2>
      </div>

      <Form {...form}>
        <div className="p-5 lg:p-6 space-y-5">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">1. Student Information</h3>
            </div>
            <StudentInfoCard student={detail.studentInfo} />
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <School className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">2. College Verification</h3>
            </div>
            <CollegeReviewCard verification={detail.collegeVerification} />
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">3. Initiator Loan Assessment</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Displayed exactly as submitted by the Initiator. Every field below is read-only — Support cannot modify any value.
            </p>
            <AssessmentSummary />
          </section>

          <Step9Approval currentUserRole="SUPPORT" currentUserName={supporterEmail ?? "Support Officer"} />
        </div>
      </Form>
    </div>
  );
}
