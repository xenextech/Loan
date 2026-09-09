"use client";
import { useEffect } from "react";
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
import { AdDatePicker } from "@/components/ui/ad-date-picker";
import { BsDatePicker } from "@/components/ui/bs-date-picker";
import { convertBsToAdString } from "@/lib/bsDate";
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
import SaveDraftButton, { type SaveDraftStatus } from "@/components/apply/SaveDraftButton";
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
import {
  useUploadDocumentMutation,
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
} from "@/lib/api/documentsApi";
import { toIdentityType } from "@/lib/api/transforms";
import { useAppSelector } from "@/lib/hooks";
import type { Document, DocumentType, IdentityType } from "@/types/api";

// Mirrors buildStep2Body's exact special-casing (lib/api/applicationApi.ts):
// the "document" radio option has no backend IdentityType equivalent, so it
// must map to undefined/null rather than an invalid "DOCUMENT" enum value.
// This is what keeps each identity type's IDENTITY_FRONT/BACK/DOCUMENT
// uploads independent of every other type's — see docFor/uploadFile below.
function toBackendIdentityType(
  value: string | undefined,
): IdentityType | undefined {
  if (!value || value === "document") return undefined;
  return toIdentityType(value);
}

interface Step2Props {
  defaultValues?: Partial<Step2FormData>;
  onNext: (data: Step2FormData) => void;
  onPrev: () => void;
  onDataChange?: (data: Partial<Step2FormData>) => void;
  isSaving?: boolean;
  onSaveDraft?: (data: Step2FormData) => void;
  saveDraftStatus?: SaveDraftStatus;
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
  onSaveDraft,
  saveDraftStatus = "idle",
}: Step2Props) {
  const applicationId = useAppSelector((s) => s.application.applicationId);
  const [uploadDocument] = useUploadDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();
  const { data: documents } = useGetDocumentsQuery(applicationId ?? "", {
    skip: !applicationId,
  });

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      identityType: undefined,
      identityNumber: "",
      identityName: "",
      dobBs: "",
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
  const dobBs = form.watch("dobBs");
  const watchedValues = form.watch();

  // The currently-selected identity type, in the backend's shape — every
  // document lookup/upload below is scoped by this (in addition to
  // documentType) so switching identity types reveals that type's own,
  // independent set of documents instead of colliding with another type's
  // IDENTITY_FRONT/BACK/DOCUMENT slot. "document" (no specific legal type)
  // and null both mean the same thing here: undefined.
  const backendIdentityType = toBackendIdentityType(identityType);

  // Only the identity-document slots are scoped by identity type — the
  // applicant photo isn't tied to any identity type and always has
  // identityType: null on the backend regardless of the current selection.
  const IDENTITY_SCOPED_TYPES: DocumentType[] = [
    "IDENTITY_FRONT",
    "IDENTITY_BACK",
    "IDENTITY_DOCUMENT",
  ];

  const docFor = (documentType: DocumentType): Document | undefined =>
    documents?.find(
      (d) =>
        d.documentType === documentType &&
        (!IDENTITY_SCOPED_TYPES.includes(documentType) ||
          d.identityType === (backendIdentityType ?? null)),
    );

  const uploadFile = async (file: File, documentType: DocumentType) => {
    if (!applicationId) {
      toast.error("No active application. Please refresh.");
      return;
    }
    try {
      await uploadDocument({
        applicationId,
        documentType,
        identityType: backendIdentityType,
        file,
      }).unwrap();
    } catch (err) {
      toast.error(
        getUploadErrorMessage(err) ??
          `Failed to upload ${documentType.replace(/_/g, " ").toLowerCase()}`,
      );
    }
  };

  const removeUploadedFile = async (documentType: DocumentType) => {
    const doc = docFor(documentType);
    if (!applicationId || !doc) return;
    try {
      await deleteDocument({ applicationId, documentId: doc.id }).unwrap();
    } catch {
      toast.error(
        `Failed to remove ${documentType.replace(/_/g, " ").toLowerCase()}`,
      );
    }
  };

  useEffect(() => {
    onDataChange?.(watchedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  // BS is the primary input; AD is derived and never hand-entered — mirrors
  // NewApplicationDetailsForm's dobBs -> dobAd handling exactly, so the two
  // can never disagree and trip the backend's "dobAd and dobBs do not refer
  // to the same calendar date" check.
  useEffect(() => {
    const derived = typeof dobBs === "string" ? convertBsToAdString(dobBs) : undefined;
    form.setValue("dob", derived ?? "", { shouldValidate: false, shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dobBs]);

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

  const toExisting = (doc: Document | undefined) =>
    doc
      ? {
          name: doc.originalFileName,
          url: doc.publicUrl,
          mimeType: doc.mimeType,
          sizeKB: doc.size / 1024,
        }
      : null;

  const identityFrontDoc = toExisting(docFor("IDENTITY_FRONT"));
  const identityBackDoc = toExisting(docFor("IDENTITY_BACK"));
  const identityDocumentDoc = toExisting(docFor("IDENTITY_DOCUMENT"));
  const applicantPhotoDoc = toExisting(docFor("APPLICANT_PHOTO"));

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
                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium text-foreground">
                    Upload {identityLabels[identityType] ?? "Document"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload any combination — front image, back image, and/or a PDF. All fields are optional but at least one must be provided.
                  </p>
                </div>

                {/* Front + Back images — available for all identity types.
                    Keyed by identityType: FileUploadZone keeps its own local
                    `file`/`preview` state for the instant post-selection
                    preview (before the upload round-trips and this list
                    refetches), and without a key React reuses the same
                    component instance — and therefore that same local state
                    — across an identity type switch. That's what let a
                    locally-picked file for one identity type keep rendering
                    under every other identity type: the correctly-scoped
                    `existingFile` prop below was already right, but the
                    stale local `file` state took rendering priority over it
                    (see FileUploadZone's `hasFile = !!file || showingExisting`).
                    The key forces a fresh instance — and fresh state — per
                    identity type. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <FileUploadZone
                    key={`${identityType}-front`}
                    label="Front Side"
                    hint="Image or PDF of the front side"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onFileSelect={handleIdentityFront}
                    existingFile={identityFrontDoc}
                    onRemoveExisting={() => removeUploadedFile("IDENTITY_FRONT")}
                    isRemoving={isDeleting}
                  />
                  <FileUploadZone
                    key={`${identityType}-back`}
                    label="Back Side"
                    hint="Image or PDF of the back side"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onFileSelect={handleIdentityBack}
                    existingFile={identityBackDoc}
                    onRemoveExisting={() => removeUploadedFile("IDENTITY_BACK")}
                    isRemoving={isDeleting}
                  />
                </div>

                {/* Single document / PDF — available for all identity types */}
                <FileUploadZone
                  key={`${identityType}-document`}
                  label={identityType === "citizenship" ? "Full Document (PDF)" : "Identity Document"}
                  hint="Image or PDF of your full identity document, under 5MB"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  maxSizeMB={5}
                  variant="document"
                  onFileSelect={handleIdentityDocument}
                  existingFile={identityDocumentDoc}
                  onRemoveExisting={() => removeUploadedFile("IDENTITY_DOCUMENT")}
                  isRemoving={isDeleting}
                />
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
                    <Input placeholder="Enter Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dobBs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth (BS)</FormLabel>
                  <FormControl>
                    <BsDatePicker value={field.value} onChange={field.onChange} />
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
                  <FormLabel>Date of Birth (AD)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto-filled from BS date"
                      readOnly
                      className="bg-muted text-muted-foreground"
                      {...field}
                    />
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
                    <Input placeholder="Enter Your Document Number" {...field} />
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
                    <Input placeholder="Enter Issued District" {...field} />
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
                    <BsDatePicker value={field.value} onChange={field.onChange} placeholder="YYYY-MM-DD" />
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
                existingFile={applicantPhotoDoc}
                onRemoveExisting={() => removeUploadedFile("APPLICANT_PHOTO")}
                isRemoving={isDeleting}
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
          <div className="flex items-center gap-3">
            {onSaveDraft && (
              <SaveDraftButton
                status={saveDraftStatus}
                onClick={() => onSaveDraft(form.getValues())}
              />
            )}
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
        </div>
      </form>
    </Form>
  );
}
