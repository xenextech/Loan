"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Info } from "lucide-react";
import { formatNPR, calculateEMI } from "@/lib/formatters";

interface LoanAmountFieldProps {
  value: number;
  onChange: (value: number) => void;
  courseDuration?: string;
  error?: string;
}

export const INTEREST_RATE = 11;
const MIN = 50000;
const MAX = 1500000;
const STEP = 50000;

export function getMonthsFromDuration(duration: string): number {
  const lower = duration.toLowerCase();
  if (lower.includes("year")) {
    const years = parseInt(lower) || 4;
    return years * 12 + 12;
  }
  if (lower.includes("month")) {
    const months = parseInt(lower) || 24;
    return months + 6;
  }
  return 60;
}

export default function LoanAmountField({
  value,
  onChange,
  courseDuration = "4 Years",
  error,
}: LoanAmountFieldProps) {
  const [inputValue, setInputValue] = useState(String(value));

  const repaymentMonths = getMonthsFromDuration(courseDuration);
  const emi = calculateEMI(value, INTEREST_RATE, repaymentMonths);

  const handleSliderChange = useCallback(
    (vals: number[]) => {
      const v = vals[0];
      onChange(v);
      setInputValue(String(v));
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= MIN && num <= MAX) {
      onChange(num);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < MIN) {
      onChange(MIN);
      setInputValue(String(MIN));
    } else if (num > MAX) {
      onChange(MAX);
      setInputValue(String(MAX));
    } else {
      const snapped = Math.round(num / STEP) * STEP;
      onChange(snapped);
      setInputValue(String(snapped));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">Loan Amount</Label>
        <span className="text-xs text-muted-foreground">
          {formatNPR(MIN)} – {formatNPR(MAX)}
        </span>
      </div>

      {/* Amount input + display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold text-foreground w-full focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
          <span className="text-muted-foreground mr-2 shrink-0 text-xs font-medium">NPR</span>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="border-0 shadow-none p-0 h-auto font-bold text-base focus-visible:ring-0 bg-transparent"
            inputMode="numeric"
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Slider */}
      <div className="pt-2 pb-1">
        <Slider
          min={MIN}
          max={MAX}
          step={STEP}
          value={[value]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">50k</span>
          <span className="text-xs text-muted-foreground">15 Lakhs</span>
        </div>
      </div>

      {/* EMI Preview Card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Estimated Monthly EMI
                    </span>
                  </div>
                  <motion.p
                    key={emi}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {formatNPR(emi)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
                  </motion.p>
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-primary/10 text-primary border-0"
                  >
                    {INTEREST_RATE}% p.a.
                  </Badge>
                  <p className="text-xs text-muted-foreground">{repaymentMonths} months tenure</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Info className="w-3 h-3 shrink-0" />
                Indicative EMI based on current rates. Actual EMI may vary after approval.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
