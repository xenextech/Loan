"use client";
import { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 5,    suffix: "K+",  label: "Students Guided" },
  { value: 4.5,  decimals: 1, prefix: "Rs.", suffix: "Cr+", label: "Loans Facilitated" },
  { value: 7,    suffix: "",   label: "Provinces Covered" },
  { value: 90,   suffix: "%",  label: "Approval Rate" },
  { value: 12,   suffix: "+",  label: "Partner Banks" },
  { value: 2400, suffix: "+",  label: "Applications Processed" },
] as const;

/* ─── Animated number ────────────────────────────────────────────────────── */
function StatValue({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  inView,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  inView: boolean;
}) {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) =>
    prefix +
    latest.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix
  );

  useIsomorphicCountUp(count, value, inView);

  return <motion.span>{display}</motion.span>;
}

function useIsomorphicCountUp(
  count: ReturnType<typeof useMotionValue<number>>,
  value: number,
  inView: boolean,
) {
  const started = useRef(false);

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      animate(count, value, { duration: 1.6, ease: "easeOut" });
    }
  }, [inView, count, value]);
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function OurImpact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="our-impact"
      ref={ref}
      className="py-20 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4">
            Our Impact
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
            Numbers that show{" "}
            <span className="inline-block bg-linear-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">
              real progress
        
            </span>
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed">
            A quick look at how Unnati is helping students and families access
            education financing across Nepal.
          </p>
        </motion.div>

        {/* ── Stat grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 * i, ease: "easeOut" }}
              className="rounded-2xl bg-white px-5 py-8 text-center border border-gray-200 shadow"
            >
              <p className="text-2xl sm:text-[28px] font-extrabold text-[#0F7D3C] tabular-nums tracking-tight">
                <StatValue
                  value={stat.value}
                  prefix={"prefix" in stat ? stat.prefix : ""}
                  suffix={stat.suffix}
                  decimals={"decimals" in stat ? stat.decimals : 0}
                  inView={inView}
                />
              </p>
              <p className="text-sm text-zinc-500 mt-1.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
