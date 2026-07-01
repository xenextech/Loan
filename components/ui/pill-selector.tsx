"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillOption<T extends string = string> {
  value: T;
  label: string;
}

export interface PillSelectorProps<T extends string = string>
  extends Omit<React.ComponentProps<"div">, "onChange" | "value"> {
  options: PillOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Single-select pill/chip group. Renders as an ARIA radiogroup so it behaves
 * like radio buttons (single selection, arrow-key navigation) without using
 * native radio inputs or showing a removable "x" icon.
 */
export function PillSelector<T extends string = string>({
  options,
  value,
  onChange,
  disabled,
  className,
  ...props
}: PillSelectorProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled) return;

    const lastIndex = options.length - 1;
    let nextIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    e.preventDefault();
    const next = options[nextIndex];
    onChange(next.value);
    const nextEl = e.currentTarget
      .closest('[role="radiogroup"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex];
    nextEl?.focus();
  };

  return (
    <div
      role="radiogroup"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!value && index === 0) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 outline-none select-none",
              "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:opacity-50 disabled:pointer-events-none",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
