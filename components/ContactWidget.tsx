"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Clock3 } from "lucide-react";

const PHONE_DISPLAY = "+977 980-000-0000";
const PHONE_HREF    = "tel:+9779800000000";

export default function ContactWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">

      {/* ── Contact card — slides in to the left of the button ─────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="contact-card"
            initial={{ opacity: 0, x: 16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{   opacity: 0, x: 16, scale: 0.96  }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white rounded-2xl shadow-2xl shadow-black/12 border border-zinc-100 overflow-hidden w-60"
          >
            {/* Card header */}
            <div
              className="px-4 py-3"
              style={{ background: "linear-gradient(135deg, #005f87 0%, #0089c0 100%)" }}
            >
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">
                Contact Us
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                We&apos;re here to help
              </p>
            </div>

            {/* Phone number row */}
            <div className="px-4 py-4">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-3 group"
                aria-label={`Call ${PHONE_DISPLAY}`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 tracking-tight group-hover:text-primary transition-colors">
                    {PHONE_DISPLAY}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock3 className="w-2.5 h-2.5 text-zinc-400" />
                    <p className="text-[11px] text-zinc-400">Mon – Fri, 9 am – 6 pm</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Divider + footer note */}
            <div className="px-4 pb-4 border-t border-zinc-100 pt-3">
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Prefer not to call?{" "}
                <a
                  href="/apply"
                  className="text-primary font-semibold hover:underline underline-offset-2"
                >
                  Apply online
                </a>{" "}
                — takes under 5 minutes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle button ───────────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{  scale: 0.94 }}
        aria-label={open ? "Close contact" : "Contact us"}
        className="relative w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {/* Pulse ring — only when closed */}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping"
          />
        )}

        {/* Icon swap */}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{   rotate:  90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="phone"
              initial={{ rotate:  90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{   rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Phone className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
