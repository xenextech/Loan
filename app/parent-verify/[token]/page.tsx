"use client";
import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  CheckCircle2,
  Clock,
  BookOpen,
  Banknote,
  Phone,
  Mail,
  GraduationCap,
  AlertCircle,
  UserPlus,
  Upload,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import {
  useGetApplicationByParentTokenQuery,
  useSubmitParentProfileMutation,
  useUploadParentSalarySheetMutation,
} from "@/lib/api/collegeApi";
import { formatNPR } from "@/lib/formatters";

const nepaliPhone = z
  .string()
  .optional()
  .refine((v) => !v || /^(\+977)?[0-9]{10}$/.test(v), { message: "Invalid phone number" });

const parentFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: nepaliPhone,
  contact: nepaliPhone,
  citizenshipNumber: z.string().optional(),
  salaryBankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});
type ParentFormValues = z.infer<typeof parentFormSchema>;

function FileUploadRow({
  label,
  hint,
  onUpload,
  isUploading,
  existingUrl,
}: {
  label: string;
  hint: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
  existingUrl?: string;
}) {
  return (
    <div className="border border-dashed border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
            {existingUrl && (
              <a
                href={existingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-0.5 inline-block"
              >
                View uploaded file
              </a>
            )}
          </div>
        </div>
        <label className="shrink-0">
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <Button type="button" variant="outline" size="sm" className="gap-1.5 cursor-pointer" asChild>
            <span>
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {existingUrl ? "Replace" : "Upload"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}

export default function ParentVerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data, isLoading, isError } = useGetApplicationByParentTokenQuery(token);
  const [submitProfile, { isLoading: isSubmittingProfile }] = useSubmitParentProfileMutation();
  const [uploadSalarySheet, { isLoading: isUploadingSS }] = useUploadParentSalarySheetMutation();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: data?.verification?.name ?? "",
      phone: data?.verification?.phone ?? "",
      contact: data?.verification?.contact ?? "",
      citizenshipNumber: data?.verification?.citizenshipNumber ?? "",
      salaryBankName: data?.verification?.salaryBankName ?? "",
      bankAccountNumber: data?.verification?.bankAccountNumber ?? "",
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid or Expired Link</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This verification link is no longer valid. Please ask the student to share a new link.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmitProfile = async (values: ParentFormValues) => {
    try {
      await submitProfile({ token, ...values }).unwrap();
      toast.success("Profile saved", {
        description: "Your information has been submitted successfully.",
      });
      setFormSubmitted(true);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleSalarySheetUpload = async (file: File) => {
    try {
      await uploadSalarySheet({ token, file }).unwrap();
      toast.success("Salary sheet uploaded");
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const appFields = [
    { icon: BookOpen, label: "Course / Program", value: data.courseName ?? "—" },
    { icon: GraduationCap, label: "Institution", value: data.boardUniversity ?? "—" },
    { icon: Clock, label: "Duration", value: data.courseDuration ?? "—" },
    {
      icon: Banknote,
      label: "Loan Amount Requested",
      value: data.loanAmount ? formatNPR(data.loanAmount) : "—"
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-white-bg.svg" alt="Cliq Edu Loan" width={140} height={40} />
          </Link>
          <Badge variant="outline" className="text-xs">Parent View</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Intro */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Education Loan Application</h1>
            <p className="text-sm text-muted-foreground">
              Your ward has submitted an education loan application. Review the details and fill in your information below.
            </p>
          </div>
          {/* Application summary */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="bg-muted/50 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">Application Number</p>
                <p className="text-base font-bold font-mono text-foreground">{data.applicationNumber}</p>
              </div>

              <Separator />

              {/* Student info */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Student Information
                </p>
                <div className="space-y-2">
                  {data.studentName && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="text-sm font-medium text-foreground">{data.studentName}</p>
                      </div>
                    </div>
                  )}
                  {data.email && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{data.email}</p>
                      </div>
                    </div>
                  )}
                  {data.phoneNumber && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{data.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Study & loan info */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Study & Loan Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {appFields.map((f) => (
                    <div key={f.label} className="bg-muted/40 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                      <p className="text-sm font-semibold text-foreground">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="mt-1 bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0 text-xs font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    Under Review
                  </Badge>
                </div>
                {data.submittedAt && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium mt-0.5">
                      {new Date(data.submittedAt).toLocaleDateString("en-NP", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parent profile form */}
          {formSubmitted ? (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">Information Submitted</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your details have been saved. You can still upload your salary sheet below.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Parent / Guardian Information</p>
                    <p className="text-xs text-muted-foreground">Please fill in your details to support the loan application.</p>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Ram Prasad Sharma" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+9779801234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alternate Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="+9779809876543" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="citizenshipNumber"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Citizenship Number</FormLabel>
                            <FormControl>
                              <Input placeholder="12-34-56789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Bank Information
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salaryBankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Nepal Bank Limited" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="0123456789012" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                     {/* Salary sheet upload */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Required Document</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload your latest salary sheet or income proof. PDF or image, max 5 MB.
                </p>
              </div>
              <FileUploadRow
                label="Salary Sheet / Income Proof"
                hint="Latest 3-month salary slip or bank statement"
                onUpload={handleSalarySheetUpload}
                isUploading={isUploadingSS}
                existingUrl={data.verification?.salarySheetPublicUrl}
              />
            </CardContent>
          </Card>

                    <Button type="submit" className="w-full gap-2" disabled={isSubmittingProfile}>
                      {isSubmittingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Submit Information
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

         

          <p className="text-xs text-center text-muted-foreground px-4 pb-4">
            This verification portal is provided by GenZ Loan. Data is encrypted and handled securely.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
