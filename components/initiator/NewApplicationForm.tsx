"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { useCreateNewInitiatorApplicationMutation } from "@/lib/api/initiatorApi";
import { applicantInfoSchema } from "./loan-assessment/schema";
import { DEFAULT_LOAN_ASSESSMENT_VALUES } from "./loan-assessment/constants";
import { Step1ApplicantInfo } from "./loan-assessment/steps/Step1ApplicantInfo";

// Same shape/validation as Step 1 of the full loan assessment form — reusing
// `Step1ApplicantInfo` here keeps this page's fields identical to the ones the
// initiator fills in for any other application, and identical to what
// CreateInitiatorApplicationDto actually accepts.
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
  const [createApplication, { isLoading }] = useCreateNewInitiatorApplicationMutation();

  const form = useForm<NewApplicationValues>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: { applicantInfo: DEFAULT_LOAN_ASSESSMENT_VALUES.applicantInfo },
    mode: "onBlur",
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createApplication(newApplicationSchema.parse(values).applicantInfo).unwrap();
      toast.success("Application created", { description: `Reference ${created.applicationNumber}` });
      router.push(`/initiator/applications/${created.id}`);
    } catch (err) {
      toast.error("Failed to create application", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  });

  return (
    <div className="p-6 lg:p-8 max-w-8xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground -ml-2 mb-3"
          onClick={() => router.push("/initiator/applications")}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Button>
        <h1 className="text-2xl font-bold text-foreground">New Application</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start a brand new loan application. Only Customer Name and Contact Number are required — you can fill in
          the rest of the credit appraisal on the next screen.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <Form {...form}>
          <div className="space-y-5">
            <Step1ApplicantInfo />

            <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-sm">
              <Button type="button" variant="outline" size="sm" onClick={() => router.push("/initiator/applications")} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="button" size="sm" className="gap-1.5" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isLoading ? "Creating…" : "Create Application"}
              </Button>
            </div>
          </div>
        </Form>
      </motion.div>
    </div>
  );
}
