"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LayoutDashboard, LogOut, ArrowRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "How It Works",   id: "how-it-works"   },
  { label: "EMI Calculator", id: "emi-calculator" },
  { label: "About",          id: "about"          },
  { label: "FAQ",            id: "faq"            },
] as const;

export default function LandingNav() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { isAuthenticated, user }     = useAppSelector((s) => s.auth);
  const dispatch                      = useAppDispatch();
  const router                        = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = () => {
    dispatch(clearCredentials());
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      {/*
        mx-4→mx-16 creates the visible gap between the pill and the screen
        edges at every breakpoint. On a 1920 px monitor with lg:mx-16 (64 px
        each side) the pill spans ~1792 px — wide and centered like the
        reference design.
      */}
      <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-56+ mt-4 pointer-events-auto">
        <div
          className={`grid grid-cols-[1fr_auto_1fr] items-center h-14 px-5 sm:px-7 rounded-2xl border border-border transition-all duration-300 ${
            scrolled
              ? "bg-background/96 backdrop-blur-md shadow-sm shadow-black/6"
              : "bg-background/90 backdrop-blur-sm"
          }`}
        >

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 group w-fit"
            aria-label="Cliq home"
          >
            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
            <span className="text-[17px] font-bold text-foreground tracking-tight leading-none">
              Cliq<span className="text-primary">.</span>
            </span>
          </Link>

          {/* ── Center nav (desktop) ─────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* ── Right: actions (desktop) + hamburger (mobile) ── */}
          <div className="flex items-center justify-end">

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && user ? (
                <>
                  <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium text-foreground/60 hover:text-foreground gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-foreground/60 hover:text-foreground gap-1.5"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium text-foreground/60 hover:text-foreground px-4"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/apply">
                    <Button
                      size="sm"
                      className="text-sm font-semibold rounded-full px-5 h-9 gap-1.5 shadow-none ml-1"
                    >
                      Start Application
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen
                ? <X className="w-5 h-5 text-foreground" />
                : <Menu className="w-5 h-5 text-foreground" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown — separate rounded card below the pill ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mx-4 sm:mx-6 mt-2 pointer-events-auto"
          >
            <div className="rounded-2xl border border-border bg-background shadow-xl shadow-black/8 px-5 pt-3 pb-5">
              <div className="space-y-0.5 mb-4">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className="block w-full text-left text-sm font-medium text-foreground/60 hover:text-foreground py-2.5 px-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                      className="flex-1"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <LayoutDashboard className="w-4 h-4" />
                        {user.role === "ADMIN" ? "Admin Panel" : "My Application"}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Log in</Button>
                    </Link>
                    <Link href="/apply" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full rounded-full">Start Application</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
