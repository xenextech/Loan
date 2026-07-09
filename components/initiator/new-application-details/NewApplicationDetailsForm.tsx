"use client";

import { useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, IdCard, Loader2, MapPin, Receipt, UserPlus, UserRound, Users } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SectionCard, FormSection } from "@/components/initiator/loan-assessment/ui/SectionCard";
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

interface TextInputProps {
  control: Control<NewApplicationDetailsValues>;
  name: FieldPath<NewApplicationDetailsValues>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "date" | "number";
  required?: boolean;
}

function TextInput({ control, name, label, placeholder, type = "text", required }: TextInputProps) {
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

interface NewApplicationDetailsFormProps {
  defaultValues?: Partial<NewApplicationDetailsValues>;
  onSubmit: (values: NewApplicationDetailsSubmitValues) => void | Promise<void>;
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

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(newApplicationDetailsSchema.parse(values));
  });

  return (
    <Form {...form}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
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

        <SectionCard icon={IdCard} title="Identity Document">
          <FormSection>
            <SelectInput
              control={form.control}
              name="identityType"
              label="Identity Type"
              options={NA_IDENTITY_TYPE_OPTIONS}
            />
            <TextInput control={form.control} name="identityNumber" label="Document Number" />
            <TextInput control={form.control} name="identityName" label="Name on Document" />
            <TextInput control={form.control} name="dobAd" label="Date of Birth (AD)" type="date" />
            <TextInput control={form.control} name="dobBs" label="Date of Birth (BS)" type="date" />
            <SelectInput control={form.control} name="gender" label="Gender" options={NA_GENDER_OPTIONS} />
            <SelectInput control={form.control} name="occupation" label="Occupation" options={NA_OCCUPATION_OPTIONS} />
            <TextInput control={form.control} name="issuedDistrict" label="Issued District" />
            <TextInput control={form.control} name="issuedDate" label="Issued Date" type="date" />
          </FormSection>
        </SectionCard>

        <SectionCard icon={MapPin} title="Permanent Address">
          <FormSection>
            <TextInput control={form.control} name="province" label="Province" />
            <TextInput control={form.control} name="district" label="District" />
            <TextInput control={form.control} name="municipality" label="Municipality / VDC" />
            <TextInput control={form.control} name="ward" label="Ward No." />
          </FormSection>
        </SectionCard>

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
