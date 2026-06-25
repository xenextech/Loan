"use client";
import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatNPR } from "@/lib/formatters";

// EMI = P × r × (1+r)^n / ((1+r)^n - 1)
function calcEMI(principal: number, annualRate: number, tenureMonths: number) {
  const r = annualRate / (12 * 100);
  if (r === 0) {
    return { emi: principal / tenureMonths, totalPayable: principal, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * factor) / (factor - 1);
  const totalPayable = emi * tenureMonths;
  return { emi, totalPayable, totalInterest: totalPayable - principal };
}

function formatTenure(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} yr${y !== 1 ? "s" : ""}`;
  if (y === 0) return `${m} mo`;
  return `${y} yr${y !== 1 ? "s" : ""} ${m} mo`;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  // Set the CSS custom property directly on the element to avoid an inline style prop.
  // The actual gradient rule lives in globals.css (.emi-slider).
  useLayoutEffect(() => {
    inputRef.current?.style.setProperty("--emi-fill", `${pct}%`);
  }, [pct]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground tabular-nums">{display}</span>
      </div>
      <input
        ref={inputRef}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="emi-slider w-full h-1.5 rounded-full cursor-pointer appearance-none
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-background
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-primary
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:-mt-1.75
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-background
          [&::-moz-range-thumb]:border-2
          [&::-moz-range-thumb]:border-primary
          [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

export default function EmiCalculator() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [principal, setPrincipal] = useState(500000);
  const [rate,      setRate]      = useState(12);
  const [tenure,    setTenure]    = useState(60);

  const { emi, totalPayable, totalInterest } = useMemo(
    () => calcEMI(principal, rate, tenure),
    [principal, rate, tenure],
  );

  const monthlyEMI   = Math.round(isFinite(emi) ? emi : 0);
  const safePayable  = Math.round(isFinite(totalPayable) ? totalPayable : 0);
  const safeInterest = Math.round(isFinite(totalInterest) ? totalInterest : 0);
  const principalPct = safePayable > 0 ? Math.min(100, (principal / safePayable) * 100) : 100;

  return (
    <section
      id="emi-calculator"
      ref={ref}
      className="py-24 bg-background border-b border-border relative overflow-hidden"
    >
      {/* Dot grid — same pattern as HeroSection */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-45 bg-[radial-gradient(circle,var(--color-border)_1.5px,transparent_1.5px)] bg-size-[32px_32px]" />
      {/* Soft primary glows */}
      <div className="absolute -top-20 right-1/4 w-120 h-120 rounded-full bg-primary/5 blur-3xl pointer-events-none select-none" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-primary/3 blur-3xl pointer-events-none select-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">
            EMI Calculator
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
            Estimate your monthly payment
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Adjust the sliders to see how loan amount, interest rate, and tenure
            affect your monthly repayment.
          </p>
        </motion.div>

        {/* Calculator grid */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 xl:gap-10 max-w-5xl mx-auto">

          {/* ── Left: Inputs ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="rounded-2xl border border-border bg-card p-7 space-y-8 shadow-sm"
          >
            <SliderRow
              label="Loan Amount"
              value={principal}
              min={50000}
              max={5000000}
              step={10000}
              display={formatNPR(principal)}
              onChange={setPrincipal}
            />
            <SliderRow
              label="Annual Interest Rate"
              value={rate}
              min={7}
              max={20}
              step={0.5}
              display={`${rate}%`}
              onChange={setRate}
            />
            <SliderRow
              label="Loan Tenure"
              value={tenure}
              min={12}
              max={120}
              step={6}
              display={formatTenure(tenure)}
              onChange={setTenure}
            />

            <p className="text-[11px] text-muted-foreground leading-relaxed pt-3 border-t border-border">
              Typical education loan rates range from 10%–14% p.a. for NRB-regulated banks.
              Exact rates depend on your lender and credit profile.
            </p>
          </motion.div>

          {/* ── Right: Results ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Monthly EMI hero */}
            <div className="rounded-2xl border border-border bg-card px-7 py-6 shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Monthly EMI
              </p>
              <p className="text-5xl font-bold text-foreground tabular-nums tracking-tight">
                {formatNPR(monthlyEMI)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                per month · {formatTenure(tenure)} tenure
              </p>
            </div>

            {/* Breakdown */}
            <div className="rounded-2xl border border-border bg-card px-7 py-6 flex-1 shadow-sm">
              {/* Principal vs Interest ratio bar */}
              <div className="mb-6">
                <div className="h-2 rounded-full overflow-hidden flex">
                  <motion.div
                    className="bg-primary rounded-l-full"
                    animate={{ width: `${principalPct}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <div className="bg-muted flex-1 rounded-r-full" />
                </div>
                <div className="flex gap-5 mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      Principal {principalPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      Interest {(100 - principalPct).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat rows */}
              <div>
                {[
                  { label: "Principal Amount", value: formatNPR(principal),    bold: false },
                  { label: "Total Interest",   value: formatNPR(safeInterest), bold: false },
                  { label: "Total Payable",    value: formatNPR(safePayable),  bold: true  },
                ].map(({ label, value, bold }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span
                      className={`text-sm tabular-nums ${
                        bold ? "font-bold text-foreground" : "font-semibold text-foreground/80"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer + CTA */}
            <div className="rounded-xl border border-border bg-muted/50 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">
                This is an estimate only. Final EMI is subject to bank approval, fees, and applicable charges.
              </p>
              <Link href="/apply" className="shrink-0">
                <Button
                  size="sm"
                  className="h-9 px-5 rounded-full text-sm font-semibold gap-1.5 shadow-none whitespace-nowrap"
                >
                  Apply Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
