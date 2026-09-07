"use client";

import { useEffect } from "react";
import { toast } from "sonner";

function notifyUpdateAvailable(registration: ServiceWorkerRegistration) {
  const waiting = registration.waiting;
  if (!waiting) return;

  toast.info("A new version of Edu Loan is available.", {
    id: "pwa-update-available",
    duration: Infinity,
    action: {
      label: "Refresh",
      onClick: () => waiting.postMessage({ type: "SKIP_WAITING" }),
    },
  });
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // A service worker from a previous production build (or a stale one
      // left over from testing) can otherwise keep serving cached bundles
      // during `next dev`, making local changes seem not to apply.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      caches?.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      return;
    }

    let hasReloaded = false;
    const onControllerChange = () => {
      if (hasReloaded) return;
      hasReloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // A worker was already waiting from a previous visit in this tab.
        if (registration.waiting && navigator.serviceWorker.controller) {
          notifyUpdateAvailable(registration);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              notifyUpdateAvailable(registration);
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
