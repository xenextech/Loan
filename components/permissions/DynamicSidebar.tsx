"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { performLogout } from "@/lib/auth/authActions";
import { displayName } from "@/lib/formatters";
import { getDashboardPath } from "@/lib/roleRedirect";
import { usePermissions } from "@/lib/permissions/usePermissions";
import { resolveIcon } from "@/lib/permissions/iconMap";
import { LogOut, Menu } from "lucide-react";

interface DynamicSidebarProps {
  /** Short badge text, e.g. "CREDIT MANAGER". */
  portalBadge: string;
  /** Footer label, e.g. "Credit Manager Portal". */
  portalTitle: string;
  /** Fallback shown in the footer before the user record loads. */
  fallbackName: string;
  /** Footer avatar icon. */
  footerIcon: LucideIcon;
}

function NavSkeleton() {
  return (
    <div className="px-3 py-2 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-lg" />
      ))}
    </div>
  );
}

function NavLinks({ basePath, onNavigate }: { basePath: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { menu, isLoading } = usePermissions();

  if (isLoading) return <NavSkeleton />;

  return (
    <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
      {menu.map((group) => (
        <div key={group.groupLabel ?? "_"} className="space-y-0.5">
          {group.groupLabel && (
            <p className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {group.groupLabel}
            </p>
          )}
          {group.items.map((item) => {
            const href = `${basePath}${item.href}`;
            const active = item.href === "" ? pathname === basePath : pathname.startsWith(href);
            const Icon = resolveIcon(item.icon);
            return (
              <Link
                key={item.key}
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({
  onNavigate,
  basePath,
  portalBadge,
  portalTitle,
  fallbackName,
  footerIcon: FooterIcon,
}: DynamicSidebarProps & { onNavigate?: () => void; basePath: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleSignOut = () => {
    performLogout(dispatch);
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border shrink-0">
        <Link href="/" className="cursor-pointer">
          <Image src="/logo-white-bg.svg" width={100} height={100} alt="Unnati Logo" />
        </Link>
        <Badge className="text-[9px] bg-primary/10 text-primary border-0 px-1.5 py-0.5 ml-auto shrink-0 font-bold tracking-wide">
          {portalBadge}
        </Badge>
      </div>

      <NavLinks basePath={basePath} onNavigate={onNavigate} />

      <div className="px-3 pb-4 border-t border-border pt-4 shrink-0 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FooterIcon className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">{portalTitle}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {displayName(user, fallbackName)}
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

/**
 * Sidebar generated entirely from GET /permissions/me (via usePermissions())
 * instead of a hardcoded NAV_GROUPS array — an Admin toggling a role's
 * Sidebar Access in the Permission Management UI changes what renders here
 * immediately, no code change or deploy. Drop-in replacement for the
 * per-role hardcoded sidebars (CreditManagerSidebar, AdminSidebar, etc.) —
 * same visual output.
 *
 * Hrefs are built from the *logged-in user's own role* (getDashboardPath),
 * not the current URL segment — several layouts let ADMIN (and, for
 * /checker, CREDIT_MANAGER) into a portal that isn't their own via an OR
 * clause in the route gate. In that case the sidebar must still point back
 * at the visiting user's real portal, since their menu reflects their own
 * role's access, not the portal they're currently borrowing.
 */
export function DynamicSidebar(props: DynamicSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useAppSelector((s) => s.auth.user?.role);
  const basePath = role ? getDashboardPath(role) : "/dashboard";

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
            <Image src="/logo-white-bg.svg" width={100} height={100} alt="Unnati Logo" />
          </Link>
          <Badge className="text-[9px] bg-primary/10 text-primary border-0 px-1.5 font-bold">
            {props.portalBadge}
          </Badge>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{props.portalTitle} Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent {...props} basePath={basePath} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border h-screen sticky top-0 shrink-0">
        <SidebarContent {...props} basePath={basePath} />
      </aside>
    </>
  );
}
