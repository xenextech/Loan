"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUploadDocumentMutation } from "@/lib/api/documentsApi";
import { useAppSelector } from "@/lib/hooks";
import type { DocumentType } from "@/types/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { step3Schema, type Step3FormData } from "@/lib/validations/schemas";
import FileUploadZone from "@/components/apply/fields/FileUploadZone";
import { ArrowRight, ArrowLeft, Loader2, Users, GraduationCap, Receipt, Heart, Info } from "lucide-react";

interface Step3Props {
  defaultValues?: Partial<Step3FormData>;
  onNext: (data: Step3FormData) => void;
  onPrev: () => void;
  onDataChange?: (data: Partial<Step3FormData>) => void;
  isSaving?: boolean;
}

const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
  </div>
);

const FEE_OPTIONS = [
  { value: "upload", label: "Upload Document", desc: "PDF, DOC, DOCX of fee structure" },
  { value: "website", label: "Website Link", desc: "URL to institution's fee page" },
  { value: "manual", label: "Manual Entry", desc: "Enter total fee amount" },
];

export default function Step3FamilyEducation({
  defaultValues,
  onNext,
  onPrev,
  onDataChange,
  isSaving,
}: Step3Props) {
  const applicationId = useAppSelector((s) => s.application.applicationId);
  const [uploadDocument] = useUploadDocumentMutation();

  const uploadFile = async (file: File, documentType: DocumentType) => {
    if (!applicationId) { toast.error("No active application. Please refresh."); return; }
    try {
      await uploadDocument({ applicationId, documentType, file }).unwrap();
    } catch {
      toast.error(`Failed to upload ${documentType.replace(/_/g, " ").toLowerCase()}`);
    }
  };

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      fatherName: "",
      motherName: "",
      grandfatherName: "",
      maritalStatus: undefined,
      spouseName: "",
      expectedSalary: "",
      feeStructureType: undefined,
      feeWebsiteLink: "",
      feeManualAmount: "",
      ...defaultValues,
    },
  });

  const maritalStatus = form.watch("maritalStatus");
  const feeType = form.watch("feeStructureType");
  const watchedValues = form.watch();

  useEffect(() => {
    onDataChange?.(watchedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-10">
        {/* Family Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeading icon={Users} title="Family Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="fatherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father&apos;s Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother&apos;s Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grandfatherName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Grandfather&apos;s Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Paternal grandfather's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </motion.div>

        {/* Marital Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
        >
          <SectionHeading icon={Heart} title="Marital Status" />
          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence>
            {maritalStatus === "married" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <FormField
                  control={form.control}
                  name="spouseName"
                  render={({ field }) => (
                    <FormItem className="max-w-sm">
                      <FormLabel>Spouse&apos;s Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of spouse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5">
            <FormField
              control={form.control}
              name="expectedSalary"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>Expected Monthly Salary (NPR)</FormLabel>
                  <FormControl>
                    <Input placeholder="After graduation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </motion.div>

        {/* Academic Records */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <SectionHeading icon={GraduationCap} title="Academic Records" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload your latest academic transcripts, marksheets, or certificates.
          </p>
          <FileUploadZone
            label="Academic Records"
            hint="Transcripts, marksheets, certificates · PDF, DOC, DOCX"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxSizeMB={10}
            onFileSelect={(file) => { if (file) uploadFile(file, "ACADEMIC_RECORD"); }}
          />
        </motion.div>

        {/* Fee Structure */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <SectionHeading icon={Receipt} title="Fee Structure" />
          <p className="text-sm text-muted-foreground mb-4">
            How would you like to provide the course fee structure?
          </p>

          <FormField
            control={form.control}
            name="feeStructureType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
                  >
                    {FEE_OPTIONS.map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={`fee-${opt.value}`}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          field.value === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <RadioGroupItem value={opt.value} id={`fee-${opt.value}`} className="mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence mode="wait">
            {feeType === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <FileUploadZone
                  label="Fee Structure Document"
                  hint="Upload fee breakdown from institution"
                  accept=".pdf,.doc,.docx"
                  onFileSelect={(file) => { if (file) uploadFile(file, "FEE_STRUCTURE"); }}
                />
              </motion.div>
            )}
            {feeType === "website" && (
              <motion.div
                key="website"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <FormField
                  control={form.control}
                  name="feeWebsiteLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Page URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://college.edu.np/fees"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
            {feeType === "manual" && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <FormField
                  control={form.control}
                  name="feeManualAmount"
                  render={({ field }) => (
                    <FormItem className="max-w-sm">
                      <FormLabel>Total Course Fee (NPR)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1200000" inputMode="numeric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* College documents notice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Offer letter &amp; enrollment documents
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your institution will provide the admission offer letter and enrollment documents directly
                through the GenZ Loan College Portal. You do not need to upload these yourself — your
                college will verify your enrollment and submit the required documents on your behalf.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" size="lg" className="h-12 px-6" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="submit" size="lg" disabled={isSaving} className="h-12 px-8 text-base font-semibold">
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
