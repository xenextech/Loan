"use client";
import { useMemo } from "react";
import { useAppSelector } from "@/lib/hooks";
import { useGetMyAccessQuery } from "@/lib/api/permissionsApi";

/**
 * Single source of truth for "what can the logged-in user see/do" — wraps
 * GET /permissions/me. Every dynamic sidebar, route guard, and
 * permission-gated UI element in the app should read from this hook instead
 * of branching on `user.role` directly.
 */
export function usePermissions() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data, isLoading, isFetching, isError } = useGetMyAccessQuery(undefined, {
    skip: !isAuthenticated,
  });

  const permissionSet = useMemo(() => new Set(data?.permissions ?? []), [data]);
  const menuKeySet = useMemo(
    () => new Set((data?.menu ?? []).flatMap((g) => g.items.map((i) => i.key))),
    [data],
  );
  const widgetSet = useMemo(() => new Set(data?.widgets ?? []), [data]);

  return {
    role: data?.role ?? null,
    menu: data?.menu ?? [],
    permissions: data?.permissions ?? [],
    widgets: data?.widgets ?? [],
    /** True once /permissions/me has resolved (regardless of what it contains). */
    isReady: !isLoading && (isAuthenticated ? data !== undefined || isError : true),
    isLoading: isAuthenticated && isLoading,
    isFetching,
    hasPermission: (key: string) => permissionSet.has(key),
    hasMenuAccess: (key: string) => menuKeySet.has(key),
    hasWidget: (key: string) => widgetSet.has(key),
  };
}
