"use client";
import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

/* ─── Lenders ────────────────────────────────────────────────────────────── */
const LENDERS = [
  { id: "nmb",       name: "NMB Bank",       rate: 11.0, color: "#DC2626" },
  { id: "nabil",     name: "Nabil Bank",      rate: 10.5, color: "#2563EB" },
  { id: "global",    name: "Global IME",      rate: 12.0, color: "#7C3AED" },
  { id: "himalayan", name: "Himalayan Bank",  rate: 11.5, color: "#D97706" },
  { id: "sunrise",   name: "Sunrise Bank",    rate: 12.5, color: "#059669" },
] as const;

const LOAN_MIN    = 50_000;
const LOAN_MAX    = 1_000_000;
const TENURE_MIN  = 1;
const TENURE_MAX  = 7;

/* ─── Math ───────────────────────────────────────────────────────────────── */
function calcEMI(principal: number, annualRate: number, tenureYears: number) {
  const months = tenureYears * 12;
  const r      = annualRate / (12 * 100);
  if (r === 0) return { emi: principal / months, totalPayable: principal, totalInterest: 0 };
  const factor      = Math.pow(1 + r, months);
  const emi         = (principal * r * factor) / (factor - 1);
  const totalPayable = emi * months;
  return { emi, totalPayable, totalInterest: totalPayable - principal };
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */
function inr(n: number) { return Math.round(n).toLocaleString("en-IN"); }

/* ─── Slider (track fill via CSS var) ───────────────────────────────────── */
function Slider({ value, min, max, step, onChange }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  useLayoutEffect(() => {
    ref.current?.style.setProperty("--emi-fill", `${pct}%`);
  }, [pct]);

  return (
    <input
      ref={ref}
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="emi-slider w-full h-[3px] rounded-full cursor-pointer appearance-none
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px]
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
        [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-primary
        [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
        [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px]
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
        [&::-moz-range-thumb]:border-[2.5px] [&::-moz-range-thumb]:border-primary
        [&::-moz-range-thumb]:cursor-pointer"
    />
  );
}

/* ─── Semicircle donut chart ─────────────────────────────────────────────── */
function SemiDonut({ principalRatio }: { principalRatio: number }) {
  const r      = 100;
  const arcLen = Math.PI * r;           // ≈ 314.16 px  (half-circle arc length)
  const pLen   = principalRatio * arcLen;
  const iLen   = arcLen - pLen;
  const gap    = iLen > 4 ? 3 : 0;     // visual gap between the two arcs

  // Path: semicircle from (50,150) → (250,150), radius 100, sweeping up
  const d = "M 50 150 A 100 100 0 0 1 250 150";

  return (
    <svg viewBox="0 0 300 158" className="w-full max-w-[260px] mx-auto overflow-visible">
      {/* Grey background track */}
      <path d={d} fill="none" stroke="#0074A3" strokeWidth="28" strokeLinecap="round" />

      {/* Principal — primary blue, starts from left */}
      {pLen > 0 && (
        <path
          d={d}
          fill="none"
          stroke="#0074A3"
          strokeWidth="28"
          strokeLinecap={iLen < 3 ? "round" : "butt"}
          strokeDasharray={`${pLen - gap} ${arcLen + 4}`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      )}

      {/* Interest — green, starts where principal ends */}
      {iLen > 0 && (
        <path
          d={d}
          fill="none"
          stroke="#22C55E"
          strokeWidth="28"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0, iLen)} ${arcLen + 4}`}
          strokeDashoffset={-pLen}
          style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }}
        />
      )}
    </svg>
  );
}

/* ─── PrefixInput ────────────────────────────────────────────────────────── */
function PrefixInput({ prefix, value, onChange, onBlur, width = "w-28" }: {
  prefix: string; value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  width?: string;
}) {
  return (
    <div className="flex items-stretch rounded-lg border border-zinc-200 overflow-hidden">
      <span className="px-3 py-[7px] bg-zinc-50 text-zinc-500 font-medium border-r border-zinc-200 text-[13px] select-none">
        {prefix}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`${width} px-3 py-[7px] text-zinc-900 font-semibold text-[13px] tabular-nums focus:outline-none bg-white`}
      />
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function EmiCalculator() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  /* Lender */
  const [lenderIdx,  setLenderIdx]  = useState(0);
  const [lenderOpen, setLenderOpen] = useState(false);
  const lender = LENDERS[lenderIdx];
  const rate   = lender.rate;

  /* Loan amount */
  const [principal,  setPrincipal]  = useState(880_000);
  const [loanInput,  setLoanInput]  = useState("8,80,000");

  /* Tenure (years) */
  const [tenure,      setTenure]     = useState(4);
  const [tenureInput, setTenureInput]= useState("4");

  /* EMI calculation */
  const { emi, totalPayable, totalInterest } = useMemo(
    () => calcEMI(principal, rate, tenure),
    [principal, rate, tenure],
  );

  const monthlyEMI    = Math.round(isFinite(emi)          ? emi          : 0);
  const safePay       = Math.round(isFinite(totalPayable)  ? totalPayable  : 0);
  const safeInterest  = Math.round(isFinite(totalInterest) ? totalInterest : 0);
  const principalRatio = safePay > 0 ? principal / safePay : 0.8;

  /* Handlers — loan amount */
  const handleLoanSlider = (v: number) => { setPrincipal(v); setLoanInput(inr(v)); };
  const handleLoanInput  = (raw: string) => {
    setLoanInput(raw);
    const n = Number(raw.replace(/,/g, ""));
    if (!isNaN(n) && n >= LOAN_MIN && n <= LOAN_MAX) setPrincipal(n);
  };
  const handleLoanBlur = () => {
    const n = Math.max(LOAN_MIN, Math.min(LOAN_MAX, principal));
    setPrincipal(n); setLoanInput(inr(n));
  };

  /* Handlers — tenure */
  const handleTenureSlider = (v: number) => { setTenure(v); setTenureInput(String(v)); };
  const handleTenureInput  = (raw: string) => {
    setTenureInput(raw);
    const n = Number(raw);
    if (!isNaN(n) && n >= TENURE_MIN && n <= TENURE_MAX) setTenure(n);
  };
  const handleTenureBlur = () => {
    const n = Math.max(TENURE_MIN, Math.min(TENURE_MAX, tenure));
    setTenure(n); setTenureInput(String(n));
  };

  return (
    <section
      id="emi-calculator"
      ref={ref}
      className="py-20 bg-white border-b border-zinc-100"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-3">
            EMI Calculator
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Find the right loan{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">for you.</span>
              <svg
                className="absolute -bottom-1 left-0 w-full overflow-visible"
                viewBox="0 0 140 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5.5 Q22 1.5 42 5.5 Q62 9.5 82 5.5 Q102 1.5 122 5.5 Q132 7.5 138 5.5"
                  stroke="#22C55E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </h2>
        </motion.div>

        {/* ── Two cards ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid lg:grid-cols-2 gap-5"
        >

          {/* ── LEFT: input card ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 flex flex-col gap-10 h-full">

            {/* Loan Amount */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-semibold text-zinc-800">Loan Amount</label>
                <PrefixInput
                  prefix="Rs."
                  value={loanInput}
                  onChange={handleLoanInput}
                  onBlur={handleLoanBlur}
                />
              </div>
              <Slider
                value={principal}
                min={LOAN_MIN} max={LOAN_MAX} step={10_000}
                onChange={handleLoanSlider}
              />
              <div className="flex justify-between">
                <span className="text-[11px] text-zinc-400">Rs.50,000</span>
                <span className="text-[11px] text-zinc-400">Rs.10,00,000</span>
              </div>
            </div>

            {/* Select Lender */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-semibold text-zinc-800">Select Lender</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLenderOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-[7px] text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span
                      className="w-4 h-4 rounded-sm shrink-0"
                      style={{ background: lender.color }}
                    />
                    <span className="text-zinc-800 whitespace-nowrap">{lender.name}</span>
                    <span className="text-zinc-500 whitespace-nowrap">({rate}%)</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${lenderOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {lenderOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-black/8 py-1.5 z-30"
                      >
                        {LENDERS.map((l, i) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => { setLenderIdx(i); setLenderOpen(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-sm shrink-0"
                              style={{ background: l.color }}
                            />
                            <span className="text-[13px] font-medium text-zinc-800 flex-1 text-left">{l.name}</span>
                            <span className="text-[12px] text-zinc-400 tabular-nums">{l.rate}%</span>
                            {i === lenderIdx && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[15px] font-semibold text-zinc-800">Loan Tenure</label>
                <PrefixInput
                  prefix="Yrs."
                  value={tenureInput}
                  onChange={handleTenureInput}
                  onBlur={handleTenureBlur}
                  width="w-14"
                />
              </div>
              <Slider
                value={tenure}
                min={TENURE_MIN} max={TENURE_MAX} step={1}
                onChange={handleTenureSlider}
              />
              <div className="flex justify-between mt-2.5">
                <span className="text-[11px] text-zinc-400">1 year</span>
                <span className="text-[11px] text-zinc-400">7 years</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT: result card ───────────────────────────────────── */}
          <div
            className="rounded-2xl border border-zinc-100 px-8 py-8 flex flex-col h-full"
         
          >

            {/* EMI value */}
            <div className="text-center mb-1">
              <p className="text-[15px] font-semibold text-zinc-500 mb-3">Your Monthly EMI</p>
              <motion.p
                key={monthlyEMI}
                initial={{ opacity: 0.6, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-5xl font-bold tabular-nums leading-none"
           
              >
                Rs.{inr(monthlyEMI)}
              </motion.p>
              <p className="text-[13px] text-zinc-400 mt-2.5">
                {rate}% Interest Per Annum
              </p>
            </div>

            {/* Semicircle donut */}
            <div className="my-3">
              <SemiDonut principalRatio={principalRatio} />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0074A3] shrink-0" />
                <span className="text-[13px] text-zinc-500">Principal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-[13px] text-zinc-500">Total Interest</span>
              </div>
            </div>

            {/* Principal / Interest amounts */}
            <div className="flex justify-center gap-14 mb-5">
              <div className="text-center">
                <p className="text-[15px] font-bold text-zinc-800 tabular-nums">
                  Rs.{inr(principal)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-zinc-800 tabular-nums">
                  Rs.{inr(safeInterest)}
                </p>
              </div>
            </div>

            {/* Total amount */}
            <div className="text-center pt-4 border-t border-zinc-200/70 mt-auto">
              <p className="text-[13px] text-zinc-400 mb-1">Total Loan Amount</p>
              <p className="text-[24px] font-bold text-zinc-900 tabular-nums">
                Rs.{inr(safePay)}
              </p>
            </div>

          </div>

        </motion.div>
      </div>
    </section>
  );
}