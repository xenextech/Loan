"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { ApplicationFormData } from "@/types/application";
import type { VerificationInvitation } from "@/types/api";
import { formatNPR, formatDate } from "@/lib/formatters";
import {
  useGetVerificationStatusQuery,
  useSendParentVerificationMutation,
  useResendParentVerificationMutation,
  useSendCollegeVerificationMutation,
  useResendCollegeVerificationMutation,
} from "@/lib/api/applicationApi";
import {
  ArrowLeft,
  Pencil,
  Send,
  User,
  IdCard,
  Users,
  BookOpen,
  Wallet,
  CheckCircle2,
  Loader2,
  GraduationCap,
  RotateCw,
  Circle,
} from "lucide-react";

export interface Step4Declaration {
  informationAccurate: boolean;
  authorizeVerification: boolean;
}

interface Step4Props {
  applicationId: string;
  formData: ApplicationFormData;
  isSubmitting: boolean;
  onPrev: () => void;
  onEdit: (step: number) => void;
  onSubmit: (decl: Step4Declaration) => void;
}

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message)
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number")
      return `Request failed with status ${status}. Please try again.`;
  }
  return "Something went wrong. Please try again.";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_BADGE: Record<
  VerificationInvitation["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-amber-500/15 text-amber-700 border-0" },
  OPENED: { label: "Opened", className: "bg-blue-500/15 text-blue-700 border-0" },
  VERIFIED: { label: "Verified", className: "bg-green-500/15 text-green-700 border-0" },
  EXPIRED: { label: "Expired", className: "bg-muted text-muted-foreground border-0" },
  REVOKED: { label: "Revoked", className: "bg-muted text-muted-foreground border-0" },
  FAILED: { label: "Failed to send", className: "bg-destructive/15 text-destructive border-0" },
};

// Shared UI for the Parent and College verification invite sections — same
// send/resend/status lifecycle, only labels/icon/placeholder differ.
function VerificationInviteCard({
  title,
  icon: Icon,
  placeholder,
  invitation,
  isSending,
  isResending,
  onSend,
  onResend,
}: {
  title: string;
  icon: React.ElementType;
  placeholder: string;
  invitation: VerificationInvitation | null | undefined;
  isSending: boolean;
  isResending: boolean;
  onSend: (email: string) => void;
  onResend: () => void;
}) {
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(true);
  const [touched, setTouched] = useState(false);

  const trimmed = email.trim();
  const isValid = EMAIL_RE.test(trimmed);
  const showInviteForm = editing || !invitation;

  const handleSend = () => {
    setTouched(true);
    if (!isValid) return;
    onSend(trimmed.toLowerCase());
    setEditing(false);
  };

  const canResend =
    invitation &&
    !isSending &&
    !isResending &&
    invitation.status !== "VERIFIED" &&
    invitation.status !== "REVOKED";

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-3">
        {showInviteForm ? (
          <div className="space-y-2">
            <Label htmlFor={`${title}-email`} className="text-xs">
              {title.replace(" Verification", "")} Email
            </Label>
            <div className="flex gap-2">
              <Input
                id={`${title}-email`}
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className="text-sm"
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={isSending || !trimmed}
                className="shrink-0 gap-1.5"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Verification
              </Button>
            </div>
            {touched && !isValid && trimmed && (
              <p className="text-xs text-destructive">
                Enter a valid email address.
              </p>
            )}
            {invitation && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          invitation && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {invitation.email}
                  </p>
                </div>
                <Badge className={`text-xs font-semibold ${STATUS_BADGE[invitation.status].className}`}>
                  {invitation.status === "VERIFIED" ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <Circle className="w-3 h-3 mr-1" />
                  )}
                  {STATUS_BADGE[invitation.status].label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Verification ID</p>
                  <p className="font-mono font-medium text-foreground">
                    {invitation.verificationCode}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {invitation.status === "VERIFIED" ? "Verified" : "Expires"}
                  </p>
                  <p className="font-medium text-foreground">
                    {formatDate(
                      invitation.status === "VERIFIED"
                        ? invitation.verifiedAt
                        : invitation.expiresAt,
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {canResend && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={onResend}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RotateCw className="w-3 h-3" />
                    )}
                    Resend
                  </Button>
                )}
                {invitation.status !== "VERIFIED" && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    onClick={() => {
                      setEmail(invitation.email);
                      setEditing(true);
                    }}
                  >
                    Change email
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

interface ReviewCardProps {
  title: string;
  icon: React.ElementType;
  step: number;
  onEdit: (step: number) => void;
  rows: { label: string; value: string | undefined }[];
}

function ReviewCard({
  title,
  icon: Icon,
  step,
  onEdit,
  rows,
}: ReviewCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => onEdit(step)}
          >
            <Pencil className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <dl className="space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-xs text-muted-foreground shrink-0">
                {label}
              </dt>
              <dd className="text-xs font-medium text-foreground text-right truncate">
                {value ?? "—"}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export default function Step4ReviewSubmit({
  applicationId,
  formData,
  isSubmitting,
  onPrev,
  onEdit,
  onSubmit,
}: Step4Props) {
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);

  const { data: verification } = useGetVerificationStatusQuery(applicationId);
  const [sendParent, { isLoading: isSendingParent }] =
    useSendParentVerificationMutation();
  const [resendParent, { isLoading: isResendingParent }] =
    useResendParentVerificationMutation();
  const [sendCollege, { isLoading: isSendingCollege }] =
    useSendCollegeVerificationMutation();
  const [resendCollege, { isLoading: isResendingCollege }] =
    useResendCollegeVerificationMutation();

  const handleSendParent = async (email: string) => {
    try {
      await sendParent({ id: applicationId, email }).unwrap();
      toast.success("Parent verification sent");
    } catch (err) {
      toast.error("Failed to send parent verification", {
        description: getApiErrorMessage(err),
      });
    }
  };
  const handleResendParent = async () => {
    try {
      await resendParent({ id: applicationId }).unwrap();
      toast.success("Parent verification resent");
    } catch (err) {
      toast.error("Failed to resend parent verification", {
        description: getApiErrorMessage(err),
      });
    }
  };
  const handleSendCollege = async (email: string) => {
    try {
      await sendCollege({ id: applicationId, email }).unwrap();
      toast.success("College verification sent");
    } catch (err) {
      toast.error("Failed to send college verification", {
        description: getApiErrorMessage(err),
      });
    }
  };
  const handleResendCollege = async () => {
    try {
      await resendCollege({ id: applicationId }).unwrap();
      toast.success("College verification resent");
    } catch (err) {
      toast.error("Failed to resend college verification", {
        description: getApiErrorMessage(err),
      });
    }
  };

  const { step1, step2, step3 } = formData;
  const canSubmit = agreed1 && agreed2 && !isSubmitting;

  const STUDY_TYPE_MAP: Record<string, string> = {
    program: "Degree Program",
    course: "Short Course",
    diploma: "Diploma",
    certification: "Certification",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal */}
        <ReviewCard
          title="Personal Information"
          icon={User}
          step={1}
          onEdit={onEdit}
          rows={[
            { label: "Full Name", value: step1?.fullName },
            { label: "Phone", value: step1?.phoneNumber },
            { label: "Email", value: step1?.email },
          ]}
        />

        {/* Study */}
        <ReviewCard
          title="Study Details"
          icon={BookOpen}
          step={1}
          onEdit={onEdit}
          rows={[
            {
              label: "Study Type",
              value: step1?.studyType
                ? STUDY_TYPE_MAP[step1.studyType]
                : undefined,
            },
            { label: "Course", value: step1?.courseName },
            { label: "University", value: step1?.boardUniversity },
            { label: "Duration", value: step1?.courseDuration },
          ]}
        />

        {/* Loan */}
        <ReviewCard
          title="Loan Details"
          icon={Wallet}
          step={1}
          onEdit={onEdit}
          rows={[
            {
              label: "Loan Amount",
              value: step1?.loanAmount
                ? formatNPR(step1.loanAmount)
                : undefined,
            },
          ]}
        />

        {/* Identity */}
        <ReviewCard
          title="Identity Verification"
          icon={IdCard}
          step={2}
          onEdit={onEdit}
          rows={[
            {
              label: "ID Type",
              value: step2?.identityType
                ?.replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            },
            { label: "Name on Doc", value: step2?.identityName },
            { label: "DOB (BS)", value: step2?.dobBs },
            {label:"Issued Date", value: step2?.issuedDate},
            { label: "DOB (AD)", value: step2?.dob },
            { label: "Doc Number", value: step2?.identityNumber },
            {
              label: "Gender",
              value: step2?.gender
                ? step2.gender.charAt(0).toUpperCase() + step2.gender.slice(1)
                : undefined,
            },
          ]}
        />

        {/* Address */}
        <ReviewCard
          title="Address"
          icon={IdCard}
          step={2}
          onEdit={onEdit}
          rows={[
            { label: "Province", value: step2?.province },
            { label: "District", value: step2?.district },
            { label: "Municipality", value: step2?.municipality },
            { label: "Ward", value: step2?.ward },
          ]}
        />

        {/* Family */}
        <ReviewCard
          title="Family Details"
          icon={Users}
          step={3}
          onEdit={onEdit}
          rows={[
            { label: "Father's Name", value: step3?.fatherName },
            { label: "Mother's Name", value: step3?.motherName },
            { label: "Grandfather", value: step3?.grandfatherName },
            {
              label: "Marital Status",
              value: step3?.maritalStatus
                ? step3.maritalStatus.charAt(0).toUpperCase() +
                  step3.maritalStatus.slice(1)
                : undefined,
            },
            ...(step3?.maritalStatus === "married"
              ? [{ label: "Spouse", value: step3?.spouseName }]
              : []),
            {
              label: "Expected Salary",
              value: step3?.expectedSalary
                ? `NPR ${step3.expectedSalary}`
                : undefined,
            },
          ]}
        />
      </div>

      {/* Verification invitations — separate secure invitation per recipient,
          never a shared token. Raw links/tokens are never shown here. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VerificationInviteCard
          title="Parent Verification"
          icon={Users}
          placeholder="parent@example.com"
          invitation={verification?.parent}
          isSending={isSendingParent}
          isResending={isResendingParent}
          onSend={handleSendParent}
          onResend={handleResendParent}
        />
        <VerificationInviteCard
          title="College Verification"
          icon={GraduationCap}
          placeholder="verification@college.edu.np"
          invitation={verification?.college}
          isSending={isSendingCollege}
          isResending={isResendingCollege}
          onSend={handleSendCollege}
          onResend={handleResendCollege}
        />
      </div>

      {/* Declaration */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Declaration</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree1"
              checked={agreed1}
              onCheckedChange={(v) => setAgreed1(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="agree1"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I confirm that all information provided in this application is
              true, accurate, and complete to the best of my knowledge. I
              understand that providing false information may result in
              rejection or cancellation of the loan.
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree2"
              checked={agreed2}
              onCheckedChange={(v) => setAgreed2(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="agree2"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I authorize Unnati Edu Loan and its partner banks to verify my
              identity, academic records, and financial information with
              relevant institutions and government agencies.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 px-6"
          onClick={onPrev}
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() =>
            onSubmit({
              informationAccurate: agreed1,
              authorizeVerification: agreed2,
            })
          }
          disabled={!canSubmit}
          size="lg"
          className="h-12 px-8 text-base font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>

      {!agreed1 || !agreed2 ? (
        <p className="text-xs text-center text-muted-foreground">
          Please agree to both declarations to submit your application.
        </p>
      ) : null}
    </motion.div>
  );
}
