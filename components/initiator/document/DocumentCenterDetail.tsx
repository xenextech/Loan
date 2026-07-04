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
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentCenterDetail } from "./useDocumentCenterDetail";
import type { AgreementStatus, DocumentTone } from "./types";

const TONE_SWATCH_CLASS: Record<DocumentTone, string> = {
  success: "bg-[var(--success)]/15",
  info: "bg-primary/10",
  purple: "bg-[oklch(0.85_0.08_300)]",
  warning: "bg-[var(--warning)]/15",
};

const STATUS_BADGE_CLASS: Record<AgreementStatus, string> = {
  Signed: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  Active: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  "Pending sign": "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  "Not signed": "bg-destructive/10 text-destructive",
};

/** Document Center is not scoped to one loan's data model beyond the demo example — `id` only drives the Back destination. */
export function DocumentCenterDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const { data } = useDocumentCenterDetail();

  const [refInput, setRefInput] = useState(data.offerLetterVerification.refNo);
  const [verified, setVerified] = useState(true);
  const [agreementType, setAgreementType] = useState(data.agreementTypeOptions[0]);
  const [loanReference, setLoanReference] = useState(data.loanReferenceOptions[0]?.value ?? "");

  const handleVerify = () => {
    if (!refInput.trim()) {
      setVerified(false);
      return;
    }
    setVerified(true);
    toast.success(`Offer letter ${refInput.trim()} verified.`);
  };

  const handleGeneratePdf = () => {
    toast.success(`${agreementType} PDF generated for ${data.borrowerName}.`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/document-center")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Document Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Education Loan Documents</p>
      </div>

      {/* Offer letter verification */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h3 className="text-sm font-bold text-foreground">Offer letter verification</h3>
          <p className="text-xs text-muted-foreground">QR scan or manual ref entry</p>
        </div>

        <div className="flex flex-col items-center gap-2 mb-5">
          <p className="text-xs font-semibold text-foreground">Scan offer letter QR code or enter reference number</p>
          <div className="flex items-center gap-2 w-full max-w-md">
            <Input
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. AIM/OFFER/2081-082/0041"
              className="h-9 text-sm text-center"
            />
            <Button size="sm" className="h-9 shrink-0" onClick={handleVerify}>
              Verify
            </Button>
          </div>
        </div>

        {verified && (
          <div className="rounded-lg bg-[var(--success)]/10 border-l-4 border-[var(--success)] px-4 py-3">
            <p className="text-xs font-semibold text-[oklch(0.42_0.18_145)] dark:text-success mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verification result — {data.offerLetterVerification.refNo}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1 text-xs text-[oklch(0.42_0.18_145)] dark:text-success">
              <p>
                College: <span className="font-semibold">{data.offerLetterVerification.college}</span>
              </p>
              <p>
                Student: <span className="font-semibold">{data.offerLetterVerification.studentName}</span>
              </p>
              <p>
                Program: <span className="font-semibold">{data.offerLetterVerification.program}</span>
              </p>
              <p>
                Duration: <span className="font-semibold">{data.offerLetterVerification.duration}</span>
              </p>
              <p>
                Total fee: <span className="font-semibold">{data.offerLetterVerification.totalFeeLabel}</span>
              </p>
              <p>
                Valid until: <span className="font-semibold">{data.offerLetterVerification.validUntil}</span>
              </p>
              <p>
                NRB Partner: <span className="font-semibold">{data.offerLetterVerification.nrbPartner}</span>
              </p>
              <p>
                Status: <span className="font-semibold">{data.offerLetterVerification.status} ✓</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Document vault */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Document vault</h3>
          <p className="text-xs font-mono text-muted-foreground">{data.loanRef}</p>
        </div>
        <ul className="divide-y divide-border">
          {data.vaultDocuments.map((doc) => (
            <li key={doc.id} className="flex items-center gap-4 py-4 first:pt-0">
              <div className={cn("w-9 h-9 rounded-lg shrink-0", TONE_SWATCH_CLASS[doc.tone])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  View
                </button>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Download
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Agreement generator */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h3 className="text-sm font-bold text-foreground">Agreement generator</h3>
          <p className="text-xs text-muted-foreground">Auto-populate from loan record</p>
        </div>

        <p className="text-xs font-semibold text-foreground mb-2">Select loan and agreement type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Loan reference</p>
            <Select value={loanReference} onValueChange={setLoanReference}>
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.loanReferenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Agreement type</p>
            <Select value={agreementType} onValueChange={setAgreementType}>
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.agreementTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs font-semibold text-foreground mb-2">Auto-populated fields preview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1.5 text-xs text-muted-foreground mb-5">
          <p>
            Borrower: <span className="font-semibold text-foreground">{data.autoPopulated.borrower}</span>
          </p>
          <p>
            Loan amount: <span className="font-semibold text-foreground">{data.autoPopulated.loanAmount}</span>
          </p>
          <p>
            Interest rate: <span className="font-semibold text-foreground">{data.autoPopulated.interestRate}</span>
          </p>
          <p>
            Tenure: <span className="font-semibold text-foreground">{data.autoPopulated.tenure}</span>
          </p>
          <p>
            College: <span className="font-semibold text-foreground">{data.autoPopulated.college}</span>
          </p>
          <p>
            Guarantor: <span className="font-semibold text-foreground">{data.autoPopulated.guarantor}</span>
          </p>
          <p>
            Disbursement: <span className="font-semibold text-foreground">{data.autoPopulated.disbursement}</span>
          </p>
          <p>
            Platform: <span className="font-semibold text-foreground">{data.autoPopulated.platform}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button className="flex-1 w-full h-11 bg-[oklch(0.3_0.08_260)] hover:bg-[oklch(0.25_0.08_260)] text-white" onClick={handleGeneratePdf}>
            Generate PDF
          </Button>
          <button type="button" className="text-xs font-medium text-primary hover:underline shrink-0">
            Send to sign
          </button>
          <button type="button" className="text-xs font-medium text-primary hover:underline shrink-0">
            Preview
          </button>
        </div>
      </div>

      {/* All generated agreements */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">All generated agreements</h3>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Doc type</TableHead>
              <TableHead className="text-xs">For</TableHead>
              <TableHead className="text-xs">Generated</TableHead>
              <TableHead className="text-xs">Signed</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.generatedAgreements.map((agreement) => (
              <TableRow key={agreement.id} className="border-border">
                <TableCell className="text-xs text-foreground">{agreement.docType}</TableCell>
                <TableCell className="text-sm text-foreground">{agreement.forName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{agreement.generatedLabel}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{agreement.signedLabel}</TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_BADGE_CLASS[agreement.status], "border-0 text-[10px] font-semibold")}>{agreement.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    {agreement.actionLabel}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
