"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AdDatePickerProps {
  /** AD date as "YYYY-MM-DD", or "" / undefined for no selection. */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Oldest selectable year — defaults to 100 years back (covers any DOB). */
  fromYear?: number;
  /** Newest selectable year — defaults to the current year. */
  toYear?: number;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Native `<input type="date">` renders as a scroll-wheel picker on mobile
// (iOS/Android) with no way to jump straight to a year — going back e.g. 45
// years for a parent's DOB means scrolling one year at a time. This uses
// react-day-picker's month/year dropdown caption instead, so any year is a
// couple of taps away on every screen size.
export function AdDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  id,
  fromYear,
  toYear,
}: AdDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);

  const currentYear = new Date().getFullYear();
  const startYear = fromYear ?? currentYear - 100;
  const endYear = toYear ?? currentYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          id={id}
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span className="truncate">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(startYear, 0)}
          endMonth={new Date(endYear, 11)}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(formatIsoDate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
