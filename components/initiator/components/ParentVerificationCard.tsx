"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, ExternalLink, CheckCircle2, Clock, FileStack } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { DocumentGrid } from "../review/DocumentSection";
import { DocumentModal } from "../review/DocumentModal";
import type { DocumentItem, InitiatorParentVerification } from "../types/initiator";

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
 * Read-only view of the parent's magic-link verification submission —
 * distinct from the student-reported family names shown elsewhere. Never
 * editable from this screen.
 */
export default function ParentVerificationCard({
  verification,
  documents,
}: {
  verification: InitiatorParentVerification | null;
  /** Parent's uploaded documents (NID, PAN card, every labeled salary sheet) — omit to fall back to the legacy single salary-sheet link. */
  documents?: DocumentItem[];
}) {
  const submitted = Boolean(verification?.submittedAt);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-3.5 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          Parent Information
        </CardTitle>
        {submitted ? (
          <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-[10px] font-semibold gap-1">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </Badge>
        ) : (
          <Badge className="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0 text-[10px] font-semibold gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-5 py-1">
        {!verification ? (
          <p className="text-xs text-muted-foreground py-3">Parent has not submitted the verification form yet.</p>
        ) : (
          <>
            <InfoRow label="Parent Name" value={verification.name} />
            <InfoRow label="Phone" value={verification.phone} />
            <InfoRow label="Contact" value={verification.contact} />
            <InfoRow label="Citizenship Number" value={verification.citizenshipNumber} />
            <InfoRow label="Salary Bank Name" value={verification.salaryBankName} />
            <InfoRow label="Bank Account Number" value={verification.bankAccountNumber} />
            <InfoRow label="Submitted On" value={verification.submittedAt ? formatDate(verification.submittedAt) : undefined} />

            {documents !== undefined ? (
              <div className="pt-2">
                <Separator className="mb-3" />
                <div className="flex items-center gap-1.5 mb-2">
                  <FileStack className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Documents</span>
                </div>
                <DocumentGrid
                  documents={documents}
                  onOpen={(doc) => {
                    setActiveDocument(doc);
                    setModalOpen(true);
                  }}
                  emptyLabel="No parent documents uploaded yet."
                />
              </div>
            ) : (
              verification.salarySheetPublicUrl && (
                <div className="flex items-baseline justify-between py-2 gap-6">
                  <span className="text-xs text-muted-foreground shrink-0">Salary Sheet</span>
                  <a
                    href={verification.salarySheetPublicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )
            )}
          </>
        )}
      </CardContent>

      <DocumentModal document={activeDocument} open={modalOpen} onOpenChange={setModalOpen} />
    </Card>
  );
}
