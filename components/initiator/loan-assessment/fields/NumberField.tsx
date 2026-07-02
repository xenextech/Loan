"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LoanAssessmentFormValues } from "../schema";

interface NumberFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  suffix?: string;
}

/** Keeps the raw string in RHF state; the Zod schema coerces to a number on validate/submit. */
export function NumberField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  placeholder,
  disabled,
  suffix,
}: NumberFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                placeholder={placeholder}
                disabled={disabled}
                value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                className={suffix ? "pr-10" : undefined}
              />
              {suffix && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
