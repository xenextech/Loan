"use client";
import { useRef, useLayoutEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const STEPS = [
  {
    title: "Submit Application",
    description:
      "Complete your personal, academic, and financial details through a guided multi-step form. No branch visit required.",
    timeEst: "~10 minutes",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=320&fit=crop&auto=format&q=80",
    imageAlt: "Student completing an education loan application on a laptop",
  },
  {
    title: "Upload Documents",
    description:
      "Submit academic transcripts, identity proof, and income documents securely through the platform.",
    timeEst: "Same day",
    image:
      "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=320&fit=crop&auto=format&q=80",
    imageAlt: "Person organizing and preparing documents for upload",
  },
  {
    title: "Bank Review",
    description:
      "Your application is forwarded to a partner bank, where a loan officer evaluates your eligibility and documentation.",
    timeEst: "3–5 business days",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=320&fit=crop&auto=format&q=80",
    imageAlt: "Bank loan officer reviewing an application at their desk",
  },
  {
    title: "Loan Decision",
    description:
      "The partner bank communicates their decision. If approved, disbursement is arranged directly by the bank.",
    timeEst: "1–2 days",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=320&fit=crop&auto=format&q=80",
    imageAlt: "Person receiving a positive loan decision on their device",
  },
] as const;

export default function HowItWorks() {
  const sectionRef  = useRef<HTMLElement>(null);
  const rowRef      = useRef<HTMLDivElement>(null);
  const inView      = useInView(sectionRef, { once: true, margin: "-80px" });
  const [rowW, setRowW] = useState(0);

  /* Measure the indicator row so the dot travels the exact pixel distance */
  useLayoutEffect(() => {
    if (!rowRef.current) return;
    const update = () => setRowW(rowRef.current!.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(rowRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 bg-[#F8F6F1] border-y border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-4">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4 max-w-lg">
            From application to decision —{" "}
            <span className="text-zinc-400 font-medium">one platform</span>
          </h2>
          <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
            Cliq guides you through each stage of the education loan process and
            coordinates with partner banks on your behalf.
          </p>
        </motion.div>

        {/* ── Desktop indicator row — ONE dot across all steps ──────────── */}
        <div
          ref={rowRef}
          className="relative hidden lg:flex items-center mb-8"
        >
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.title} className={`flex items-center ${!isLast ? "flex-1" : ""}`}>

                {/* Step circle — sits above the dot (z-10) */}
                <div className="relative shrink-0 z-10">
                  <motion.div
                    initial={{ scale: 0.55, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{
                      duration: 0.45,
                      delay: i * 0.09 + 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-8 h-8 rounded-full border border-primary/40 bg-[#F8F6F1] flex items-center justify-center"
                  >
                    <span className="text-[11px] font-bold text-primary leading-none">
                      {i + 1}
                    </span>
                  </motion.div>

                  {/* One-shot ripple on scroll-in */}
                  {inView && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border border-primary/45 pointer-events-none"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.4, opacity: 0 }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.09 + 0.45,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </div>

                {/* Static connector line */}
                {!isLast && (
                  <div className="flex-1 h-px bg-zinc-300 mx-0" />
                )}
              </div>
            );
          })}

          {/* ── Single dot — travels the full width of the row ── */}
          {inView && rowW > 0 && (
            <motion.span
              aria-hidden="true"
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary pointer-events-none"
              style={{
                /* Dot starts centered on circle 1 (16 px = half of w-8) */
                left: 13,           /* 16px center − 3px (half dot) */
                boxShadow:
                  "0 0 0 2px oklch(0.528 0.113 235.573 / 0.25), 0 0 10px 3px oklch(0.528 0.113 235.573 / 0.7)",
              }}
              animate={{
                /* Dot ends centered on circle 4 */
                x: rowW - 13 - 13, /* total − startOffset − endOffset */
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                repeatDelay: 0.9,
                ease: "linear",
              }}
            />
          )}
        </div>

        {/* ── Card grid ────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.09, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Mobile-only step indicator (desktop uses the shared row above) */}
              <div className="flex items-center mb-4 lg:hidden">
                <div className="w-8 h-8 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                </div>
              </div>

              {/* Card */}
              <div className="group border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50 hover:border-zinc-300 overflow-hidden flex flex-col flex-1 transition-all duration-300 shadow-sm hover:shadow-md">

                {/* Image */}
                <div className="relative h-44 overflow-hidden shrink-0">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center bg-black/55 backdrop-blur-sm border border-white/15 rounded px-2 py-0.5 text-[10px] font-bold text-white/80 uppercase tracking-widest">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-zinc-900 leading-snug mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed flex-1 mb-4">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-100">
                    <Clock className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-zinc-500">
                      {step.timeEst}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.42, ease: "easeOut" }}
          className="mt-10"
        >
          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors"
          >
            Start your application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
