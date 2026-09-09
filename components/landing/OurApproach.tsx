"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Plus, Building2, Shield, ShieldCheck, File, Banknote } from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const FORMULA_ITEMS = [
  { label: "Banks", className: "bg-green-50 text-primary" },
  { label: "Educational Institutions", className: "bg-green-50 text-primary" },
  { label: "Skill Providers", className: "bg-green-50 text-primary" },
  { label: "Smart Financing", className: "bg-green-50 text-primary" },
] as const;

const BENEFITS = [
  {
    id:1,
    title:"Reduce application stress",
    icon:<ShieldCheck className="w-4 h-4 text-primary shrink-0" />,
  },
  {
    id:2,
    title:"Improve approval chances",
    icon:<CheckCircle2 className="w-4 h-4 text-primary shrink-0" />,
  },
  {
    id:3,
    title:"Simplify documentation",
    icon:<File className="w-4 h-4 text-primary shrink-0" />,
  },
  {
    id:4,
    title:"Enable faster disbursement",
    icon:<Banknote className="w-4 h-4 text-primary shrink-0" />,
  }
] as const;

/* ─── Section header underline ──────────────────────────────────────────── */
function Squiggle() {
  return (
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
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function OurApproach() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="our-approach"
      ref={ref}
      className="py-16 sm:py-20 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4">
            Our Approach
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
            Financing built around your{" "}
            <span className="inline-block bg-linear-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">
              education journey
             
            </span>
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed">
            Unnati connects students with the right loan options, guidance, and
            trusted partner banks so families can plan for higher education
            with confidence.
          </p>
        </motion.div>

        {/* ── Two-column layout ───────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">

          {/* ── Left: image panel ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="relative rounded-3xl overflow-hidden h-56 sm:h-72 lg:min-h-full min-h-[280px]"
          >
            <Image
              src="/assets/E10N2AA.avif"
              alt="Students planning their education journey together"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

          </motion.div>

          {/* ── Right: formula + benefits + quote ─────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Formula card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="rounded-2xl border border-zinc-200 px-7 py-7"
            >
              <h3 className="text-[15px] font-bold text-zinc-900 mb-5">
                The Unnati Formula
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {FORMULA_ITEMS.map((item, i) => (
                  <span key={item.label} className="flex items-center gap-2.5">
                    <span
                      className={`px-4 py-2 rounded-lg text-[13px] font-semibold ${item.className}`}
                    >
                      {item.label}
                    </span>
                    {i < FORMULA_ITEMS.length - 1 && (
                      <Plus className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={3} />
                    )}
                  </span>
                ))}
              </div>

              <div className="flex justify-center my-3">
                <span className="text-lg font-bold text-zinc-400">=</span>
              </div>

              <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3.5 text-center">
                <span className="text-[15px] font-bold text-primary">
                   Every Learning Opportunity Within Reach
                </span>
              </div>
            </motion.div>

            {/* Benefits grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
              className="grid sm:grid-cols-2 gap-3"
            >
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.id}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-200 px-4 py-3"
                >
                  {benefit.icon}
                  <span className="text-[13px] font-semibold text-zinc-700">{benefit.title}</span>
                </div>
              ))}
            </motion.div>

            {/* Quote card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.29, ease: "easeOut" }}
              className="rounded-2xl px-7 py-7 flex-1 flex flex-col justify-center bg-gradient-to-br from-[#15C35B] to-[#0F7D3C] shadow-lg shadow-black/10"
            >
              <p className="text-white text-[15px] italic leading-relaxed">
                &quot;Unnati is where financing meets education — and where
                students build their future.&quot;
              </p>
              <p className="text-white/80 text-[13px] font-semibold mt-3 flex items-center gap-2">
                <span className="w-4 h-px bg-white/50" />
                Unnati Team
              </p>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
