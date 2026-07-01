"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PillSelector } from "@/components/ui/pill-selector";
import { ClipboardCheck, Loader2 } from "lucide-react";
import {
  initiatorVerificationSchema,
  type InitiatorVerificationFormValues,
  CREDIT_FACILITY_SIZE_OPTIONS,
  DSGIR_OPTIONS,
  COLLEGE_OPERATION_OPTIONS,
  INSTITUTION_PERFORMANCE_OPTIONS,
  PARENT_BORROWING_OPTIONS,
  INCOME_SOURCE_OPTIONS,
} from "../schema/initiatorVerificationSchema";
import type { InitiatorVerificationData } from "../types/initiator";

export default function InitiatorForm({
  defaultValues,
}: {
  defaultValues?: InitiatorVerificationData;
}) {
  const form = useForm<InitiatorVerificationFormValues>({
    resolver: zodResolver(initiatorVerificationSchema),
    defaultValues: {
      creditFacilitySize: defaultValues?.creditFacilitySize,
      dsgir: defaultValues?.dsgir,
      collegeOperation: defaultValues?.collegeOperation,
      institutionPerformance: defaultValues?.institutionPerformance,
      parentsBorrowings: defaultValues?.parentsBorrowings,
      sourceOfIncome: defaultValues?.sourceOfIncome,
      remarks: defaultValues?.remarks ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: InitiatorVerificationFormValues) => {
    // Backend endpoint not implemented yet — this is UI-only for now.
    await new Promise((r) => setTimeout(r, 400));
    toast.info("Initiator verification captured", {
      description: "Backend integration is pending — this submission was not saved.",
    });
    console.log("Initiator verification (mock submit):", values);
  };

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-3.5 border-b border-border">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <ClipboardCheck className="w-3.5 h-3.5" />
          Initiator Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="creditFacilitySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Facility Size</FormLabel>
                  <FormControl>
                    <PillSelector
                      options={CREDIT_FACILITY_SIZE_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dsgir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DSGIR</FormLabel>
                  <FormControl>
                    <PillSelector
                      options={DSGIR_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collegeOperation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation of College</FormLabel>
                  <FormControl>
                    <PillSelector
                      options={COLLEGE_OPERATION_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institutionPerformance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satisfactory Performance with Institution</FormLabel>
                  <FormControl>
                    <PillSelector
                      options={INSTITUTION_PERFORMANCE_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentsBorrowings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parents Borrowings with BFIs</FormLabel>
                  <FormControl>
                    <PillSelector
                      options={PARENT_BORROWING_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceOfIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source of Income</FormLabel>
                  <FormControl>
                    <PillSelector
                      options={INCOME_SOURCE_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes for this application…"
                      rows={4}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ClipboardCheck className="w-4 h-4" />
              )}
              Save Verification
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
