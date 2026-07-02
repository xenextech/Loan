"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LoanAssessmentFormValues } from "../schema";

interface DateFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  disabled?: boolean;
}

export function DateField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  disabled,
}: DateFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type="date"
              disabled={disabled}
              value={typeof field.value === "string" ? field.value : ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
