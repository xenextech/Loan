"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCreateNewInitiatorApplicationMutation, useCreateInitiatorApplicationMutation } from "@/lib/api/initiatorApi";
import { useUploadDocumentMutation } from "@/lib/api/documentsApi";
import { applicantInfoSchema, type LoanAssessmentFormValues } from "./loan-assessment/schema";
import { DEFAULT_LOAN_ASSESSMENT_VALUES } from "./loan-assessment/constants";
import { Step1ApplicantInfo } from "./loan-assessment/steps/Step1ApplicantInfo";
import { NewApplicationDetailsForm, type StagedDocuments } from "./new-application-details/NewApplicationDetailsForm";
import type { NewApplicationDetailsSubmitValues } from "./new-application-details/schema";
import type { DocumentType } from "@/types/api";

// Same shape/validation as Step 1 of the full loan assessment form — reusing
// `Step1ApplicantInfo` here keeps this page's fields identical to the ones the
// initiator fills in for any other application, and identical to what
// CreateInitiatorApplicationDto (the per-id credit-appraisal endpoint) accepts.
const newApplicationSchema = z.object({ applicantInfo: applicantInfoSchema });
type NewApplicationValues = z.input<typeof newApplicationSchema>;

function getApiErrorMessage(err: unknown): string | undefined {
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

export function NewApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "applicant">("details");
  const [createdApplication, setCreatedApplication] = useState<{ id: string; applicationNumber: string } | null>(null);

  const [createNewApplication, { isLoading: isCreating }] = useCreateNewInitiatorApplicationMutation();
  const [createInitiatorApplication, { isLoading: isAttaching }] = useCreateInitiatorApplicationMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const isSubmitting = isCreating || isAttaching;

  const form = useForm<NewApplicationValues>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: { applicantInfo: DEFAULT_LOAN_ASSESSMENT_VALUES.applicantInfo },
    mode: "onBlur",
  });

  const handleDetailsSubmit = async (details: NewApplicationDetailsSubmitValues, documents: StagedDocuments) => {
    try {
      const created = await createNewApplication(details).unwrap();
      setCreatedApplication(created);

      // Uploads are optional and best-effort — a failed upload shouldn't block
      // moving on to the credit-appraisal step; the initiator can re-upload
      // later from the application's document review workspace.
      const uploads = await Promise.allSettled(
        Object.entries(documents).map(([documentType, file]) =>
          uploadDocument({ applicationId: created.id, documentType: documentType as DocumentType, file: file as File }).unwrap(),
        ),
      );
      const failedCount = uploads.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        toast.warning(`${failedCount} document${failedCount > 1 ? "s" : ""} failed to upload`, {
          description: "You can re-upload them later from the application's review page.",
        });
      }

      // Pre-fill Step 2 (Applicant Info) from the details form
      form.reset({
        applicantInfo: {
          ...DEFAULT_LOAN_ASSESSMENT_VALUES.applicantInfo,
          customerName: details.fullName,
          contactNumber: details.phoneNumber,
          citizenshipNumber: details.identityType === "CITIZENSHIP" ? details.identityNumber || "" : "",
          citizenshipIssuedDate: details.identityType === "CITIZENSHIP" ? details.issuedDate || "" : "",
          citizenshipIssuedPlace: details.identityType === "CITIZENSHIP" ? details.issuedDistrict || "" : "",
          nationalId: details.identityType === "NATIONAL_ID" ? details.identityNumber || "" : "",
          pan: details.identityType === "PAN_NUMBER" ? details.identityNumber || "" : "",
          license: details.identityType === "DRIVING_LICENSE" ? details.identityNumber || "" : "",
          permanentAddress: [
            details.province,
            details.district,
            details.municipality,
            details.ward ? `Ward ${details.ward}` : "",
          ]
            .filter(Boolean)
            .join(", "),
        },
      });

      toast.success("Application created", {
        description: `Reference ${created.applicationNumber}. Please complete the applicant/credit details.`,
      });
      setStep("applicant");
    } catch (err) {
      toast.error("Failed to create application", {
        description: getApiErrorMessage(err) ?? "Please try again.",
      });
    }
  };

  const handleApplicantSubmit = form.handleSubmit(async (values) => {
    if (!createdApplication) {
      toast.error("No active application context", {
        description: "Please complete application details first.",
      });
      setStep("details");
      return;
    }
    try {
      await createInitiatorApplication({
        applicationId: createdApplication.id,
        data: values.applicantInfo,
      }).unwrap();

      toast.success("Application completed successfully");
      router.push("/initiator");
    } catch (err) {
      toast.error("Failed to complete application", {
        description: getApiErrorMessage(err) ?? "Please try again.",
      });
    }
  });

  return (
    <div className="p-6 lg:p-8 max-w-8xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground -ml-2 mb-3"
          onClick={() => (step === "details" ? router.push("/initiator/applications") : setStep("details"))}
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" /> {step === "details" ? "Back to Applications" : "Back to Details"}
        </Button>
        <h1 className="text-2xl font-bold text-foreground">New Application</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === "details"
            ? "Fill in the applicant's personal, study, identity and family details, then click next to create the application."
            : "Complete the credit appraisal basic/kyc details for the created application."}
        </p>
      </motion.div>

      {step === "details" ? (
        <NewApplicationDetailsForm
          onSubmit={handleDetailsSubmit}
          onBack={() => router.push("/initiator/applications")}
          isSubmitting={isSubmitting}
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Form {...form}>
            <div className="space-y-5">
              <Step1ApplicantInfo />

              <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/initiator/applications")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" className="gap-1.5" onClick={handleApplicantSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isSubmitting ? "Completing…" : "Complete Application"}
                </Button>
              </div>
            </div>
          </Form>
        </motion.div>
      )}
    </div>
  );
}
