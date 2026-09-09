"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";

const PHONE_DISPLAY = "+977-9860005961";
const PHONE_HREF    = "tel:+9779860005961";

export default function ContactWidget() {
  // Defaults to open so the contact card is visible right away,
  // sitting to the left of the FAB (it's the first child in the
  // flex row, which is anchored to the right edge via right-6 on
  // the parent — so the button stays right-most and the card
  // occupies the space to its left). Clicking the FAB still
  // toggles it closed/open.
  const [open, setOpen] = useState(false);

  return (
    <div className="safe-bottom fixed bottom-6 right-6 z-50 flex items-end gap-3">

      {/* ── Contact card — sits to the left of the button ──────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="contact-card"
            initial={{ opacity: 0, x: 16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{   opacity: 0, x: 16, scale: 0.96  }}
            transition={{ duration: 0.30, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white rounded-2xl shadow-2xl shadow-black/12 border border-zinc-100 overflow-hidden w-60 relative"
          >
            {/* Phone number row */}
            <div className="px-4 pb-4 pt-5">
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
      
                    <p className="text-[11px] text-zinc-400">Mon – Fri, 9am – 6pm</p>
                  </div>
                </div>
              </a>
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
            className="absolute inset-0 rounded-full bg-primary opacity-0"
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
              transition={{ duration: 0.25 }}
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