"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, XCircle, FileText, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useVerifyOfferLetterMutation,
  useGetDocumentVaultQuery,
  useGetGeneratedAgreementsQuery,
  useCreateGeneratedAgreementMutation,
  useSendAgreementToSignMutation,
  useMarkAgreementSignedMutation,
} from "@/lib/api/dashboardApi";
import type { GeneratedAgreementType, GeneratedAgreementStatus } from "@/types/dashboard";

const AGREEMENT_TYPES: GeneratedAgreementType[] = ["LOAN_AGREEMENT", "GUARANTEE_DEED", "HYPOTHECATION", "PROMISSORY_NOTE"];

const STATUS_BADGE_CLASS: Record<GeneratedAgreementStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGNATURE: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  SIGNED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

export function DocumentCenterDetail({ id }: { id: string }) {
  const router = useRouter();
  const [refInput, setRefInput] = useState("");
  const [agreementType, setAgreementType] = useState<GeneratedAgreementType>("LOAN_AGREEMENT");

  const { data: application, isLoading: appLoading } = useGetDashboardApplicationDetailQuery(id);
  const { data: vault, isLoading: vaultLoading } = useGetDocumentVaultQuery({ applicationId: id, page: 1, limit: 50 });
  const { data: agreements, isLoading: agreementsLoading } = useGetGeneratedAgreementsQuery({ applicationId: id, page: 1, limit: 50 });
  const [verifyOfferLetter, { data: verifyResult, isLoading: verifying }] = useVerifyOfferLetterMutation();
  const [createAgreement, { isLoading: creatingAgreement }] = useCreateGeneratedAgreementMutation();
  const [sendToSign] = useSendAgreementToSignMutation();
  const [markSigned] = useMarkAgreementSignedMutation();

  const handleVerify = async () => {
    if (!refInput.trim()) return;
    try {
      await verifyOfferLetter({ applicationId: id, refOrQrToken: refInput.trim() }).unwrap();
    } catch {
      toast.error("Verification request failed");
    }
  };

  const handleCreateAgreement = async () => {
    try {
      await createAgreement({ applicationId: id, agreementType }).unwrap();
      toast.success("Agreement draft generated.");
    } catch {
      toast.error("Failed to generate agreement");
    }
  };

  if (appLoading) {
    return <div className="p-6 lg:p-8 max-w-5xl mx-auto text-sm text-muted-foreground">Loading…</div>;
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Application not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/initiator/document-center")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/document-center")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-foreground font-mono">{application.applicationNumber}</h2>
        <span className="text-sm text-muted-foreground">— {application.fullName ?? "—"}</span>
      </div>

      {/* Offer letter verification */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">Offer letter verification</h3>
        <div className="flex items-center gap-2 w-full max-w-md mb-4">
          <Input
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="e.g. AIM/OFFER/2081-082/0041 or QR token"
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <Button size="sm" className="h-9 shrink-0 gap-1.5" disabled={verifying || !refInput.trim()} onClick={handleVerify}>
            {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Verify
          </Button>
        </div>

        {verifyResult && (
          verifyResult.matched ? (
            <div className="rounded-lg bg-[var(--success)]/10 border-l-4 border-[var(--success)] px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success shrink-0" />
              <p className="text-xs font-semibold text-[oklch(0.42_0.18_145)] dark:text-success">
                Matched — offer letter verified and linked to this application.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-destructive/10 border-l-4 border-destructive px-4 py-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-xs font-semibold text-destructive">No offer letter matched that reference/QR token.</p>
            </div>
          )
        )}
      </div>

      {/* Document vault */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Document vault</h3>
        {vaultLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !vault?.data.length ? (
          <p className="text-sm text-muted-foreground">No documents uploaded for this application yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {vault.data.map((doc) => (
              <li key={doc.id} className="flex items-center gap-4 py-3.5 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{doc.documentType.replaceAll("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{doc.originalFileName} · {formatDate(doc.uploadedAt)}</p>
                </div>
                <a href={doc.publicUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline shrink-0">
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Agreement generator */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">Agreement generator</h3>
        <div className="flex items-center gap-3 mb-1">
          <Select value={agreementType} onValueChange={(v) => setAgreementType(v as GeneratedAgreementType)}>
            <SelectTrigger className="h-9 text-sm w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGREEMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t.replaceAll("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" disabled={creatingAgreement} onClick={handleCreateAgreement}>
            {creatingAgreement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Generate Draft
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          No PDF rendering pipeline exists yet — this creates a draft record with borrower/loan terms auto-populated from the application.
        </p>
      </div>

      {/* Generated agreements for this application */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Generated agreements</h3>
        {agreementsLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !agreements?.data.length ? (
          <p className="text-sm text-muted-foreground">No agreements generated for this application yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Generated</TableHead>
                <TableHead className="text-xs">Signed</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.data.map((agreement) => (
                <TableRow key={agreement.id} className="border-border">
                  <TableCell className="text-xs text-foreground">{agreement.agreementType.replaceAll("_", " ")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(agreement.createdAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{agreement.signedAt ? formatDate(agreement.signedAt) : "—"}</TableCell>
                  <TableCell>
                    <Badge className={cn(STATUS_BADGE_CLASS[agreement.status], "border-0 text-[10px] font-semibold")}>{agreement.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {agreement.status === "DRAFT" && (
                      <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => sendToSign(agreement.id)}>
                        Send to sign
                      </button>
                    )}
                    {agreement.status === "PENDING_SIGNATURE" && (
                      <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => markSigned(agreement.id)}>
                        Mark signed
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </motion.div>
  );
}
