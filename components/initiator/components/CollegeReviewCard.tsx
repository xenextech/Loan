import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import type { InitiatorCollegeVerification } from "../types/initiator";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/50 last:border-0 gap-6">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{String(value)}</span>
    </div>
  );
}

/**
 * Read-only view of the College Verification Form. The initiator reviews
 * this data only — it is never editable from this screen.
 */
export default function CollegeReviewCard({
  verification,
}: {
  verification: InitiatorCollegeVerification;
}) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-3.5 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5" />
          College Verification
        </CardTitle>
        {verification.isApplicationVerified ? (
          <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-[10px] font-semibold gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </Badge>
        ) : (
          <Badge className="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0 text-[10px] font-semibold gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-5 py-1">
        <InfoRow label="College Name" value={verification.collegeName} />
        <InfoRow label="Contact Person" value={verification.contactPerson} />
        <InfoRow label="College Email" value={verification.collegeEmail} />
        <InfoRow label="Contact Phone" value={verification.contactPhone} />
        {verification.verificationNotes && (
          <InfoRow label="Notes" value={verification.verificationNotes} />
        )}
        {verification.offerLetterPublicUrl && (
          <div className="flex items-baseline justify-between py-2 border-b border-border/50 gap-6">
            <span className="text-xs text-muted-foreground shrink-0">Offer Letter</span>
            <a
              href={verification.offerLetterPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              View <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
        {verification.enrollmentDocPublicUrl && (
          <div className="flex items-baseline justify-between py-2 gap-6">
            <span className="text-xs text-muted-foreground shrink-0">Enrollment Doc</span>
            <a
              href={verification.enrollmentDocPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              View <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
