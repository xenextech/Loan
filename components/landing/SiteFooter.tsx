"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: ["How It Works", "Loan Calculator", "Interest Rates", "Partner Banks"],
  Company: ["About Us", "Careers", "Press", "Contact"],
  Legal:   ["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"],
  Support: ["Help Center", "Application Status", "Track Application", "Report Issue"],
};

const CONTACT = [
  { icon: Phone,  text: "+977-01-4567890"          },
  { icon: Mail,   text: "support@cliqedu.com.np"   },
  { icon: MapPin, text: "Kathmandu, Bagmati, Nepal" },
] as const;

export default function SiteFooter() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <footer ref={ref} className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">

          {/* ── Brand ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-background">Cliq</span>
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0 font-semibold">
                  EDU
                </Badge>
              </div>
            </div>
            <p className="text-sm text-background/60 leading-relaxed mb-6 max-w-60">
              Making quality education accessible to every Nepalese student through transparent,
              fast, and fair education loans.
            </p>
            <div className="space-y-2.5">
              {CONTACT.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-background/60">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Link columns — each staggers in ──────────── */}
          {Object.entries(footerLinks).map(([heading, links], i) => (
            <motion.div
              key={heading}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.07, ease: "easeOut" }}
            >
              <h3 className="text-xs font-bold text-background/40 tracking-widest uppercase mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="bg-background/10 mb-8" />

        {/* ── Bottom bar ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.42 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-background/40">
            © 2024 Cliq Edu Loan. All rights reserved. Regulated by Nepal Rastra Bank.
          </p>
          <div className="flex items-center gap-2">
            {["NRB Approved", "ISO 27001", "256-bit SSL"].map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="text-[10px] border-background/20 text-background/40"
              >
                {label}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
