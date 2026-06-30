"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import type { Application } from "@/types/application";
import type { DocumentType } from "@/types/api";
import { formatNPR, formatDate } from "@/lib/formatters";
import StatusBadge from "./StatusBadge";
import { useGetAdminApplicationDetailQuery } from "@/lib/api/adminApi";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  User,
  BookOpen,
  Wallet,
  Loader2,
  ExternalLink,
  Images,
  MapPin,
  Users,
  Phone,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface ApplicationDrawerProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DOC_LABELS: Record<DocumentType, string> = {
  APPLICANT_PHOTO:      "Applicant Photo",
  IDENTITY_FRONT:       "Identity — Front",
  IDENTITY_BACK:        "Identity — Back",
  ACADEMIC_RECORD:      "Academic Records",
  FEE_STRUCTURE:        "Fee Structure",
  STUDENT_APPLICATION:  "Student Application",
  OFFER_LETTER:         "Offer Letter",
  ENROLLMENT_DOCUMENT:  "Enrollment Document",
};

const IMAGE_TYPES: Set<DocumentType> = new Set([
  "APPLICANT_PHOTO",
  "IDENTITY_FRONT",
  "IDENTITY_BACK",
]);

const DOC_ORDER: DocumentType[] = [
  "APPLICANT_PHOTO",
  "IDENTITY_FRONT",
  "IDENTITY_BACK",
  "ACADEMIC_RECORD",
  "FEE_STRUCTURE",
];

function DocCard({ docType, url }: { docType: DocumentType; url?: string }) {
  const label   = DOC_LABELS[docType];
  const isImage = IMAGE_TYPES.has(docType);

  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-7 gap-2">
        <FileText className="w-5 h-5 text-muted-foreground/40" />
        <p className="text-[11px] font-medium text-muted-foreground/60 text-center leading-tight px-2">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground/40">Not uploaded</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden group">
      {isImage ? (
        <div className="relative h-32 bg-muted overflow-hidden">
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 bg-white/95 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-foreground flex items-center gap-1 transition-opacity shadow-sm"
            >
              <ExternalLink className="w-3 h-3" />
              Open full
            </a>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-muted/40 flex flex-col items-center justify-center gap-2">
          <FileText className="w-6 h-6 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Document</p>
        </div>
      )}
      <div className="px-3 py-2.5 border-t border-border bg-card flex items-center justify-between">
        <p className="text-[11px] font-medium text-foreground leading-tight">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:underline shrink-0 ml-2"
        >
          View <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/50 last:border-0 gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{String(value)}</span>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export default function ApplicationDrawer({
  application,
  open,
  onOpenChange,
}: ApplicationDrawerProps) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [actionType, setActionType]   = useState<"approve" | "reject" | null>(null);
  const [comment, setComment]         = useState("");

  const { data: detail, isLoading: detailLoading } = useGetAdminApplicationDetailQuery(
    application?.id ?? "",
    { skip: !open || !application?.id }
  );

  if (!application) return null;

  const handleAction = (type: "approve" | "reject") => {
    setActionType(type);
    setCommentOpen(true);
    setComment(application.reviewComment ?? "");
  };

  const handleConfirm = () => {
    toast.info("Status updates are not yet available.");
    setCommentOpen(false);
  };

  const docs   = detail?.documents ?? [];
  const docMap = Object.fromEntries(
    docs.map((d) => [d.documentType, d.publicUrl])
  ) as Record<DocumentType, string | undefined>;

  const uploadedCount = DOC_ORDER.filter((t) => docMap[t]).length;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-5 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-base font-bold leading-tight">
                  Application Details
                </SheetTitle>
                <SheetDescription className="font-mono text-sm text-foreground font-semibold mt-1">
                  {application.applicationNumber}
                </SheetDescription>
              </div>
              <StatusBadge status={application.status} />
            </div>
          </SheetHeader>

          <div className="px-6 pb-12 pt-6 space-y-8">
            {/* Quick summary cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User,           label: "Applicant",   value: application.fullName          },
                { icon: Wallet,         label: "Loan Amount", value: formatNPR(application.loanAmount) },
                { icon: GraduationCap,  label: "Program",     value: application.courseName        },
                { icon: FileText,       label: "Submitted",   value: formatDate(application.submittedAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-muted/20 px-4 py-4"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <SectionHeading icon={Phone} label="Contact Information" />
              <div className="rounded-xl border border-border bg-muted/10 px-4 py-1">
                <InfoRow label="Email"  value={application.email}       />
                <InfoRow label="Phone"  value={application.phoneNumber} />
              </div>
            </div>

            {/* Full detail sections */}
            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : detail && (
              <>
                {/* Personal */}
                <div>
                  <SectionHeading icon={User} label="Personal Details" />
                  <div className="rounded-xl border border-border bg-muted/10 px-4 py-1">
                    <InfoRow label="Full Name (Identity)" value={detail.identityName} />
                    <InfoRow
                      label="Date of Birth"
                      value={detail.dob ? new Date(detail.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined}
                    />
                    <InfoRow label="Gender"         value={detail.gender?.toLowerCase()} />
                    <InfoRow label="Marital Status" value={detail.maritalStatus?.toLowerCase()} />
                    <InfoRow label="Occupation"     value={detail.occupation?.toLowerCase()} />
                    <InfoRow label="Identity Type"  value={detail.identityType?.toLowerCase().replace("_", " ")} />
                    <InfoRow label="Identity No."   value={detail.identityNumber} />
                    {detail.issuedDistrict && (
                      <InfoRow label="Issued District" value={detail.issuedDistrict} />
                    )}
                  </div>
                </div>

                {/* Address */}
                {(detail.province ?? detail.district) && (
                  <div>
                    <SectionHeading icon={MapPin} label="Address" />
                    <div className="rounded-xl border border-border bg-muted/10 px-4 py-1">
                      <InfoRow label="Province"     value={detail.province}     />
                      <InfoRow label="District"     value={detail.district}     />
                      <InfoRow label="Municipality" value={detail.municipality} />
                      <InfoRow label="Ward"         value={detail.ward}         />
                    </div>
                  </div>
                )}

                {/* Family */}
                {(detail.fatherName ?? detail.motherName) && (
                  <div>
                    <SectionHeading icon={Users} label="Family" />
                    <div className="rounded-xl border border-border bg-muted/10 px-4 py-1">
                      <InfoRow label="Father's Name"      value={detail.fatherName}      />
                      <InfoRow label="Mother's Name"      value={detail.motherName}      />
                      <InfoRow label="Grandfather's Name" value={detail.grandfatherName} />
                      {detail.spouseName && (
                        <InfoRow label="Spouse Name" value={detail.spouseName} />
                      )}
                    </div>
                  </div>
                )}

                {/* Study & Loan */}
                <div>
                  <SectionHeading icon={BookOpen} label="Study & Loan" />
                  <div className="rounded-xl border border-border bg-muted/10 px-4 py-1">
                    <InfoRow
                      label="Course / Program"
                      value={detail.studyInformation?.courseName ?? detail.courseName}
                    />
                    <InfoRow
                      label="Institution"
                      value={detail.studyInformation?.boardUniversity ?? detail.boardUniversity}
                    />
                    <InfoRow
                      label="Study Type"
                      value={
                        (detail.studyInformation?.studyType ?? detail.studyType)
                          ?.toLowerCase()
                          .replace("_", " ")
                      }
                    />
                    <InfoRow
                      label="Duration"
                      value={
                        detail.studyInformation?.courseDuration
                          ?? (detail.courseDuration ? `${detail.courseDuration} months` : undefined)
                      }
                    />
                    <InfoRow label="Loan Amount"     value={formatNPR(application.loanAmount)} />
                    <InfoRow
                      label="Expected Salary"
                      value={
                        detail.loanInformation?.expectedSalary
                          ? formatNPR(Number(detail.loanInformation.expectedSalary))
                          : detail.expectedSalary
                          ? formatNPR(Number(detail.expectedSalary))
                          : undefined
                      }
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Documents */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Images className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Documents
                </p>
                {uploadedCount > 0 && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border-0 ml-auto px-2">
                    {uploadedCount} / {DOC_ORDER.length} uploaded
                  </Badge>
                )}
              </div>

              {detailLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {DOC_ORDER.map((docType) => (
                    <DocCard key={docType} docType={docType} url={docMap[docType]} />
                  ))}
                </div>
              )}
            </div>

            {/* Review notes */}
            {application.reviewComment && (
              <>
                <Separator />
                <div>
                  <SectionHeading icon={MessageSquare} label="Review Notes" />
                  <p className="text-sm text-foreground bg-muted/50 rounded-xl px-4 py-4 leading-relaxed">
                    {application.reviewComment}
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            {(application.status === "submitted" || application.status === "under_review") && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white"
                    onClick={() => handleAction("approve")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAction("reject")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
              className={
                actionType === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-[oklch(0.62_0.18_145)] hover:bg-[oklch(0.52_0.18_145)] text-white"
              }
              disabled={actionType === "reject" && !comment.trim()}
            >
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
