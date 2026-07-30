"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetUniversitiesQuery } from "@/lib/api/marketplaceApi";
import type { CollegeListFilters } from "@/types/college-marketplace";
import { CATEGORY_LABELS, DEGREE_LABELS, DURATIONS, PROVINCES } from "./constants";
import { useCollegeUrlFilters } from "./useCollegeUrlFilters";
import { Search } from "lucide-react";

const ANY = "__any__";
const DEBOUNCE_MS = 400;

export function CollegeFilterSidebar() {
  const { filters, updateFilters, clearFilters } = useCollegeUrlFilters();
  const { data: universities = [] } = useGetUniversitiesQuery();

  // Text/number fields are debounced locally before hitting the URL — every
  // other control (Select) is discrete and updates immediately.
  const [search, setSearch] = useState(filters.search ?? "");
  const [district, setDistrict] = useState(filters.district ?? "");
  const [minFee, setMinFee] = useState(filters.minFee?.toString() ?? "");
  const [maxFee, setMaxFee] = useState(filters.maxFee?.toString() ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (filters.search ?? "")) updateFilters({ search: search || undefined });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (district !== (filters.district ?? "")) updateFilters({ district: district || undefined });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  useEffect(() => {
    const t = setTimeout(() => {
      const num = minFee ? Number(minFee) : undefined;
      if (num !== filters.minFee) updateFilters({ minFee: num });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFee]);

  useEffect(() => {
    const t = setTimeout(() => {
      const num = maxFee ? Number(maxFee) : undefined;
      if (num !== filters.maxFee) updateFilters({ maxFee: num });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxFee]);

  const handleClear = () => {
    setSearch("");
    setDistrict("");
    setMinFee("");
    setMaxFee("");
    clearFilters();
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Search</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search colleges…"
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Province</label>
        <Select
          value={filters.province ?? ANY}
          onValueChange={(v) => updateFilters({ province: v === ANY ? undefined : v })}
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue placeholder="Any province" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any province</SelectItem>
            {PROVINCES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">District</label>
        <Input
          placeholder="e.g. Kathmandu"
          className="h-9 text-sm"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">University</label>
        <Select
          value={filters.universityId ?? ANY}
          onValueChange={(v) => updateFilters({ universityId: v === ANY ? undefined : v })}
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue placeholder="Any university" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any university</SelectItem>
            {universities.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.shortName ?? u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          Course Category
        </label>
        <Select
          value={filters.category ?? ANY}
          onValueChange={(v) =>
            updateFilters({
              category: v === ANY ? undefined : (v as CollegeListFilters["category"]),
            })
          }
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any category</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Degree</label>
        <Select
          value={filters.degreeLevel ?? ANY}
          onValueChange={(v) =>
            updateFilters({
              degreeLevel: v === ANY ? undefined : (v as CollegeListFilters["degreeLevel"]),
            })
          }
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue placeholder="Any degree" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any degree</SelectItem>
            {Object.entries(DEGREE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Duration</label>
        <Select
          value={filters.duration ?? ANY}
          onValueChange={(v) => updateFilters({ duration: v === ANY ? undefined : v })}
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue placeholder="Any duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any duration</SelectItem>
            {DURATIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          Fee Range (NPR)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9 text-sm"
            value={minFee}
            onChange={(e) => setMinFee(e.target.value)}
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-9 text-sm"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
          />
        </div>
      </div>

      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleClear}>
        Clear all filters
      </Button>
    </div>
  );
}
