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
  Upload,
  FileText,
  Loader2,
  Users,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  useGetApplicationByParentTokenQuery,
  useSubmitParentProfileMutation,
  useUploadParentSalarySheetMutation,
  useUploadParentIdentityDocumentMutation,
  useUpdateParentDocumentLabelMutation,
  type ParentIdentityDocumentType,
} from "@/lib/api/collegeApi";
import { formatNPR } from "@/lib/formatters";
import type { ParentDocument } from "@/types/api";
import VerificationEmailGate from "@/components/apply/VerificationEmailGate";

const nepaliPhone = z
  .string()
  .optional()
  .refine((v) => !v || /^(\+977)?[0-9]{10}$/.test(v), {
    message: "Invalid phone number",
  });

const parentFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: nepaliPhone,
  contact: nepaliPhone,
  citizenshipNumber: z.string().optional(),
  salaryBankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});
type ParentFormValues = z.infer<typeof parentFormSchema>;

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number") return `Request failed with status ${status}. Please try again.`;
  }
  return "Something went wrong. Please try again.";
}

// Inline click-to-edit label — used for every uploaded document (identity
// docs and salary sheets alike) since the backend lets the parent rename any of them.
function DocumentLabel({
  token,
  email,
  documentId,
  label,
  fallback,
}: {
  token: string;
  email?: string;
  documentId: string;
  label?: string | null;
  fallback: string;
}) {
  const [updateLabel, { isLoading }] = useUpdateParentDocumentLabelMutation();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label ?? "");

  const handleSave = async () => {
    if (!value.trim()) return;
    try {
      await updateLabel({ token, email, documentId, label: value.trim() }).unwrap();
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update label", { description: getApiErrorMessage(err) });
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-7 text-xs w-40"
          autoFocus
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => {
            setEditing(false);
            setValue(label ?? "");
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group"
    >
      {label || fallback}
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
    </button>
  );
}

// NID / PAN ID — exactly one document each, re-uploading replaces the previous file.
function IdentityDocumentCard({
  token,
  email,
  documentType,
  title,
  hint,
  document,
}: {
  token: string;
  email?: string;
  documentType: ParentIdentityDocumentType;
  title: string;
  hint: string;
  document?: ParentDocument;
}) {
  const [uploadDoc, { isLoading }] = useUploadParentIdentityDocumentMutation();

  const handleUpload = async (file: File) => {
    try {
      await uploadDoc({ token, email, documentType, file }).unwrap();
      toast.success(`${title} uploaded`);
    } catch (err) {
      toast.error("Upload failed", { description: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="border border-dashed border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
            {document && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <a
                  href={document.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View uploaded file
                </a>
                <span className="text-muted-foreground text-xs">·</span>
                <DocumentLabel
                  token={token}
                  email={email}
                  documentId={document.id}
                  label={document.label}
                  fallback={title}
                />
              </div>
            )}
          </div>
        </div>
        <label className="shrink-0">
          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            disabled={isLoading}
            asChild
          >
            <span>
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {document ? "Replace" : "Upload"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}

// Salary sheets — any number of documents, never overwritten. Parents can
// upload several at once and label each one individually afterwards.
function SalarySheetSection({
  token,
  email,
  documents,
}: {
  token: string;
  email?: string;
  documents: ParentDocument[];
}) {
  const [uploadSheets, { isLoading }] = useUploadParentSalarySheetMutation();
  const [pendingLabel, setPendingLabel] = useState("");

  const handleUpload = async (files: FileList) => {
    try {
      await uploadSheets({
        token,
        email,
        files: Array.from(files),
        label: pendingLabel.trim() || undefined,
      }).unwrap();
      toast.success(
        files.length > 1 ? "Salary sheets uploaded" : "Salary sheet uploaded",
      );
      setPendingLabel("");
    } catch (err) {
      toast.error("Upload failed", { description: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-3">
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 border border-border rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <DocumentLabel
                  token={token}
                  email={email}
                  documentId={doc.id}
                  label={doc.label}
                  fallback={`Salary Sheet ${i + 1}`}
                />
              </div>
              <a
                href={doc.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline shrink-0"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Add Salary Sheet{documents.length > 0 ? "(s)" : ""}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            PDF or image, max 5 MB each. You can select multiple files at once,
            and previously uploaded sheets are kept.
          </p>
        </div>
        <Input
          placeholder="Optional label (e.g. March Salary)"
          value={pendingLabel}
          onChange={(e) => setPendingLabel(e.target.value)}
          className="h-9 text-sm"
        />
        <label className="block">
          <input
            type="file"
            accept=".pdf,image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer w-full"
            disabled={isLoading}
            asChild
          >
            <span>
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {isLoading ? "Uploading…" : "Choose file(s)"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}

export default function ParentVerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  // isLoading (not isFetching) is what should gate the full-page skeleton —
  // isFetching is also true on every background refetch (e.g. after a salary
  // sheet/identity document upload invalidates this query's tag), which was
  // blowing away the whole rendered form and looking like a page refresh on
  // every upload. isLoading only means "no data yet", so an in-place refetch
  // just updates data quietly once it resolves.
  const { data, isLoading, error } = useGetApplicationByParentTokenQuery(
    { token, email: confirmedEmail ?? undefined },
    { skip: !confirmedEmail },
  );
  const [submitProfile, { isLoading: isSubmittingProfile }] =
    useSubmitParentProfileMutation();
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

  // Nothing about the application is fetched (let alone shown) until the
  // recipient confirms the email that received this invitation. A failed
  // attempt (wrong email, expired/invalid/revoked link) returns to this same
  // gate with the error shown, so a mistyped email can just be corrected.
  if (!confirmedEmail || error) {
    return (
      <VerificationEmailGate
        recipientLabel="Parent"
        isLoading={isLoading}
        error={error ? getApiErrorMessage(error) : null}
        onConfirm={(email) => setConfirmedEmail(email)}
      />
    );
  }

  if (isLoading || !data) {
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

  const onSubmitProfile = async (values: ParentFormValues) => {
    // Optional fields must be omitted (not sent as "") — the backend's
    // @IsOptional() only skips validation for null/undefined, so an empty
    // string still fails the phone-format check and effectively becomes required.
    const payload = {
      ...values,
      phone: values.phone || undefined,
      contact: values.contact || undefined,
      citizenshipNumber: values.citizenshipNumber || undefined,
      salaryBankName: values.salaryBankName || undefined,
      bankAccountNumber: values.bankAccountNumber || undefined,
    };
    try {
      await submitProfile({
        token,
        email: confirmedEmail ?? undefined,
        ...payload,
      }).unwrap();
      toast.success("Profile saved", {
        description: "Your information has been submitted successfully.",
      });
      setFormSubmitted(true);
    } catch (err) {
      toast.error("Failed to save", { description: getApiErrorMessage(err) });
    }
  };

  const documents = data.documents ?? [];
  const nidDocument = documents.find((d) => d.documentType === "NID");
  const panDocument = documents.find((d) => d.documentType === "PAN_ID");
  const salarySheets = documents.filter(
    (d) => d.documentType === "SALARY_SHEET",
  );

  const appFields = [
    {
      icon: BookOpen,
      label: "Course / Program",
      value: data.courseName ?? "—",
    },
    {
      icon: GraduationCap,
      label: "Institution",
      value: data.boardUniversity ?? "—",
    },
    { icon: Clock, label: "Duration", value: data.courseDuration ?? "—" },
    {
      icon: Banknote,
      label: "Loan Amount Requested",
      value: data.loanAmount ? formatNPR(data.loanAmount) : "—",
    },
  ];

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
            Parent View
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
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Education Loan Application
            </h1>
            <p className="text-sm text-muted-foreground">
              Your ward has submitted an education loan application. Review the
              details and fill in your information below.
            </p>
          </div>
          {/* Application summary */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Application Number
                  </p>
                  <p className="text-base font-bold font-mono text-foreground">
                    {data.applicationNumber}
                  </p>
                </div>
                {data.verificationCode && (
                  <div className="bg-muted/50 rounded-xl px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Verification ID
                    </p>
                    <p className="text-base font-bold font-mono text-foreground">
                      {data.verificationCode}
                    </p>
                  </div>
                )}
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
                        <p className="text-xs text-muted-foreground">
                          Full Name
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {data.studentName}
                        </p>
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
                        <p className="text-sm font-medium text-foreground">
                          {data.email}
                        </p>
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
                        <p className="text-sm font-medium text-foreground">
                          {data.phoneNumber}
                        </p>
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
                    <div
                      key={f.label}
                      className="bg-muted/40 rounded-xl px-3 py-2.5"
                    >
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {f.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {f.value}
                      </p>
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
                <p className="font-semibold text-foreground">
                  Information Submitted
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your details have been saved. You can still upload documents
                  below.
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
                    <p className="text-sm font-semibold text-foreground">
                      Parent / Guardian Information
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please fill in your details to support the loan
                      application.
                    </p>
                  </div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitProfile)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ram Prasad Sharma"
                                {...field}
                              />
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
                            <FormLabel>
                              Alternate Contact{" "}
                              <span className="text-muted-foreground font-normal">
                                (Optional)
                              </span>
                            </FormLabel>
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
                              <Input
                                placeholder="Nepal Bank Limited"
                                {...field}
                              />
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
 {/* Documents — always available, independent of profile submission */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Required Documents
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload your identity documents and salary sheet(s). Labels
                  can be edited any time — click a document&apos;s name to rename it.
                </p>
              </div>

              <IdentityDocumentCard
                token={token}
                email={confirmedEmail ?? undefined}
                documentType="NID"
                title="National ID / Citizenship"
                hint="Front and back in a single file, or the citizenship certificate"
                document={nidDocument}
              />

              <IdentityDocumentCard
                token={token}
                email={confirmedEmail ?? undefined}
                documentType="PAN_ID"
                title="PAN Card"
                hint="Permanent Account Number card"
                document={panDocument}
              />

              <Separator />

              <SalarySheetSection
                token={token}
                email={confirmedEmail ?? undefined}
                documents={salarySheets}
              />
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground px-4 pb-4">
            This verification portal is provided by Unnati. Data is encrypted
            and handled securely.
          </p>
                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isSubmittingProfile}
                    >
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

         
        </motion.div>
      </main>
    </div>
  );
}
