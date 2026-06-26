"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Signal, Wifi, Battery } from "lucide-react";


/* ─── Step data ──────────────────────────────────────────────────────────── */
const STEPS = [
  {
    title: "Check Eligibility",
    description:
      "Use our eligibility checker to see if you meet the basic criteria for an education loan. This step helps you understand your chances before applying.",
  },
  {
    title: "Apply & Compare",
    description:
      "Submit your application through our platform and compare offers from multiple partner banks. Upload documents digitally and track your application status in one place.",
  },
  {
    title: "Get Approved & Funded",
    description:
      "Once your application is approved, the bank will disburse the funds directly to your college account.",
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
        <div
          className="relative rounded-[44px] overflow-hidden bg-white"
          style={{ height: 610 }}
        >
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-3 pb-1 bg-white/90 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-zinc-900 tracking-tight">9:41</span>
            {/* Dynamic Island */}
            <div className="w-18 h-5.5 bg-zinc-900 rounded-full" />
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3 text-zinc-800" />
              <Wifi className="w-3 h-3 text-zinc-800" />
              <Battery className="w-3.5 h-3.5 text-zinc-800" />
            </div>
          </div>

          {/* App screenshot pushed down below status bar */}
          <div className="absolute inset-0 top-9">
            <Image
              src="/assets/mobile.png"
              alt="App screenshot showing EMI calculator and loan features"
              width={280}
              height={574}
              className="w-full h-full object-cover object-top"
              sizes="280px"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Step card ──────────────────────────────────────────────────────────── */
function StepCard({
  step,
  index,
  inView,
}: {
  step: (typeof STEPS)[number];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: "easeOut" }}
      className="w-full flex gap-4 items-start p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm"
    >
      {/* Step number */}
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xl font-bold text-primary">{index + 1}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-1">
        <p className="text-sm font-bold text-zinc-900 leading-snug mb-1.5">
          {step.title}
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
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
              className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-3"
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
              Apply with Your{" "}
              <span className="relative inline-block bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent">
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
              </span>
            </motion.h2>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-base text-zinc-500 leading-relaxed mb-8 max-w-md"
            >
              Three clear steps from profile to funded — every step backed by
              partner banks built for Nepali students.
            </motion.p>

            {/* Step cards */}
            <div className="space-y-7">
              {STEPS.map((step, i) => (
                <StepCard
                  key={step.title}
                  step={step}
                  index={i}
                  inView={inView}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
