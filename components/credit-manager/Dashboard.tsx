"use client";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Landmark, AlertTriangle, ShieldAlert, Gauge, Inbox, ArrowRight, ClipboardList, CheckCircle2, Search, Stamp, Percent, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreditManagerSummary } from "./hooks/useCreditManagerSummary";
import { useCreditManagerPortfolio } from "./hooks/useCreditManagerPortfolio";
import { useGetPipelineStatsThisMonthQuery } from "@/lib/api/dashboardApi";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
}) {
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

function StatSkeleton() {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="px-5 py-5">
        <Skeleton className="w-9 h-9 rounded-xl mb-4" />
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

/**
 * Bespoke portfolio-monitoring overview for the Credit Manager — distinct from
 * the other 4 role portals, which reuse the generic `InitiatorDashboard`. This
 * one is about post-approval loan health, not approval-pipeline stats.
 *
 * Note on scope: portfolio-wide Performing/Non-Performing/Outstanding-Amount
 * breakdowns would require either a new backend aggregate endpoint or fetching
 * every approved loan's full detail individually (N+1) — neither is done here.
 * What's shown below is everything computable from existing aggregate endpoints
 * in one request each. Per-loan health (DPD, NRB tier, installment progress) is
 * on each loan's own detail page, where it costs nothing extra to fetch.
 */
export default function CreditManagerDashboard() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const summary = useCreditManagerSummary();
  const { data: recentLoans, isLoading: recentLoading } = useCreditManagerPortfolio(1, 6);
  const { data: pipelineStats, isLoading: pipelineLoading } = useGetPipelineStatsThisMonthQuery();

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Credit Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Post-approval loan portfolio monitoring and collection oversight.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="mb-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">This Month — Workflow Pipeline</p>
        {pipelineLoading ? (
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <StatSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={ClipboardList} label="Initiated" value={pipelineStats?.initiated ?? 0} iconBg="bg-primary/10 text-primary" />
            <StatCard icon={Search} label="Supported" value={pipelineStats?.supported ?? 0} iconBg="bg-primary/10 text-primary" />
            <StatCard icon={Stamp} label="Checked" value={pipelineStats?.checked ?? 0} iconBg="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle2} label="Approved" value={pipelineStats?.approved ?? 0} iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]" />
            <StatCard
              icon={Percent}
              label="Approval Rate"
              value={pipelineStats?.approvalRate !== null && pipelineStats?.approvalRate !== undefined ? `${pipelineStats.approvalRate}%` : "—"}
              iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]"
            />
            <StatCard
              icon={Timer}
              label="Avg Processing Time"
              value={pipelineStats?.avgProcessingTimeDays !== null && pipelineStats?.avgProcessingTimeDays !== undefined ? `${pipelineStats.avgProcessingTimeDays}d` : "—"}
              iconBg="bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)]"
            />
          </div>
        )}
      </motion.div>

      {summary.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Landmark}
            label="Approved Loans"
            value={summary.totalApprovedLoans}
            sub="Full post-approval portfolio"
            iconBg="bg-primary/10 text-primary"
          />
          <StatCard
            icon={AlertTriangle}
            label="Overdue Installments"
            value={summary.overdueInstallmentCount}
            sub={summary.overdueAmountLabel}
            iconBg="bg-destructive/10 text-destructive"
          />
          <StatCard
            icon={ShieldAlert}
            label="Insurance Expiring / CICL Flags"
            value={`${summary.insuranceExpiringCount} / ${summary.ciclFlagCount}`}
            sub="Within 30 days · blacklist matches"
            iconBg="bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)]"
          />
          <StatCard
            icon={Gauge}
            label="Collection Efficiency"
            value={summary.collectionEfficiency !== null ? `${summary.collectionEfficiency}%` : "—"}
            iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]"
          />
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-foreground">Recently Approved Loans</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary" onClick={() => router.push(`${basePath}/applications`)}>
              View full portfolio <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                ))}
              </div>
            ) : recentLoans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Inbox className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No approved loans yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs pl-5">Borrower</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Branch</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs text-right pr-5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLoans.map((loan) => (
                    <TableRow
                      key={loan.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                      onClick={() => router.push(`${basePath}/applications/${loan.id}`)}
                    >
                      <TableCell className="pl-5 py-3">
                        <p className="text-sm font-medium text-foreground leading-tight">{loan.borrowerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{loan.refNo}</p>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{loan.branch}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-foreground">{loan.amountLabel}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right pr-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${basePath}/applications/${loan.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
