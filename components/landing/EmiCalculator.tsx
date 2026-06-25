"use client";
import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatNPR } from "@/lib/formatters";

/* ─── Math ───────────────────────────────────────────────────────────────── */
function calcEMI(principal: number, annualRate: number, tenureMonths: number) {
  const r = annualRate / (12 * 100);
  if (r === 0) return { emi: principal / tenureMonths, totalPayable: principal, totalInterest: 0 };
  const factor = Math.pow(1 + r, tenureMonths);
  const emi    = (principal * r * factor) / (factor - 1);
  const totalPayable = emi * tenureMonths;
  return { emi, totalPayable, totalInterest: totalPayable - principal };
}

function formatTenure(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} yr${y !== 1 ? "s" : ""}`;
  if (y === 0) return `${m} mo`;
  return `${y} yr${y !== 1 ? "s" : ""} ${m} mo`;
}

/* ─── Slider with floating current-value label ───────────────────────────── */
interface SliderProps {
  value:    number;
  min:      number;
  max:      number;
  step:     number;
  display:  string;   // formatted current value shown above thumb
  minLabel: string;
  maxLabel: string;
  onChange: (v: number) => void;
}

function Slider({ value, min, max, step, display, minLabel, maxLabel, onChange }: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  useLayoutEffect(() => {
    inputRef.current?.style.setProperty("--emi-fill", `${pct}%`);
  }, [pct]);

  /* Clamp so the floating label never clips outside the track edges */
  const labelLeft = `${Math.max(6, Math.min(94, pct))}%`;

  return (
    <div>
      {/* Label row: min (left) · current value (floating above thumb) · max (right) */}
      <div className="relative h-7 mb-1 select-none">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-zinc-400 leading-none">
          {minLabel}
        </span>
        <span
          aria-live="polite"
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-sm font-bold text-zinc-900 tabular-nums whitespace-nowrap"
          style={{ left: labelLeft }}
        >
          {display}
        </span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-zinc-400 leading-none">
          {maxLabel}
        </span>
      </div>

      {/* Track */}
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="emi-slider w-full h-[3px] rounded-full cursor-pointer appearance-none
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-[18px]
          [&::-webkit-slider-thumb]:h-[18px]
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-[2.5px]
          [&::-webkit-slider-thumb]:border-primary
          [&::-webkit-slider-thumb]:shadow
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-[18px]
          [&::-moz-range-thumb]:h-[18px]
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border-[2.5px]
          [&::-moz-range-thumb]:border-primary
          [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function EmiCalculator() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [principal, setPrincipal] = useState(500_000);
  const [rate,      setRate]      = useState(12);
  const [tenure,    setTenure]    = useState(60);

  const { emi, totalPayable } = useMemo(
    () => calcEMI(principal, rate, tenure),
    [principal, rate, tenure],
  );

  const monthlyEMI  = Math.round(isFinite(emi)         ? emi         : 0);
  const safePayable = Math.round(isFinite(totalPayable) ? totalPayable : 0);

  return (
    <section
      id="emi-calculator"
      ref={ref}
      className="py-24 bg-[#F8F6F1] border-b border-zinc-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-4">
            EMI Calculator
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-3">
            Find the right loan{" "}
            <span className="text-zinc-400 font-medium">for you.</span>
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed max-w-md mx-auto">
            Adjust the sliders to estimate your monthly repayment before applying.
          </p>
        </motion.div>

        {/* ── Main split card ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid lg:grid-cols-[1.1fr_1fr] rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/60"
        >
          {/* ── Left: white calculator panel ───────────────────────── */}
          <div className="bg-white px-8 py-10 sm:px-12 sm:py-12 flex flex-col">

            {/* Sliders */}
            <div className="space-y-8 mb-8">
              <Slider
                value={principal}
                min={50_000}
                max={5_000_000}
                step={10_000}
                display={formatNPR(principal)}
                minLabel="Rs. 50k"
                maxLabel="Rs. 50L"
                onChange={setPrincipal}
              />
              <Slider
                value={rate}
                min={7}
                max={20}
                step={0.5}
                display={`${rate}%`}
                minLabel="7% p.a."
                maxLabel="20% p.a."
                onChange={setRate}
              />
              <Slider
                value={tenure}
                min={12}
                max={120}
                step={6}
                display={formatTenure(tenure)}
                minLabel="1 Year"
                maxLabel="10 Years"
                onChange={setTenure}
              />
            </div>

            {/* ── Result rows ──────────────────────────────────────── */}
            <div className="divide-y divide-zinc-100 mb-8">
              {([
                { label: "Pay Monthly",   value: formatNPR(monthlyEMI),  bold: true  },
                { label: "Tenure",        value: formatTenure(tenure),    bold: false },
                { label: "Total Pay Back",value: formatNPR(safePayable),  bold: true  },
              ] as const).map(({ label, value, bold }) => (
                <div key={label} className="flex items-center justify-between py-4">
                  <span className="text-sm text-zinc-500">{label}</span>
                  <span className={`text-sm tabular-nums ${bold ? "font-bold text-zinc-900 text-base" : "font-semibold text-zinc-700"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ── CTA ─────────────────────────────────────────────── */}
            <Link href="/apply" className="mt-auto">
              <Button className="w-full h-12 rounded-xl text-[15px] font-semibold gap-2">
                Apply For Loan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <p className="mt-4 text-[11px] text-zinc-400 leading-relaxed">
              *These figures are estimates only. Final EMI is determined by your partner
              bank after review, subject to fees and applicable charges.
            </p>
          </div>

          {/* ── Right: photo + floating stat ───────────────────────── */}
          <div className="relative hidden lg:block min-h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=900&fit=crop&auto=format&q=80"
              alt="Student working on a laptop managing their education loan application"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle dark overlay for legibility */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Floating stat card — overlaps the left seam */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.45 }}
              className="absolute bottom-10 left-0 -translate-x-1/3 z-10 bg-primary rounded-2xl px-6 py-5 shadow-lg shadow-primary/25"
            >
              <p className="text-3xl font-bold text-white leading-none">12+</p>
              <p className="text-sm text-white/75 mt-1 font-medium">Partner Banks</p>
            </motion.div>

            {/* Second stat — top right corner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.55 }}
              className="absolute top-8 right-8 z-10 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-md"
            >
              <p className="text-2xl font-bold text-zinc-900 leading-none">0%</p>
              <p className="text-xs text-zinc-500 mt-1 font-medium">Branch visits needed</p>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
