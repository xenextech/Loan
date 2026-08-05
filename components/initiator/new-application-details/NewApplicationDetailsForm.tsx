"use client";

import { useEffect, useState } from "react";
import { useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, IdCard, Loader2, MapPin, Receipt, UserPlus, UserRound, Users } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BsDatePicker } from "@/components/ui/bs-date-picker";
import { SectionCard, FormSection } from "@/components/initiator/loan-assessment/ui/SectionCard";
import FileUploadZone from "@/components/apply/fields/FileUploadZone";
import { convertBsToAdString } from "@/lib/bsDate";
import type { DocumentType } from "@/types/api";
import {
  newApplicationDetailsSchema,
  DEFAULT_NEW_APPLICATION_DETAILS,
  NA_STUDY_TYPE_OPTIONS,
  NA_IDENTITY_TYPE_OPTIONS,
  NA_GENDER_OPTIONS,
  NA_OCCUPATION_OPTIONS,
  NA_MARITAL_STATUS_OPTIONS,
  NA_FEE_STRUCTURE_METHOD_OPTIONS,
  type NewApplicationDetailsValues,
  type NewApplicationDetailsSubmitValues,
} from "./schema";

/** Files staged locally while filling the form — uploaded only after the
 *  application is created (there's no applicationId to attach them to before
 *  that), so these never go through react-hook-form/zod. */
export type StagedDocuments = Partial<Record<DocumentType, File>>;

function StepHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 pt-2 first:pt-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
        {step}
      </span>
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
    </div>
  );
}

interface TextInputProps {
  control: Control<NewApplicationDetailsValues>;
  name: FieldPath<NewApplicationDetailsValues>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "date" | "number";
  required?: boolean;
  readOnly?: boolean;
}

function TextInput({ control, name, label, placeholder, type = "text", required, readOnly }: TextInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              readOnly={readOnly}
              className={readOnly ? "bg-muted text-muted-foreground" : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SelectInputProps {
  control: Control<NewApplicationDetailsValues>;
  name: FieldPath<NewApplicationDetailsValues>;
  label: string;
  options: readonly { value: string; label: string }[];
}

function SelectInput({ control, name, label, options }: SelectInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={typeof field.value === "string" ? field.value : undefined} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DateBsInputProps {
  control: Control<NewApplicationDetailsValues>;
  name: FieldPath<NewApplicationDetailsValues>;
  label: string;
}

function DateBsInput({ control, name, label }: DateBsInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <BsDatePicker
              value={typeof field.value === "string" ? field.value : ""}
              onChange={field.onChange}
              disabled={field.disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface NewApplicationDetailsFormProps {
  defaultValues?: Partial<NewApplicationDetailsValues>;
  onSubmit: (values: NewApplicationDetailsSubmitValues, documents: StagedDocuments) => void | Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function NewApplicationDetailsForm({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
}: NewApplicationDetailsFormProps) {
  const form = useForm<NewApplicationDetailsValues>({
    resolver: zodResolver(newApplicationDetailsSchema),
    defaultValues: { ...DEFAULT_NEW_APPLICATION_DETAILS, ...defaultValues },
    mode: "onBlur",
  });

  const maritalStatus = form.watch("maritalStatus");
  const feeStructureMethod = form.watch("feeStructureMethod");
  const identityType = form.watch("identityType");
  const dobBs = form.watch("dobBs");

  const [documents, setDocuments] = useState<StagedDocuments>({});
  const stageFile = (type: DocumentType) => (file: File | null) => {
    setDocuments((prev) => {
      const next = { ...prev };
      if (file) next[type] = file;
      else delete next[type];
      return next;
    });
  };

  // Citizenship uploads as EITHER a front+back image pair OR a single PDF —
  // never both (backend rejects mixing, see identity-document.util.ts). Clear
  // whichever slots the other mode used so switching can't stage a conflict.
  const [citizenshipMode, setCitizenshipMode] = useState<"images" | "pdf">("images");
  const setCitizenshipModeAndClear = (mode: "images" | "pdf") => {
    setCitizenshipMode(mode);
    setDocuments((prev) => {
      const next = { ...prev };
      if (mode === "pdf") {
        delete next.IDENTITY_FRONT;
        delete next.IDENTITY_BACK;
      } else {
        delete next.IDENTITY_DOCUMENT;
      }
      return next;
    });
  };

  // BS is the primary input (this is a Nepal-only product) — AD is derived
  // from it and never hand-entered, so the two can never disagree and trip
  // the backend's "dobAd and dobBs do not refer to the same calendar date"
  // check (see applications.service.ts resolveDateOfBirth).
  useEffect(() => {
    const derived = typeof dobBs === "string" ? convertBsToAdString(dobBs) : undefined;
    form.setValue("dobAd", derived ?? "", { shouldValidate: false, shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dobBs]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(newApplicationDetailsSchema.parse(values), documents);
  });

  return (
    <Form {...form}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <StepHeading step={1} title="Personal, Study & Loan Information" />
        <SectionCard icon={UserRound} title="Personal Information">
          <FormSection>
            <TextInput control={form.control} name="fullName" label="Full Name" required />
            <TextInput control={form.control} name="email" label="Email" type="email" />
            <TextInput control={form.control} name="phoneNumber" label="Phone Number" type="tel" required />
          </FormSection>
        </SectionCard>

        <SectionCard icon={GraduationCap} title="Study & Loan Information">
          <FormSection>
            <SelectInput control={form.control} name="studyType" label="Study Type" options={NA_STUDY_TYPE_OPTIONS} />
            <TextInput control={form.control} name="courseName" label="Course Name" />
            <TextInput control={form.control} name="boardUniversity" label="Board / University" />
            <TextInput control={form.control} name="courseDuration" label="Course Duration" placeholder="e.g. 4 Years" />
            <TextInput control={form.control} name="loanAmount" label="Loan Amount (NPR)" type="number" />
          </FormSection>
        </SectionCard>

        <StepHeading step={2} title="Identity, KYC & Address" />
        <SectionCard icon={IdCard} title="Identity Document" description="Uploads are optional here and can be added later.">
          <FormSection>
            <SelectInput
              control={form.control}
              name="identityType"
              label="Identity Type"
              options={NA_IDENTITY_TYPE_OPTIONS}
            />
            <TextInput control={form.control} name="identityNumber" label="Document Number" />
            <TextInput control={form.control} name="identityName" label="Name on Document" />
            <DateBsInput control={form.control} name="dobBs" label="Date of Birth (BS)" />
            <TextInput
              control={form.control}
              name="dobAd"
              label="Date of Birth (AD)"
              placeholder="Auto-filled from BS date"
              readOnly
            />
            <SelectInput control={form.control} name="gender" label="Gender" options={NA_GENDER_OPTIONS} />
            <SelectInput control={form.control} name="occupation" label="Occupation" options={NA_OCCUPATION_OPTIONS} />
            <TextInput control={form.control} name="issuedDistrict" label="Issued District" />
            <DateBsInput control={form.control} name="issuedDate" label="Issued Date" />
          </FormSection>

          {identityType && (
            <div className="mt-5 pt-5 border-t border-border space-y-4">
              {identityType === "CITIZENSHIP" ? (
                <div className="space-y-4">
                  <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
                    {(
                      [
                        { value: "images", label: "Upload as Images" },
                        { value: "pdf", label: "Upload as PDF" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCitizenshipModeAndClear(opt.value)}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                          citizenshipMode === opt.value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {citizenshipMode === "images" ? (
                    // items-start: without it, CSS Grid's default row-stretch
                    // makes both cells match the taller sibling's height —
                    // e.g. Front uploaded (short card) next to Back still
                    // showing the dropzone (tall) — which reads as the
                    // uploaded card being stretched with dead space below it.
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <FileUploadZone
                        label="Citizenship — Front Side"
                        hint="Clear photo of the front"
                        accept="image/jpeg,image/png"
                        onFileSelect={stageFile("IDENTITY_FRONT")}
                      />
                      <FileUploadZone
                        label="Citizenship — Back Side"
                        hint="Clear photo of the back"
                        accept="image/jpeg,image/png"
                        onFileSelect={stageFile("IDENTITY_BACK")}
                      />
                    </div>
                  ) : (
                    <FileUploadZone
                      label="Citizenship Document"
                      hint="A single PDF of the full document, under 5MB"
                      accept="application/pdf"
                      maxSizeMB={5}
                      variant="document"
                      onFileSelect={stageFile("IDENTITY_DOCUMENT")}
                    />
                  )}
                </div>
              ) : (
                <FileUploadZone
                  label="Identity Document"
                  hint="Image or PDF of the identity document"
                  accept="image/jpeg,image/png,application/pdf"
                  variant="document"
                  onFileSelect={stageFile("IDENTITY_DOCUMENT")}
                />
              )}
              <div className="max-w-[200px]">
                <FileUploadZone
                  label="Applicant Photo"
                  hint="Recent passport-size photo"
                  accept="image/jpeg,image/png"
                  variant="photo"
                  onFileSelect={stageFile("APPLICANT_PHOTO")}
                />
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard icon={MapPin} title="Permanent Address">
          <FormSection>
            <TextInput control={form.control} name="province" label="Province" />
            <TextInput control={form.control} name="district" label="District" />
            <TextInput control={form.control} name="municipality" label="Municipality / VDC" />
            <TextInput control={form.control} name="ward" label="Ward No." />
          </FormSection>
        </SectionCard>

        <StepHeading step={3} title="Family & Fee Structure" />
        <SectionCard icon={Users} title="Family Information">
          <FormSection>
            <TextInput control={form.control} name="fatherName" label="Father's Name" />
            <TextInput control={form.control} name="motherName" label="Mother's Name" />
            <TextInput control={form.control} name="grandfatherName" label="Grandfather's Name" />
            <SelectInput
              control={form.control}
              name="maritalStatus"
              label="Marital Status"
              options={NA_MARITAL_STATUS_OPTIONS}
            />
            {maritalStatus === "MARRIED" && (
              <TextInput control={form.control} name="spouseName" label="Spouse Name" required />
            )}
            <TextInput control={form.control} name="expectedSalary" label="Expected Monthly Salary (NPR)" type="number" />
          </FormSection>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">Academic Records</p>
            <FileUploadZone
              label="Academic Records"
              hint="Transcripts, marksheets, certificates (optional)"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              maxSizeMB={10}
              onFileSelect={stageFile("ACADEMIC_RECORD")}
            />
          </div>
        </SectionCard>

        <SectionCard icon={Receipt} title="Fee Structure">
          <FormSection>
            <SelectInput
              control={form.control}
              name="feeStructureMethod"
              label="Fee Structure Method"
              options={NA_FEE_STRUCTURE_METHOD_OPTIONS}
            />
            {feeStructureMethod === "LINK" && (
              <TextInput control={form.control} name="feeStructureUrl" label="Fee Structure URL" />
            )}
            {feeStructureMethod === "MANUAL" && (
              <TextInput control={form.control} name="feeStructureText" label="Fee Details" />
            )}
          </FormSection>

          {feeStructureMethod === "DOCUMENT" && (
            <div className="mt-5 pt-5 border-t border-border">
              <FileUploadZone
                label="Fee Structure Document"
                hint="Fee breakdown from the institution (optional)"
                accept=".pdf,.doc,.docx"
                onFileSelect={stageFile("FEE_STRUCTURE")}
              />
            </div>
          )}
        </SectionCard>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-sm">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <Button type="button" size="sm" className="gap-1.5" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            {isSubmitting ? "Creating…" : "Create Application"}
          </Button>
        </div>
      </motion.div>
    </Form>
  );
}
