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
import { Search, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/useDebounce";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { AllApplicationsTable } from "@/components/initiator/applications/AllApplicationsTable";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import { useCreditManagerPortfolio } from "./hooks/useCreditManagerPortfolio";
import type { DashboardApplicationsFilter } from "@/types/dashboard";

type TabKey = "portfolio" | "action-needed" | "pending-disbursement" | "disbursed" | "all";

const TABS: { key: TabKey; label: string; filter?: DashboardApplicationsFilter }[] = [
  { key: "portfolio", label: "Approved Portfolio", filter: "disbursement" },
  { key: "action-needed", label: "Action Needed", filter: "action-needed" },
  { key: "pending-disbursement", label: "Pending Disbursement", filter: "pending-disbursement" },
  { key: "disbursed", label: "Disbursed", filter: "disbursed" },
  { key: "all", label: "All" },
];

const TAB_EMPTY_LABEL: Record<Exclude<TabKey, "all">, string> = {
  portfolio: "No approved loans found",
  "action-needed": "Nothing needs attention right now",
  "pending-disbursement": "No loans pending disbursement",
  disbursed: "No disbursed loans found",
};

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

/** "Approved Portfolio" tab — every loan at stage APPROVED, the Credit Manager's
 *  actual monitoring scope. Separate from `AllApplicationsTable`'s unfiltered "All"
 *  since this role's default view is specifically post-approval, not the whole pipeline. */
function PortfolioTable({ search, filter, emptyLabel }: { search: string; filter: DashboardApplicationsFilter; emptyLabel: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data: rows, isLoading, total } = useCreditManagerPortfolio(page, 20, debouncedSearch, filter);

  const totalPages = Math.ceil(total / 20);

  if (isLoading) return <TableSkeleton />;
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Inbox className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
        <p className="text-xs text-muted-foreground">Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-xs pl-5">Ref No.</TableHead>
            <TableHead className="text-xs">Borrower</TableHead>
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
                <span className="text-xs font-mono font-semibold text-foreground">{app.refNo}</span>
              </TableCell>
              <TableCell className="py-3.5">
                <p className="text-sm font-semibold text-foreground leading-tight">{app.borrowerName}</p>
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
  );
}

export default function CreditManagerApplications() {
  const [tab, setTab] = useState<TabKey>("portfolio");
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The approved-loan portfolio under post-approval monitoring, or every application across the full pipeline.
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
                placeholder="Search by borrower, ref no.…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {tab === "all" ? (
              <AllApplicationsTable search={search} />
            ) : (
              <PortfolioTable
                key={tab}
                search={search}
                filter={TABS.find((t) => t.key === tab)!.filter!}
                emptyLabel={TAB_EMPTY_LABEL[tab]}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
