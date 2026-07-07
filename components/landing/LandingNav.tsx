"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  ChevronDown,
  Calculator,
  LogIn,
  Megaphone,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { getDashboardPath } from "@/lib/roleRedirect";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─── Tools dropdown items ───────────────────────────────────────────────── */
const TOOLS = [
  {
    label: "EMI Calculator",
    icon: Calculator,
    id: "emi-calculator",
    description: "Estimate your monthly repayment",
  },
] as const;

/* ─── Static nav scroll items ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "How It Works", id: "how-it-works" },
  { label: "About", id: "about" },
  { label: "FAQ", id: "faq" },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      setScrolled(y > 8);

      if (y < 10) {
        // Back at the very top — always reveal
        setHidden(false);
      } else if (y > lastScrollY.current + 4 && y > 80) {
        // Scrolling down past threshold — hide
        setHidden(true);
        setMobileOpen(false);
      } else if (y < lastScrollY.current - 4) {
        // Scrolling up — reveal
        setHidden(false);
      }

      lastScrollY.current = y;
    };

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
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50"
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ── Main nav bar ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`w-full transition-all duration-200 ${
          scrolled
            ? "bg-white/97 backdrop-blur-md shadow-sm shadow-black/6 border-b border-zinc-200/80"
            : "bg-white border-b border-zinc-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-8">
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="Unnati home"
          >
            <Image
              src="/logo-white-bg.svg"
              width={120}
              height={120}
              alt="Unnati Logo"
            />
          </Link>

          {/* ── Center nav (desktop) ──────────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-1 flex-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="text-[13.5px] font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                {item.label}
              </button>
            ))}

            {/* Tools dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[13.5px] font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors data-[state=open]:bg-zinc-50 data-[state=open]:text-zinc-900"
                >
                  Tools
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-56 rounded-xl border border-zinc-200 shadow-lg shadow-black/8 p-1.5"
              >
                {TOOLS.map(({ label, icon: Icon, id, description }) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-zinc-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-900 leading-none mb-0.5">
                        {label}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        {description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* ── Right: actions (desktop) + hamburger (mobile) ─────────── */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link href={getDashboardPath(user.role)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 gap-1.5 h-9"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 gap-1.5 h-9"
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
                      variant="outline"
                      size="sm"
                      className="text-[13px] font-semibold text-zinc-700 border-zinc-300 h-9 px-4 gap-1.5 rounded-lg"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In
                    </Button>
                  </Link>
                  {/* <Link href="/apply">
                    <Button
                      size="sm"
                      className="text-[13px] font-semibold h-9 px-5 gap-1.5 rounded-lg shadow-none"
                    >
                      Apply For Loan
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link> */}
                     <Link href="/register">
                    <Button
                      size="sm"
                      className="text-[13px] font-semibold h-9 px-5 gap-1.5 rounded-lg shadow-none"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-zinc-700" />
              ) : (
                <Menu className="w-5 h-5 text-zinc-700" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-b border-zinc-200 bg-white shadow-lg shadow-black/6"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              {/* Scroll nav items */}
              <div className="space-y-0.5 mb-3">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className="block w-full text-left text-sm font-medium text-zinc-600 hover:text-zinc-900 py-2.5 px-3 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                {/* Tools items flat in mobile */}
                {TOOLS.map(({ label, icon: Icon, id }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollTo(id)}
                    className="flex items-center gap-2 w-full text-left text-sm font-medium text-zinc-600 hover:text-zinc-900 py-2.5 px-3 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Auth buttons */}
              <div className="flex gap-2 pt-3 border-t border-zinc-100">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href={getDashboardPath(user.role)}
                      className="flex-1"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 rounded-lg"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {user.role === "ADMIN"
                          ? "Admin Panel"
                          : "My Application"}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1.5 rounded-lg"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex-1"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 rounded-lg"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/apply"
                      className="flex-1"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button size="sm" className="w-full rounded-lg gap-1.5">
                        Start Application
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
