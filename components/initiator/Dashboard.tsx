"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  ClipboardList,
  AlertTriangle,
  Percent,
  Inbox,
  ShieldAlert,
  CalendarClock,
  Ban,
} from "lucide-react";
import { formatNPR, formatNPRShort } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  useGetDashboardOverviewQuery,
  useGetCheckerQueueQuery,
} from "@/lib/api/dashboardApi";
import type { DashboardAlertType } from "@/types/dashboard";

const ALERT_META: Record<DashboardAlertType, { label: string; icon: React.ElementType; className: string }> = {
  CICL_FLAG: { label: "CICL Flag", icon: Ban, className: "bg-destructive/10 text-destructive" },
  INSURANCE_EXPIRING: { label: "Insurance Expiring", icon: ShieldAlert, className: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]" },
  EMI_OVERDUE: { label: "EMI Overdue", icon: CalendarClock, className: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
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
    </motion.div>
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

export default function InitiatorDashboard() {
  const router = useRouter();
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverviewQuery();
  const { data: queue, isLoading: queueLoading } = useGetCheckerQueueQuery({ page: 1, limit: 8 });

  const pipeline = overview?.approvalPipeline;
  const pipelineTotal = (pipeline?.initiated ?? 0) + (pipeline?.supported ?? 0) + (pipeline?.approved ?? 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Portfolio snapshot and items needing your attention.</p>
      </motion.div>

      {/* Stat tiles */}
      {overviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Wallet}
            label="Portfolio Total"
            value={formatNPRShort(overview?.portfolioTotal ?? 0)}
            sub="Disbursed (partial + completed)"
            iconBg="bg-primary/10 text-primary"
            delay={0}
          />
          <StatCard
            icon={ClipboardList}
            label="Pending My Action"
            value={overview?.pendingMyActionCount ?? 0}
            sub="Submitted, not yet approved"
            iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]"
            delay={0.07}
          />
          <StatCard
            icon={AlertTriangle}
            label="Overdue EMI"
            value={overview?.overdueEmi.count ?? 0}
            sub={formatNPR(overview?.overdueEmi.amount ?? 0)}
            iconBg="bg-destructive/10 text-destructive"
            delay={0.14}
          />
          <StatCard
            icon={Percent}
            label="Commission This Month"
            value={formatNPRShort(overview?.commissionThisMonth.total ?? 0)}
            sub={`Banks ${formatNPRShort(overview?.commissionThisMonth.fromBanks ?? 0)} · Colleges ${formatNPRShort(overview?.commissionThisMonth.fromColleges ?? 0)}`}
            iconBg="bg-primary/8 text-primary"
            delay={0.21}
          />
        </div>
      )}

      {/* Approval pipeline (approximate) */}
      {!overviewLoading && pipeline && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <Card className="border-border shadow-none">
            <CardContent className="px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">Approval Pipeline</p>
                <Badge variant="outline" className="text-[10px] font-semibold">approximate</Badge>
              </div>
              <div className="h-2 flex rounded-full overflow-hidden bg-muted">
                {pipelineTotal > 0 && (
                  <>
                    <div className="h-full bg-primary/60" style={{ width: `${(pipeline.initiated / pipelineTotal) * 100}%` }} />
                    <div className="h-full bg-[var(--warning)]" style={{ width: `${(pipeline.supported / pipelineTotal) * 100}%` }} />
                    <div className="h-full bg-[oklch(0.62_0.18_145)]" style={{ width: `${(pipeline.approved / pipelineTotal) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="flex items-center gap-6 mt-3.5 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary/60 shrink-0" /> Initiated — {pipeline.initiated}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] shrink-0" /> Supported — {pipeline.supported}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.62_0.18_145)] shrink-0" /> Approved — {pipeline.approved}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 mt-3">
                Derived from sign-off fields, not a persisted workflow stage.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alerts feed */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border shadow-none h-full">
            <CardHeader className="px-5 py-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {overviewLoading ? (
                <div className="divide-y divide-border">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                  ))}
                </div>
              ) : !overview?.alerts.length ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <Inbox className="w-6 h-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No alerts right now</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {overview.alerts.map((alert, i) => {
                    const meta = ALERT_META[alert.type];
                    return (
                      <li
                        key={`${alert.applicationId}-${i}`}
                        className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => router.push(`/initiator/approval/${alert.applicationId}`)}
                      >
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", meta.className)}>
                          <meta.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <Badge className={cn(meta.className, "border-0 text-[10px] font-semibold mb-1")}>{meta.label}</Badge>
                          <p className="text-xs text-foreground leading-snug">{alert.message}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Checker queue */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <Card className="border-border shadow-none h-full">
            <CardHeader className="px-5 py-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Awaiting Approval</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {queueLoading ? (
                <div className="divide-y divide-border">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                  ))}
                </div>
              ) : !queue?.data.length ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <ClipboardList className="w-6 h-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Nothing awaiting approval</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Borrower</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Grade</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.data.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => router.push(`/initiator/approval/${row.id}`)}
                      >
                        <TableCell className="pl-5 py-3">
                          <p className="text-sm font-medium text-foreground leading-tight">{row.fullName ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{row.applicationNumber}</p>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{row.riskGrade ?? "—"}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-foreground">{formatNPR(row.loanInformation?.loanAmount ?? 0)}</span>
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
    </div>
  );
}
