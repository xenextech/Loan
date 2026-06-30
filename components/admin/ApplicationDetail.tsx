"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminApplicationDetailQuery } from "@/lib/api/adminApi";
import type { DocumentType } from "@/types/api";
import { formatNPR, formatDate, toNumber } from "@/lib/formatters";
import StatusBadge from "./StatusBadge";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  User,
  BookOpen,
  Wallet,
  ExternalLink,
  Images,
  MapPin,
  Users,
  Phone,
  GraduationCap,
  Building2,
} from "lucide-react";

// ─── Doc helpers ─────────────────────────────────────────────────────────────

const DOC_LABELS: Record<DocumentType, string> = {
  APPLICANT_PHOTO:     "Applicant Photo",
  IDENTITY_FRONT:      "Identity — Front",
  IDENTITY_BACK:       "Identity — Back",
  ACADEMIC_RECORD:     "Academic Records",
  FEE_STRUCTURE:       "Fee Structure",
  STUDENT_APPLICATION: "Student Application",
  OFFER_LETTER:        "Offer Letter",
  ENROLLMENT_DOCUMENT: "Enrollment Document",
};

const IMAGE_TYPES: Set<DocumentType> = new Set(["APPLICANT_PHOTO", "IDENTITY_FRONT", "IDENTITY_BACK"]);

const DOC_ORDER: DocumentType[] = [
  "APPLICANT_PHOTO", "IDENTITY_FRONT", "IDENTITY_BACK", "ACADEMIC_RECORD", "FEE_STRUCTURE",
];

function DocCard({ docType, url }: { docType: DocumentType; url?: string }) {
  const label   = DOC_LABELS[docType];
  const isImage = IMAGE_TYPES.has(docType);

  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-8 gap-2">
        <FileText className="w-5 h-5 text-muted-foreground/40" />
        <p className="text-[11px] font-medium text-muted-foreground/60 text-center leading-tight px-2">{label}</p>
        <p className="text-[10px] text-muted-foreground/40">Not uploaded</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden group">
      {isImage ? (
        <div className="relative h-40 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 bg-white/95 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-foreground flex items-center gap-1 transition-opacity shadow-sm">
              <ExternalLink className="w-3 h-3" /> Open full
            </a>
          </div>
        </div>
      ) : (
        <div className="h-28 bg-muted/40 flex flex-col items-center justify-center gap-2">
          <FileText className="w-6 h-6 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Document</p>
        </div>
      )}
      <div className="px-3 py-2.5 border-t border-border bg-card flex items-center justify-between">
        <p className="text-[11px] font-medium text-foreground leading-tight">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:underline shrink-0 ml-2">
          View <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
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

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicationDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: detail, isLoading } = useGetAdminApplicationDetailQuery(id, { skip: !id });

  const [commentOpen, setCommentOpen] = useState(false);
  const [actionType,  setActionType]  = useState<"approve" | "reject" | null>(null);
  const [comment,     setComment]     = useState("");

  const docs   = detail?.documents ?? [];
  const docMap = Object.fromEntries(docs.map((d) => [d.documentType, d.publicUrl])) as Record<DocumentType, string | undefined>;
  const uploadedCount = DOC_ORDER.filter((t) => docMap[t]).length;

  const handleAction = (type: "approve" | "reject") => {
    setActionType(type);
    setCommentOpen(true);
    setComment("");
  };

  const handleConfirm = () => {
    toast.info("Status updates are not yet available.");
    setCommentOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-6 w-48 rounded" />
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-foreground font-mono">
                {detail?.applicationNumber ?? "—"}
              </h1>
              {detail?.status && <StatusBadge status={detail.status as "DRAFT" | "SUBMITTED"} />}
            </div>
          )}
        </div>
        {!isLoading && detail && (detail.status === "SUBMITTED") && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white gap-1.5"
              onClick={() => handleAction("approve")}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => handleAction("reject")}>
              <XCircle className="w-4 h-4" /> Reject
            </Button>
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border shadow-none">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-24 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !detail ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <FileText className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Application not found</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/applications")}>
            Back to list
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="space-y-5"
        >
          {/* Quick summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: User,          label: "Applicant",   value: detail.fullName ?? "—" },
              { icon: Wallet,        label: "Loan Amount", value: formatNPR(toNumber(detail.loanInformation?.loanAmount ?? detail.loanAmount)) },
              { icon: GraduationCap, label: "Program",     value: detail.studyInformation?.courseName ?? detail.courseName ?? "—" },
              { icon: FileText,      label: "Submitted",   value: formatDate(detail.submittedAt) },
            ].map(({ icon: Icon, label, value }) => (
              <Card key={label} className="border-border shadow-none">
                <CardContent className="px-4 py-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left column */}
            <div className="space-y-5">
              {/* Contact */}
              <SectionCard icon={Phone} title="Contact Information">
                <InfoRow label="Email"        value={detail.email}       />
                <InfoRow label="Phone"        value={detail.phoneNumber} />
              </SectionCard>

              {/* Personal */}
              <SectionCard icon={User} title="Personal Details">
                <InfoRow label="Full Name (Identity)" value={detail.identityName}   />
                <InfoRow label="Date of Birth"
                  value={detail.dob ? new Date(detail.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined} />
                <InfoRow label="Gender"         value={detail.gender?.toLowerCase()} />
                <InfoRow label="Marital Status" value={detail.maritalStatus?.toLowerCase()} />
                <InfoRow label="Occupation"     value={detail.occupation?.toLowerCase()} />
                <InfoRow label="Identity Type"  value={detail.identityType?.toLowerCase().replace("_", " ")} />
                <InfoRow label="Identity No."   value={detail.identityNumber} />
                <InfoRow label="Issued District" value={detail.issuedDistrict} />
              </SectionCard>

              {/* Address */}
              {(detail.province ?? detail.district) && (
                <SectionCard icon={MapPin} title="Address">
                  <InfoRow label="Province"     value={detail.province}     />
                  <InfoRow label="District"     value={detail.district}     />
                  <InfoRow label="Municipality" value={detail.municipality} />
                  <InfoRow label="Ward"         value={detail.ward}         />
                </SectionCard>
              )}

              {/* Family */}
              {(detail.fatherName ?? detail.motherName) && (
                <SectionCard icon={Users} title="Family">
                  <InfoRow label="Father's Name"      value={detail.fatherName}      />
                  <InfoRow label="Mother's Name"      value={detail.motherName}      />
                  <InfoRow label="Grandfather's Name" value={detail.grandfatherName} />
                  {detail.spouseName && <InfoRow label="Spouse Name" value={detail.spouseName} />}
                </SectionCard>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Study & Loan */}
              <SectionCard icon={BookOpen} title="Study & Loan">
                <InfoRow label="Course / Program"
                  value={detail.studyInformation?.courseName ?? detail.courseName} />
                <InfoRow label="Institution"
                  value={detail.studyInformation?.boardUniversity ?? detail.boardUniversity} />
                <InfoRow label="Study Type"
                  value={(detail.studyInformation?.studyType ?? detail.studyType)?.toLowerCase().replace("_", " ")} />
                <InfoRow label="Duration"
                  value={detail.studyInformation?.courseDuration ?? (detail.courseDuration ? `${detail.courseDuration} months` : undefined)} />
                <InfoRow label="Loan Amount"     value={formatNPR(toNumber(detail.loanInformation?.loanAmount ?? detail.loanAmount))} />
                <InfoRow label="Expected Salary"
                  value={
                    (detail.loanInformation?.expectedSalary ?? detail.expectedSalary)
                      ? formatNPR(toNumber(detail.loanInformation?.expectedSalary ?? detail.expectedSalary))
                      : undefined
                  }
                />
              </SectionCard>

              {/* Documents */}
              <Card className="border-border shadow-none">
                <CardHeader className="px-5 py-3.5 border-b border-border">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Images className="w-3.5 h-3.5" />
                    Documents
                    {uploadedCount > 0 && (
                      <Badge className="text-[10px] bg-primary/10 text-primary border-0 ml-auto px-2">
                        {uploadedCount} / {DOC_ORDER.length} uploaded
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {DOC_ORDER.map((docType) => (
                      <DocCard key={docType} docType={docType} url={docMap[docType]} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* College verification */}
              {detail.collegeVerification && (
                <SectionCard icon={Building2} title="College Verification">
                  <InfoRow label="College Name"   value={detail.collegeVerification.collegeName}   />
                  <InfoRow label="Contact Person" value={detail.collegeVerification.contactPerson} />
                  <InfoRow label="College Email"  value={detail.collegeVerification.collegeEmail}  />
                  <InfoRow label="Contact Phone"  value={detail.collegeVerification.contactPhone}  />
                  <InfoRow label="Verified"       value={detail.collegeVerification.isApplicationVerified ? "Yes" : "No"} />
                  {detail.collegeVerification.verificationNotes && (
                    <InfoRow label="Notes" value={detail.collegeVerification.verificationNotes} />
                  )}
                  {detail.collegeVerification.offerLetterPublicUrl && (
                    <div className="py-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Offer Letter</span>
                      <a href={detail.collegeVerification.offerLetterPublicUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-3 text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                  {detail.collegeVerification.enrollmentDocPublicUrl && (
                    <div className="py-2">
                      <span className="text-xs text-muted-foreground">Enrollment Doc</span>
                      <a href={detail.collegeVerification.enrollmentDocPublicUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-3 text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </SectionCard>
              )}
            </div>
          </div>

          {/* Review notes */}
          {detail.reviewComment && (
            <>
              <Separator />
              <Card className="border-border shadow-none">
                <CardHeader className="px-5 py-3.5 border-b border-border">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Review Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4">
                  <p className="text-sm text-foreground leading-relaxed">{detail.reviewComment}</p>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      )}

      {/* Confirm dialog */}
      <AlertDialog open={commentOpen} onOpenChange={setCommentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Application" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "This will mark the application as approved and notify the applicant."
                : "This will reject the application. Please provide a reason."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Review Notes{actionType === "reject" && " (required)"}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add review notes or reason for decision…"
              className="mt-2 resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={actionType === "reject"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white"}
              disabled={actionType === "reject" && !comment.trim()}
            >
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
