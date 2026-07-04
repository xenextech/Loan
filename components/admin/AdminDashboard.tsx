"use client";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useGetAdminApplicationsQuery,
  useGetAdminDashboardQuery,
  useLazyExportCsvQuery,
} from "@/lib/api/adminApi";
import type { Application, ApplicationStatus } from "@/types/application";
import type { AdminQuery, AppStatus } from "@/types/api";
import { formatNPR, formatDate } from "@/lib/formatters";
import StatusBadge from "./StatusBadge";
import ApplicationDrawer from "./ApplicationDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  GraduationCap,
  FileText,
  Clock,
  Download,
  TrendingUp,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_desc", label: "Amount (High → Low)" },
  { value: "amount_asc", label: "Amount (Low → High)" },
];

const sortToQuery = (
  sort: string,
): Pick<AdminQuery, "sortBy" | "sortOrder"> => {
  switch (sort) {
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "asc" };
    case "amount_desc":
      return { sortBy: "loanAmount", sortOrder: "desc" };
    case "amount_asc":
      return { sortBy: "loanAmount", sortOrder: "asc" };
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div
            className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const query: AdminQuery = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status:
        statusFilter !== "all"
          ? (statusFilter.toUpperCase() as AppStatus)
          : undefined,
      page: 1,
      limit: 100,
      ...sortToQuery(sortBy),
    }),
    [debouncedSearch, statusFilter, sortBy],
  );

  const { data, isLoading } = useGetAdminApplicationsQuery(query);
  const { data: dashStats } = useGetAdminDashboardQuery();
  const [triggerExport, { isLoading: isExporting }] = useLazyExportCsvQuery();
  console.log("admin data", data);
  const applications: Application[] = data?.items ?? [];
  const paginated = data?.paginated;

  const stats = useMemo(
    () => ({
      total: (dashStats?.totalSubmitted ?? 0) + (dashStats?.totalDraft ?? 0),
      drafts: dashStats?.totalDraft ?? 0,
      submitted: dashStats?.totalSubmitted ?? paginated?.meta?.total ?? 0,
    }),
    [dashStats, paginated],
  );

  const openDrawer = (app: Application) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  const handleExport = useCallback(async () => {
    try {
      const { data: blobUrl } = await triggerExport(query);
      if (!blobUrl) return;
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `applications-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }, [triggerExport, query]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top nav */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">
                Unnati Edu Loan
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] bg-primary/10 text-primary border-0"
              >
                Admin
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? "Exporting…" : "Export CSV"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and review student loan applications
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            icon={FileText}
            label="Total Applications"
            value={stats.total}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Clock}
            label="Drafts"
            value={stats.drafts}
            color="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)]"
          />
          <StatCard
            icon={CheckCircle2}
            label="Submitted"
            value={stats.submitted}
            color="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]"
          />
        </motion.div>

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, course…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-35 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 w-[160px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <p className="text-xs text-muted-foreground">
                  Showing {applications.length} of {paginated?.meta?.total ?? 0}{" "}
                  applications
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-0 mt-3">
              {isLoading ? (
                <TableSkeleton />
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    No applications found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-6">
                        Application #
                      </TableHead>
                      <TableHead className="text-xs">Applicant</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">
                        Program
                      </TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">
                        Submitted
                      </TableHead>
                      <TableHead className="text-xs text-right pr-6">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow
                        key={app.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => openDrawer(app)}
                      >
                        <TableCell className="pl-6 py-3.5">
                          <span className="text-xs font-mono font-semibold text-foreground">
                            {app.applicationNumber}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {app.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {app.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell">
                          <p className="text-xs text-foreground max-w-[160px] truncate">
                            {app.courseName}
                          </p>
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-semibold text-foreground">
                            {formatNPR(app.loanAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <StatusBadge
                            status={app.status as ApplicationStatus}
                          />
                        </TableCell>
                        <TableCell className="py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(app.submittedAt)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawer(app);
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

      <ApplicationDrawer
        application={selectedApp}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
