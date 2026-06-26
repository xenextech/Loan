"use client";
import { useState, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Zap, ShieldCheck, CheckCircle2, Clock, ArrowRight, ChevronRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button }   from "@/components/ui/button";
import Image from "next/image";

/* ─── Form types & constants ─────────────────────────────────────────────── */
const INITIAL_FORM = {
  salutation:   "",
  firstName:    "",
  middleName:   "",
  lastName:     "",
  dobAD:        "",
  dobBS:        "",
  nationality:  "",
  mobile:       "",
  email:        "",
  branch:       "",
  salary:       "",
  otherEmis:    "0",
  loanType:     "",
  interestRate: "",
  loanAmount:   "",
  tenure:       "",
};
type FormKey   = keyof typeof INITIAL_FORM;
type FormState = Record<FormKey, string>;

const REQUIRED: FormKey[] = [
  "salutation","firstName","lastName","dobAD","dobBS",
  "nationality","mobile","branch","salary","otherEmis",
  "loanType","loanAmount","tenure",
];

const RATES: Record<string, string> = {
  education: "10.5",
  home:      "9.5",
  personal:  "14.0",
  business:  "12.5",
};

const BRANCHES = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara",
  "Chitwan", "Butwal", "Biratnagar", "Birgunj",
];

/* ─── Eligibility form (inside dialog) ──────────────────────────────────── */
export function EligibilityForm({ onDone }: { onDone: () => void }) {
  const [form, setForm]           = useState<FormState>(INITIAL_FORM);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: FormKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLoanType = (value: string) =>
    setForm((prev) => ({ ...prev, loanType: value, interestRate: RATES[value] ?? "" }));

  const progress = useMemo(
    () => Math.round((REQUIRED.filter((k) => form[k] !== "").length / REQUIRED.length) * 100),
    [form],
  );

  const isValid = confirmed && REQUIRED.every((k) => form[k] !== "");

  /* ── Submit → show result state ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Eligibility check complete!</h3>
        <p className="text-sm text-zinc-500 mb-1">Based on your inputs, you appear to qualify for an education loan.</p>
        <p className="text-xs text-zinc-400 mb-8">Final eligibility is determined by the partner bank after full review.</p>

        <div className="w-full max-w-sm bg-[#F8F6F1] border border-zinc-200 rounded-2xl p-5 mb-8 text-left">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Indicative Sanction</p>
          <p className="text-2xl font-bold text-primary mb-3">Rs. 8 – 15 L</p>
          <div className="w-full h-2 bg-zinc-200 rounded-full mb-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" style={{ width: "78%" }} />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Eligibility score</span>
            <span className="font-bold text-zinc-900">78 / 100</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Start Full Application
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 px-4 py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /* ── Field helpers ── */
  const field = (
    key: FormKey,
    label: string,
    required: boolean,
    node: React.ReactNode,
  ) => (
    <div>
      <Label htmlFor={key} className="block text-xs font-semibold text-zinc-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {node}
    </div>
  );

  const textInput = (key: FormKey, placeholder: string, type = "text") => (
    <Input
      id={key}
      type={type}
      value={form[key]}
      onChange={(e) => update(key, e.target.value)}
      placeholder={placeholder}
      className="h-10 border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 focus:border-primary"
    />
  );

  const rsInput = (key: FormKey, placeholder: string) => (
    <div className="flex h-10">
      <div className="flex items-center px-3 text-xs font-semibold text-zinc-500 bg-zinc-100 border border-r-0 border-zinc-200 rounded-l-lg select-none whitespace-nowrap">
        Rs.
      </div>
      <Input
        id={key}
        type="number"
        min="0"
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className="rounded-l-none border-zinc-200 h-full flex-1 text-sm placeholder:text-zinc-400 focus:border-primary"
      />
    </div>
  );

  const selectInput = (key: FormKey, placeholder: string, items: { value: string; label: string }[]) => (
    <Select value={form[key]} onValueChange={(v) => update(key, v)}>
      <SelectTrigger id={key} className="h-10 border-zinc-200 rounded-lg text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((it) => (
          <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col" style={{ maxHeight: "88vh" }}>

      {/* ── Dialog header ── */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-100 shrink-0">
        <DialogTitle className="text-xl font-bold text-primary leading-tight">
          Check Loan Eligibility
        </DialogTitle>
        <p className="text-xs text-zinc-400 mt-0.5">* Required fields</p>
      </div>
      <DialogDescription className="sr-only">
        Fill in the form below to check your education loan eligibility.
      </DialogDescription>

      {/* ── Progress bar ── */}
      <div className="px-6 py-3 bg-primary/4 border-b border-zinc-100 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Zap className="w-3 h-3" />
            Let&apos;s check what you qualify for
          </div>
          <span className="text-xs font-bold text-primary tabular-nums">{progress}%</span>
        </div>
        {/* Custom progress bar */}
        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Scrollable form body ── */}
      <div className="px-6 py-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5">

          {/* Row 1 */}
          {field("salutation", "Salutation", true,
            selectInput("salutation", "Select an option", [
              { value: "mr",  label: "Mr."  },
              { value: "mrs", label: "Mrs." },
              { value: "ms",  label: "Ms."  },
              { value: "dr",  label: "Dr."  },
            ])
          )}
          {field("firstName",  "First Name",   true,  textInput("firstName",  "First Name"))}
          {field("middleName", "Middle Name",  false, textInput("middleName", "Middle Name"))}

          {/* Row 2 */}
          {field("lastName", "Last Name",   true, textInput("lastName", "Last Name"))}
          {field("dobAD",    "DOB (AD)",    true, textInput("dobAD",    "mm/dd/yyyy", "date"))}
          {field("dobBS",    "DOB (BS)",    true,
            <Input
              id="dobBS"
              value={form.dobBS}
              onChange={(e) => update("dobBS", e.target.value)}
              placeholder="YYYY-MM-DD (BS)"
              className="h-10 border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400"
            />
          )}

          {/* Row 3 */}
          {field("nationality", "Nationality", true,
            selectInput("nationality", "Select Your Nationality", [
              { value: "nepali",    label: "Nepali"    },
              { value: "nrn",      label: "NRN"       },
              { value: "foreign",  label: "Foreign National" },
            ])
          )}
          {field("mobile", "Mobile Number",  true,  textInput("mobile", "Mobile Number", "tel"))}
          {field("email",  "Email Address",  false, textInput("email",  "Email Address", "email"))}

          {/* Row 4 */}
          {field("branch",    "Preferred Branch",  true,
            selectInput("branch", "Select your preferred branch",
              BRANCHES.map((b) => ({ value: b.toLowerCase(), label: b }))
            )
          )}
          {field("salary",    "Monthly Salary",    true, rsInput("salary",    "Monthly Salary"))}
          {field("otherEmis", "Other EMIs",        true, rsInput("otherEmis", "0"))}

          {/* Row 5 */}
          {field("loanType", "Loan Type", true,
            <Select value={form.loanType} onValueChange={handleLoanType}>
              <SelectTrigger id="loanType" className="h-10 border-zinc-200 rounded-lg text-sm">
                <SelectValue placeholder="Select Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education">Education Loan</SelectItem>
                <SelectItem value="home">Home Loan</SelectItem>
                <SelectItem value="personal">Personal Loan</SelectItem>
                <SelectItem value="business">Business Loan</SelectItem>
              </SelectContent>
            </Select>
          )}
          {field("interestRate", "Interest Rate %", false,
            <Input
              id="interestRate"
              value={form.interestRate ? `${form.interestRate}%` : ""}
              readOnly
              placeholder="Auto-calculated"
              className="h-10 border-zinc-200 rounded-lg text-sm bg-zinc-50 text-zinc-500 cursor-not-allowed placeholder:text-zinc-400"
            />
          )}
          {field("loanAmount", "Loan Amount", true, rsInput("loanAmount", "Loan Amount"))}

          {/* Row 6 — single col */}
          <div className="lg:col-span-1">
            {field("tenure", "Loan Tenure (in years)", true,
              <Input
                id="tenure"
                type="number"
                min="1"
                max="15"
                value={form.tenure}
                onChange={(e) => update("tenure", e.target.value)}
                placeholder="e.g. 10"
                className="h-10 border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400"
              />
            )}
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/60 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(!!v)}
              className="mt-0.5 border-zinc-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="confirm" className="text-xs text-zinc-600 leading-relaxed cursor-pointer">
              I&apos;m not a robot — I confirm the details above are accurate.
            </label>
          </div>
          <Button
            type="button"
            disabled={!isValid}
            onClick={() => setSubmitted(true)}
            className="shrink-0 h-11 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-40 gap-2"
          >
            Check Eligibility
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function EligibilityChecker() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="check-eligibility"
      className="py-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Dialog>
          <div className="grid lg:grid-cols-[1.45fr_1fr] gap-12 xl:gap-20 items-center">

            {/* ── Left: headline + CTA ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Badge */}
              <div className="mb-5">
                <span className="text-[10.5px] font-bold text-primary uppercase tracking-[0.15em]">
                  Check Your Eligibility
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-[1.08] mb-3">
                See if you{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent">qualify</span>
                  <svg
                    className="absolute -bottom-1 left-0 w-full overflow-visible"
                    viewBox="0 0 140 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5.5 Q22 1.5 42 5.5 Q62 9.5 82 5.5 Q102 1.5 122 5.5 Q132 7.5 138 5.5"
                      stroke="#22C55E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {" "}— before<br className="hidden sm:block" /> you apply.
              </h2>

              {/* Sub-copy */}
              <p className="text-base text-zinc-600 leading-relaxed mb-7 max-w-md">
                Answer a few quick questions to preview your loan eligibility, expected
                sanction range, and which partner banks fit you best.
              </p>

              {/* CTA row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors shadow-md shadow-primary/20"
                  >
                    <Zap className="w-4 h-4" />
                    Check my eligibility
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </DialogTrigger>

                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                  No credit-score impact
                </div>
              </div>
            </motion.div>

            {/* ── Right: mock result card ───────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
              className=" w-full max-w-lg"
            >
             <Image src="/assets/checker.png" alt="Checker" width={800} height={800} />
            </motion.div>

          </div>

          {/* ── Dialog ── */}
          <DialogContent
            className="sm:max-w-3xl lg:max-w-4xl p-0 overflow-hidden gap-0"
            style={{ maxHeight: "90vh" }}
          >
            <EligibilityForm onDone={() => {}} />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
