"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Search,
  SlidersHorizontal,
  ClipboardList,
  FileUp,
  Building2,
  CheckCircle2,
  GraduationCap,
  ChevronRight,
  Wifi,
  Signal,
  Battery,
} from "lucide-react";

/* ─── Step data ──────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    Icon: ClipboardList,
    title: "Check Eligibility",
    description:
      "Use our eligibility checker to see if you meet the basic criteria for an education loan. This step helps you understand your chances before applying.",
  },
  {
    num: "02",
    Icon: FileUp,
    title: "Apply & Compare",
    description:
      "Submit your application through our platform and compare offers from multiple partner banks. Upload documents digitally and track your application status in one place.",
  },
  {
    num: "03",
    Icon: Building2,
    title: "Get Approved & Funded",
    description:
      "Once your application is approved, the bank will disburse the funds directly to your account. You can manage your loan and repayment schedule through our platform.",
  },

] as const;

/* ─── Phone mockup ───────────────────────────────────────────────────────── */
function PhoneMockup({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto"
      style={{ width: 300 }}
    >
      {/* Ambient glow behind phone */}
      <div className="absolute -inset-8 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      {/* ── Phone frame ── */}
      <div className="relative bg-zinc-900 rounded-[52px] p-[10px] shadow-2xl shadow-zinc-900/40 ring-1 ring-white/10">

        {/* Side buttons */}
        <div className="absolute left-[-3px] top-[88px] w-[3px] h-7 bg-zinc-700 rounded-l-full" />
        <div className="absolute left-[-3px] top-[128px] w-[3px] h-12 bg-zinc-700 rounded-l-full" />
        <div className="absolute left-[-3px] top-[188px] w-[3px] h-12 bg-zinc-700 rounded-l-full" />
        <div className="absolute right-[-3px] top-[128px] w-[3px] h-16 bg-zinc-700 rounded-r-full" />

        {/* ── Screen ── */}
        <div className="bg-[#F7F8FA] rounded-[44px] overflow-hidden" style={{ height: 610 }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-1 bg-white">
            <span className="text-[11px] font-bold text-zinc-900 tracking-tight">9:41</span>
            {/* Dynamic Island */}
            <div className="w-[88px] h-[30px] bg-zinc-900 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-zinc-800" />
              <Wifi className="w-3 h-3 text-zinc-800" />
              <Battery className="w-3.5 h-3.5 text-zinc-800" />
            </div>
          </div>

          {/* App content */}
          <div className="bg-white px-0">

            {/* ── User header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                  AS
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-900 leading-tight">Aarav Sharma</p>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-2.5 h-2.5 text-zinc-400" />
                    <p className="text-[9px] text-zinc-400">Undergraduate</p>
                  </div>
                </div>
              </div>
              <div className="relative w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm">
                <Bell className="w-3 h-3 text-zinc-600" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>
            </div>

            {/* ── Featured banner ── */}
            <div className="mx-3 mt-3 rounded-2xl overflow-hidden relative" style={{ height: 120 }}>
              <Image
                src="/assets/about.jpg"
                alt="Education loan banner"
                fill
                className="object-cover object-top"
                sizes="280px"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-3.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-sm bg-white/20 flex items-center justify-center">
                    <GraduationCap className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest">Cliq</span>
                </div>
                <div>
                  <p className="text-[9px] text-white/70 font-medium leading-none mb-0.5">Apply Now</p>
                  <p className="text-[16px] font-bold text-white leading-tight">Education<br />Loan</p>
                </div>
              </div>
            </div>

            {/* ── Search bar ── */}
            <div className="mx-3 mt-3 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
              <Search className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="text-[10px] text-zinc-400 flex-1">Search by bank, course, country...</span>
              <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                <SlidersHorizontal className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* ── Filter chips ── */}
            <div className="flex gap-1.5 px-3 mt-2.5 overflow-x-hidden">
              {[
                { label: "Education", active: false },
                { label: "For Nepali Students", active: true },
                { label: "NRB Banks", active: false },
                { label: "Online Apply", active: false },
              ].map(({ label, active }) => (
                <span
                  key={label}
                  className={`shrink-0 text-[8.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    active
                      ? "bg-primary text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* ── Partner Banks ── */}
            <div className="px-3 mt-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold text-zinc-900">Loan Provider</p>
                <button className="flex items-center gap-0.5 text-[9px] font-semibold text-primary">
                  See all <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Bank card 1 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 bg-white mb-2 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[8px] font-bold leading-tight text-center">Engineer</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-900">Engineer</p>
                  <p className="text-[9px] text-zinc-500">Education Loan</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-primary">10.5%</p>
                  <p className="text-[8px] text-zinc-400">p.a.</p>
                </div>
              </div>

              {/* Bank card 2 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 bg-white shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[8px] font-bold leading-tight text-center">Doctor</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-900">Doctor</p>
                  <p className="text-[9px] text-zinc-500">Student Loan</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-primary">11%</p>
                  <p className="text-[8px] text-zinc-400">p.a.</p>
                </div>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-[10px] right-[10px] h-14 bg-gradient-to-t from-[#F7F8FA] to-transparent rounded-b-[44px] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Below-phone CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-zinc-500 mb-3">
          An all-in-one platform for your education loan needs.
        </p>
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors px-5 py-2.5 rounded-xl shadow-md shadow-primary/20"
        >
          Start Application
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step card ──────────────────────────────────────────────────────────── */
function StepCard({
  step,
  index,
  active,
  onClick,
  inView,
}: {
  step: (typeof STEPS)[number];
  index: number;
  active: boolean;
  onClick: () => void;
  inView: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: 24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: "easeOut" }}
      className={`w-full flex gap-4 items-start p-6 rounded-tr-2xl rounded-bl-2xl border text-left cursor-pointer transition-all duration-300 ${
        active
          ? "border-[2px] border-green-400 bg-white shadow-md shadow-green-100/60"
          : "border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
      }`}
    >
      {/* Icon container + number badge */}
      <div className="relative shrink-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
            active ? "bg-primary/10" : "bg-zinc-100"
          }`}
        >
          <step.Icon
            className={`w-5 h-5 transition-colors duration-300 ${
              active ? "text-primary" : "text-zinc-500"
            }`}
          />
        </div>
        {/* Number badge */}
        <div
          className={`absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold transition-colors duration-300 ${
            active ? "bg-primary text-white" : "bg-zinc-300 text-zinc-600"
          }`}
        >
          {step.num}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={`text-sm font-bold leading-snug mb-1 transition-colors duration-300 ${
            active ? "text-primary" : "text-zinc-900"
          }`}
        >
          {step.title}
        </p>
        <AnimatePresence>
          {active && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-xs text-zinc-500 leading-relaxed overflow-hidden"
            >
              {step.description}
            </motion.p>
          )}
        </AnimatePresence>
        {!active && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-1">
            {step.description}
          </p>
        )}
      </div>

      {/* Arrow indicator when active */}
      <div
        className={`shrink-0 self-center transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronRight className="w-4 h-4 text-primary" />
      </div>
    </motion.button>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-24 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* ── Left: phone mockup ───────────────────────────────────────── */}
          <PhoneMockup inView={inView} />

          {/* ── Right: steps ─────────────────────────────────────────────── */}
          <div>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-4"
            >
              How It Works
            </motion.p>

            {/* Headline with green squiggle accent */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4"
            >
              Apply with{" "}
              <span className="relative inline-block text-primary">
                confidence
                {/* Green squiggle underline */}
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
                {/* Sparkle */}
                <span
                  aria-hidden="true"
                  className="absolute -top-2.5 -right-5 text-green-400 text-sm font-bold select-none"
                >
                  ✦
                </span>
              </span>
            </motion.h2>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-base text-zinc-500 leading-relaxed mb-8 max-w-md"
            >
              Four clear steps from profile to funded — every step backed by
              NRB-regulated partner banks built for Nepali students.
            </motion.p>

            {/* Step cards */}
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <StepCard
                  key={step.num}
                  step={step}
                  index={i}
                  active={activeStep === i}
                  onClick={() => setActiveStep(i)}
                  inView={inView}
                />
              ))}
            </div>

            {/* Bottom CTA link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.44 }}
              className="mt-8"
            >
              <Link
                href="/apply"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors"
              >
                Start your application now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
