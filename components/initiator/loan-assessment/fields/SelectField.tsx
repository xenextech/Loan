"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LoanAssessmentFormValues } from "../schema";

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  options: readonly SelectFieldOption[];
  placeholder?: string;
  disabled?: boolean;
}

/** Plain closed-list dropdown — use ComboboxField instead when the list needs search. */
export function SelectField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  options,
  placeholder = "Select…",
  disabled,
}: SelectFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            value={typeof field.value === "string" ? field.value : undefined}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
