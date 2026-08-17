"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { step1Schema, type Step1FormData } from "@/lib/validations/schemas";
import LoanAmountField, { INTEREST_RATE, getMonthsFromDuration } from "@/components/apply/fields/LoanAmountField";
import { formatNPR, calculateEMI } from "@/lib/formatters";
import { ArrowRight, Loader2, User, BookOpen, Wallet, School } from "lucide-react";

interface Step1Props {
  defaultValues?: Partial<Step1FormData>;
  onNext: (data: Step1FormData) => void;
  onDataChange?: (data: Partial<Step1FormData>) => void;
  isSaving?: boolean;
}

const STUDY_TYPES = [
  { value: "program", label: "Degree Program" },
  { value: "course", label: "Short Course" },
  { value: "diploma", label: "Diploma" },
  { value: "certification", label: "Certification" },
];

const DURATIONS = [
  "6 Months", "1 Year", "1.5 Years", "2 Years", "2.5 Years",
  "3 Years", "4 Years", "5 Years", "6 Years",
];

const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
  </div>
);

export default function Step1AboutYou({ defaultValues, onNext, onDataChange, isSaving }: Step1Props) {
  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      studyType: undefined,
      courseName: "",
      collegeName: "",
      boardUniversity: "",
      courseDuration: "",
      loanAmount: 100000,
      ...defaultValues,
    },
  });

  const watchedValues = form.watch();
  useEffect(() => {
    onDataChange?.(watchedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  // College Marketplace prefill data arrives asynchronously, after this form
  // has already mounted with empty defaultValues — react-hook-form only
  // reads defaultValues once at init, so a plain prop change wouldn't reach
  // the live field values. Reset once, the moment collegeId first appears.
  const appliedPrefillRef = useRef(false);
  useEffect(() => {
    if (defaultValues?.collegeId && !appliedPrefillRef.current) {
      appliedPrefillRef.current = true;
      form.reset((prev) => ({ ...prev, ...defaultValues }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const loanAmount = form.watch("loanAmount");
  const courseDuration = form.watch("courseDuration");
  const isPrefilled = Boolean(defaultValues?.collegeId);

  const handleSubmit = form.handleSubmit((data) => {
    const months = getMonthsFromDuration(data.courseDuration);
    const emi = calculateEMI(data.loanAmount, INTEREST_RATE, months);
    onNext({ ...data, estimatedEmi: emi });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Personal Information */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeading icon={User} title="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="As on citizenship certificate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+977-98XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </motion.div>

        {/* Study Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between gap-3 mb-6 -mt-6">
            <SectionHeading icon={BookOpen} title="Study Details" />
            {isPrefilled && (
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <School className="w-3 h-3" />
                  From College Marketplace
                </Badge>
                <Link
                  href="/dashboard/college"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change college
                </Link>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="studyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
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
              name="courseDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={isPrefilled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
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
              name="courseName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Course / Program Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Bachelor of Computer Engineering"
                      disabled={isPrefilled}
                      className={isPrefilled ? "bg-muted/50" : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegeName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>College Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Kathmandu College of Management"
                      disabled={isPrefilled}
                      className={isPrefilled ? "bg-muted/50" : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="boardUniversity"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Board / University</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Tribhuvan University"
                      disabled={isPrefilled}
                      className={isPrefilled ? "bg-muted/50" : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPrefilled && defaultValues?.tuitionFee !== undefined && (
              <FormItem className="sm:col-span-2">
                <FormLabel>Tuition Fee</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    className="bg-muted/50"
                    value={formatNPR(defaultValues.tuitionFee)}
                    readOnly
                  />
                </FormControl>
              </FormItem>
            )}
          </div>
        </motion.div>

        {/* Loan Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeading icon={Wallet} title="Loan Details" />
          <LoanAmountField
            value={loanAmount}
            onChange={(v) => form.setValue("loanAmount", v, { shouldValidate: true })}
            courseDuration={courseDuration}
            error={form.formState.errors.loanAmount?.message}
          />
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="h-12 px-8 text-base font-semibold shadow-sm hover:shadow-md transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Continue
              </>
            )}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
