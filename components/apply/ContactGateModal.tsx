"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, CheckCircle2, Loader2, ArrowRight, SkipForward, Mail } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type EmailForm = z.infer<typeof emailSchema>;

export interface ContactEmails {
  parentEmail?: string;
  collegeEmail?: string;
}

interface ContactGateModalProps {
  isOpen: boolean;
  onComplete: (emails: ContactEmails) => void;
}

type GateStep = "parent" | "college";

const STEPS: { key: GateStep; label: string; icon: React.ElementType; color: string; bgColor: string; description: string; placeholder: string }[] = [
  {
    key: "parent",
    label: "Parent / Guardian",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    placeholder: "parent@example.com",
    description:
      "Enter your parent or guardian's email address. We'll send them a secure link so they can view and verify your application themselves.",
  },
  {
    key: "college",
    label: "College / Institution",
    icon: GraduationCap,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    placeholder: "admissions@college.edu.np",
    description:
      "Enter your college or institution's email address. They'll receive a secure link to upload the offer letter and enrollment documents.",
  },
];

function ContactEmailForm({
  step,
  onSubmit,
  onSkip,
}: {
  step: (typeof STEPS)[number];
  onSubmit: (email: string) => void;
  onSkip: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: EmailForm) => {
    setIsSubmitting(true);
    onSubmit(data.email);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={step.placeholder}
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                A secure verification link will be sent to this address. They'll create their own account.
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-muted-foreground"
            onClick={onSkip}
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip for now
          </Button>
          <Button type="submit" size="sm" className="flex-1 gap-1.5" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Send Link
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function ContactGateModal({ isOpen, onComplete }: ContactGateModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [collectedEmails, setCollectedEmails] = useState<ContactEmails>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStep = STEPS[stepIndex];

  const advance = (email?: string) => {
    const updated = { ...collectedEmails };
    if (email) {
      if (currentStep.key === "parent") updated.parentEmail = email;
      else updated.collegeEmail = email;
      setCompletedSteps((p) => [...p, currentStep.key]);
    }
    setCollectedEmails(updated);

    if (stepIndex + 1 < STEPS.length) {
      setStepIndex((i) => i + 1);
    } else {
      onComplete(updated);
      // reset for next open
      setStepIndex(0);
      setCollectedEmails({});
      setCompletedSteps([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onComplete(collectedEmails); }}>
      <DialogContent className="max-w-md">
        {/* Step indicator */}
        <div className="flex gap-2 mb-1">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  completedSteps.includes(s.key)
                    ? "bg-green-500 text-white"
                    : i === stepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {completedSteps.includes(s.key) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 ${i < stepIndex ? "bg-green-400" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            <DialogHeader className="mt-2">
              <div className="flex items-center gap-2.5 mb-1">
                <div className={`w-9 h-9 rounded-xl ${currentStep.bgColor} flex items-center justify-center`}>
                  <currentStep.icon className={`w-5 h-5 ${currentStep.color}`} />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-0.5">
                    Step {stepIndex + 1} of {STEPS.length}
                  </Badge>
                  <DialogTitle className="text-base leading-tight">
                    {currentStep.label}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-sm leading-relaxed">
                {currentStep.description}
              </DialogDescription>
            </DialogHeader>

            <ContactEmailForm
              key={currentStep.key}
              step={currentStep}
              onSubmit={(email) => advance(email)}
              onSkip={() => advance()}
            />
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
