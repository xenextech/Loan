"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Clock, ShieldCheck, MessageCircle } from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const TRUST = [
  {
    icon:  ShieldCheck,
    label: "NRB-regulated partner banks",
    sub:   "All banks on the platform are licensed by Nepal Rastra Bank.",
  },
  {
    icon:  Clock,
    label: "3–5 day review",
    sub:   "Most applications receive a decision within one working week.",
  },
  {
    icon:  MessageCircle,
    label: "Support Mon–Sat · 9am–5pm",
    sub:   "Reach our team by email or phone during business hours.",
  },
] as const;

const FAQS = [
  {
    q: "Who is eligible to apply for a Cliq education loan?",
    a: "Any Nepalese citizen who has secured admission or is enrolled in a recognised educational institution — domestically or abroad — can apply. You must be between 18 and 35 years of age and have a guarantor (typically a parent or guardian).",
  },
  {
    q: "What is the maximum loan amount I can get?",
    a: "You can apply for up to NPR 50,00,000 (50 Lakhs) depending on your institution, course, and family income. Loans up to NPR 7.5 Lakhs require no collateral; amounts above that require eligible property as security.",
  },
  {
    q: "What documents do I need to submit?",
    a: "You'll need your Citizenship Certificate (front & back), a recent passport-size photo, academic transcripts, the institution's admission letter, and fee structure documents. Family income proof and guarantor documents may also be required.",
  },
  {
    q: "How long does the approval process take?",
    a: "Most applications are processed within 3–5 business days after all required documents are received. You'll receive real-time status updates via SMS and email throughout the review.",
  },
  {
    q: "What interest rate is applied on education loans?",
    a: "Interest rates start at 10.5% per annum (floating). Rates vary based on the loan amount, tenure, and your partner bank's current rates. There is a 6–12 month moratorium period during your course.",
  },
  {
    q: "Can I save my application and complete it later?",
    a: "Yes. Cliq automatically saves your progress as a draft every 30 seconds. You can also click 'Save & Continue Later' at any step. Your draft is securely stored for 30 days.",
  },
  {
    q: "Are there any processing fees?",
    a: "A one-time processing fee of 0.5% of the loan amount (minimum NPR 2,000) is charged upon loan disbursement. There are no hidden charges or prepayment penalties.",
  },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function FAQSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" ref={ref} className="py-24 bg-[#F8F6F1] border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-16 xl:gap-24 items-start">

          {/* ── Left: sticky context panel ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hidden lg:block sticky top-24"
          >
            <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-4">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight mb-3">
              Got questions?{" "}
              <span className="text-zinc-400 font-medium">We&apos;ve got answers.</span>
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              Everything you need to know before starting your application.
              If something&apos;s still unclear, our support team is one email away.
            </p>

            {/* Trust signals */}
            <div className="space-y-3 mb-8">
              {TRUST.map(({ icon: Icon, label, sub }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.07, ease: "easeOut" }}
                  className="flex items-start gap-3 bg-white rounded-xl px-4 py-4 border border-zinc-100 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-800 leading-tight">{label}</p>
                    <p className="text-[11px] text-zinc-400 leading-snug mt-1">{sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.38, ease: "easeOut" }}
              className="rounded-2xl bg-primary px-6 py-7"
            >
              <p className="text-base font-bold text-white mb-1">Still have questions?</p>
              <p className="text-sm text-white/65 leading-relaxed mb-5">
                Our team responds within one business day.
              </p>
              <a
                href="mailto:support@cliqedu.com.np"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                support@cliqedu.com.np
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right: FAQ accordion ───────────────────────────────────── */}
          <div>
            {/* Mobile-only header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="lg:hidden mb-10"
            >
              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-3">
                FAQ
              </p>
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                Common Questions
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Everything you need to know before applying.
              </p>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-2.5">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 14 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.38, delay: 0.06 + i * 0.05, ease: "easeOut" }}
                >
                  <AccordionItem
                    value={`faq-${i}`}
                    className="
                      border border-zinc-200 rounded-2xl bg-white
                      shadow-sm overflow-hidden
                      data-[state=open]:border-primary/20
                      data-[state=open]:shadow-md
                      transition-all duration-300
                    "
                  >
                    <AccordionTrigger
                      className="
                        w-full px-6 py-5 text-left flex items-center justify-between
                        text-[15px] font-semibold text-zinc-800
                        hover:text-primary hover:no-underline
                        data-[state=open]:text-primary
                        transition-colors duration-200
                        [&>svg]:shrink-0
                        [&>svg]:text-zinc-300
                        [&>svg]:transition-all
                        [&>svg]:duration-300
                        [&>svg]:data-[state=open]:text-primary
                      "
                    >
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 overflow-hidden text-sm text-zinc-500 leading-relaxed">
                      <div className="flex gap-4 pt-1">
                        <div className="w-0.5 shrink-0 self-stretch rounded-full bg-primary/30" />
                        <p>{faq.a}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            {/* Mobile contact link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.06 + FAQS.length * 0.05 + 0.15 }}
              className="lg:hidden text-center text-sm text-zinc-400 mt-8"
            >
              Still have questions?{" "}
              <a
                href="mailto:support@cliqedu.com.np"
                className="text-primary font-medium hover:underline"
              >
                Email our support team
              </a>
            </motion.p>
          </div>

        </div>
      </div>
    </section>
  );
}
