"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/useDebounce";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import { useCreditManagerPortfolio } from "../hooks/useCreditManagerPortfolio";

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
        </div>
      ))}
    </div>
  );
}

/** Credit Manager's EMI Schedule entry point — lists the approved portfolio
 *  (the only loans that can have an amortization schedule) and hands off to
 *  `/emi-schedule/[id]`, which fetches the real per-loan schedule from
 *  `GET /dashboard/repayment/{applicationId}/schedule`. Unlike the shared
 *  initiator `EmiScheduleList`, this intentionally skips the portfolio-wide
 *  `/dashboard/repayment/overview` aggregate — the schedule endpoint is
 *  scoped to one applicationId, so this page's job is just to get you to one. */
export function EmiScheduleList() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data: rows, isLoading, total } = useCreditManagerPortfolio(page, 20, debouncedSearch, "disbursement");
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">EMI Schedule / Repayment</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a loan to view its amortization schedule.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border space-y-3">
            <CardTitle className="text-sm font-semibold text-foreground">Approved Portfolio</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by borrower, ref no.…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No data</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Ref No.</TableHead>
                      <TableHead className="text-xs">Borrower</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                      <TableHead className="text-xs">Stage</TableHead>
                      <TableHead className="text-xs text-right pr-5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((app) => (
                      <TableRow
                        key={app.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => router.push(`${basePath}/emi-schedule/${app.id}`)}
                      >
                        <TableCell className="pl-5 py-3.5">
                          <span className="text-xs font-mono font-semibold text-foreground">{app.refNo}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-sm font-semibold text-foreground leading-tight">{app.borrowerName}</p>
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-semibold text-foreground">{app.amountLabel}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge className={cn(app.stage ? STAGE_BADGE_CLASS[app.stage] : NO_STAGE_BADGE_CLASS, "border-0 text-[10px] font-semibold")}>
                            {app.stage ? STAGE_LABEL[app.stage] : NO_STAGE_LABEL}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`${basePath}/emi-schedule/${app.id}`);
                            }}
                          >
                            View Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
