"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Filter, Download, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLedger } from "./useAuditLedger";
import type { AuditCategory, AuditRole } from "./types";

const ROLE_BADGE_CLASS: Record<AuditRole, string> = {
  Approver: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  Supporter: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Initiator: "bg-primary/10 text-primary",
  Checker: "bg-[oklch(0.85_0.08_300)] text-[oklch(0.4_0.12_300)]",
  Auto: "bg-muted text-muted-foreground",
  Platform: "bg-muted text-muted-foreground",
};

const TABS: { key: "All actions" | AuditCategory }[] = [
  { key: "All actions" },
  { key: "Approvals" },
  { key: "Disbursements" },
  { key: "Repayments" },
  { key: "Commission" },
  { key: "System changes" },
];

/** Audit Ledger is a portfolio-wide, cross-branch log, not scoped to one loan — `id` only drives the Back destination. */
export function AuditLedgerDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const { data } = useAuditLedger();
  const [activeTab, setActiveTab] = useState<"All actions" | AuditCategory>("All actions");

  const filteredEntries = useMemo(
    () => (activeTab === "All actions" ? data.entries : data.entries.filter((entry) => entry.category === activeTab)),
    [data.entries, activeTab],
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/audit-ledger")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Audit Ledger</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Compliance & Traceability</p>
      </div>

      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Audit ledger</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Immutable log — all actions, all users, all branches</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted-foreground">
              HO visibility: <span className="font-semibold text-foreground">{data.hoVisibilityLabel}</span>
            </span>
            <button type="button" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button type="button" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add manual entry
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.key}
            </button>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs whitespace-nowrap">Timestamp</TableHead>
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Action / Details</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} className="border-border">
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-top">{entry.timestampLabel}</TableCell>
                <TableCell className="text-xs text-foreground align-top">{entry.user}</TableCell>
                <TableCell className="align-top">
                  <Badge className={cn(ROLE_BADGE_CLASS[entry.role], "border-0 text-[10px] font-semibold")}>{entry.role}</Badge>
                </TableCell>
                <TableCell className="text-xs text-foreground align-top">
                  <span className="font-bold">{entry.actionLabel}</span> — {entry.details}
                </TableCell>
                <TableCell className="text-right align-top">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" className="text-xs font-medium text-primary hover:underline">
                      Edit
                    </button>
                    <button type="button" className="text-xs font-medium text-primary hover:underline">
                      Preview
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-xs text-muted-foreground mt-4">{data.footerNote}</p>
      </div>
    </motion.div>
  );
}
