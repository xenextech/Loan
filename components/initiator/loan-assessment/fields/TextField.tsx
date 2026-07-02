"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LoanAssessmentFormValues } from "../schema";

interface TextFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "email" | "tel";
  required?: boolean;
}

export function TextField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  placeholder,
  disabled,
  type = "text",
  required,
}: TextFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
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
