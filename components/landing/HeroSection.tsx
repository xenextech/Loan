"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ThreeLine } from "@/public/svg/svgIcons";

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    animatedWord: "Master's",
    image: "/assets/cta.png",
    alt: "Happy student in graduation cap and gown holding a diploma",
  },
  {
    animatedWord: "Bachelor's",
    image: "/assets/Hero1.png",
    alt: "Students studying together in academic attire",
  },
  {
    animatedWord: "PhD",
    image: "/assets/Hero.png",
    alt: "Group of graduates celebrating at a ceremony",
  },
  {
    animatedWord: "Skills Course",
    image: "/assets/animated.png",
    alt: "Group of graduates celebrating at a ceremony",
  },
] as const;

const STATIC_SUB =
  "Submit your application and documents online. Partner banks review your case directly — no branch visit needed.";

const ANIMATED_WORDS = SLIDES.map((s) => s.animatedWord) as readonly string[];

const STATS = [
  { num: 12, suffix: "+", label: "Partner banks" },
  { num: 4,  suffix: "",  label: "Steps to apply" },
  { num: 0,  suffix: "",  label: "Branch visits" },
] as const;

/* ─── Typewriter hook — loops: type → pause → erase → next word ─────────── */
function useTypewriter(words: readonly string[], speed = 45) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const word = words[wordIndex];
    let n = 0;
    let id: ReturnType<typeof setTimeout>;
    setDisplayed("");
    setTyping(true);

    const forward = () => {
      n++;
      setDisplayed(word.slice(0, n));
      if (n < word.length) {
        id = setTimeout(forward, speed);
      } else {
        setTyping(false);
        id = setTimeout(backward, 1800);
      }
    };

    const backward = () => {
      n--;
      setDisplayed(word.slice(0, n));
      if (n > 0) {
        id = setTimeout(backward, speed / 2);
      } else {
        id = setTimeout(() => setWordIndex((i) => (i + 1) % words.length), 300);
      }
    };

    id = setTimeout(forward, speed);
    return () => clearTimeout(id);
  }, [wordIndex]); // words and speed are stable module-level constants

  return { displayed, typing, wordIndex, jump: setWordIndex };
}

/* ─── Count-up hook ─────────────────────────────────────────────────────── */
function useCountUp(to: number, durationMs = 1500, delayMs = 500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (to === 0) return;
    let rafId = 0;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / durationMs, 1);
      setCount(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    const timerId = window.setTimeout(() => { rafId = requestAnimationFrame(step); }, delayMs);
    return () => { clearTimeout(timerId); cancelAnimationFrame(rafId); };
  }, [to, durationMs, delayMs]);

  return count;
}

function StatItem({ num, suffix, label, delay }: {
  num: number; suffix: string; label: string; delay: number;
}) {
  const count = useCountUp(num, 1500, delay);
  return (
    <div className="shrink-0">
      <p className="text-[1.6rem] font-bold text-zinc-900 tabular-nums leading-none">
        {num === 0 ? 0 : count}{suffix}
      </p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const { displayed: typed, wordIndex, jump } = useTypewriter(ANIMATED_WORDS);
  const slide = SLIDES[wordIndex];

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Radial glow behind the image panel */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-0 -translate-y-1/2 w-160 h-160 rounded-full pointer-events-none"
      />
      {/* Top-left accent glow */}
      <div
        aria-hidden="true"
        className=" absolute -top-32 -left-32 w-120 h-120 rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-screen relative">

        {/* ── Left panel — static, never changes ───────────────────────────── */}
        <div className="relative flex flex-col justify-center w-full lg:w-[55%] xl:w-[52%] pt-24 pb-12 lg:pt-0 lg:pb-0 pr-6 lg:pr-10">

          {/* Eyebrow */}
          <p className="text-[10.5px] font-bold text-primary uppercase tracking-[0.2em] mb-6">
            Education Loan Platform · Nepal
          </p>

          {/* Headline — fixed prefix + looping typewriter word */}
          <h1
            id="hero-heading"
            className="text-[2.5rem] sm:text-5xl lg:text-[3.1rem] font-bold tracking-tight text-zinc-900 leading-[1.09] mb-5 min-h-[2.2em]"
          >
            Apply for education{" "}
            <span className="relative inline-block">
              loans
              <ThreeLine className="absolute -top-2 -right-7 w-9 h-9 text-primary" />
            </span>
            {" "}from{" "}
            <span className="text-primary">{typed}</span>
            <span
              aria-hidden="true"
              className="inline-block w-0.75 h-[0.78em] bg-primary ml-0.5 align-middle rounded-sm animate-pulse"
            />
          </h1>

          {/* Sub-copy */}
          <p className="text-base text-zinc-600 leading-relaxed max-w-115 mb-2">
            {STATIC_SUB}
          </p>

          <p className="text-sm text-zinc-400 max-w-115 mb-10">
            Cliq is not a lender. We connect students with NRB-regulated banks.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/apply">
              <Button
                size="lg"
                className="w-full sm:w-auto h-11 px-7 text-sm font-semibold rounded-xl"
              >
                Apply For Loan
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollTo("how-it-works")}
              className="w-full sm:w-auto h-11 px-7 text-sm font-medium rounded-xl border-zinc-300 text-zinc-700 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-400"
            >
             Check Eligibility
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-end pt-8 border-t border-zinc-200">
            <div className="flex gap-7 sm:gap-10">
              {STATS.map(({ num, suffix, label }, i) => (
                <StatItem
                  key={label}
                  num={num}
                  suffix={suffix}
                  label={label}
                  delay={500 + i * 180}
                />
              ))}
            </div>
          </div>

        </div>

        {/* ── Right panel — image changes with wordIndex ────────────────────── */}
        <div className="hidden lg:flex relative flex-1 overflow-hidden items-center justify-center">

          {/* Photo crossfade */}
          <div className="relative z-10 w-120 h-130 rounded-3xl overflow-hidden">
            <AnimatePresence mode="sync">
              <motion.div
                key={wordIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-top overflow-auto"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide counter */}
          <div className="absolute top-10 left-[calc(28px+(--spacing(10)))] z-20 select-none">
            <span className="text-zinc-400 text-xs font-mono tracking-[0.15em]">
              {String(wordIndex + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
