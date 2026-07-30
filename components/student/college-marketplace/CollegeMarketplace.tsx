"use client";
import { ChevronLeft, ChevronRight, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCollegesQuery } from "@/lib/api/marketplaceApi";
import { CollegeCard, CollegeCardSkeleton } from "./CollegeCard";
import { useCollegeUrlFilters } from "./useCollegeUrlFilters";

export function CollegeMarketplace() {
  const { filters, hasActiveFilters, setPage } = useCollegeUrlFilters();
  const { data, isLoading, isFetching, isError } = useGetCollegesQuery(filters);

  const colleges = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <School className="w-6 h-6 text-primary" />
          College Marketplace
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse colleges and courses, then apply for a loan directly.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CollegeCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">Couldn&apos;t load colleges</p>
          <p className="text-xs text-muted-foreground">Please try again in a moment.</p>
        </div>
      ) : colleges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <School className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">No colleges found</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters in the sidebar."
              : "Check back soon — new colleges are added regularly."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            {meta?.total ?? colleges.length} college{meta?.total !== 1 ? "s" : ""} found
            {isFetching && " · updating…"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {colleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={!meta.hasPrev}
                onClick={() => setPage(meta.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={!meta.hasNext}
                onClick={() => setPage(meta.page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
