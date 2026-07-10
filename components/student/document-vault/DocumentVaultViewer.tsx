"use client";
import { useMemo, useRef } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { useGetVaultDocumentQuery } from "@/lib/api/documentVaultApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { buildOfferLetterHtml } from "@/lib/documentTemplates/offerLetterTemplate";
import { buildAgreementHtml } from "@/lib/documentTemplates/agreementTemplate";
import { buildEnrollmentCertificateHtml } from "@/lib/documentTemplates/enrollmentCertificateTemplate";

const TYPE_LABEL: Record<string, string> = {
  "offer-letter": "Offer Letter",
  agreement: "Bonafide Agreement",
  "enrollment-certificate": "Enrollment Certificate",
};

function num(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Renders the exact same certificate layout used by the College generator's
// live preview/PDF download (lib/documentTemplates/*) — not a stripped-down
// summary — so what the student sees/prints here matches what the college
// issued.
function renderHtml(documentType: string, data: Record<string, unknown>): string | null {
  switch (documentType) {
    case "offer-letter": {
      const signatoriesRaw = Array.isArray(data.signatories) ? data.signatories : [];
      return buildOfferLetterHtml({
        collegeName: str(data.collegeName) ?? "",
        collegeAddress: str(data.collegeAddress),
        collegeRegNo: str(data.collegeRegNo),
        collegeAffiliation: str(data.collegeAffiliation),
        collegePhone: str(data.collegePhone),
        collegeEmail: str(data.collegeEmail),
        collegeWebsite: str(data.collegeWebsite),
        logoUrl: str(data.logoUrl),
        refNo: str(data.refNo) ?? "",
        issuedDateAD: str(data.issuedDateAD),
        issuedDateBS: str(data.issuedDateBS),
        validUntilAD: str(data.validUntilAD),
        validUntilBS: str(data.validUntilBS),
        studentName: str(data.studentFullName) ?? "",
        studentDobAD: str(data.studentDobAD),
        studentDobBS: str(data.studentDobBS),
        citizenshipNumber: str(data.citizenshipNumber),
        fatherName: str(data.fatherName),
        motherName: str(data.motherName),
        permanentAddress: str(data.permanentAddress),
        district: str(data.district),
        province: str(data.province),
        programName: str(data.programName),
        programFullName: str(data.programFullName),
        programAffiliation: str(data.programAffiliation),
        durationYears: num(data.durationYears),
        totalSemesters: num(data.totalSemesters),
        creditHours: num(data.creditHours),
        academicYearBS: str(data.academicYearBS),
        intakeMonthBS: str(data.intakeMonthBS),
        fees: {
          admissionFee: num(data.admissionFee),
          tuitionPerSem: num(data.tuitionPerSem),
          examFeePerSem: num(data.examFeePerSem),
          labFeePerSem: num(data.labFeePerSem),
          totalSemesters: num(data.totalSemesters),
          totalApprox: num(data.totalApprox),
        },
        conditions: Array.isArray(data.conditions) ? (data.conditions as string[]) : [],
        signatories: signatoriesRaw as { name: string; designation: string; stampAreaLabel?: string }[],
        qrToken: str(data.qrToken),
        qrVerifyUrl: str(data.qrVerifyUrl),
      });
    }
    case "agreement":
      return buildAgreementHtml({
        collegeName: str(data.collegeName) ?? "",
        collegeAddress: str(data.collegeAddress),
        collegeRegNo: str(data.collegeRegNo),
        collegeAffiliation: str(data.collegeAffiliation),
        collegePhone: str(data.collegePhone),
        collegeEmail: str(data.collegeEmail),
        collegeWebsite: str(data.collegeWebsite),
        logoUrl: str(data.logoUrl),
        refNo: str(data.refNo) ?? "",
        issuedDateAD: str(data.issuedDateAD),
        issuedDateBS: str(data.issuedDateBS),
        studentFullName: str(data.studentFullName) ?? "",
        tuRollNo: str(data.tuRollNo),
        enrollmentNo: str(data.enrollmentNo),
        programName: str(data.programName),
        currentYear: str(data.currentYear),
        currentSemester: str(data.currentSemester),
        academicYearBS: str(data.academicYearBS),
        studentStatus: str(data.studentStatus),
        isEnrolled: Boolean(data.isEnrolled),
        hasBacklogs: Boolean(data.hasBacklogs),
        disciplinaryHold: Boolean(data.disciplinaryHold),
        feeDueRs: num(data.feeDueRs),
        qrToken: str(data.qrToken),
        qrVerifyUrl: str(data.qrVerifyUrl),
      });
    case "enrollment-certificate":
      return buildEnrollmentCertificateHtml({
        collegeName: str(data.collegeName) ?? "",
        collegeCode: str(data.collegeCode),
        collegeAddress: str(data.collegeAddress),
        collegeRegNo: str(data.collegeRegNo),
        collegeAffiliation: str(data.collegeAffiliation),
        collegePhone: str(data.collegePhone),
        collegeEmail: str(data.collegeEmail),
        collegeWebsite: str(data.collegeWebsite),
        logoUrl: str(data.logoUrl),
        refNo: str(data.refNo) ?? "",
        issuedDateAD: str(data.issuedDateAD),
        issuedDateBS: str(data.issuedDateBS),
        studentFullName: str(data.studentFullName) ?? "",
        tuRollNo: str(data.tuRollNo),
        enrollmentNo: str(data.enrollmentNo),
        programName: str(data.programName),
        currentYear: str(data.currentYear),
        currentSemester: str(data.currentSemester),
        academicYearBS: str(data.academicYearBS),
        studentStatus: str(data.studentStatus),
        isEnrolled: Boolean(data.isEnrolled),
        hasBacklogs: Boolean(data.hasBacklogs),
        disciplinaryHold: Boolean(data.disciplinaryHold),
        feeDueRs: num(data.feeDueRs),
        qrToken: str(data.qrToken),
        qrVerifyUrl: str(data.qrVerifyUrl),
      });
    default:
      return null;
  }
}

export function DocumentVaultViewer({ documentType, id }: { documentType: string; id: string }) {
  const { data, isLoading, error } = useGetVaultDocumentQuery({ documentType, id });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const typeLabel = TYPE_LABEL[documentType] ?? documentType;

  const html = useMemo(
    () => (data ? renderHtml(documentType, data as unknown as Record<string, unknown>) : null),
    [data, documentType],
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[80vh] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data || !html) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h1 className="text-lg font-bold text-foreground mb-2">Document not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This document doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/document-vault">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Document Vault
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 gap-1.5 text-xs">
            <Link href="/dashboard/document-vault">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Document Vault
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground">{typeLabel}</h1>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => iframeRef.current?.contentWindow?.print()}
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-white">
        <iframe
          ref={iframeRef}
          title={`${typeLabel} preview`}
          srcDoc={html}
          className="w-full border-0"
          style={{ height: "82vh" }}
        />
      </div>
    </div>
  );
}
