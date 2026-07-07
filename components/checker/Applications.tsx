"use client";
import { useState } from "react";
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
import { Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/useDebounce";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { AllApplicationsTable } from "@/components/initiator/applications/AllApplicationsTable";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import { useCheckerApplications } from "./hooks/useCheckerApplications";

type TabKey = "all" | "my-queue" | "pending-approval" | "disbursed" | "rejected" | "sent-back";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "my-queue", label: "My Queue" },
  { key: "pending-approval", label: "Pending Approval" },
  { key: "disbursed", label: "Disbursed" },
  { key: "rejected", label: "Rejected" },
  { key: "sent-back", label: "Sent Back" },
];

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

/** "My Queue" tab — applications supported by the Supporter and awaiting (or sent
 *  back for) this Checker's own tick action. Reuses the same hook that backs the
 *  Check review entry point. */
function MyQueueTable({ search }: { search: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useCheckerApplications();

  const q = debouncedSearch.trim().toLowerCase();
  const rows = q
    ? data.filter((app) => app.borrowerName.toLowerCase().includes(q) || app.branch.toLowerCase().includes(q) || app.refNo.toLowerCase().includes(q))
    : data;

  if (isLoading) return <TableSkeleton />;
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Inbox className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No applications found</p>
        <p className="text-xs text-muted-foreground">Try adjusting your search, or check back once the Supporter clears more applications.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="text-xs pl-5">Borrower</TableHead>
          <TableHead className="text-xs hidden md:table-cell">Branch</TableHead>
          <TableHead className="text-xs hidden lg:table-cell">Type</TableHead>
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
            onClick={() => router.push(`${basePath}/applications/${app.id}`)}
          >
            <TableCell className="pl-5 py-3.5">
              <p className="text-sm font-semibold text-foreground leading-tight">{app.borrowerName}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{app.refNo}</p>
            </TableCell>
            <TableCell className="py-3.5 hidden md:table-cell">
              <p className="text-xs text-foreground max-w-44 truncate">{app.branch}</p>
            </TableCell>
            <TableCell className="py-3.5 hidden lg:table-cell">
              <p className="text-xs text-foreground max-w-44 truncate">{app.loanType}</p>
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
                  router.push(`${basePath}/applications/${app.id}`);
                }}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Checker's "Applications" page — mirrors the Initiator/Supporter Applications page
 * structure exactly (tabs, search, same "All" table). No "New Application" button:
 * only the Initiator creates applications. "My Queue" shows this Checker's own
 * actionable items instead.
 */
export default function CheckerApplications() {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  const isLiveTab = LIVE_TABS.includes(tab);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every student loan application, across every stage of the review pipeline.
        </p>
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

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={tab === "my-queue" ? "Search by borrower, branch…" : "Search by borrower, ref no., citizenship, phone…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {tab === "all" ? (
              <AllApplicationsTable search={search} />
            ) : tab === "my-queue" ? (
              <MyQueueTable search={search} />
            ) : !isLiveTab ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Not available yet</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  This tab needs a real approval-stage field, which isn&apos;t exposed by the API yet. It will populate
                  once that field exists.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
