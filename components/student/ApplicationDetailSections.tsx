import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNPR, formatDate, humanizeEnum, toNumber } from "@/lib/formatters";
import type { DocumentType, LoanApplication } from "@/types/api";
import { User, Users, GraduationCap, Wallet, FileText, ExternalLink } from "lucide-react";

// ─── Shared read-only building blocks (mirrors components/admin/ApplicationDetail.tsx's
// SectionCard/InfoRow/DocCard pattern) ─────────────────────────────────────────

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-3.5 border-b border-border">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-1">{children}</CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/50 last:border-0 gap-6">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{String(value)}</span>
    </div>
  );
}

const DOC_LABELS: Record<DocumentType, string> = {
  APPLICANT_PHOTO: "Applicant Photo",
  IDENTITY_FRONT: "Identity — Front",
  IDENTITY_BACK: "Identity — Back",
  IDENTITY_DOCUMENT: "Identity Document",
  ACADEMIC_RECORD: "Academic Records",
  FEE_STRUCTURE: "Fee Structure",
  STUDENT_APPLICATION: "Student Application",
  OFFER_LETTER: "Offer Letter",
  ENROLLMENT_DOCUMENT: "Enrollment Document",
};

const STUDY_TYPE_LABELS: Record<string, string> = {
  PROGRAM: "Degree Program",
  COURSE: "Short Course",
  DIPLOMA: "Diploma",
  CERTIFICATION: "Certification",
};

const FEE_METHOD_LABELS: Record<string, string> = {
  DOCUMENT: "Uploaded Document",
  LINK: "Website Link",
  MANUAL: "Manually Entered",
};

// ─── Sections ──────────────────────────────────────────────────────────────────
// Deliberately whitelists only student-safe fields (see plan's field map) —
// never spreads the raw application object, since GET /applications/:id also
// carries internal underwriting/credit fields that must not reach the student UI.
// Shared by the plain Application Detail page and the Application Tracker's
// detail tab — one whitelist, so a field added/removed here updates both.

export function StudentInfoSection({ app }: { app: LoanApplication }) {
  const address = [app.municipality, app.district, app.province].filter(Boolean).join(", ");
  return (
    <SectionCard icon={User} title="Student Information">
      <InfoRow label="Full Name" value={app.fullName} />
      <InfoRow label="Email" value={app.email} />
      <InfoRow label="Phone" value={app.phoneNumber} />
      <InfoRow label="Date of Birth" value={formatDate(app.dobAd ?? app.dob)} />
      {app.age !== undefined && <InfoRow label="Age" value={`${app.age} years`} />}
      <InfoRow label="Gender" value={humanizeEnum(app.gender)} />
      <InfoRow label="Occupation" value={humanizeEnum(app.occupation)} />
      <InfoRow label="Identity Type" value={humanizeEnum(app.identityType)} />
      <InfoRow label="Identity Number" value={app.identityNumber} />
      <InfoRow label="Issued District" value={app.issuedDistrict} />
      <InfoRow label="Issued Date" value={formatDate(app.issuedDate)} />
      <InfoRow label="Address" value={address || undefined} />
      <InfoRow label="Ward No." value={app.ward} />
    </SectionCard>
  );
}

export function FamilyInfoSection({ app }: { app: LoanApplication }) {
  return (
    <SectionCard icon={Users} title="Family Information">
      <InfoRow label="Father's Name" value={app.fatherName} />
      <InfoRow label="Mother's Name" value={app.motherName} />
      <InfoRow label="Grandfather's Name" value={app.grandfatherName} />
      <InfoRow label="Marital Status" value={humanizeEnum(app.maritalStatus)} />
      <InfoRow label="Spouse Name" value={app.spouseName} />
    </SectionCard>
  );
}

export function CourseInfoSection({ app }: { app: LoanApplication }) {
  const study = app.studyInformation;
  const studyType = study?.studyType ?? app.studyType;
  return (
    <SectionCard icon={GraduationCap} title="Course & Institution">
      <InfoRow label="Study Type" value={studyType ? (STUDY_TYPE_LABELS[studyType] ?? studyType) : undefined} />
      <InfoRow label="Course Name" value={study?.courseName ?? app.courseName} />
      <InfoRow label="Board / University" value={study?.boardUniversity ?? app.boardUniversity} />
      <InfoRow label="Course Duration" value={study?.courseDuration ?? app.courseDuration} />
    </SectionCard>
  );
}

export function LoanInfoSection({ app }: { app: LoanApplication }) {
  const loan = app.loanInformation;
  const loanAmount = loan?.loanAmount ?? app.loanAmount;
  const expectedSalary = loan?.expectedSalary ?? app.expectedSalary;
  return (
    <SectionCard icon={Wallet} title="Loan Information">
      <InfoRow label="Requested Loan Amount" value={loanAmount ? formatNPR(toNumber(loanAmount)) : undefined} />
      <InfoRow label="Expected Salary" value={expectedSalary ? formatNPR(toNumber(expectedSalary)) : undefined} />
      <InfoRow label="Fee Structure" value={app.feeStructureMethod ? FEE_METHOD_LABELS[app.feeStructureMethod] : undefined} />
      {app.feeWebsiteLink && (
        <div className="flex items-baseline justify-between py-2 border-b border-border/50 last:border-0 gap-6">
          <span className="text-xs text-muted-foreground shrink-0">Fee Website</span>
          <a href={app.feeWebsiteLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline text-right truncate flex items-center gap-1">
            {app.feeWebsiteLink} <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      )}
      <InfoRow label="Fee Amount" value={app.feeManualAmount ? formatNPR(toNumber(app.feeManualAmount)) : undefined} />
    </SectionCard>
  );
}

export function DocumentsSection({ app }: { app: LoanApplication }) {
  const documents = app.documents ?? [];
  return (
    <SectionCard icon={FileText} title="Uploaded Documents">
      {documents.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3">No documents uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-xs font-medium text-foreground truncate">{DOC_LABELS[doc.documentType] ?? doc.documentType}</span>
              {doc.publicUrl ? (
                <a href={doc.publicUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0">
                  View <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] text-muted-foreground shrink-0">Not uploaded</span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
