"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ThreeLine } from "@/public/svg/svgIcons";

function DecoPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="cta-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.07" />
        </pattern>
      </defs>
      <rect width="1200" height="480" fill="url(#cta-dots)" />

      {/* Large outer ring — top-left */}
      <circle cx="-40" cy="-40" r="300" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="60" />
      {/* Large outer ring — bottom-right */}
      <circle cx="1240" cy="520" r="340" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="60" />

      {/* Subtle hexagon — center-right */}
      <polygon
        points="980,60 1120,140 1120,300 980,380 840,300 840,140"
        fill="none"
        stroke="white"
        strokeOpacity="0.08"
        strokeWidth="1.5"
        strokeDasharray="10 6"
      />

      {/* Subtle hexagon — center-left */}
      <polygon
        points="220,100 330,160 330,280 220,340 110,280 110,160"
        fill="none"
        stroke="white"
        strokeOpacity="0.07"
        strokeWidth="1"
        strokeDasharray="7 5"
      />
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function CTASection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-16 bg-[#F8F6F1] border-b border-zinc-200"
    >
      {/* Constrained to same width as HowItWorks / other sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Rounded card with gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #005f87 0%, #0074A3 45%, #0089c0 100%)" }}
      >
        <DecoPattern />

      {/* Two-column layout: text left, illustration right */}
      <div className="relative z-10 flex items-stretch">

        {/* Left: text + CTAs */}
        <div className="flex-1 py-16 px-6 sm:px-12 lg:px-16">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35 }}
            className="text-[10.5px] font-bold text-white/60 uppercase tracking-[0.22em] mb-5"
          >
            Get Started Today
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-5"
          >
            Ready to fund your{" "}
            <span className="relative inline-block">
              future?
              <ThreeLine className="absolute -top-4 -right-5 w-9 h-9 text-white/70" />
              <svg
                className="absolute -bottom-1 left-0 w-full overflow-visible"
                viewBox="0 0 80 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5.5 Q16 1.5 30 5.5 Q44 9.5 58 5.5 Q68 2.5 78 5.5"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="text-base sm:text-lg text-white/70 leading-relaxed mb-10 max-w-lg"
          >
            Fill in one application. Let Cliq connect you with NRB-regulated partner banks.
            No branch visit, no paper forms — decisions in days, not weeks.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="flex flex-col sm:flex-row items-start gap-3"
          >
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-black/15 hover:bg-white/90 transition-colors"
            >
              Start Application
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#emi-calculator"
              scroll={false}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("emi-calculator")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/50 transition-colors"
            >
              Calculate my EMI
            </Link>
          </motion.div>

        </div>

        {/* Right: graduate illustration anchored to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="hidden lg:flex flex-col justify-end w-72 xl:w-80 shrink-0"
        >
          <Image
            src="/assets/cta.png"
            alt="Happy graduate celebrating with diploma"
            width={320}
            height={380}
            className="w-full h-auto object-contain object-bottom mix-blend-multiply select-none pointer-events-none"
          />
        </motion.div>

      </div>
      </motion.div>
      </div>
    </section>
  );
}
