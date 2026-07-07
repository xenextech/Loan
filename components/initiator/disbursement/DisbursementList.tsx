"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
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
import { useDisbursementTracker } from "./useDisbursementTracker";
import { useDebounce } from "@/lib/useDebounce";
import type { DisbursementReadiness } from "./types";

const READINESS_LABEL: Record<DisbursementReadiness, string> = {
  ready: "Ready",
  conditions: "Conditions",
  blocked: "Blocked",
};

const READINESS_CLASS: Record<DisbursementReadiness, string> = {
  ready: "text-[oklch(0.42_0.18_145)] dark:text-success",
  conditions: "text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  blocked: "text-destructive",
};

const TRANCHE_STATUS_CLASS: Record<string, string> = {
  CREDITED: "text-[oklch(0.42_0.18_145)] dark:text-success",
  PENDING: "text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  FAILED: "text-destructive",
};

const TRANCHE_STATUS_LABEL: Record<string, string> = {
  CREDITED: "Confirmed",
  PENDING: "Pending ack",
  FAILED: "Failed",
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded hidden md:block" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DisbursementList() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data: rows, isLoading, total } = useDisbursements(page, 20);
  const { data: trackerRows, isLoading: trackerLoading } = useDisbursementTracker(5);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.borrowerName.toLowerCase().includes(q) || row.refNo.toLowerCase().includes(q));
  }, [rows, debouncedSearch]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-serif">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Disbursement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approved applications awaiting conditions checklist and fund release.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-bold text-foreground">Pending disbursements</h2>
          <div className="relative w-full max-w-xs sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search borrower, ref no.…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm font-sans border-0 border-b border-border rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 border-y border-border">
            <Inbox className="w-7 h-7 text-muted-foreground" />
            <p className="text-sm text-foreground">No pending disbursements</p>
            <p className="text-xs text-muted-foreground font-sans">Approved applications will appear here once ready for disbursement.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs">Loan ref</TableHead>
                  <TableHead className="text-xs">Borrower</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Conditions</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <button
                        type="button"
                        className="text-xs font-mono font-semibold text-primary hover:underline"
                        onClick={() => router.push(`${basePath}/disbursment/${row.id}`)}
                      >
                        {row.refNo}
                      </button>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm text-foreground">{row.borrowerName}</span>
                    </TableCell>
                    <TableCell className="py-3 hidden sm:table-cell">
                      <span className="text-sm text-foreground">{row.amountLabel}</span>
                    </TableCell>
                    <TableCell className="py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{row.conditionsDone}/{row.conditionsTotal} done</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className={cn("text-sm font-semibold", READINESS_CLASS[row.readiness])}>{READINESS_LABEL[row.readiness]}</span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary hover:underline"
                        onClick={() => router.push(`${basePath}/disbursment/${row.id}`)}
                      >
                        {row.readiness === "ready" ? "Disburse" : "View"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 font-sans">
                <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    className="flex items-center gap-1 text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="space-y-3">
        <h2 className="text-base font-bold text-foreground">Disbursement tracker</h2>
        {trackerLoading ? (
          <TableSkeleton />
        ) : trackerRows.length === 0 ? (
          <p className="text-sm text-muted-foreground border-y border-border py-6 text-center">No tranches recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Loan ref</TableHead>
                <TableHead className="text-xs">Borrower</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Tranche</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs hidden md:table-cell">A/C credited</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackerRows.map((row) => (
                <TableRow key={row.id} className="border-border">
                  <TableCell className="py-3 text-sm text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="py-3 text-xs font-mono font-semibold text-foreground">{row.refNo}</TableCell>
                  <TableCell className="py-3 text-sm text-foreground">{row.borrowerName}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{row.trancheLabel}</TableCell>
                  <TableCell className="py-3 text-sm text-foreground">{row.amountLabel}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground hidden md:table-cell">{row.accountCredited}</TableCell>
                  <TableCell className="py-3 text-right">
                    <span className={cn("text-sm font-semibold", TRANCHE_STATUS_CLASS[row.status])}>
                      {TRANCHE_STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
