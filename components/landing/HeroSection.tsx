"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Slide data ─────────────────────────────────────────────────────────── */

const SLIDES = [
  {
    headline: "Apply for education loans from home.",
    sub:
      "Submit your application and documents online. Partner banks review your case and communicate the decision directly — no branch visit needed.",
    image:
      "/assets/about.jpg",
    alt: "Students walking on a university campus",
  },
  {
    headline: "Your studies deserve the right funding.",
    sub:
      "We connect Nepali students with NRB-regulated partner banks for a seamless, paperwork-free loan application experience.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=1200&fit=crop&auto=format&q=80",
    alt: "Students studying together in a library",
  },
  {
    headline: "From application to decision — all online.",
    sub:
      "No branch visit required. Upload documents, track your status, and receive the bank's decision from one platform.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&h=1200&fit=crop&auto=format&q=80",
    alt: "Student working on a laptop at a desk",
  },
] as const;

const STATS = [
  { num: 12, suffix: "+", label: "Partner banks"  },
  { num: 4,  suffix: "",  label: "Steps to apply" },
  { num: 0,  suffix: "",  label: "Branch visits"  },
] as const;

const INTERVAL_MS = 6000;

/* ─── Typewriter hook ────────────────────────────────────────────────────── */

function useTypewriter(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState(text);
  const [typing, setTyping]       = useState(false);

  useEffect(() => {
    setDisplayed("");
    setTyping(true);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setTyping(false);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, typing };
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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(to * eased));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    const timerId = window.setTimeout(() => {
      rafId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(rafId);
    };
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
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const slide                        = SLIDES[current];
  const { displayed: typed, typing } = useTypewriter(slide.headline);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const go = useCallback((dir: 1 | -1) => {
    setCurrent((c) => (c + dir + SLIDES.length) % SLIDES.length);
  }, []);

  /* Reset countdown whenever the slide changes (manual or auto) */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, current, go]);

  return (
    <section
      className="flex min-h-screen overflow-hidden"
      aria-labelledby="hero-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* ── Left panel — warm off-white, content ────────────────────────── */}
      <div className="relative flex flex-col justify-center w-full lg:w-[55%] xl:w-[52%] bg-[#F8F6F1] px-6 sm:px-10 lg:px-14 xl:px-20 pt-24 pb-12 lg:pt-0 lg:pb-0">

        {/* Eyebrow — fades on slide change */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`ey-${current}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[10.5px] font-bold text-primary uppercase tracking-[0.2em] mb-6"
          >
            Education Loan Platform · Nepal
          </motion.p>
        </AnimatePresence>

        {/* Headline with typewriter + blinking cursor */}
        <h1
          id="hero-heading"
          className="text-[2.5rem] sm:text-5xl lg:text-[3.1rem] font-bold tracking-tight text-zinc-900 leading-[1.09] mb-5 min-h-[2.2em]"
        >
          {typed}
          <span
            aria-hidden="true"
            className={`inline-block w-[3px] h-[0.8em] bg-primary ml-[2px] align-middle rounded-sm transition-opacity duration-200 ${
              typing ? "opacity-100 animate-pulse" : "opacity-0"
            }`}
          />
        </h1>

        {/* Sub-copy — slides up on transition */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.38, delay: 0.08 }}
            className="text-base text-zinc-600 leading-relaxed max-w-[460px] mb-2"
          >
            {slide.sub}
          </motion.p>
        </AnimatePresence>

        <p className="text-sm text-zinc-400 max-w-[460px] mb-10">
          Cliq is not a lender. We connect students with NRB-regulated banks.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href="/apply">
            <Button
              size="lg"
              className="w-full sm:w-auto h-11 px-7 text-sm font-semibold rounded-xl"
            >
              Start Application
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => scrollTo("how-it-works")}
            className="w-full sm:w-auto h-11 px-7 text-sm font-medium rounded-xl border-zinc-300 text-zinc-700 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-400"
          >
            How It Works
          </Button>
        </div>

        {/* Stats + slide controls on one baseline */}
        <div className="flex items-end justify-between gap-4 pt-8 border-t border-zinc-200">

          {/* Stats — each number counts up on mount */}
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

          {/* Prev / dots / Next */}
          {/* <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel slides">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-white/30 hover:bg-white/55"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div> */}
        </div>

        {/* Right-edge blend — left panel fades into image */}
        <div
          className="hidden lg:block absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F8F6F1] to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      </div>

      {/* ── Right panel — image carousel ─────────────────────────────────── */}
      <div className="hidden lg:block relative flex-1 overflow-hidden" aria-hidden="true">

        {/* Images — crossfade + Ken Burns */}
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1   }}
            exit={{    opacity: 0             }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Left-edge gradient — blends image into the warm left panel */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F8F6F1] to-transparent z-10 pointer-events-none" />

        {/* Subtle tint so bright images don't blow out */}
        <div className="absolute inset-0 bg-black/10 z-[5] pointer-events-none" />

        {/* Slide counter — top right */}
        <div className="absolute top-10 right-10 z-20 select-none">
          <span className="text-white/50 text-xs font-mono tracking-[0.15em]">
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {/* Vertical dot track — right edge */}
        <div className="absolute right-7 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-[3px] rounded-full transition-all duration-300 ${
                i === current ? "h-7 bg-primary" : "h-2.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-200 z-30" aria-hidden="true">
        {!paused && (
          <motion.div
            key={`progress-${current}`}
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
          />
        )}
      </div>

    </section>
  );
}
