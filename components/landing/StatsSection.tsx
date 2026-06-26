"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const STATS = [
  {
    title: "Financing Up To",
    content: "10,00,000L",
    description: "For Tuition + Education Loans",
  },
  {
    title: "Approval Process",
    content: "3-4",
    description: "Business Days",
  },
  {
    title: "Fast",
    content: "Application",
    description: "Processing",
  },
  {
    title: "Lower",
    content: "Interest",
    description: "Rates",
  },
] as const;

/* ─── Single stat card ───────────────────────────────────────────────────── */
function StatCard({
  title,
  content,
  description,
  index,
}: {
  title: string;
  content: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
      className="flex flex-col items-start gap-4 flex-1 min-w-0"
    >
      {/* Stat text */}
      <div>
        <p className="text-sm font-semibold text-zinc-500">{title}</p>
        <p className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mt-1">
          {content}
        </p>
        <p className="text-[13px] text-zinc-400 leading-snug mt-1 max-w-[180px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="w-full bg-white border-y border-zinc-100 py-10 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stat grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {STATS.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}