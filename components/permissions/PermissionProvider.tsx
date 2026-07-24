"use client";
import { Loader2, GraduationCap } from "lucide-react";
import { usePermissions } from "@/lib/permissions/usePermissions";

/**
 * Wraps a dashboard layout's content, holding it behind a single loading
 * state until GET /permissions/me resolves — every child can then call
 * usePermissions() and trust the cache is populated, instead of each one
 * separately handling "still loading" locally.
 */
export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading your permissions…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
