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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  Banknote,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import {
  useGetApplicationByCollegeTokenQuery,
  useSubmitCollegeFormMutation,
  useUploadOfferLetterMutation,
  useUploadEnrollmentDocsMutation,
} from "@/lib/api/collegeApi";
import { formatNPR } from "@/lib/formatters";
import { useCurrentUser } from "@/lib/hooks";

const collegeFormSchema = z.object({
  collegeName: z.string().min(1, "College name is required"),
  collegeEmail: z.string().email("Enter a valid email"),
  contactPerson: z.string().min(1, "Contact person is required"),
  contactPhone: z.string().optional(),
  isApplicationVerified: z.boolean(),
  verificationNotes: z.string().optional(),
});
type CollegeFormValues = z.infer<typeof collegeFormSchema>;

function FileUploadRow({
  label,
  hint,
  accept,
  onUpload,
  isUploading,
  existingUrl,
}: {
  label: string;
  hint: string;
  accept: string;
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
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            asChild
          >
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

export default function CollegeVerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const currentUser = useCurrentUser();
  const { data, isLoading, isError } =
    useGetApplicationByCollegeTokenQuery(token);
  const [submitForm, { isLoading: isSubmittingForm }] =
    useSubmitCollegeFormMutation();
  const [uploadOfferLetter, { isLoading: isUploadingOL }] =
    useUploadOfferLetterMutation();
  const [uploadEnrollment, { isLoading: isUploadingEnroll }] =
    useUploadEnrollmentDocsMutation();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<CollegeFormValues>({
    resolver: zodResolver(collegeFormSchema),
    defaultValues: {
      collegeName: data?.verification?.collegeName ?? "",
      collegeEmail: data?.verification?.collegeEmail ?? "",
      contactPerson: data?.verification?.contactPerson ?? "",
      contactPhone: data?.verification?.contactPhone ?? "",
      isApplicationVerified: data?.verification?.isApplicationVerified ?? false,
      verificationNotes: data?.verification?.verificationNotes ?? "",
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-64 w-full rounded-2xl" />
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
          <h1 className="text-xl font-bold text-foreground mb-2">
            Invalid or Expired Link
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            This verification link is no longer valid. Please contact the loan
            applicant for a new link.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmitForm = async (values: CollegeFormValues) => {
    try {
      await submitForm({ token, ...values }).unwrap();
      toast.success("Verification submitted", {
        description: "Your college verification has been saved successfully.",
      });
      setFormSubmitted(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  };

  const handleFileUpload = async (
    type: "offer-letter" | "enrollment-docs",
    file: File,
  ) => {
    try {
      if (type === "offer-letter") {
        await uploadOfferLetter({ token, file }).unwrap();
        toast.success("Offer letter uploaded");
      } else {
        await uploadEnrollment({ token, file }).unwrap();
        toast.success("Enrollment document uploaded");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo-white-bg.svg"
              alt="Cliq Edu Loan"
              width={140}
              height={40}
            />
          </Link>
          <Badge variant="outline" className="text-xs">
            College Verification
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Intro */}
          <div className="text-center mb-8">
            <h1 className="max-w-4xl text-2xl font-bold text-foreground text-center">
              Please review the student&apos;s application and complete the
              loan request verification below.
            </h1>
          </div>

          {/* Account CTA — adapts based on auth state */}
          {currentUser?.role === "COLLEGE" ? (
            <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3.5 mb-4">
              <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-teal-900">
                  Signed in as {currentUser.email}
                </p>
                <p className="text-xs text-teal-700 mt-0.5">
                  You&apos;re logged in with a college account. Verifications
                  you submit here will appear in your dashboard.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="shrink-0 border-teal-300 text-teal-700 hover:bg-teal-100"
              >
                <Link href="/college">
                  Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                </Link>
              </Button>
            </div>
          ) : currentUser?.role === "ADMIN" ? null : (
            <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3.5 mb-4">
              <UserPlus className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-teal-900">
                  Need a college portal account?
                </p>
                <p className="text-xs text-teal-700 mt-0.5">
                  Register a college account to manage verifications and track
                  all loan applications from your institution.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="shrink-0 border-teal-300 text-teal-700 hover:bg-teal-100"
              >
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Application summary */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="bg-muted/50 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Application Number
                </p>
                <p className="text-base font-bold font-mono text-foreground">
                  {data.applicationNumber}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: GraduationCap,
                    label: "Student",
                    value: data.studentName ?? "—",
                  },
                  {
                    icon: BookOpen,
                    label: "Course",
                    value: data.courseName ?? "—",
                  },
                  {
                    icon: GraduationCap,
                    label: "Institution",
                    value: data.boardUniversity ?? "—",
                  },
                  {
                    icon: Banknote,
                    label: "Loan Amount",
                    value: data.loanAmount
                      ? formatNPR(Number(data.loanAmount))
                      : "—",
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-muted/40 rounded-xl px-3 py-2.5"
                  >
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {f.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0 text-xs font-semibold">
                  <Clock className="w-3 h-3 mr-1" />
                  Under Review
                </Badge>
                {data.submittedAt && (
                  <span className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {new Date(data.submittedAt).toLocaleDateString("en-NP", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification form */}
          {formSubmitted ? (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">
                  Verification Submitted
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your verification details have been saved. You can still
                  upload documents below.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-foreground mb-5">
                  College Information & Verification
                </p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitForm)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="collegeName"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>College / Institution Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tribhuvan University"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="collegeEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Official Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="admissions@college.edu.np"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="01-XXXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Contact Person Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name of registrar / admissions officer"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="isApplicationVerified"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
                          <div>
                            <FormLabel className="text-sm font-semibold cursor-pointer">
                              Confirm student enrollment
                            </FormLabel>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              I confirm this student is enrolled / admitted at
                              our institution
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="verificationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes about the student's enrollment or application…"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Card className="shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Required Documents
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Upload the documents requested by the loan officer.
                            PDF or image files, max 5 MB each.
                          </p>
                        </div>
                        <FileUploadRow
                          label="Offer Letter"
                          hint="Official admission / offer letter from the institution"
                          accept=".pdf,.doc,.docx,image/*"
                          onUpload={(f) => handleFileUpload("offer-letter", f)}
                          isUploading={isUploadingOL}
                          existingUrl={data.verification?.offerLetterPublicUrl}
                        />
                        <FileUploadRow
                          label="Enrollment Documents"
                          hint="Proof of enrollment, registration card, or ID card"
                          accept=".pdf,.doc,.docx,image/*"
                          onUpload={(f) =>
                            handleFileUpload("enrollment-docs", f)
                          }
                          isUploading={isUploadingEnroll}
                          existingUrl={
                            data.verification?.enrollmentDocPublicUrl
                          }
                        />
                      </CardContent>
                    </Card>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isSubmittingForm}
                    >
                      {isSubmittingForm ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Submit Verification
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Document uploads */}

          <p className="text-xs text-center text-muted-foreground px-4 pb-4">
            This verification portal is provided by Unnati. Data is encrypted
            and handled securely.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
