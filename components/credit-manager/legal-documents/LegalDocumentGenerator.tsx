"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, FileText, Loader2, Sparkles, ShieldAlert, ShieldCheck, Download, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatNPR, displayName } from "@/lib/formatters";
import { useAppSelector } from "@/lib/hooks";
import {
  useGetApplicationFullDetailQuery,
  useGetEmiScheduleQuery,
  useGetGeneratedAgreementsQuery,
  useCreateGeneratedAgreementMutation,
  useSendAgreementToSignMutation,
  useMarkAgreementSignedMutation,
} from "@/lib/api/dashboardApi";
import type { GeneratedAgreementRecord, GeneratedAgreementStatus } from "@/types/dashboard";
import {
  buildLegalDocumentHtml,
  downloadGeneratedAgreement,
  LEGAL_DOCUMENT_TYPE_LABEL,
  type LegalDocumentType,
} from "@/lib/documentTemplates/legalDocumentTemplate";

const AGREEMENT_TYPES: LegalDocumentType[] = [
  "LOAN_AGREEMENT",
  "GUARANTEE_DEED",
  "HYPOTHECATION",
  "PROMISSORY_NOTE",
];

const STATUS_BADGE_CLASS: Record<GeneratedAgreementStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGNATURE: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  SIGNED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

function monthsFromPeriod(period?: number | null, unit?: "YEAR" | "MONTH" | null): number | null {
  if (period == null) return null;
  return unit === "YEAR" ? period * 12 : period;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate mt-0.5">{value}</p>
    </div>
  );
}

interface BlankFields {
  studentAddress: string;
  studentCitizenshipNo: string;
  studentCitizenshipOffice: string;
  studentCitizenshipIssueDate: string;
  studentFatherOrHusbandName: string;
  studentGrandfatherName: string;
  studentPermanentDistrict: string;
  studentPermanentMunicipality: string;
  studentPermanentWardNo: string;
  branchManagerName: string;
  guarantorName: string;
  guarantorRelationship: string;
  guarantorCitizenshipNo: string;
  guarantorCitizenshipIssueDate: string;
  guarantorCitizenshipOffice: string;
  guarantorAddress: string;
  guarantorFatherOrHusbandName: string;
  guarantorGrandfatherName: string;
  guarantorPermanentDistrict: string;
  guarantorPermanentMunicipality: string;
  guarantorPermanentWardNo: string;
  guarantorAge: string;
  collateralOwnerName: string;
  collateralAddress: string;
  collateralPlotNo: string;
  collateralArea: string;
  collateralRemarks: string;
  approvalLetterDate: string;
  loanExpiryDate: string;
  borrowerPosition: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

const EMPTY_BLANKS: BlankFields = {
  studentAddress: "",
  studentCitizenshipNo: "",
  studentCitizenshipOffice: "",
  studentCitizenshipIssueDate: "",
  studentFatherOrHusbandName: "",
  studentGrandfatherName: "",
  studentPermanentDistrict: "",
  studentPermanentMunicipality: "",
  studentPermanentWardNo: "",
  branchManagerName: "",
  guarantorName: "",
  guarantorRelationship: "",
  guarantorCitizenshipNo: "",
  guarantorCitizenshipIssueDate: "",
  guarantorCitizenshipOffice: "",
  guarantorAddress: "",
  guarantorFatherOrHusbandName: "",
  guarantorGrandfatherName: "",
  guarantorPermanentDistrict: "",
  guarantorPermanentMunicipality: "",
  guarantorPermanentWardNo: "",
  guarantorAge: "",
  collateralOwnerName: "",
  collateralAddress: "",
  collateralPlotNo: "",
  collateralArea: "",
  collateralRemarks: "",
  approvalLetterDate: "",
  loanExpiryDate: "",
  borrowerPosition: "",
  bankAccountName: "",
  bankAccountNumber: "",
};

function BlankInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "...................."}
        className="h-8 text-sm"
      />
    </div>
  );
}

export function LegalDocumentGenerator({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [agreementType, setAgreementType] = useState<LegalDocumentType>("LOAN_AGREEMENT");
  const [remarks, setRemarks] = useState("");
  // Editable per document — the platform generates these on behalf of
  // different partner banks/NBFCs, not just Unnati, so it isn't hardcoded.
  const [institutionName, setInstitutionName] = useState("Unnati");
  // Blanks on the paper Loan Agreement ("....................") with no
  // source in the application data — the Credit Manager types these in by
  // hand before generating.
  const [blanks, setBlanks] = useState<BlankFields>(EMPTY_BLANKS);
  const setBlank = (key: keyof BlankFields) => (value: string) =>
    setBlanks((b) => ({ ...b, [key]: value }));

  const { data: fullDetail, isLoading: detailLoading } = useGetApplicationFullDetailQuery(
    { applicationId: id, page: 1, limit: 20 },
    { skip: !id },
  );
  const { data: schedule } = useGetEmiScheduleQuery(
    { applicationId: id, page: 1, limit: 200 },
    { skip: !id },
  );
  const { data: documents, isLoading: documentsLoading } = useGetGeneratedAgreementsQuery(
    { applicationId: id, page: 1, limit: 50 },
    { skip: !id },
  );
  const [createAgreement, { isLoading: generating }] = useCreateGeneratedAgreementMutation();
  const [sendToSign] = useSendAgreementToSignMutation();
  const [markSigned] = useMarkAgreementSignedMutation();

  const handleSendToSign = async (documentId: string) => {
    try {
      await sendToSign(documentId).unwrap();
      toast.success("Sent to sign — student notified to visit the branch.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleMarkSigned = async (documentId: string) => {
    try {
      await markSigned(documentId).unwrap();
      toast.success("Marked as signed.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDownload = (doc: GeneratedAgreementRecord) => {
    const opened = downloadGeneratedAgreement(doc);
    if (!opened) {
      toast.error("Couldn't open the document", {
        description: "This document has no saved content to render, or your browser blocked the popup.",
      });
    }
  };

  const application = fullDetail?.application;
  const loanAccount = fullDetail?.loanAccount;
  const disbursement = fullDetail?.disbursement;

  // Mirrors the Credit-Manager-override-first precedence the backend applies
  // via resolveEffectiveLoanTerms() — approximate, display-only. The
  // authoritative values are always (re)computed server-side at generation
  // time and stored in the document's templateSnapshot.
  const effective = useMemo(() => {
    const principal =
      loanAccount?.finalPrincipalAmount ??
      disbursement?.totalDisbursedAmount ??
      application?.creditLimit ??
      null;
    const interestRate = loanAccount?.finalInterestRate ?? application?.interestRate ?? null;
    const tenureMonths =
      loanAccount?.finalTenureMonths ??
      monthsFromPeriod(application?.period, application?.periodUnit) ??
      null;
    const gracePeriodMonths = loanAccount?.gracePeriodMonths ?? 0;
    const repaymentFrequency = loanAccount?.repaymentFrequency ?? "MONTHLY";
    return { principal, interestRate, tenureMonths, gracePeriodMonths, repaymentFrequency };
  }, [loanAccount, disbursement, application]);

  const emiAmount = schedule?.data[0]?.emiAmount ?? null;
  const totalRepayment = schedule?.data.length
    ? schedule.data.reduce((sum, e) => sum + e.emiAmount, 0)
    : null;

  const generatorName = displayName(currentUser, "Credit Manager");

  const previewData = useMemo(
    () => ({
      documentNumber: null,
      agreementType,
      status: "DRAFT" as const,
      studentName: application?.fullName ?? "—",
      applicationNumber: application?.applicationNumber ?? "—",
      collegeName: application?.collegeName ?? null,
      loanProduct: application?.facility ?? "Education Loan",
      finalDisbursementAmount: effective.principal,
      interestRate: effective.interestRate,
      tenureMonths: effective.tenureMonths,
      gracePeriodMonths: effective.gracePeriodMonths,
      repaymentFrequency: effective.repaymentFrequency,
      emiAmount,
      totalRepayment,
      remarks,
      generatedByName: generatorName,
      generatedAt: new Date().toISOString(),
      institutionName,
      studentAddress: blanks.studentAddress.trim() || null,
      studentCitizenshipNo: blanks.studentCitizenshipNo.trim() || null,
      studentCitizenshipOffice: blanks.studentCitizenshipOffice.trim() || null,
      studentCitizenshipIssueDate: blanks.studentCitizenshipIssueDate.trim() || null,
      studentFatherOrHusbandName: blanks.studentFatherOrHusbandName.trim() || null,
      studentGrandfatherName: blanks.studentGrandfatherName.trim() || null,
      studentPermanentDistrict: blanks.studentPermanentDistrict.trim() || null,
      studentPermanentMunicipality: blanks.studentPermanentMunicipality.trim() || null,
      studentPermanentWardNo: blanks.studentPermanentWardNo.trim() || null,
      branchManagerName: blanks.branchManagerName.trim() || null,
      collateralOwnerName: blanks.collateralOwnerName.trim() || null,
      collateralAddress: blanks.collateralAddress.trim() || null,
      collateralPlotNo: blanks.collateralPlotNo.trim() || null,
      collateralArea: blanks.collateralArea.trim() || null,
      collateralRemarks: blanks.collateralRemarks.trim() || null,
      approvalLetterDate: blanks.approvalLetterDate.trim() || null,
      loanExpiryDate: blanks.loanExpiryDate.trim() || null,
      borrowerPosition: blanks.borrowerPosition.trim() || null,
      bankAccountName: blanks.bankAccountName.trim() || null,
      bankAccountNumber: blanks.bankAccountNumber.trim() || null,
      guarantor:
        blanks.guarantorName.trim() ||
        blanks.guarantorRelationship.trim() ||
        blanks.guarantorCitizenshipNo.trim() ||
        blanks.guarantorCitizenshipIssueDate.trim() ||
        blanks.guarantorCitizenshipOffice.trim() ||
        blanks.guarantorAddress.trim() ||
        blanks.guarantorFatherOrHusbandName.trim() ||
        blanks.guarantorGrandfatherName.trim() ||
        blanks.guarantorPermanentDistrict.trim() ||
        blanks.guarantorPermanentMunicipality.trim() ||
        blanks.guarantorPermanentWardNo.trim() ||
        blanks.guarantorAge.trim()
          ? {
              name: blanks.guarantorName.trim() || null,
              relationship: blanks.guarantorRelationship.trim() || null,
              netWorth: null,
              citizenshipNo: blanks.guarantorCitizenshipNo.trim() || null,
              citizenshipIssueDate: blanks.guarantorCitizenshipIssueDate.trim() || null,
              citizenshipOffice: blanks.guarantorCitizenshipOffice.trim() || null,
              address: blanks.guarantorAddress.trim() || null,
              fatherOrHusbandName: blanks.guarantorFatherOrHusbandName.trim() || null,
              grandfatherName: blanks.guarantorGrandfatherName.trim() || null,
              permanentDistrict: blanks.guarantorPermanentDistrict.trim() || null,
              permanentMunicipality: blanks.guarantorPermanentMunicipality.trim() || null,
              permanentWardNo: blanks.guarantorPermanentWardNo.trim() || null,
              age: blanks.guarantorAge.trim() || null,
            }
          : null,
    }),
    [application, effective, emiAmount, totalRepayment, remarks, agreementType, generatorName, institutionName, blanks],
  );

  // "Live Preview" opens the panel immediately on click. Once open, it
  // keeps itself in sync with every field you type — but debounced (not on
  // every single keystroke), so rebuilding the HTML string and reloading
  // the <iframe srcDoc> doesn't make typing feel like the page is
  // re-rendering constantly.
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const handlePreview = () => {
    setPreviewHtml(buildLegalDocumentHtml(previewData));
    setShowPreview(true);
  };

  useEffect(() => {
    if (!showPreview) return;
    const timer = setTimeout(() => {
      setPreviewHtml(buildLegalDocumentHtml(previewData));
    }, 350);
    return () => clearTimeout(timer);
  }, [showPreview, previewData]);

  const handleDownloadPreview = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Couldn't open the preview", { description: "Your browser blocked the popup." });
      return;
    }
    win.document.write(buildLegalDocumentHtml(previewData, { autoPrint: true }));
    win.document.close();
  };

  const readyToGenerate = Boolean(
    application && effective.principal && effective.interestRate != null && effective.tenureMonths != null,
  );

  // Which "Fill in the blanks" fields apply depends on the document type —
  // each of the 4 legal documents is a different paper form with a
  // different set of blanks to fill:
  //  - कर्जा प्रस्ताव पत्र (LOAN_AGREEMENT): borrower address/citizenship,
  //    branch manager, and a guarantor block (name/relationship/citizenship/
  //    address only — no parentage/permanent-address/age).
  //  - व्यक्तिगत जमानत (GUARANTEE_DEED): both borrower and guarantor in the
  //    traditional citizenship format — address/citizenship *plus*
  //    father-or-husband name, grandfather name, permanent district/
  //    municipality/ward, and (guarantor only) age. No branch manager.
  //  - कर्जा तमसुक (PROMISSORY_NOTE): borrower in the same traditional format
  //    (plus a citizenship issue date) and a collateral/mortgage security
  //    block — no guarantor, no branch manager.
  //  - कर्जा रकम निकासा अनुरोध पत्र (HYPOTHECATION): none of the above —
  //    instead its own small set of fields (approval letter date, loan
  //    expiry date, borrower's position, disbursement bank account).
  const showBorrowerBlanks =
    agreementType === "LOAN_AGREEMENT" || agreementType === "GUARANTEE_DEED" || agreementType === "PROMISSORY_NOTE";
  const showBorrowerParentageBlanks = agreementType === "GUARANTEE_DEED" || agreementType === "PROMISSORY_NOTE";
  const showBorrowerCitizenshipIssueDate = agreementType === "PROMISSORY_NOTE";
  const showBranchManagerBlank = agreementType === "LOAN_AGREEMENT";
  const showGuarantorBlanks = agreementType === "LOAN_AGREEMENT" || agreementType === "GUARANTEE_DEED";
  const showGuarantorParentageBlanks = agreementType === "GUARANTEE_DEED";
  const showCollateralBlanks = agreementType === "PROMISSORY_NOTE";
  const showHypothecationBlanks = agreementType === "HYPOTHECATION";
  const showBlanksSection = showBorrowerBlanks || showHypothecationBlanks;

  const handleGenerate = async () => {
    try {
      await createAgreement({
        applicationId: id,
        agreementType,
        remarks: remarks.trim() || undefined,
        institutionName: institutionName.trim() || undefined,
        studentAddress: blanks.studentAddress.trim() || undefined,
        studentCitizenshipNo: blanks.studentCitizenshipNo.trim() || undefined,
        studentCitizenshipOffice: blanks.studentCitizenshipOffice.trim() || undefined,
        studentCitizenshipIssueDate: blanks.studentCitizenshipIssueDate.trim() || undefined,
        studentFatherOrHusbandName: blanks.studentFatherOrHusbandName.trim() || undefined,
        studentGrandfatherName: blanks.studentGrandfatherName.trim() || undefined,
        studentPermanentDistrict: blanks.studentPermanentDistrict.trim() || undefined,
        studentPermanentMunicipality: blanks.studentPermanentMunicipality.trim() || undefined,
        studentPermanentWardNo: blanks.studentPermanentWardNo.trim() || undefined,
        branchManagerName: blanks.branchManagerName.trim() || undefined,
        guarantorName: blanks.guarantorName.trim() || undefined,
        guarantorRelationship: blanks.guarantorRelationship.trim() || undefined,
        guarantorCitizenshipNo: blanks.guarantorCitizenshipNo.trim() || undefined,
        guarantorCitizenshipIssueDate: blanks.guarantorCitizenshipIssueDate.trim() || undefined,
        guarantorCitizenshipOffice: blanks.guarantorCitizenshipOffice.trim() || undefined,
        guarantorAddress: blanks.guarantorAddress.trim() || undefined,
        guarantorFatherOrHusbandName: blanks.guarantorFatherOrHusbandName.trim() || undefined,
        guarantorGrandfatherName: blanks.guarantorGrandfatherName.trim() || undefined,
        guarantorPermanentDistrict: blanks.guarantorPermanentDistrict.trim() || undefined,
        guarantorPermanentMunicipality: blanks.guarantorPermanentMunicipality.trim() || undefined,
        guarantorPermanentWardNo: blanks.guarantorPermanentWardNo.trim() || undefined,
        guarantorAge: blanks.guarantorAge.trim() || undefined,
        collateralOwnerName: blanks.collateralOwnerName.trim() || undefined,
        collateralAddress: blanks.collateralAddress.trim() || undefined,
        collateralPlotNo: blanks.collateralPlotNo.trim() || undefined,
        collateralArea: blanks.collateralArea.trim() || undefined,
        collateralRemarks: blanks.collateralRemarks.trim() || undefined,
        approvalLetterDate: blanks.approvalLetterDate.trim() || undefined,
        loanExpiryDate: blanks.loanExpiryDate.trim() || undefined,
        borrowerPosition: blanks.borrowerPosition.trim() || undefined,
        bankAccountName: blanks.bankAccountName.trim() || undefined,
        bankAccountNumber: blanks.bankAccountNumber.trim() || undefined,
      }).unwrap();
      toast.success("Legal document generated and participants notified.");
      setRemarks("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (detailLoading) {
    return <div className="p-6 lg:p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Application not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/legal-documents`)}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2" onClick={() => router.push(`${basePath}/legal-documents`)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 text-right">
          <h2 className="text-sm font-bold text-foreground font-mono">{application.applicationNumber}</h2>
          <span className="text-sm text-muted-foreground">— {application.fullName ?? "—"}</span>
        </div>
      </div>

      {!readyToGenerate && (
        <div className="rounded-lg bg-[var(--warning)]/10 border-l-4 border-[var(--warning)] px-4 py-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] shrink-0" />
          <p className="text-xs font-semibold text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]">
            Interest rate, tenure, or disbursement amount is not finalized yet — configure the loan first for accurate figures.
          </p>
        </div>
      )}

      <div className={cn("grid grid-cols-1 gap-6", showPreview && "xl:grid-cols-2")}>
        {/* Generator form */}
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Legal Document Generator</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fields below are auto-populated from the application — only the template, institution, blanks, and remarks are yours to set.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handlePreview}>
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </Button>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2.5">Document Type</p>
              <Select value={agreementType} onValueChange={(v) => setAgreementType(v as LegalDocumentType)}>
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGREEMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{LEGAL_DOCUMENT_TYPE_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Financial Institution Name
              </p>
              <Input
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. Unnati, XYZ Finance Company Ltd."
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                The document is issued in this institution&apos;s name — change it when generating on behalf of a different partner bank/NBFC.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 rounded-lg bg-muted/30 border border-border">
              <ReadOnlyField label="Student Name" value={application.fullName ?? "—"} />
              <ReadOnlyField label="Application No." value={application.applicationNumber} />
              <ReadOnlyField label="College" value={application.collegeName ?? "—"} />
              <ReadOnlyField label="Loan Product" value={application.facility ?? "Education Loan"} />
              <ReadOnlyField label="Final Disbursement Amount" value={effective.principal !== null ? formatNPR(effective.principal) : "—"} />
              <ReadOnlyField label="Interest Rate" value={effective.interestRate !== null ? `${effective.interestRate}% p.a.` : "—"} />
              <ReadOnlyField label="Loan Tenure" value={effective.tenureMonths !== null ? `${effective.tenureMonths} month(s)` : "—"} />
              <ReadOnlyField label="Grace Period" value={`${effective.gracePeriodMonths} month(s)`} />
              <ReadOnlyField label="EMI Amount" value={emiAmount !== null ? formatNPR(emiAmount) : "—"} />
              <ReadOnlyField label="Total Repayment" value={totalRepayment !== null ? formatNPR(totalRepayment) : "—"} />
            </div>

            {showBlanksSection && (
              <div className="space-y-4 p-4 rounded-lg border border-dashed border-border">
                <div>
                  <p className="text-xs font-semibold text-foreground">Fill in the blanks</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    These aren&apos;t captured on the application yet — they show as dotted blanks in the document until you type them in here.
                  </p>
                </div>

                {showBorrowerBlanks && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Borrower</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                      <div className="col-span-2">
                        <BlankInput label="Address" value={blanks.studentAddress} onChange={setBlank("studentAddress")} />
                      </div>
                      <BlankInput label="Citizenship No." value={blanks.studentCitizenshipNo} onChange={setBlank("studentCitizenshipNo")} />
                      <BlankInput label="Citizenship Issuing Office" value={blanks.studentCitizenshipOffice} onChange={setBlank("studentCitizenshipOffice")} />
                      {showBorrowerCitizenshipIssueDate && (
                        <BlankInput label="Citizenship Issue Date" value={blanks.studentCitizenshipIssueDate} onChange={setBlank("studentCitizenshipIssueDate")} />
                      )}
                      {showBorrowerParentageBlanks && (
                        <>
                          <BlankInput label="Father's / Husband's Name" value={blanks.studentFatherOrHusbandName} onChange={setBlank("studentFatherOrHusbandName")} />
                          <BlankInput label="Grandfather's Name" value={blanks.studentGrandfatherName} onChange={setBlank("studentGrandfatherName")} />
                          <BlankInput label="Permanent Address — District" value={blanks.studentPermanentDistrict} onChange={setBlank("studentPermanentDistrict")} />
                          <BlankInput label="Permanent Address — Municipality" value={blanks.studentPermanentMunicipality} onChange={setBlank("studentPermanentMunicipality")} />
                          <BlankInput label="Permanent Address — Ward No." value={blanks.studentPermanentWardNo} onChange={setBlank("studentPermanentWardNo")} />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {showBranchManagerBlank && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Branch</p>
                    <BlankInput label="Branch Manager Name" value={blanks.branchManagerName} onChange={setBlank("branchManagerName")} />
                  </div>
                )}

                {showGuarantorBlanks && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Guarantor</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                      <BlankInput label="Name" value={blanks.guarantorName} onChange={setBlank("guarantorName")} />
                      <BlankInput label="Relationship to Borrower" value={blanks.guarantorRelationship} onChange={setBlank("guarantorRelationship")} />
                      <BlankInput label="Citizenship No." value={blanks.guarantorCitizenshipNo} onChange={setBlank("guarantorCitizenshipNo")} />
                      <BlankInput label="Citizenship Issue Date" value={blanks.guarantorCitizenshipIssueDate} onChange={setBlank("guarantorCitizenshipIssueDate")} />
                      <BlankInput label="Citizenship Issuing Office" value={blanks.guarantorCitizenshipOffice} onChange={setBlank("guarantorCitizenshipOffice")} />
                      <BlankInput label="Address" value={blanks.guarantorAddress} onChange={setBlank("guarantorAddress")} />
                      {showGuarantorParentageBlanks && (
                        <>
                          <BlankInput label="Age" value={blanks.guarantorAge} onChange={setBlank("guarantorAge")} />
                          <BlankInput label="Father's / Husband's Name" value={blanks.guarantorFatherOrHusbandName} onChange={setBlank("guarantorFatherOrHusbandName")} />
                          <BlankInput label="Grandfather's Name" value={blanks.guarantorGrandfatherName} onChange={setBlank("guarantorGrandfatherName")} />
                          <BlankInput label="Permanent Address — District" value={blanks.guarantorPermanentDistrict} onChange={setBlank("guarantorPermanentDistrict")} />
                          <BlankInput label="Permanent Address — Municipality" value={blanks.guarantorPermanentMunicipality} onChange={setBlank("guarantorPermanentMunicipality")} />
                          <BlankInput label="Permanent Address — Ward No." value={blanks.guarantorPermanentWardNo} onChange={setBlank("guarantorPermanentWardNo")} />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {showCollateralBlanks && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Collateral / Mortgage Security</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                      <BlankInput label="Owner Name" value={blanks.collateralOwnerName} onChange={setBlank("collateralOwnerName")} />
                      <BlankInput label="Address" value={blanks.collateralAddress} onChange={setBlank("collateralAddress")} />
                      <BlankInput label="Plot (Kitta) No." value={blanks.collateralPlotNo} onChange={setBlank("collateralPlotNo")} />
                      <BlankInput label="Area" value={blanks.collateralArea} onChange={setBlank("collateralArea")} />
                      <div className="col-span-2">
                        <BlankInput label="Remarks" value={blanks.collateralRemarks} onChange={setBlank("collateralRemarks")} />
                      </div>
                    </div>
                  </div>
                )}

                {showHypothecationBlanks && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Disbursement Request Details</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                      <BlankInput label="Approval Letter Date" value={blanks.approvalLetterDate} onChange={setBlank("approvalLetterDate")} />
                      <BlankInput label="Loan Expiry Date" value={blanks.loanExpiryDate} onChange={setBlank("loanExpiryDate")} />
                      <BlankInput label="Borrower's Position" value={blanks.borrowerPosition} onChange={setBlank("borrowerPosition")} />
                      <div />
                      <BlankInput label="Bank Account Name" value={blanks.bankAccountName} onChange={setBlank("bankAccountName")} />
                      <BlankInput label="Bank Account No." value={blanks.bankAccountNumber} onChange={setBlank("bankAccountNumber")} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Additional Clauses / Remarks (optional)
              </p>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any additional conditions, clauses, or remarks to include in the document…"
                className="text-sm min-h-24"
              />
            </div>

            <Button className="w-full gap-1.5" disabled={generating || !readyToGenerate} onClick={handleGenerate}>
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate {LEGAL_DOCUMENT_TYPE_LABEL[agreementType]}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Generating a new document notifies the student, initiator, supporter, checker, and approver.
            </p>
          </CardContent>
        </Card>

        {/* Live preview — collapsed until "Live Preview" is clicked, then
            slides in. Only rebuilds when explicitly (re)triggered, not on
            every keystroke. */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card className="border-border shadow-none flex flex-col h-full">
                <CardHeader className="px-5 py-4 border-b border-border flex-row items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">Live Preview</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Snapshot from when you last clicked &quot;Live Preview&quot;.</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadPreview}>
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setShowPreview(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-[520px]">
                  <iframe title="Legal document preview" srcDoc={previewHtml ?? ""} className="w-full h-full min-h-[520px] border-0 rounded-b-lg bg-white" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generated documents for this application */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Generated legal documents</h3>
        {documentsLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !documents?.data.length ? (
          <p className="text-sm text-muted-foreground">No legal documents generated for this application yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs">Document No.</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Generated</TableHead>
                  <TableHead className="text-xs">Signed</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.data.map((doc) => (
                  <TableRow key={doc.id} className="border-border">
                    <TableCell className="text-xs font-mono text-foreground">{doc.documentNumber ?? "—"}</TableCell>
                    <TableCell className="text-xs text-foreground">{LEGAL_DOCUMENT_TYPE_LABEL[doc.agreementType]}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.signedAt ? formatDate(doc.signedAt) : "—"}</TableCell>
                    <TableCell>
                      <Badge className={cn(STATUS_BADGE_CLASS[doc.status], "border-0 text-[10px] font-semibold")}>
                        {doc.status === "SIGNED" || doc.status === "ACTIVE" ? (
                          <ShieldCheck className="w-3 h-3 mr-1 inline" />
                        ) : null}
                        {doc.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {doc.status === "DRAFT" && (
                          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => handleSendToSign(doc.id)}>
                            Send to sign
                          </button>
                        )}
                        {doc.status === "PENDING_SIGNATURE" && (
                          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => handleMarkSigned(doc.id)}>
                            Mark signed
                          </button>
                        )}
                        <button type="button" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline" onClick={() => handleDownload(doc)}>
                          Download
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
