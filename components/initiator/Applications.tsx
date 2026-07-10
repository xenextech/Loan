"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, Filter, CheckCircle2, Plus, Inbox, UserPlus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import { useInitiatorApplications } from "./hooks/useInitiatorApplications";
import { useDebounce } from "@/lib/useDebounce";
import { AllApplicationsTable } from "./applications/AllApplicationsTable";

type TabKey = "all" | "my-queue" | "pending-approval" | "disbursed" | "rejected" | "sent-back";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "my-queue", label: "My Queue" },
  { key: "pending-approval", label: "Pending Approval" },
  { key: "disbursed", label: "Disbursed" },
  { key: "rejected", label: "Rejected" },
  { key: "sent-back", label: "Sent Back" },
];

const TAB_KEYS = new Set<TabKey>(TABS.map((t) => t.key));

function isTabKey(value: string | null): value is TabKey {
  return value !== null && TAB_KEYS.has(value as TabKey);
}

// "All" is backed by GET /dashboard/applications (every submitted application);
// "My Queue" is backed by the college-verified review queue scoped to this initiator.
// The rest need a real approval-stage field the backend doesn't have yet.
const LIVE_TABS: TabKey[] = ["all", "my-queue"];

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


export default function InitiatorApplications() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState<TabKey>(isTabKey(requestedTab) ? requestedTab : "all");
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  const { data: applications, isLoading, isError, refetch } = useInitiatorApplications();

  const colleges = useMemo(
    () => Array.from(new Set(applications.map((app) => app.collegeName))).sort(),
    [applications],
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        !q ||
        app.studentName.toLowerCase().includes(q) ||
        app.collegeName.toLowerCase().includes(q) ||
        app.program.toLowerCase().includes(q) ||
        app.applicationNumber.toLowerCase().includes(q);
      const matchesCollege = collegeFilter === "all" || app.collegeName === collegeFilter;
      return matchesSearch && matchesCollege;
    });
  }, [applications, debouncedSearch, collegeFilter]);

  const isLiveTab = LIVE_TABS.includes(tab);
  const rows = tab === "my-queue" ? filtered : [];

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every student loan application, across every stage of the review pipeline.
          </p>
        </div>
        <Button size="sm" className="h-9 text-sm gap-1.5 shrink-0" onClick={() => router.push("/initiator/applications/new")}>
          <Plus className="w-4 h-4" />
          New Application
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border space-y-4">
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                    tab === t.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={tab === "my-queue" ? "Search by student, college, program…" : "Search by borrower, ref no., citizenship, phone…"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {tab === "my-queue" && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                    <SelectTrigger className="h-9 w-44 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {colleges.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tab === "my-queue" && (
                <p className="text-xs text-muted-foreground sm:ml-auto shrink-0">
                  {isLoading ? "Loading…" : `${rows.length} application${rows.length !== 1 ? "s" : ""}`}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {tab === "all" ? (
              <AllApplicationsTable search={search} />
            ) : !isLiveTab ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Not available yet</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  This tab needs a real approval-stage field, which isn&apos;t exposed by the API yet. It will populate
                  once that field exists.
                </p>
              </div>
            ) : isLoading ? (
              <TableSkeleton />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Couldn&apos;t load your queue</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Something went wrong while fetching your applications. Please try again.
                </p>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </Button>
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No applications found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs w-44 pl-5">Application Number</TableHead>
                    <TableHead className="text-xs pl-5">Student Name</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">College Name</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Loan Amount</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Program</TableHead>
                    <TableHead className="text-xs">Current Status</TableHead>
                    <TableHead className="text-xs text-right pr-5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                      onClick={() => router.push(`/initiator/applications/${app.id}`)}
                    >
                      <TableCell className="pl-5 py-3.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">{app.applicationNumber}</p>
                      </TableCell>
                      <TableCell className="pl-5 py-3.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">{app.studentName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{app.applicationNumber}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden md:table-cell">
                        <p className="text-xs text-foreground max-w-44 truncate">{app.collegeName}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-foreground">{formatNPR(app.loanAmount)}</span>
                      </TableCell>
                      <TableCell className="py-3.5 hidden lg:table-cell">
                        <p className="text-xs text-foreground max-w-44 truncate">{app.program}</p>
                      </TableCell>
                      <TableCell className="py-3.5">
                        {app.status === "INITIATOR_CREATED" ? (
                          <Badge className="bg-[oklch(0.55_0.15_260)]/15 text-[oklch(0.42_0.15_260)] border-0 text-[10px] font-semibold gap-1">
                            <UserPlus className="w-3 h-3" /> Initiator Created
                          </Badge>
                        ) : (
                          <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-[10px] font-semibold gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified by College
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 text-right pr-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/initiator/applications/${app.id}`);
                          }}
                        >
                          Edit
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
