"use client";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/permissions/usePermissions";

/**
 * Blocks rendering of a page/section unless the caller's role has the given
 * menu or permission key — the client-side half of the same check
 * PermissionsGuard enforces server-side (see backend RequireMenuKey /
 * RequirePermission). Hiding a sidebar item and blocking its page are the
 * same admin-configured toggle, not two things to keep in sync by hand.
 */
export function RouteGuard({
  menuKey,
  permissionKey,
  children,
}: {
  menuKey?: string;
  permissionKey?: string;
  children: React.ReactNode;
}) {
  const { hasMenuAccess, hasPermission, isReady } = usePermissions();

  if (!isReady) return null;

  const allowed =
    (!menuKey || hasMenuAccess(menuKey)) && (!permissionKey || hasPermission(permissionKey));

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">Access Restricted</h1>
            <p className="text-sm text-muted-foreground">
              Your role doesn&apos;t have access to this page. Contact your administrator if you
              believe this is a mistake.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
