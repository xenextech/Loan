"use client";

import { PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SignaturePlaceholderProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

/**
 * Architecture placeholder for a real e-signature/signature-pad integration.
 * For now it captures a typed attestation name against a signature-styled input.
 */
export function SignaturePlaceholder({ value, onChange, disabled }: SignaturePlaceholderProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 flex items-center gap-2.5",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <PenLine className="w-4 h-4 text-muted-foreground shrink-0" />
      <Input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder="Type full name to digitally sign"
        className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-6 italic font-medium"
      />
    </div>
  );
}
