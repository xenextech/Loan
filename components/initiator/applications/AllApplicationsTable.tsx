"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import { useGetDashboardApplicationsQuery } from "@/lib/api/dashboardApi";
import { useDebounce } from "@/lib/useDebounce";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "../approval/stageBadge";
import type { DashboardApplicationsFilter } from "@/types/dashboard";

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-4 w-32 rounded hidden md:block" />
          <Skeleton className="h-4 w-24 rounded hidden sm:block" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Every submitted application across the platform — backed by
 * GET /dashboard/applications, the same data source `ApprovalWorkflowList`
 * uses. Unfiltered by default (the "All" tab); pass `filter` to scope it to
 * a stage-based queue instead (Pending Approval/Disbursed/Rejected/Sent
 * Back tabs) — the backend combines `filter` and `search` rather than
 * treating them as mutually exclusive. Row clicks go to
 * `${basePath}/applications/:id`, so this is reused as-is by both the
 * Initiator and the Supporter's own Applications page — each role's
 * `applications/[id]` route renders that role's own detail page.
 */
export function AllApplicationsTable({ search, filter }: { search: string; filter?: DashboardApplicationsFilter }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetDashboardApplicationsQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    filter,
  });

  const rows = data?.data ?? [];

  return (
    <>
      <div className="flex items-center justify-end px-5 py-2 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Loading…" : `${data?.meta.total ?? 0} application${data?.meta.total !== 1 ? "s" : ""}`}
        </p>
      </div>
      {isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Inbox className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No applications found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs w-44 pl-5">Ref No.</TableHead>
                  <TableHead className="text-xs">Borrower</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Branch</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Grade</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">DSGIR / LTV</TableHead>
                  <TableHead className="text-xs">Stage</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Days Open</TableHead>
                  <TableHead className="text-xs text-right pr-5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                    onClick={() => router.push(`${basePath}/applications/${app.id}`)}
                  >
                    <TableCell className="pl-5 py-3.5">
                      <p className="text-sm font-semibold text-foreground leading-tight">{app.refNo ?? "—"}</p>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <p className="text-sm font-semibold text-foreground leading-tight">{app.borrower ?? "—"}</p>
                    </TableCell>
                    <TableCell className="py-3.5 hidden md:table-cell">
                      <p className="text-xs text-foreground max-w-44 truncate">{app.branch ?? "—"}</p>
                    </TableCell>
                    <TableCell className="py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-foreground">{app.amount !== null ? formatNPR(app.amount) : "—"}</span>
                    </TableCell>
                    <TableCell className="py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-foreground">{app.grade ?? "—"}</span>
                    </TableCell>
                    <TableCell className="py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {app.dsgir !== null ? `${app.dsgir}%` : "—"} / {app.ltv !== null ? `${app.ltv}%` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={cn(app.stage ? STAGE_BADGE_CLASS[app.stage] : NO_STAGE_BADGE_CLASS, "border-0 text-[10px] font-semibold")}>
                        {app.stage ? STAGE_LABEL[app.stage] : NO_STAGE_LABEL}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{app.daysOpen}d</span>
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`${basePath}/applications/${app.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page {data.meta.page} of {data.meta.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!data.meta.hasPrev || isFetching} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!data.meta.hasNext || isFetching} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
        </>
      )}
    </>
  );
}
