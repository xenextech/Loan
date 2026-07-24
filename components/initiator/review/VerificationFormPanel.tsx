"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { LoanAssessmentForm } from "../loan-assessment";
import { toDateInputValue } from "@/lib/api/transforms";
import type { InitiatorApplicationDetail } from "../types/initiator";

/**
 * Left column of the split-screen review layout. Wraps the existing
 * multi-step Loan Assessment Form untouched. The scroll container itself
 * lives on the parent (`VerificationLayout`) — this panel only adds a
 * lightweight sub-header that sticks to the top of that same container.
 */
export function VerificationFormPanel({ detail }: { detail: InitiatorApplicationDetail }) {
  const router = useRouter();

  return (
    <div>
      {/* Only sticky from md: up, where this panel becomes its own independent-scroll column —
          on mobile it would otherwise compete with the page header for the same sticky slot. */}
      <div className="md:sticky md:top-0 z-10 px-5 lg:px-6 py-3 border-b border-border bg-card flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-primary shrink-0" />
        <h2 className="text-sm font-bold text-foreground">Verification Form</h2>
      </div>

      <div className="p-5 lg:p-6">
        <LoanAssessmentForm
          applicationId={detail.id}
          hasInitiatorInfo={detail.hasInitiatorInfo}
          onSubmitted={() => router.push("/initiator")}
          initialValues={{
            ...detail.assessment,
            applicantInfo: {
              // Previously-saved initiator answers win; fall back to the student's
              // own submission data for fields not yet filled in by the initiator.
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
    </div>
  );
}
