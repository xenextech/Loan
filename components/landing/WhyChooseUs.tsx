"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Wallet, Building2, ClipboardCheck, Smartphone, CheckCircle2 } from "lucide-react";
import Image from "next/image";

/* ─── Card data ──────────────────────────────────────────────────────────── */
const CARDS = [
  {
    title: "Financing",
    gif: <Image src="/assets/earning.png" alt="Financing" width={80} height={80}  />,
    items: ["Education Loans", "Skill Loans", "No-Collateral Options", "Flexible Tenure"],
  },
  {
    title: "Partner Banks",
    gif: <Image src="/assets/stakeholder.png" alt="Partner Banks" width={80} height={80}  />, 
    items: ["18+ Partner Banks", "Best-Rate Matching", "NRB-Regulated Lenders"],
  },
  {
    title: "Application Support",
    gif: <Image src="/assets/customer.png" alt="Application Support" width={80} height={80}  />,
    items: ["Eligibility Check", "Document Checklist", "Application Tracking", "Dedicated Support"],
  },
  {
    title: "Digital Tools",
    gif: <Image src="/assets/calculator-tool.png" alt="Digital Tools" width={80} height={80}  />,
    items: ["EMI Calculator", "Online Application", "Real-time Status", "Secure Document Upload"],
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
      className="py-16 sm:py-20 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
            Why {" "}
            <span className="inline-block bg-linear-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">
             Choose Us?
            </span>
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed max-w-md mx-auto">
            Reasons why you choose us to apply for a loan
          </p>
        </motion.div>

        {/* ── Cards grid ───────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {CARDS.map(({ title, gif, items }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.1 }}
              whileHover={{
                scale: 1.04,
                y: -4,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className="rounded-2xl bg-white border border-zinc-100 px-6 py-7 shadow-sm hover:shadow-lg hover:border-primary/20 transition-shadow duration-300 cursor-pointer"
            >
              {/* Icon */}
              <span className="flex items-center justify-center w-11 h-11 rounded-xl mb-5">
                {gif}
              </span>

              {/* Title */}
              <h3 className="text-[17px] font-bold text-zinc-900 leading-snug mb-3">
                {title}
              </h3>

              {/* Checklist */}
              <ul>
                {items.map((item, j) => (
                  <li
                    key={item}
                    className={`flex items-center gap-2.5 py-2.5 text-[13.5px] text-zinc-600 ${
                      j < items.length - 1 ? "border-b border-zinc-200/70" : ""
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
