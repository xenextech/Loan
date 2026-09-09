"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ThreeLine } from "@/public/svg/svgIcons";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EligibilityForm } from "./EligibilityChecker";
import StatsSection from "./StatsSection";

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    animatedWord: "Master's",
    image: "/assets/hero.png",
    alt: "Happy student in graduation cap and gown holding a diploma",
  },
  {
    animatedWord: "Bachelor's",
    image: "/assets/hero2.png",
    alt: "Students studying together in academic attire",
  },
  {
    animatedWord: "PhD",
    image: "/assets/hero3.png",
    alt: "Group of graduates celebrating at a ceremony",
  },
  {
    animatedWord: "SEE",
    image: "/assets/hero4.png",
    alt: "Group of graduates celebrating at a ceremony",
  },
   {
    animatedWord: "Re-Skilling",
    image: "/assets/hero2.png",
    alt: "Group of graduates celebrating at a ceremony",
  },
  {
    animatedWord: "Up Skilling",
    image: "/assets/hero3.png",
    alt: "Group of graduates celebrating at a ceremony",
  }
] as const;

const STATIC_SUB =
  "Submit your application and documents online. Partner banks review your case directly — no branch visit needed.";

const ANIMATED_WORDS = SLIDES.map((s) => s.animatedWord) as readonly string[];


/* ─── Typewriter hook — loops: type → pause → erase → next word ─────────── */
function useTypewriter(words: readonly string[], speed = 45) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const word = words[wordIndex];
    let n = 0;
    let id: ReturnType<typeof setTimeout>;

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

    id = setTimeout(() => {
      setDisplayed("");
      setTyping(true);
      id = setTimeout(forward, speed);
    }, 0);
    return () => clearTimeout(id);
  }, [wordIndex]); // words and speed are stable module-level constants

  return { displayed, typing, wordIndex, jump: setWordIndex };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const { displayed: typed, wordIndex, jump } = useTypewriter(ANIMATED_WORDS);
  const slide = SLIDES[wordIndex];

  // Broadcast slide changes so SlideCounter can sync without prop-drilling
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("heroSlideChange", {
        detail: { index: wordIndex, total: SLIDES.length, word: ANIMATED_WORDS[wordIndex] },
      })
    );
  }, [wordIndex]);

  // Listen for jump requests fired by SlideCounter dots
  useEffect(() => {
    const handler = (e: Event) => jump((e as CustomEvent<{ index: number }>).detail.index);
    window.addEventListener("heroSlideJump", handler);
    return () => window.removeEventListener("heroSlideJump", handler);
  }, [jump]);

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row relative pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 lg:pb-16">

        {/* ── Left panel ─────────────────────────────────────────────────────── */}
        <div className="relative flex flex-col justify-center w-full lg:w-[55%] xl:w-[52%] lg:pr-10">

          {/* Eyebrow */}
          <p className="text-[10px] sm:text-[10.5px] font-bold text-primary uppercase tracking-[0.2em] mb-3">
            Education Loan Platform · Nepal
          </p>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-[1.9rem] xs:text-[2.2rem] sm:text-5xl lg:text-[3.1rem] font-bold tracking-tight text-zinc-900 leading-[1.09] mb-4 sm:mb-5 min-h-[2.2em]"
          >
            Apply for loan that{" "}
            <span className="relative inline-block">
              funds
              <ThreeLine className="hidden lg:block absolute -top-2 -right-7 w-9 h-9 text-primary" />
            </span>
            {" "}your{" "}
            <span className="bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent">{typed}</span>
            <span
              aria-hidden="true"
              className="inline-block w-0.75 h-[0.78em] bg-primary ml-0.5 align-middle rounded-sm animate-pulse"
            />
          </h1>

          {/* Sub-copy */}
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-4 sm:mb-5 max-w-xl">
            {STATIC_SUB}
          </p>

          {/* CTAs */}
          <div className="flex flex-col lg:flex-row gap-3">
            <Link href="/apply" className="xs:flex-none">
              <Button
                size="lg"
                className="w-full xs:w-auto h-11 px-7 text-sm font-semibold rounded-xl"
              >
                Apply For Loan
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full lg:w-auto h-11 px-7 text-sm font-medium rounded-xl border-zinc-300 text-zinc-700 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-400"
                >
                  Check Eligibility
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-[95vw] sm:max-w-3xl lg:max-w-4xl p-0 overflow-hidden gap-0"
                style={{ maxHeight: "90vh" }}
              >
                <EligibilityForm onDone={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Mobile / tablet hero image — below text on small screens ──────── */}
        <div className="lg:hidden relative w-full mt-8 sm:mt-10 h-56 xs:h-64 sm:h-80">
          <AnimatePresence mode="sync">
            <motion.div
              key={`mobile-${wordIndex}`}
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
                className="w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right panel — desktop only ──────────────────────────────────────── */}
        <div className="hidden lg:flex relative flex-1 items-center justify-center">
          <div className="relative z-10 w-full h-130">
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
                className="w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      </div>

      <div className="-mt-10 lg:-mt-30">
        <StatsSection />
      </div>

    </section>
  );
}
