"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import {
  CheckCircle2,
  FileEdit,
  Calculator,
  LogOut,
  GraduationCap,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: CheckCircle2,
    label: "Submitted Applications",
    exact: true,
  },
  { href: "/dashboard/drafts", icon: FileEdit, label: "Drafts", exact: true },
  {
    href: "/dashboard/loan-tools",
    icon: Calculator,
    label: "Loan Tools",
    exact: true,
  },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
      {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleSignOut = () => {
    dispatch(clearCredentials());
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border shrink-0">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/logo-white-bg.svg"
            width={100}
            height={100}
            alt="Unnati Logo"
          />
        </Link>
        <Badge className="text-[9px] bg-primary/10 text-primary border-0 px-1.5 py-0.5 ml-auto shrink-0 font-bold tracking-wide">
          STUDENT
        </Badge>
      </div>

      <div className="px-5 pt-5 pb-1 shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Navigation
        </p>
      </div>

      <NavLinks onNavigate={onNavigate} />

      <div className="px-3 pb-4 border-t border-border pt-4 shrink-0 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">
              Student Portal
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email ?? "Unnati Student"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function StudentSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/logo-white-bg.svg"
              width={100}
              height={100}
              alt="Unnati Logo"
            />
          </Link>
          <Badge className="text-[9px] bg-primary/10 text-primary border-0 px-1.5 font-bold">
            STUDENT
          </Badge>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Student Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
