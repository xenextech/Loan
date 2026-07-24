"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import { Inbox, Download, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, displayName } from "@/lib/formatters";
import { useGetAuditLogQuery, useLazyExportAuditCsvQuery } from "@/lib/api/dashboardApi";
import type { AuditCategory } from "@/types/dashboard";

const CATEGORY_TABS: { key: AuditCategory | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "APPROVAL", label: "Approvals" },
  { key: "DISBURSEMENT", label: "Disbursements" },
  { key: "REPAYMENT", label: "Repayments" },
  { key: "COMMISSION", label: "Commission" },
  { key: "SYSTEM", label: "System changes" },
];

const CATEGORY_BADGE_CLASS: Record<AuditCategory, string> = {
  APPROVAL: "bg-primary/10 text-primary",
  DISBURSEMENT: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]",
  REPAYMENT: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  COMMISSION: "bg-[oklch(0.85_0.08_300)] text-[oklch(0.35_0.08_300)]",
  SYSTEM: "bg-muted text-muted-foreground",
};

export function AuditLedgerList() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [category, setCategory] = useState<AuditCategory | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAuditLogQuery({ page, limit: 20, category: category === "ALL" ? undefined : category });
  const [triggerExport, { isLoading: exporting }] = useLazyExportAuditCsvQuery();

  const rows = data?.data ?? [];

  const handleExport = async () => {
    try {
      const { data: blobUrl } = await triggerExport({ category: category === "ALL" ? undefined : category });
      if (!blobUrl) return;
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `audit-log-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable log of every significant action taken in the system.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" className="h-9 gap-1.5" disabled={exporting} onClick={handleExport}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => router.push(`${basePath}/audit-ledger/manual-entry`)}>
            <Plus className="w-4 h-4" /> Manual Entry
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-sm font-semibold text-foreground">Activity Log</CardTitle>
              <p className="text-xs text-muted-foreground">{isLoading ? "Loading…" : `${data?.meta.total ?? 0} entries`}</p>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              {CATEGORY_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setCategory(t.key); setPage(1); }}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                    category === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No activity recorded</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Time</TableHead>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                      <TableHead className="text-xs text-right pr-5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((entry) => (
                      <TableRow key={entry.id} className="border-border">
                        <TableCell className="pl-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.createdAt)}</TableCell>
                        <TableCell className="py-3">
                          <p className="text-sm font-medium text-foreground leading-tight">{displayName(entry.user, "System")}</p>
                          <p className="text-[11px] text-muted-foreground">{entry.user?.role ?? "—"}</p>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <Badge className={cn(CATEGORY_BADGE_CLASS[entry.category], "border-0 text-[10px] font-semibold")}>{entry.category}</Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-5">
                          <span className="text-xs text-foreground">{entry.action.replaceAll("_", " ").toLowerCase()}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data && data.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)}>
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
