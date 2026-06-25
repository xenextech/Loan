"use client";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useGetAdminApplicationsQuery,
  useLazyExportCsvQuery,
} from "@/lib/api/adminApi";
import type { Application, ApplicationStatus } from "@/types/application";
import type { AdminQuery, AppStatus } from "@/types/api";
import { formatNPR, formatDate } from "@/lib/formatters";
import StatusBadge from "./StatusBadge";
import ApplicationDrawer from "./ApplicationDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Search, Download, Filter, TrendingUp } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

const SORT_OPTIONS = [
  { value: "newest",      label: "Newest First"          },
  { value: "oldest",      label: "Oldest First"          },
  { value: "amount_desc", label: "Amount (High → Low)"   },
  { value: "amount_asc",  label: "Amount (Low → High)"   },
] as const;

const sortToQuery = (sort: string): Pick<AdminQuery, "sortBy" | "sortOrder"> => {
  switch (sort) {
    case "oldest":      return { sortBy: "createdAt",  sortOrder: "asc"  };
    case "amount_desc": return { sortBy: "loanAmount", sortOrder: "desc" };
    case "amount_asc":  return { sortBy: "loanAmount", sortOrder: "asc"  };
    default:            return { sortBy: "createdAt",  sortOrder: "desc" };
  }
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded hidden md:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

export default function ApplicationsView() {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<string>("all");
  const [sortBy, setSortBy]               = useState("newest");
  const [selectedApp, setSelectedApp]     = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen]       = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const query: AdminQuery = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter.toUpperCase() as AppStatus) : undefined,
    page:   1,
    limit:  100,
    ...sortToQuery(sortBy),
  }), [debouncedSearch, statusFilter, sortBy]);

  const { data, isLoading }                                  = useGetAdminApplicationsQuery(query);
  const [triggerExport, { isLoading: isExporting }]          = useLazyExportCsvQuery();

  const applications: Application[] = data?.items ?? [];
  const total                        = data?.paginated?.meta?.total ?? 0;

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
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading…" : `${total} application${total !== 1 ? "s" : ""} in total`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-sm gap-1.5 shrink-0"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting…" : "Export CSV"}
        </Button>
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
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
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-36 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-44 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Showing {applications.length} of {total} results
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No applications found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs pl-5">Application #</TableHead>
                    <TableHead className="text-xs">Applicant</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Program</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-xs text-right pr-5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                      onClick={() => openDrawer(app)}
                    >
                      <TableCell className="pl-5 py-3.5">
                        <span className="text-xs font-mono font-semibold text-foreground">
                          {app.applicationNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {app.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{app.email}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden md:table-cell">
                        <p className="text-xs text-foreground max-w-40 truncate">
                          {app.courseName}
                        </p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-foreground">
                          {formatNPR(app.loanAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <StatusBadge status={app.status as ApplicationStatus} />
                      </TableCell>
                      <TableCell className="py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(app.submittedAt)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-right pr-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => { e.stopPropagation(); openDrawer(app); }}
                        >
                          Review
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

      <ApplicationDrawer
        application={selectedApp}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
