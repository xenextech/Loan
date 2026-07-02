import { ClipboardCheck } from "lucide-react";
import { LoanAssessmentForm } from "../loan-assessment";
import type { InitiatorApplicationDetail } from "../types/initiator";

/**
 * Left column of the split-screen review layout. Wraps the existing
 * multi-step Loan Assessment Form untouched. The scroll container itself
 * lives on the parent (`VerificationLayout`) — this panel only adds a
 * lightweight sub-header that sticks to the top of that same container.
 */
export function VerificationFormPanel({ detail }: { detail: InitiatorApplicationDetail }) {
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
          initialValues={{
            applicantInfo: {
              customerName: detail.studentName,
              contactNumber: detail.studentInfo.phoneNumber,
              nationalId: detail.studentInfo.identityNumber ?? "",
              citizenshipDetails: detail.studentInfo.identityNumber
                ? `${detail.studentInfo.identityNumber} (${detail.studentInfo.issuedDistrict ?? ""})`
                : "",
              profession: detail.studentInfo.occupation ?? "",
            },
          }}
        />
      </div>
    </div>
  );
}
