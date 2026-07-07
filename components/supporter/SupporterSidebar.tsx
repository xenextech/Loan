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
  LayoutDashboard,
  FileText,
  GitBranch,
  Wallet,
  Calendar,
  Bell,
  FolderOpen,
  ShieldCheck,
  Percent,
  History,
  LogOut,
  ClipboardCheck,
  Menu,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      {
        href: "/supporter",
        icon: LayoutDashboard,
        label: "Dashboard",
        exact: true,
      },
    ],
  },
  {
    title: "Lending",
    items: [
      {
        href: "/supporter/applications",
        icon: FileText,
        label: "Applications",
        exact: false,
      },
      {
        href: "/supporter/approval",
        icon: GitBranch,
        label: "Approval Work Flow",
        exact: false,
      },
      {
        href: "/supporter/disbursment",
        icon: Wallet,
        label: "Disbursement",
        exact: false,
      },
    ],
  },
  {
    title: "Repayment",
    items: [
      {
        href: "/supporter/emi-schedule",
        icon: Calendar,
        label: "EMI Schedule",
        exact: false,
      },
      {
        href: "/supporter/notification",
        icon: Bell,
        label: "Notification",
        exact: false,
      },
    ],
  },
  {
    title: "Document",
    items: [
      {
        href: "/supporter/document-center",
        icon: FolderOpen,
        label: "Document Center",
        exact: false,
      },
      {
        href: "/supporter/insurance-checker",
        icon: ShieldCheck,
        label: "Insurance Checker",
        exact: false,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        href: "/supporter/commission",
        icon: Percent,
        label: "Commission",
        exact: false,
      },
      {
        href: "/supporter/audit-ledger",
        icon: History,
        label: "Audit Ledger",
        exact: false,
      },
    ],
  },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            {group.title}
          </p>
          {group.items.map(({ href, icon: Icon, label, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
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
        </div>
      ))}
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
    router.push("/login");
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
          SUPPORTER
        </Badge>
      </div>

      <NavLinks onNavigate={onNavigate} />

      <div className="px-3 pb-4 border-t border-border pt-4 shrink-0 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">
              Supporter Portal
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email ?? "Unnati Supporter"}
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

export default function SupporterSidebar() {
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
            SUPPORTER
          </Badge>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Supporter Navigation</SheetTitle>
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
