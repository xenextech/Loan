"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/* ─── Stagger helper ─────────────────────────────────────────────────────── */
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const anim = (delay = 0) => ({
    animate: inView ? { opacity: 1, y: 0 } : {},
    ...fadeUp(delay),
  });

  return (
    <section
      id="about"
      ref={ref}
      className="py-16 sm:py-20 lg:py-24 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">
          {/* ── Left: text content ─────────────────────────────────────── */}
          <div>
            <motion.p
              {...anim(0)}
              className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-3"
            >
              About Unnati
            </motion.p>

            <motion.h2
              {...anim(0.07)}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4 sm:mb-5 max-w-lg"
            >
              A simpler path to education{" "}
              <span className="inline-block">
                <span className="bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">
                  financing in Nepal
                </span>
              </span>
            </motion.h2>

            <motion.p
              {...anim(0.13)}
              className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-4"
            >
              Unnati is a digital education loan application platform — not a
              bank, not a lender. We exist to make the loan application process
              clearer, faster, and less stressful for students and their
              families across Nepal.
            </motion.p>

            <motion.p
              {...anim(0.19)}
              className="text-sm text-zinc-500 leading-relaxed mb-6 sm:mb-7"
            >
              Rather than visiting multiple bank branches with paper forms,
              students submit a single structured application through our
              platform, upload documents digitally, and receive status updates —
              all in one place. We work alongside partner banks to ensure your
              application reaches the right people with the right documentation.
            </motion.p>

            {/* CTA */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.31, ease: "easeOut" }}
              whileHover={{ x: 4 }}
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors"
            >
              See how the process works
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* ── Right: image panel — visible on all screen sizes ──────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="relative rounded-3xl overflow-hidden h-64 sm:h-80 lg:h-[520px]"
          >
            <Image
              src="/assets/abour.jpeg"
              alt="Students on a university campus in Nepal"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
            />
            <div className="absolute inset-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
