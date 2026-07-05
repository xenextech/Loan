"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarClock, Inbox, ChevronLeft, ChevronRight, Wallet, AlertTriangle, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import { useGetRepaymentOverviewQuery, useGetOverdueEmisQuery } from "@/lib/api/dashboardApi";
import type { OverdueBucket } from "@/types/dashboard";

const BUCKET_TABS: { key: OverdueBucket | "all"; label: string }[] = [
  { key: "all", label: "All Overdue" },
  { key: "1-30", label: "1–30 days" },
  { key: "31-90", label: "31–90 days" },
  { key: "90+", label: "90+ days" },
];

function StatCard({ icon: Icon, label, value, sub, iconBg }: { icon: React.ElementType; label: string; value: string | number; sub?: string; iconBg: string }) {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="px-5 py-5">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function EmiScheduleList() {
  const router = useRouter();
  const [bucket, setBucket] = useState<OverdueBucket | "all">("all");
  const [page, setPage] = useState(1);

  const { data: overview, isLoading: overviewLoading } = useGetRepaymentOverviewQuery();
  const { data: overdue, isLoading: overdueLoading } = useGetOverdueEmisQuery({
    page,
    limit: 20,
    bucket: bucket === "all" ? undefined : bucket,
  });

  const rows = overdue?.data ?? [];
  const totalPages = overdue ? overdue.meta.totalPages : 1;

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">EMI Schedule / Repayment</h1>
        <p className="text-sm text-muted-foreground mt-1">Repayment collection overview and overdue accounts.</p>
      </motion.div>

      {overviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Wallet} label="Due Today" value={formatNPR(overview?.dueToday.amount ?? 0)} sub={`${overview?.dueToday.count ?? 0} accounts`} iconBg="bg-primary/10 text-primary" />
          <StatCard icon={AlertTriangle} label="Overdue 1–30d" value={formatNPR(overview?.overdue1to30.amount ?? 0)} sub={`${overview?.overdue1to30.count ?? 0} accounts`} iconBg="bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)]" />
          <StatCard icon={AlertTriangle} label="Overdue 31–90d" value={formatNPR(overview?.overdue31to90.amount ?? 0)} sub={`${overview?.overdue31to90.count ?? 0} accounts`} iconBg="bg-destructive/10 text-destructive" />
          <StatCard icon={Gauge} label="Collection Efficiency" value={overview?.collectionEfficiency !== null && overview?.collectionEfficiency !== undefined ? `${overview.collectionEfficiency}%` : "—"} iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]" />
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border space-y-3">
            <CardTitle className="text-sm font-semibold text-foreground">Overdue Accounts</CardTitle>
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              {BUCKET_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setBucket(t.key); setPage(1); }}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                    bucket === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {overdueLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No overdue accounts</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Borrower</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Installment</TableHead>
                      <TableHead className="text-xs">EMI</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-xs text-right pr-5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => entry.application && router.push(`/initiator/emi-schedule/${entry.application.id}`)}
                      >
                        <TableCell className="pl-5 py-3.5">
                          <p className="text-sm font-semibold text-foreground leading-tight">{entry.application?.fullName ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{entry.application?.applicationNumber}</p>
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">#{entry.installmentNumber}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className="text-xs font-semibold text-foreground">{formatNPR(entry.emiAmount)}</span>
                        </TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{formatDate(entry.dueDate)}</span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-5">
                          <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] font-semibold gap-1">
                            <CalendarClock className="w-3 h-3" /> Overdue
                          </Badge>
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
