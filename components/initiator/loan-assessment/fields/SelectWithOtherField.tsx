"use client";

import { useState } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { Pencil, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { LoanAssessmentFormValues } from "../schema";

const CUSTOM_VALUE = "__custom__";

interface SelectWithOtherOption {
  value: string;
  label: string;
}

interface SelectWithOtherFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  options: readonly SelectWithOtherOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Fires with the picked option's value when the user chooses a real (non-custom) option. */
  onOptionSelect?: (value: string) => void;
}

/**
 * Closed-list dropdown with an "Other" escape hatch: picking it swaps in a free-text
 * input so the fixed NRB/Basel codes can still be overridden with a bank-assigned value.
 */
export function SelectWithOtherField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  options,
  placeholder = "Select…",
  disabled,
  onOptionSelect,
}: SelectWithOtherFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const [customMode, setCustomMode] = useState<boolean | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentValue = typeof field.value === "string" ? field.value : "";
        const isKnownOption = options.some((opt) => opt.value === currentValue);
        const isCustom = customMode ?? (currentValue !== "" && !isKnownOption);

        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            {isCustom ? (
              <FormControl>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Input
                    placeholder="Enter custom value…"
                    disabled={disabled}
                    value={currentValue}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={disabled}
                    title="Choose from list instead"
                    onClick={() => {
                      setCustomMode(false);
                      field.onChange("");
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </FormControl>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <Select
                  value={isKnownOption ? currentValue : undefined}
                  onValueChange={(val) => {
                    if (val === CUSTOM_VALUE) {
                      setCustomMode(true);
                      field.onChange("");
                      return;
                    }
                    field.onChange(val);
                    onOptionSelect?.(val);
                  }}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue className="truncate" placeholder={placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_VALUE}>Other (custom value)…</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={disabled}
                  title="Enter a custom value instead"
                  onClick={() => {
                    setCustomMode(true);
                    field.onChange("");
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
