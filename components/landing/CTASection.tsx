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
        <pattern
          id="cta-dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.07" />
        </pattern>
      </defs>
      <rect width="1200" height="480" fill="url(#cta-dots)" />

      {/* Large outer ring — top-left */}
      <circle
        cx="-40"
        cy="-40"
        r="300"
        fill="none"
        stroke="white"
        strokeOpacity="0.06"
        strokeWidth="60"
      />
      {/* Large outer ring — bottom-right */}
      <circle
        cx="1240"
        cy="520"
        r="340"
        fill="none"
        stroke="white"
        strokeOpacity="0.06"
        strokeWidth="60"
      />

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
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-16">
      {/* Constrained to same width as HowItWorks / other sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rounded card with background image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/assets/cta.png")' }}
        >
          {/* Dark overlay to keep text readable */}
          <div className="absolute inset-0 bg-black/20" />
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
                className="text-[10.5px] font-bold text-gray-700 uppercase tracking-[0.22em] mb-5"
              >
                Get Started Today
              </motion.p>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.08] mb-5 max-w-lg"
              >
                Ready to fund your future{" "}
                <span className="relative inline-block py-1">
                  education
                  <ThreeLine className="absolute -top-2 -right-15 w-9 h-9 text-gray-900" />
                  {/* Green squiggle underline — scoped to just this word */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full overflow-visible"
                    viewBox="0 0 140 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5.5 Q22 1.5 42 5.5 Q62 9.5 82 5.5 Q102 1.5 122 5.5 Q132 7.5 138 5.5"
                      stroke="#000000"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>{" "}
                ?
              </motion.h2>

              {/* Sub-copy */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 max-w-lg"
              >
                Fill in one application. Let Unnati connect you with
                NRB-regulated partner banks. No branch visit, no paper forms —
                decisions in days, not weeks.
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
                  className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-black/15 hover:bg-white/90 transition-colors"
                >
                  Apply For Loan
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#emi-calculator"
                  scroll={false}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("emi-calculator")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/50 transition-colors"
                >
                  Calculate my EMI
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
