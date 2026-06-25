"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Building2 } from "lucide-react";

/* ─── Stagger helper ─────────────────────────────────────────────────────── */
function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 14 },
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function AboutSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const anim = (delay = 0) => ({
    animate: inView ? { opacity: 1, y: 0 } : {},
    ...fadeUp(delay),
  });

  return (
    <section
      id="about"
      ref={ref}
      className="py-24 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: text content ─────────────────────────────────────── */}
          <div>
            <motion.p {...anim(0)} className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-4">
              About Cliq
            </motion.p>

            <motion.h2 {...anim(0.07)} className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-5 max-w-md">
              A simpler path to education{" "}
              <span className="text-zinc-400 font-medium">financing in Nepal</span>
            </motion.h2>

            <motion.p {...anim(0.13)} className="text-base text-zinc-600 leading-relaxed mb-4">
              Cliq is a digital education loan application platform — not a bank, not a
              lender. We exist to make the loan application process clearer, faster, and
              less stressful for students and their families across Nepal.
            </motion.p>

            <motion.p {...anim(0.19)} className="text-sm text-zinc-500 leading-relaxed mb-7">
              Rather than visiting multiple bank branches with paper forms, students submit
              a single structured application through our platform, upload documents
              digitally, and receive status updates — all in one place. We work alongside
              partner banks to ensure your application reaches the right people with the
              right documentation.
            </motion.p>

            {/* Regulatory callout */}
            <motion.div
              {...anim(0.25)}
              className="flex gap-3 items-start bg-[#F8F6F1] border border-zinc-200 rounded-xl px-4 py-4 mb-8"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                All partner banks are regulated by{" "}
                <span className="font-semibold text-zinc-700">Nepal Rastra Bank (NRB)</span>{" "}
                and operate under the Banks and Financial Institutions Act{" "}
                <span className="font-semibold text-zinc-700">(BAFIA) 2073</span>.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.31, ease: "easeOut" }}
              whileHover={{ x: 4 }}
              onClick={() =>
                document.getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors"
            >
              See how the process works
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* ── Right: image panel with floating stat chips ────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block relative rounded-3xl overflow-hidden h-[520px]"
          >
            {/* Main image */}
            <Image
              src="/assets/about.jpg"
              alt="Students on a university campus in Nepal"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 50vw, 640px"
            />

            {/* Gradient — darker at bottom so chips are readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

            {/* ── Floating chip: top-left ── */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg"
            >
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Partner Banks
              </p>
              <p className="text-3xl font-bold text-zinc-900 leading-none tabular-nums">
                12<span className="text-primary">+</span>
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">NRB-regulated</p>
            </motion.div>

            {/* ── Floating chip: top-right ── */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.52 }}
              className="absolute top-6 right-6 bg-primary rounded-2xl px-5 py-4 shadow-lg shadow-primary/25"
            >
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                Branch Visits
              </p>
              <p className="text-3xl font-bold text-white leading-none tabular-nums">0</p>
              <p className="text-[11px] text-white/70 mt-1">100% online</p>
            </motion.div>

            {/* ── Bottom caption ── */}
            <div className="absolute bottom-0 left-0 right-0 px-7 py-7">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-1.5">
                Built for Nepali students
              </p>
              <h3 className="text-xl font-bold text-white leading-snug max-w-xs">
                From application to decision — without leaving home.
              </h3>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
