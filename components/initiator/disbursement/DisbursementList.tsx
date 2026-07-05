"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useDisbursements } from "./useDisbursements";
import { useDebounce } from "@/lib/useDebounce";
import type { DisbursementStatus } from "@/types/dashboard";

const STATUS_BADGE_CLASS: Record<DisbursementStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PARTIAL: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  COMPLETED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded hidden md:block" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DisbursementList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data: rows, isLoading, total } = useDisbursements(page, 20);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.borrowerName.toLowerCase().includes(q) || row.refNo.toLowerCase().includes(q));
  }, [rows, debouncedSearch]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Disbursement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approved applications awaiting conditions checklist and fund release.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by borrower, ref no.…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground sm:ml-auto shrink-0">
                {isLoading ? "Loading…" : `${total} application${total !== 1 ? "s" : ""}`}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No pending disbursements</p>
                <p className="text-xs text-muted-foreground">Approved applications will appear here once ready for disbursement.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Ref No.</TableHead>
                      <TableHead className="text-xs">Borrower</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Conditions</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right pr-5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => router.push(`/initiator/disbursment/${row.id}`)}
                      >
                        <TableCell className="pl-5 py-3.5">
                          <span className="text-xs font-mono font-semibold text-foreground">{row.refNo}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-sm font-semibold text-foreground leading-tight">{row.borrowerName}</p>
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-semibold text-foreground">{row.amountLabel}</span>
                        </TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{row.conditionsDone} / {row.conditionsTotal} done</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge className={cn(STATUS_BADGE_CLASS[row.status], "border-0 text-[10px] font-semibold")}>{row.status}</Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/initiator/disbursment/${row.id}`);
                            }}
                          >
                            View
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
