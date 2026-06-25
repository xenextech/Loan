"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who is eligible to apply for a Cliq Edu Loan?",
    a: "Any Nepalese citizen who has secured admission or is enrolled in a recognized educational institution — domestically or abroad — can apply. You must be between 18 and 35 years of age and have a guarantor (typically a parent or guardian).",
  },
  {
    q: "What is the maximum loan amount I can get?",
    a: "You can apply for up to NPR 50,00,000 (50 Lakhs) depending on your institution, course, and family income. Loans up to NPR 7.5 Lakhs require no collateral; amounts above that require eligible property as security.",
  },
  {
    q: "What documents do I need to submit?",
    a: "You'll need your Citizenship Certificate (front & back), recent passport-size photo, academic transcripts, institution admission letter, and fee structure documents. Family income proof and guarantor documents may also be required.",
  },
  {
    q: "How long does the approval process take?",
    a: "Most applications are processed within 3–5 business days after receiving all required documents. You'll receive real-time status updates via SMS and email throughout the review process.",
  },
  {
    q: "What interest rate is applied on education loans?",
    a: "Interest rates start at 10.5% per annum (floating). Rates may vary based on the loan amount, tenure, and your partner bank's current rates. There is a 6–12 month moratorium period during your course.",
  },
  {
    q: "Can I save my application and complete it later?",
    a: "Yes. Cliq automatically saves your progress as a draft every 30 seconds. You can also click 'Save & Continue Later' at any step. Your draft is securely stored for 30 days.",
  },
  {
    q: "Are there any processing fees?",
    a: "A one-time processing fee of 0.5% of the loan amount (minimum NPR 2,000) is charged upon loan disbursement. There are no hidden charges or prepayment penalties.",
  },
];

export default function FAQSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="py-28 bg-background" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know before applying.
          </p>
        </motion.div>

        {/* FAQ items — each one staggers in individually */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.38, delay: 0.08 + idx * 0.055, ease: "easeOut" }}
            >
              <AccordionItem
                value={`faq-${idx}`}
                className="border border-border rounded-xl px-6 bg-card shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/30 transition-all"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.08 + faqs.length * 0.055 + 0.1 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          Still have questions?{" "}
          <a href="mailto:support@cliqedu.com.np" className="text-primary font-medium hover:underline">
            Contact our support team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
