"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { step2Schema, type Step2FormData } from "@/lib/validations/schemas";
import FileUploadZone from "@/components/apply/fields/FileUploadZone";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  IdCard,
  MapPin,
  User2,
} from "lucide-react";
import { useUploadDocumentMutation } from "@/lib/api/documentsApi";
import { useAppSelector } from "@/lib/hooks";
import type { DocumentType } from "@/types/api";

interface Step2Props {
  defaultValues?: Partial<Step2FormData>;
  onNext: (data: Step2FormData) => void;
  onPrev: () => void;
  onDataChange?: (data: Partial<Step2FormData>) => void;
  isSaving?: boolean;
}

const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const SectionHeading = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
  </div>
);

function getUploadErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.join(", ");
    }
  }
  return undefined;
}

export default function Step2Identity({
  defaultValues,
  onNext,
  onPrev,
  onDataChange,
  isSaving,
}: Step2Props) {
  const applicationId = useAppSelector((s) => s.application.applicationId);
  const [uploadDocument] = useUploadDocumentMutation();
  // Citizenship uploads as EITHER a front+back image pair OR a single PDF —
  // never both (backend rejects mixing, see identity-document.util.ts).
  const [citizenshipMode, setCitizenshipMode] = useState<"images" | "pdf">("images");

  const uploadFile = async (file: File, documentType: DocumentType) => {
    if (!applicationId) {
      toast.error("No active application. Please refresh.");
      return;
    }
    try {
      await uploadDocument({ applicationId, documentType, file }).unwrap();
    } catch (err) {
      toast.error(
        getUploadErrorMessage(err) ??
          `Failed to upload ${documentType.replace(/_/g, " ").toLowerCase()}`,
      );
    }
  };

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      identityType: undefined,
      identityNumber: "",
      identityName: "",
      dob: "",
      issuedDistrict: "",
      issuedDate: "",
      gender: undefined,
      occupation: undefined,
      province: "",
      district: "",
      municipality: "",
      ward: "",
      ...defaultValues,
    },
  });

  const identityType = form.watch("identityType");
  const watchedValues = form.watch();

  useEffect(() => {
    onDataChange?.(watchedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  const handleIdentityFront = (file: File | null) => {
    if (file) uploadFile(file, "IDENTITY_FRONT");
  };

  const handleIdentityBack = (file: File | null) => {
    if (file) uploadFile(file, "IDENTITY_BACK");
  };

  const handleApplicantPhoto = (file: File | null) => {
    if (file) uploadFile(file, "APPLICANT_PHOTO");
  };

  const handleIdentityDocument = (file: File | null) => {
    if (file) uploadFile(file, "IDENTITY_DOCUMENT");
  };

  const identityLabels: Record<string, string> = {
    citizenship: "Citizenship Certificate",
    passport: "Passport",
    driving_license: "Driving License",
    document: "Identity Document",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-10">
        {/* Identity Type */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionHeading icon={IdCard} title="Identity Document" />

          <FormField
            control={form.control}
            name="identityType"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Identity Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                  >
                    {[
                      {
                        value: "citizenship",
                        label: "Citizenship",
                        desc: "Nepal Government",
                      },
                      {
                        value: "passport",
                        label: "Passport",
                        desc: "Government issued",
                      },
                      {
                        value: "driving_license",
                        label: "Driving License",
                        desc: "DOTM issued",
                      },
                      {
                        value: "document",
                        label: "Upload a Document",
                        desc: "PDF, under 5MB",
                      },
                    ].map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          field.value === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <div>
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Upload */}
          <AnimatePresence>
            {identityType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  Upload {identityLabels[identityType] ?? "Document"}
                </p>

                {identityType === "citizenship" ? (
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
                          onClick={() => setCitizenshipMode(opt.value)}
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
                      // makes both cells match the taller sibling's height once
                      // one side is uploaded and the other still shows the
                      // (taller) empty dropzone.
                      <div
                        key="citizenship-images"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start"
                      >
                        <FileUploadZone
                          label="Front Side"
                          hint="Clear photo of the front"
                          accept="image/jpeg,image/png"
                          onFileSelect={handleIdentityFront}
                        />
                        <FileUploadZone
                          label="Back Side"
                          hint="Clear photo of the back"
                          accept="image/jpeg,image/png"
                          onFileSelect={handleIdentityBack}
                        />
                      </div>
                    ) : (
                      <FileUploadZone
                        key="citizenship-pdf"
                        label="Citizenship Document"
                        hint="A single PDF of the full document, under 5MB"
                        accept="application/pdf"
                        maxSizeMB={5}
                        variant="document"
                        onFileSelect={handleIdentityDocument}
                      />
                    )}
                  </div>
                ) : (
                  <FileUploadZone
                    label="Identity Document"
                    hint="Image or PDF of your identity document, under 5MB"
                    accept="image/jpeg,image/png,application/pdf"
                    maxSizeMB={5}
                    variant="document"
                    onFileSelect={handleIdentityDocument}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Auto-fill / Manual fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <SectionHeading icon={User2} title="Personal Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="identityName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full Name (as on document)</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-filled from document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-filled from document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issuedDistrict"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued District</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-filled from document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issuedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">
                        Self-Employed
                      </SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeading icon={MapPin} title="Permanent Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kathmandu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipality / VDC</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Kathmandu Metropolitan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ward No.</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Photo upload */}
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground mb-3">
              Applicant Photo
            </p>
            <div className="max-w-[200px]">
              <FileUploadZone
                label="Upload Photo"
                hint="Recent passport-size photo"
                accept="image/jpeg,image/png"
                variant="photo"
                onFileSelect={handleApplicantPhoto}
              />
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 px-6"
            onClick={onPrev}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="h-12 px-8 text-base font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
