"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  useGetAdminDashboardQuery,
  useGetAdminApplicationsQuery,
} from "@/lib/api/adminApi";
import { formatNPR, formatDate } from "@/lib/formatters";
import StatusBadge from "./StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  Clock,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";


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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Card className="border-border shadow-none">
        <CardContent className="px-5 py-5">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {sub && (
            <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>
          )}
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
        <Skeleton className="h-7 w-14 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  const router = useRouter();
  const { data: dashStats, isLoading: statsLoading } = useGetAdminDashboardQuery();
  const { data: appData, isLoading: appsLoading } = useGetAdminApplicationsQuery({
    page: 1,
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const recentItems  = appData?.items ?? [];
  const total        = (dashStats?.totalSubmitted ?? 0) + (dashStats?.totalDraft ?? 0);
  const recentCount = dashStats?.recentSubmissions?.length ?? 0;

  const submittedPct = total > 0
    ? Math.round(((dashStats?.totalSubmitted ?? 0) / total) * 100)
    : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs text-muted-foreground mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Summary of all loan applications across the platform.
        </p>
      </motion.div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="Total Applications"
            value={total}
            iconBg="bg-primary/10 text-primary"
            delay={0}
          />
          <StatCard
            icon={Send}
            label="Submitted"
            value={dashStats?.totalSubmitted ?? 0}
            sub={`${submittedPct}% of total`}
            iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]"
            delay={0.07}
          />
          <StatCard
            icon={Clock}
            label="In Draft"
            value={dashStats?.totalDraft ?? 0}
            sub="Not yet submitted"
            iconBg="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)]"
            delay={0.14}
          />
          <StatCard
            icon={CalendarDays}
            label="Recent Activity"
            value={recentCount}
            sub="Recent submissions"
            iconBg="bg-primary/8 text-primary"
            delay={0.21}
          />
        </div>
      )}

      {/* Distribution bar */}
      {!statsLoading && total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-border shadow-none">
            <CardContent className="px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Application Distribution</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {total} total
                </Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[oklch(0.62_0.18_145)] rounded-full transition-all duration-700"
                  style={{ width: `${submittedPct}%` }}
                />
              </div>
              <div className="flex items-center gap-6 mt-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.62_0.18_145)] shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    Submitted — {dashStats?.totalSubmitted ?? 0} ({submittedPct}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25 shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    Draft — {dashStats?.totalDraft ?? 0} ({100 - submittedPct}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent applications table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Applications
              </CardTitle>
              <Link href="/admin/applications">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary gap-1 hover:bg-primary/10 hover:text-primary"
                >
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {appsLoading ? (
              <div className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded hidden lg:block" />
                  </div>
                ))}
              </div>
            ) : recentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <TrendingUp className="w-7 h-7 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No applications yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs pl-5">App #</TableHead>
                    <TableHead className="text-xs">Applicant</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentItems.map((app) => (
                    <TableRow
                      key={app.id}
                      className="border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/applications/${app.id}`)}
                    >
                      <TableCell className="pl-5 py-3.5">
                        <span className="text-xs font-mono font-semibold text-foreground">
                          {app.applicationNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {app.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{app.email}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-foreground">
                          {formatNPR(app.loanAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell className="py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(app.submittedAt)}
                        </span>
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
