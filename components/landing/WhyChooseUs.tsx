"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";





/* ─── Card data ──────────────────────────────────────────────────────────── */
const CARDS = [
  {
    
    title: "Fast & Simple Application",
    description:
      "Complete your education loan application online in just a few steps. Upload your documents securely and track your application from anywhere.",
    illustration:"/assets/why.png",
    accent: "#EEF7FC",
    badge: "Minutes, not days",
    badgeColor: "bg-blue-50 text-primary",
  },
  {
   
    title: "Compare Trusted Bank Options",
    description:
      "Access education loan offers from trusted banking partners in one place, making it easier to choose the option that best fits your needs.",
    illustration:"/assets/why2.png",
    accent: "#F0FDF4",
    badge: "12+ Partner banks",
    badgeColor: "bg-green-50 text-green-700",
  },
  {

    title: "Secure & Transparent Process",
    description:
      "Your personal information is protected with secure technology, and you'll receive clear updates throughout every stage of your loan application.",
    illustration: "/assets/why3.png",
    accent: "#F5F3FF",
    badge: "Bank-grade security",
    badgeColor: "bg-violet-50 text-violet-700",
  },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function WhyChooseUs() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="why-choose-us"
      className="py-20 bg-white border-b border-zinc-100"
    >
      <div className="max-w-325 mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4">
            Our Differentiator
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
            Why {" "}
            <span className="relative inline-block bg-linear-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">
             Choose Us?
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
          <p className="text-base text-zinc-500 leading-relaxed max-w-md mx-auto">
            Reasons why you choose us to apply for a loan
          </p>
        </motion.div>

        {/* ── Cards grid ───────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {CARDS.map(({ title, description, illustration: Illustration, }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.1 }}
              className="flex flex-col group  hover:-translate-y-1 transition-all duration-300"
            >
              {/* Illustration */}
              <div className="w-full h-[200px] flex items-center justify-center overflow-hidden shrink-0">
                <Image src={Illustration} alt={title} width={200} height={200} />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                
                {/* Title */}
                <h3 className="text-[17px] font-bold text-zinc-900 leading-snug mb-2 flex items-center gap-2">
                 
                  {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
