"use client";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Signal,
  Wifi,
  Battery,
  CheckCircle2,
  Circle,
  Clock,
  PartyPopper,
  UserPlus,
  Mail,
  MailCheck,
  LogIn,
} from "lucide-react";
import Image from "next/image";


/* ─── Step data ──────────────────────────────────────────────────────────── */
const STEPS = [
  {
    title: "Sign Up & Sign In",
    description:
      "Create your free account with just your email and password, verify it via the link we email you, then sign in to get started.",
      icon:<Image src="/assets/add-user.png" alt="Login" width={48} height={48} />,
    screen: "signin",
  },
  {
    title: "Check Eligibility",
    description:
      "Use our eligibility checker to see if you meet the basic criteria for an education loan. This step helps you understand your chances before applying.",
      icon:<Image src="/assets/check-mark.png" alt="Check" width={48} height={48} />,
    screen: "eligibility",
  },
  {
    title: "Apply & Track",
    description:
      "Submit your application through our platform, upload required documents digitally, and track your application status in real time.",
      icon:<Image src="/assets/checklist.png" alt="Apply" width={48} height={48} />,
    screen: "apply",
  },
  {
    title: "Get Approved & Funded",
    description:
      "Once your application is approved, the bank will disburse the funds directly to your college account.",
      icon:<Image src="/assets/approve.png" alt="Approve" width={48} height={48} />,
    screen: "funded",
  },
] as const;

type ScreenId = (typeof STEPS)[number]["screen"];

/* ─── Per-step mock screens ─────────────────────────────────────────────── */
function SignInScreen() {
  const steps = [
    { label: "Create Account", icon: UserPlus, status: "done" as const },
    { label: "Verify Email", icon: Mail, status: "current" as const },
    { label: "Sign In", icon: LogIn, status: "pending" as const },
  ];

  return (
    <div className="flex flex-col h-full px-5 pt-4">
      <p className="text-[15px] font-bold text-zinc-900 mb-1">Create Your Account</p>
      <p className="text-[11px] text-zinc-400 mb-5">Sign up with just your email</p>

      <div className="space-y-3 mb-5">
        {steps.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              s.status === "current" ? "border-primary/30 bg-primary/5" : "border-zinc-200"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                s.status === "done"
                  ? "bg-primary/15 text-primary"
                  : s.status === "current"
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {s.status === "done" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
            </div>
            <p
              className={`text-[12.5px] font-semibold ${
                s.status === "pending" ? "text-zinc-400" : "text-zinc-800"
              }`}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <MailCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-primary">Check your inbox</p>
          <p className="text-[11px] text-zinc-500">Verification link sent to your email</p>
        </div>
      </div>
    </div>
  );
}

function EligibilityScreen() {
  return (
    <div className="flex flex-col h-full px-5 pt-4">
      <p className="text-[15px] font-bold text-zinc-900 mb-1">Eligibility Checker</p>
      <p className="text-[11px] text-zinc-400 mb-5">Tell us a bit about you</p>

      <div className="space-y-3 mb-5">
        <div className="rounded-xl border border-zinc-200 px-4 py-3">
          <p className="text-[10px] text-zinc-400 mb-1">Course Type</p>
          <p className="text-[13px] font-semibold text-zinc-800">Masters Abroad</p>
        </div>
        <div className="rounded-xl border border-zinc-200 px-4 py-3">
          <p className="text-[10px] text-zinc-400 mb-1">Family Monthly Income</p>
          <p className="text-[13px] font-semibold text-zinc-800">NPR 45,000</p>
        </div>
      </div>

      <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-primary">You&apos;re Eligible!</p>
          <p className="text-[11px] text-zinc-500">Est. loan up to NPR 25,00,000</p>
        </div>
      </div>
    </div>
  );
}

function ApplyTrackScreen() {
  const documents = [
    { name: "Citizenship Certificate", done: true },
    { name: "Admission Letter", done: true },
    { name: "Mark Sheet", done: false },
  ];
  return (
    <div className="flex flex-col h-full px-5 pt-4">
      <p className="text-[15px] font-bold text-zinc-900 mb-1">Application Status</p>
      <p className="text-[11px] text-zinc-400 mb-5">Track your submission in real time</p>

      <div className="space-y-3 mb-5">
        {documents.map((doc) => (
          <div
            key={doc.name}
            className="rounded-xl border border-zinc-200 px-4 py-3 flex items-center gap-3"
          >
            {doc.done ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" />
            ) : (
              <Circle className="w-4.5 h-4.5 text-zinc-300 shrink-0" />
            )}
            <p
              className={`text-[12.5px] font-semibold truncate ${
                doc.done ? "text-zinc-800" : "text-zinc-400"
              }`}
            >
              {doc.name}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-primary">Under Review</p>
          <p className="text-[11px] text-zinc-500">2 of 3 documents verified</p>
        </div>
      </div>
    </div>
  );
}

function FundedScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <PartyPopper className="w-8 h-8 text-primary" />
      </div>
      <p className="text-[16px] font-bold text-zinc-900 mb-1.5">Loan Approved!</p>
      <p className="text-[11px] text-zinc-400 mb-6">Funds disbursed to your college</p>

      <div className="w-full rounded-2xl border border-zinc-200 px-4 py-4">
        <p className="text-[10px] text-zinc-400 mb-1">Disbursed Amount</p>
        <p className="text-[20px] font-bold text-zinc-900 mb-3">NPR 20,00,000</p>
        <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full w-full rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  signin: SignInScreen,
  eligibility: EligibilityScreen,
  apply: ApplyTrackScreen,
  funded: FundedScreen,
};

/* ─── Phone mockup ───────────────────────────────────────────────────────── */
function PhoneMockup({ inView, screen }: { inView: boolean; screen: ScreenId }) {
  const ActiveScreen = SCREENS[screen];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto w-[220px] sm:w-[260px] lg:w-[300px]"
    >
      {/* Ambient glow behind phone */}
      <div className="absolute -inset-8 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      {/* ── Phone frame ── */}
      <div className="relative bg-zinc-900 rounded-[52px] p-[10px] shadow-2xl shadow-zinc-900/40 ring-1 ring-white/10">
        {/* Side buttons */}
        <div className="absolute left-[-3px] top-[88px] w-[3px] h-7 bg-zinc-700 rounded-l-full" />
        <div className="absolute left-[-3px] top-[128px] w-[3px] h-12 bg-zinc-700 rounded-l-full" />
        <div className="absolute left-[-3px] top-[188px] w-[3px] h-12 bg-zinc-700 rounded-l-full" />
        <div className="absolute right-[-3px] top-[128px] w-[3px] h-16 bg-zinc-700 rounded-r-full" />

        {/* ── Screen ── */}
        <div
          className="relative rounded-[44px] overflow-hidden bg-white"
          style={{ height: 610 }}
        >
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-3 pb-1 bg-white/90 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-zinc-900 tracking-tight">9:41</span>
            {/* Dynamic Island */}
            <div className="w-18 h-5.5 bg-zinc-900 rounded-full" />
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3 text-zinc-800" />
              <Wifi className="w-3 h-3 text-zinc-800" />
              <Battery className="w-3.5 h-3.5 text-zinc-800" />
            </div>
          </div>

          {/* Active step content, swapped on click */}
          <div className="absolute inset-0 top-9 pb-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="h-full"
              >
                <ActiveScreen />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Step card ──────────────────────────────────────────────────────────── */
function StepCard({
  step,
  index,
  inView,
  active,
  onSelect,
}: {
  step: (typeof STEPS)[number];
  index: number;
  inView: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, x: 24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: "easeOut" }}
      className={`w-full flex gap-4 items-start p-6 rounded-2xl border text-left transition-colors ${
        active
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-zinc-200 bg-white shadow-sm hover:border-primary/30 hover:bg-primary/3"
      }`}
    >
      {/* Step number */}
      <div
        className={`flex items-center justify-center shrink-0 transition-colors ${
          active ? "text-white" : "text-primary"
        }`}
      >
        {step.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-1">
        <p className="text-sm font-bold text-zinc-900 leading-snug mb-1.5">
          {step.title}
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.button>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-16 sm:py-20 lg:py-24 bg-white border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">

          {/* ── Left: phone mockup — order-2 on mobile (below steps) ─────── */}
          <div className="order-2 lg:order-1 hidden lg:block">
            <PhoneMockup inView={inView} screen={STEPS[activeIndex].screen} />
          </div>

          {/* ── Right: steps — order-1 on mobile (shown first) ──────────── */}
          <div className="order-1 lg:order-2">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-3"
            >
              How It Works
            </motion.p>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4"
            >
              Apply with Your{" "}
              <span className="inline-block bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent">
                confidence
              </span>
            </motion.h2>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-sm sm:text-base text-zinc-500 leading-relaxed mb-6 sm:mb-8 max-w-md"
            >
              Four clear steps from sign-in to funded — every step backed by
              partner banks built for Nepali students.
            </motion.p>

            {/* Step cards */}
            <div className="space-y-3 sm:space-y-5">
              {STEPS.map((step, i) => (
                <StepCard
                  key={step.title}
                  step={step}
                  index={i}
                  inView={inView}
                  active={activeIndex === i}
                  onSelect={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
