"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Who is eligible to apply for a Unnati education loan?",
    a: "Any Nepalese citizen who has secured admission or is enrolled in a recognised educational institution — domestically or abroad — can apply. You must be between 18 and 35 years of age and have a guarantor (typically a parent or guardian).",
  },
  {
    q: "What is the maximum loan amount I can get?",
    a: "You can apply for up to NPR 15,00,000 (15 Lakhs) depending on your institution, course, and family income. Loans up to NPR 7.5 Lakhs require no collateral; amounts above that require eligible property as security.",
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
    a: "Yes. Unnati automatically saves your progress as a draft every 30 seconds. You can also click 'Save & Continue Later' at any step. Your draft is securely stored for 30 days.",
  },
  {
    q: "Are there any processing fees?",
    a: "A one-time processing fee of 0.5% of the loan amount (minimum NPR 2,000) is charged upon loan disbursement. There are no hidden charges or prepayment penalties.",
  },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function FAQSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" ref={ref} className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — single centered block, no sticky/duplicate version */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-3">
            FAQ
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-tight mb-3">
            Got questions? We&apos;ve{" "}
            <span className="inline-block">
              <span className="bg-gradient-to-b from-[#15C35B] to-[#0F7D3C] bg-clip-text text-transparent font-bold">
                got answers.
              </span>
            </span>
          </h2>
        </motion.div>

        {/* FAQ accordion */}
        <Accordion type="single" collapsible className="space-y-2.5">
          {FAQS.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.38,
                delay: 0.06 + i * 0.05,
                ease: "easeOut",
              }}
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

        {/* Contact link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.06 + FAQS.length * 0.05 + 0.15 }}
          className="text-center text-sm text-zinc-400 mt-8"
        >
          Still have questions?{" "}
          <a
            href="mailto:support@Unnatiedu.com.np"
            className="text-primary font-medium hover:underline"
          >
            Email our support team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
