"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Inbox, FileText, Plus, ShieldCheck, ShieldAlert, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import {
  useGetGeneratedAgreementsQuery,
  useGetDisbursementPendingQuery,
} from "@/lib/api/dashboardApi";
import type { GeneratedAgreementStatus } from "@/types/dashboard";
import { LEGAL_DOCUMENT_TYPE_LABEL, downloadGeneratedAgreement } from "@/lib/documentTemplates/legalDocumentTemplate";

const STATUS_BADGE_CLASS: Record<GeneratedAgreementStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGNATURE: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  SIGNED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded hidden md:block" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function LegalDocumentsList() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: agreements, isLoading } = useGetGeneratedAgreementsQuery({ page: 1, limit: 100 });
  const { data: pending, isLoading: pendingLoading } = useGetDisbursementPendingQuery({ page: 1, limit: 100 });

  const filtered = useMemo(() => {
    const rows = agreements?.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (a) =>
        (a.documentNumber ?? "").toLowerCase().includes(q) ||
        (a.application.fullName ?? "").toLowerCase().includes(q) ||
        a.application.applicationNumber.toLowerCase().includes(q),
    );
  }, [agreements, search]);

  const pendingRows = pending?.data ?? [];

  const handleDownload = (doc: (typeof filtered)[number]) => {
    const opened = downloadGeneratedAgreement(doc);
    if (!opened) {
      toast.error("Couldn't open the document", {
        description: "This document has no saved content to render, or your browser blocked the popup.",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Legal Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and track Loan Agreements, Guarantee Deeds, Hypothecation, and Promissory Notes — auto-populated from each application&apos;s finalized loan configuration.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setPickerOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Generate New
        </Button>
      </motion.div>

      <CommandDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Select an application"
        description="Choose an approved application to generate a legal document for"
      >
        <Command>
          <CommandInput placeholder="Search by student name or application number…" />
          <CommandList>
            {pendingLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <CommandEmpty>No approved applications awaiting disbursement.</CommandEmpty>
                <CommandGroup heading="Approved applications">
                  {pendingRows.map((row) => (
                    <CommandItem
                      key={row.applicationId}
                      value={`${row.refNo ?? ""} ${row.borrower ?? ""}`}
                      onSelect={() => {
                        setPickerOpen(false);
                        router.push(`${basePath}/legal-documents/${row.applicationId}`);
                      }}
                    >
                      {row.legalDocumentReady ? (
                        <ShieldCheck className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.borrower ?? "—"}</p>
                        <p className="text-xs text-muted-foreground font-mono">{row.refNo ?? "—"}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by document no., student, application no…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground sm:ml-auto shrink-0">
                {isLoading ? "Loading…" : `${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No legal documents generated yet</p>
                <p className="text-xs text-muted-foreground">Click &quot;Generate New&quot; to create one for an approved application.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Document No.</TableHead>
                      <TableHead className="text-xs">Student</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Application No.</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Type</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Generated</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Generated By</TableHead>
                      <TableHead className="text-xs text-right pr-5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => router.push(`${basePath}/legal-documents/${doc.applicationId}`)}
                      >
                        <TableCell className="pl-5 py-3.5">
                          <span className="text-xs font-mono font-semibold text-foreground">{doc.documentNumber ?? "—"}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-sm font-semibold text-foreground leading-tight">{doc.application.fullName ?? "—"}</p>
                        </TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell">
                          <span className="text-xs font-mono text-foreground">{doc.application.applicationNumber}</span>
                        </TableCell>
                        <TableCell className="py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-foreground">{LEGAL_DOCUMENT_TYPE_LABEL[doc.agreementType]}</span>
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge className={cn(STATUS_BADGE_CLASS[doc.status], "border-0 text-[10px] font-semibold")}>
                            {doc.status.replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground truncate max-w-32 block">{doc.generatedByName ?? "—"}</span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`${basePath}/legal-documents/${doc.applicationId}`);
                              }}
                            >
                              <FileText className="w-3 h-3" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:bg-muted hover:text-foreground gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc);
                              }}
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
