"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LoanAssessmentFormValues } from "../schema";

interface TextareaFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export function TextareaField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  placeholder,
  disabled,
  description,
  rows = 5,
}: TextareaFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
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
