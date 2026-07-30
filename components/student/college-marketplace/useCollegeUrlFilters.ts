"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { CollegeListFilters } from "@/types/college-marketplace";

const PAGE_SIZE = 12;
const FILTER_KEYS = [
  "search",
  "province",
  "district",
  "universityId",
  "category",
  "degreeLevel",
  "duration",
  "minFee",
  "maxFee",
] as const;

// Filters live in the URL (not component state) so the College sidebar and
// the results grid — separate components in the layout/page tree — stay in
// sync without prop-drilling or context, and searches stay shareable/bookmarkable.
export function useCollegeUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: CollegeListFilters = useMemo(() => {
    const minFee = searchParams.get("minFee");
    const maxFee = searchParams.get("maxFee");
    const page = searchParams.get("page");
    return {
      search: searchParams.get("search") ?? undefined,
      province: searchParams.get("province") ?? undefined,
      district: searchParams.get("district") ?? undefined,
      universityId: searchParams.get("universityId") ?? undefined,
      category: (searchParams.get("category") ?? undefined) as CollegeListFilters["category"],
      degreeLevel: (searchParams.get("degreeLevel") ?? undefined) as CollegeListFilters["degreeLevel"],
      duration: searchParams.get("duration") ?? undefined,
      minFee: minFee ? Number(minFee) : undefined,
      maxFee: maxFee ? Number(maxFee) : undefined,
      page: page ? Number(page) : 1,
      limit: PAGE_SIZE,
    };
  }, [searchParams]);

  const hasActiveFilters = FILTER_KEYS.some((k) => filters[k] !== undefined);

  // Any real filter change resets pagination back to page 1.
  const updateFilters = useCallback(
    (patch: Partial<CollegeListFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      });
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, hasActiveFilters, updateFilters, setPage, clearFilters };
}
