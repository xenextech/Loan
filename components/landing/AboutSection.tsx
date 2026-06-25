"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Building2 } from "lucide-react";
import CardSwap, { Card } from "@/components/CardSwap";

const CARDS = [
  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=480&fit=crop&auto=format&q=80",
    alt: "Students working on laptops completing education loan applications",
    label: "Our Role",
    title: "Platform, not a lender",
    desc: "We facilitate the process. Partner banks own all credit decisions and disbursements independently.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN0dWRlbnRzfGVufDB8fDB8fHww",
    alt: "Students on a university campus preparing loan applications",
    label: "Who We Serve",
    title: "Built for Nepali students",
    desc: "For students applying to institutions in Nepal and abroad, along with their guardians and co-applicants.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=480&fit=crop&auto=format&q=80",
    alt: "Loan officer at a partner bank reviewing a submitted application",
    label: "Our Network",
    title: "NRB-regulated partner banks",
    desc: "All partner banks operate under Nepal Rastra Bank regulation and BAFIA 2073 compliance.",
  },
] as const;

const CARD_W = 500;
const CARD_H = 400;

// Reusable shorthand for scroll-triggered fade-up
function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 14 },
    transition: { duration: 0.4, delay, ease: "easeOut" },
  } as const;
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef    = useRef<HTMLDivElement>(null);
  const inView     = useInView(sectionRef, { once: true, margin: "-80px" });

  const [rightHeight, setRightHeight] = useState(520);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const sync = () => setRightHeight(el.offsetHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const animate = (delay = 0) => ({
    animate: inView ? { opacity: 1, y: 0 } : {},
    ...fadeUp(delay),
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 bg-background border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── Left: Text — each element staggers in ──────── */}
          <div ref={leftRef}>
            <motion.p
              {...animate(0)}
              className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4"
            >
              About Cliq
            </motion.p>

            <motion.h2
              {...animate(0.07)}
              className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-6 max-w-md"
            >
              A simpler path to education financing in Nepal
            </motion.h2>

            <motion.p
              {...animate(0.13)}
              className="text-base text-muted-foreground leading-relaxed mb-4"
            >
              Cliq is a digital education loan application platform — not a bank, not a lender.
              We exist to make the loan application process clearer, faster, and less stressful
              for students and their families across Nepal.
            </motion.p>

            <motion.p
              {...animate(0.18)}
              className="text-sm text-muted-foreground leading-relaxed mb-4"
            >
              Rather than visiting multiple bank branches with stacks of paper forms, students
              can submit a single structured application through our platform, upload required
              documents digitally, and receive status updates — all in one place.
            </motion.p>

            <motion.p
              {...animate(0.23)}
              className="text-sm text-muted-foreground leading-relaxed mb-6"
            >
              We work alongside partner banks to ensure your application reaches the right people
              with the right documentation. The goal is to reduce friction, not replace the
              banking relationship.
            </motion.p>

            {/* Regulatory note */}
            <motion.div
              {...animate(0.28)}
              className="flex gap-3 items-start border border-border rounded-xl bg-muted/40 px-4 py-3.5 mb-8"
            >
              <Building2
                className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                All partner banks are regulated by{" "}
                <span className="font-semibold text-foreground">Nepal Rastra Bank (NRB)</span>{" "}
                and operate under the Banks and Financial Institutions Act (BAFIA) 2073.
              </p>
            </motion.div>

            {/* CTA — nudges right on hover to suggest forward motion */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.34, ease: "easeOut" }}
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

          {/* ── Right: CardSwap — slides in from the right ── */}
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
            className="relative hidden lg:flex items-center justify-center"
            style={{ height: rightHeight }}
          >
            <div className="relative w-115 h-97.5">
              <CardSwap
                width={CARD_W}
                height={CARD_H}
                cardDistance={52}
                verticalDistance={66}
                delay={3800}
                pauseOnHover
                skewAmount={5}
                easing="elastic"
              >
                {CARDS.map((card) => (
                  <Card
                    key={card.title}
                    customClass="!border !border-gray-200 overflow-hidden"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={card.image}
                        alt={card.alt}
                        fill
                        className="object-cover"
                        sizes="420px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {card.label}
                        </p>
                        <h3 className="text-[15px] font-bold text-white leading-snug mb-1.5">
                          {card.title}
                        </h3>
                        <p className="text-xs text-white/65 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
