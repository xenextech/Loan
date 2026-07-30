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
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { performLogout } from "@/lib/auth/authActions";
import { ArrowLeft, GraduationCap, LayoutGrid, LogOut, Menu, School } from "lucide-react";
import { CollegeFilterSidebar } from "./CollegeFilterSidebar";

const BROWSE_HREF = "/dashboard/college";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isBrowsePage = pathname === BROWSE_HREF;
  const isActive = pathname.startsWith(BROWSE_HREF);

  const handleSignOut = () => {
    performLogout(dispatch);
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border shrink-0">
        <Link href="/" className="cursor-pointer">
          <Image src="/logo-white-bg.svg" width={100} height={100} alt="Unnati Logo" />
        </Link>
      </div>

      <div className="px-3 pt-4 shrink-0">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#15C35B] to-[#0F7D3C] flex items-center justify-center shrink-0 shadow-sm">
          <School className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">College Marketplace</p>
          <p className="text-[10px] text-muted-foreground">Find & apply in one place</p>
        </div>
      </div>

      <div className="px-3 pb-2 shrink-0">
        <Link
          href={BROWSE_HREF}
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive
              ? "bg-linear-to-r from-[#15C35B] to-[#0F7D3C] text-white shadow-sm shadow-black/10"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          Browse Colleges
        </Link>
      </div>

      {isBrowsePage && (
        <>
          <div className="px-5">
            <Separator />
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Filters
            </p>
            <CollegeFilterSidebar />
          </div>
        </>
      )}
      {!isBrowsePage && <div className="flex-1" />}

      <div className="px-3 pb-4 border-t border-border pt-4 shrink-0 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">Student Portal</p>
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

export default function CollegeSidebar() {
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
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[#15C35B] to-[#0F7D3C] flex items-center justify-center shrink-0">
            <School className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground">College Marketplace</span>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>College Marketplace Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
