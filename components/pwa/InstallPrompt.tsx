"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari's own flag — not covered by the media query above.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function recentlyDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Storage unavailable — worst case the banner reappears next visit.
    }
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    // The prompt can only be used once regardless of the user's choice.
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="safe-top fixed inset-x-4 top-4 z-100 sm:inset-x-auto sm:right-4 sm:w-80"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl shadow-black/10">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Download className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Install Edu Loan</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add it to your home screen for quick, full-screen access.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={install}>
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  Not now
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
