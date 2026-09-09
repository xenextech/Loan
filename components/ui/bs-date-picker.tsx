"use client";

import { useMemo, useRef, useState } from "react";
import NepaliDate, { dateConfigMap } from "nepali-date-converter";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BS_MIN_YEAR, BS_MAX_YEAR, isValidBsDateString } from "@/lib/bsDate";

// Keys of `dateConfigMap[year]`, in month order (index 0 = Baisakh) — matches
// NepaliDate's own getMonth()/setMonth() indexing, so no separate mapping is
// needed to go from a grid column back to the library's month index.
const BS_MONTHS = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad2 = (n: number) => String(n).padStart(2, "0");

function daysInBsMonth(year: number, monthIndex: number): number {
  const row = dateConfigMap[String(year)];
  if (!row) return 30;
  return row[BS_MONTHS[monthIndex]];
}

interface BsDatePickerProps {
  /** BS date as "YYYY-MM-DD", or "" / undefined for no selection. */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

// A minimal BS (Bikram Sambat) calendar picker — the project has no BS calendar
// UI yet (only the AD `<input type="date">` from shadcn/react-day-picker), so
// this reuses the existing `nepali-date-converter` dependency (already used by
// lib/bsDate.ts for BS<->AD conversion) for the calendar math instead of
// pulling in a new package, and reuses Popover/Select/Button for the chrome.
export function BsDatePicker({ value, onChange, placeholder = "YYYY-MM-DD (BS)", disabled, className, id }: BsDatePickerProps) {
  const selected = useMemo(() => {
    if (!value || !isValidBsDateString(value)) return null;
    const [year, month, date] = value.split("-").map(Number);
    return { year, month: month - 1, date };
  }, [value]);

  const today = useMemo(() => NepaliDate.now().getBS(), []);
  const [open, setOpen] = useState(false);
  // Month/year use a plain button list (like the day grid below), not
  // Radix's <Select> — profiling showed mounting Select's 91 <SelectItem>s
  // for the year list alone cost 300-650ms on every open (scaling roughly
  // linearly with item count: the 12-item month list cost ~150ms), because
  // each SelectItem carries real per-item overhead — collection
  // registration, roving-tabindex/typeahead wiring, animation-state classes
  // — that a plain button doesn't. The day grid's up to 42 plain buttons
  // measured effectively 0ms, so reusing that same pattern here removes the
  // cost outright instead of just relocating it to whenever the dropdown is
  // opened.
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const [viewYear, setViewYear] = useState(selected?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.month);

  const syncViewToSelection = () => {
    setViewYear(selected?.year ?? today.year);
    setViewMonth(selected?.month ?? today.month);
  };

  const changeMonth = (delta: number) => {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    if (nextYear < BS_MIN_YEAR || nextYear > BS_MAX_YEAR) return;
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const pickDay = (day: number) => {
    onChange(`${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`);
    setOpen(false);
  };

  const leadingBlanks = new NepaliDate(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInBsMonth(viewYear, viewMonth);
  const years = useMemo(
    () => Array.from({ length: BS_MAX_YEAR - BS_MIN_YEAR + 1 }, (_, i) => BS_MIN_YEAR + i),
    [],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) syncViewToSelection();
        setOpen(next);
      }}
    >
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
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="flex items-center gap-1.5 mb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Popover open={monthOpen} onOpenChange={setMonthOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 flex-1 justify-between px-2 text-xs font-normal"
              >
                {BS_MONTHS[viewMonth]}
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[140px] max-h-64 overflow-y-auto p-1" align="start">
              {BS_MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setViewMonth(i);
                    setMonthOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                    i === viewMonth && "bg-primary/10 font-medium text-primary",
                  )}
                >
                  {m}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Popover
            open={yearOpen}
            onOpenChange={(next) => {
              setYearOpen(next);
              if (next) {
                // Center the current year in the scrollable list instead of
                // making the user scroll from BS_MIN_YEAR to find it.
                requestAnimationFrame(() =>
                  selectedYearRef.current?.scrollIntoView({ block: "center" }),
                );
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-[84px] justify-between px-2 text-xs font-normal"
              >
                {viewYear}
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100px] max-h-64 overflow-y-auto p-1" align="start">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  ref={y === viewYear ? selectedYearRef : undefined}
                  onClick={() => {
                    setViewYear(y);
                    setYearOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                    y === viewYear && "bg-primary/10 font-medium text-primary",
                  )}
                >
                  {y}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[11px] font-medium text-muted-foreground py-1">
              {d}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const isSelected = selected?.year === viewYear && selected.month === viewMonth && selected.date === day;
            const isToday = today.year === viewYear && today.month === viewMonth && today.date === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => pickDay(day)}
                className={cn(
                  "h-7 w-7 rounded-md text-xs transition-colors mx-auto",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isToday
                      ? "border border-primary/50 text-foreground hover:bg-muted"
                      : "text-foreground hover:bg-muted",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
