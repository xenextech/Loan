"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
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

/* ─── Shared CTA content ─────────────────────────────────────────────────── */
function CTAContent({
  inView,
  mobile = false,
}: {
  inView: boolean;
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? "px-6 py-10" : "flex-1 py-10 sm:py-14 lg:py-16 px-5 sm:px-10 lg:px-16"}>
      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35 }}
        className={`text-[10.5px] font-bold uppercase tracking-[0.22em] mb-4 ${
          mobile ? "text-primary" : "text-gray-700"
        }`}
      >
        Get Started Today
      </motion.p>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.06 }}
        className={`font-bold tracking-tight leading-[1.08] mb-4 max-w-lg ${
          mobile
            ? "text-2xl text-zinc-900"
            : "text-2xl sm:text-3xl lg:text-5xl text-gray-900 sm:mb-5"
        }`}
      >
        Ready to fund your future{" "}
        <span className="relative inline-block py-1">
          education
          <ThreeLine
            className={`absolute -top-2 -right-15 w-9 h-9 ${
              mobile ? "text-primary" : "text-gray-900"
            }`}
          />
          {/* Squiggle underline */}
          <svg
            className="absolute -bottom-1 left-0 w-full overflow-visible"
            viewBox="0 0 140 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 5.5 Q22 1.5 42 5.5 Q62 9.5 82 5.5 Q102 1.5 122 5.5 Q132 7.5 138 5.5"
              stroke={mobile ? "#15C35B" : "#000000"}
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
        className={`text-sm leading-relaxed mb-8 max-w-lg ${
          mobile ? "text-zinc-500" : "text-base sm:text-lg text-gray-600 mb-10"
        }`}
      >
        Fill in one application. Let Unnati connect you with NRB-regulated
        partner banks. No branch visit, no paper forms — decisions in days, not
        weeks.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3"
      >
        <Link
          href="/apply"
          className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-8 py-3.5 rounded-xl transition-colors ${
            mobile
              ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              : "bg-gray-900 text-white shadow-lg shadow-black/15 hover:bg-gray-800/90"
          }`}
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
          className={`inline-flex items-center justify-center gap-2 font-semibold text-sm px-7 py-3.5 rounded-xl transition-colors ${
            mobile
              ? "border-2 border-primary/30 text-primary hover:bg-primary/5"
              : "border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50"
          }`}
        >
          Calculate my EMI
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Mobile version — no background image ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="block lg:hidden relative rounded-3xl overflow-hidden bg-white border border-zinc-100 shadow-sm"
        >
          {/* Subtle green top-border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#15C35B] to-[#0F7D3C]" />
          {/* Decorative dot grid — green tinted */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 360"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="cta-dots-mobile"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="#15C35B" fillOpacity="0.07" />
              </pattern>
            </defs>
            <rect width="600" height="360" fill="url(#cta-dots-mobile)" />
            <circle cx="560" cy="-20" r="180" fill="none" stroke="#15C35B" strokeOpacity="0.06" strokeWidth="40" />
            <circle cx="40" cy="340" r="160" fill="none" stroke="#15C35B" strokeOpacity="0.06" strokeWidth="40" />
          </svg>
          <CTAContent inView={inView} mobile={true} />
        </motion.div>

        {/* ── Desktop version — with background image ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden lg:block relative rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/assets/cta.png")' }}
        >
          {/* Dark overlay to keep text readable */}
          <div className="absolute inset-0 bg-black/20" />
          <DecoPattern />

          <div className="relative z-10 flex items-stretch">
            <CTAContent inView={inView} mobile={false} />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
