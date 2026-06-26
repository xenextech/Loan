"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const LINKS = {
  Product: [
    { label: "How It Works",     href: "/#how-it-works"   },
    { label: "EMI Calculator",   href: "/#emi-calculator" },
    {label:"Check Eligibility", href:"/#check-eligibility"}
    // { label: "Interest Rates",   href: "/#faq"            },
    // { label: "Partner Banks",    href: "/#about"          },
  ],
  Company: [
    { label: "About Cliq",       href: "/#about"          },
    // { label: "Careers",          href: "#"               },
    // { label: "Press",            href: "#"               },
    // { label: "Contact",          href: "mailto:support@cliqedu.com.np" },
  ],

  Legal: [
    { label: "Privacy Policy",   href: "/privacy-policy"  },
    { label: "Terms of Service", href: "/terms-of-service"},
    // { label: "Cookie Policy",    href: "#"               },
    // { label: "Compliance",       href: "#"               },
  ],
} as const;

const CONTACT = [
  { icon: Phone,  value: "+977-01-4567890",          href: "tel:+97714567890"               },
  { icon: Mail,   value: "support@cliqedu.com.np",   href: "mailto:support@cliqedu.com.np"  },
  { icon: MapPin, value: "Kathmandu, Bagmati, Nepal", href: "#"                              },
] as const;



/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SiteFooter() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <footer ref={ref} className="bg-[#0E1E14]">

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr_1fr] gap-10 mb-14">

          {/* ── Brand column ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            {/* Logo — matches LandingNav */}
            <Link href="/" className="inline-flex items-center gap-2 mb-5 group">
             <Image src="/logo.svg" alt="Logo" width={100} height={100} />
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed mb-7 max-w-[230px]">
              Connecting Nepali students with NRB-regulated partner banks for
              transparent, fast education loan applications.
            </p>

            {/* Contact items */}
            <div className="space-y-3">
              {CONTACT.map(({ icon: Icon, value, href }) => (
                <a
                  key={value}
                  href={href}
                  className="flex items-center gap-3 group/contact"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover/contact:bg-zinc-700 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400 group-hover/contact:text-zinc-200 transition-colors">
                    {value}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── Link columns ──────────────────────────────────── */}
          {(Object.entries(LINKS) as [string, readonly { label: string; href: string }[]][]).map(
            ([heading, links], i) => (
              <motion.div
                key={heading}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.07 + i * 0.06, ease: "easeOut" }}
              >
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.18em] mb-4">
                  {heading}
                </p>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-zinc-400 hover:text-white transition-colors duration-150"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          )}
        </div>

        {/* ── Apply CTA strip ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 mb-10"
        >
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">
              Ready to start your application?
            </p>
            <p className="text-xs text-zinc-400">
              No branch visit. No paper forms. Takes about 10 minutes.
            </p>
          </div>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0"
          >
            Apply For Loan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="border-t border-zinc-800 mb-7" />

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-white text-center sm:text-left">
            © {new Date().getFullYear()} Cliq Education Loan Platform. All rights reserved.
            Regulated by Deerx.
          </p>

    
        </motion.div>
      </div>
    </footer>
  );
}
