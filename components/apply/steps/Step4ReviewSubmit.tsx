"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ApplicationFormData } from "@/types/application";
import { formatNPR } from "@/lib/formatters";
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
} from "lucide-react";

export interface Step4Declaration {
  informationAccurate: boolean;
  authorizeVerification: boolean;
}

interface Step4Props {
  formData: ApplicationFormData;
  isSubmitting: boolean;
  onPrev: () => void;
  onEdit: (step: number) => void;
  onSubmit: (decl: Step4Declaration) => void;
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
  formData,
  isSubmitting,
  onPrev,
  onEdit,
  onSubmit,
}: Step4Props) {
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);

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
            { label: "DOB", value: step2?.dob },
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
