"use client";

import { useState } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { LoanAssessmentFormValues } from "../schema";

interface ComboboxFieldProps<TName extends FieldPath<LoanAssessmentFormValues>> {
  name: TName;
  label: string;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
}

/** Searchable dropdown for long enumerations (NRB reporting fields). */
export function ComboboxField<TName extends FieldPath<LoanAssessmentFormValues>>({
  name,
  label,
  options,
  placeholder = "Select…",
  disabled,
}: ComboboxFieldProps<TName>) {
  const { control } = useFormContext<LoanAssessmentFormValues>();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-expanded={open}
                  className="w-full justify-between font-normal h-8"
                >
                  <span className={cn("truncate", !field.value && "text-muted-foreground")}>
                    {typeof field.value === "string" && field.value ? field.value : placeholder}
                  </span>
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
              <Command>
                <CommandInput placeholder={`Search ${label ? label.toLowerCase() : "options"}…`} />
                <CommandList>
                  <CommandEmpty>No match found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((opt) => (
                      <CommandItem
                        key={opt}
                        value={opt}
                        data-checked={opt === field.value}
                        onSelect={() => {
                          field.onChange(opt);
                          setOpen(false);
                        }}
                      >
                        {opt}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
