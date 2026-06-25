"use client";
import { useRef } from "react";
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
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-24 border-y border-border bg-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-4">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4 max-w-lg">
            From application to decision —{" "}
            <span className="text-muted-foreground font-medium">one platform</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Cliq guides you through each stage of the education loan process and
            coordinates with partner banks on your behalf.
          </p>
        </motion.div>

        {/* ── Step cards ──────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 22 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.09, ease: "easeOut" }}
                className="flex flex-col"
              >
                {/* Step number + horizontal connector (desktop only) */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                  </div>
                  {!isLast && (
                    <div className="hidden lg:block flex-1 h-px bg-border ml-2" />
                  )}
                </div>

                {/* Card */}
                <div className="group border border-border rounded-xl bg-card overflow-hidden flex flex-col flex-1 hover:shadow-md transition-shadow duration-300">

                  {/* Image */}
                  <div className="relative h-44 overflow-hidden shrink-0">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Gradient scrim — helps chip read against any photo */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />

                    {/* Step chip */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-background/88 backdrop-blur-sm border border-white/20 rounded px-2 py-0.5 text-[10px] font-bold text-foreground/75 uppercase tracking-widest">
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-snug mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {step.timeEst}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom CTA ──────────────────────────────────── */}
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
