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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Inbox, FileText, Plus, ShieldCheck, ShieldAlert, Download, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import {
  useGetGeneratedAgreementsQuery,
  useGetDisbursementPendingQuery,
  useForwardGeneratedAgreementMutation,
} from "@/lib/api/dashboardApi";
import type { GeneratedAgreementRecord, GeneratedAgreementStatus } from "@/types/dashboard";
import type { UserRole } from "@/types/api";
import { LEGAL_DOCUMENT_TYPE_LABEL, downloadGeneratedAgreement } from "@/lib/documentTemplates/legalDocumentTemplate";

const FORWARD_TARGET_ROLES: { value: UserRole; label: string }[] = [
  { value: "INITIATOR", label: "Initiator" },
  { value: "SUPPORTER", label: "Supporter" },
  { value: "APPROVER", label: "Approver" },
];

const STATUS_BADGE_CLASS: Record<GeneratedAgreementStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGNATURE: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  SIGNED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

interface StudentDocumentGroup {
  applicationId: string;
  application: GeneratedAgreementRecord["application"];
  docs: GeneratedAgreementRecord[];
}

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
  const [forwardTarget, setForwardTarget] = useState<GeneratedAgreementRecord | null>(null);
  const [bulkForwardGroup, setBulkForwardGroup] = useState<StudentDocumentGroup | null>(null);

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

  // One student's application can have all 4 legal document types generated
  // — group by application so the list shows one entry per student (each
  // document type + its own status/actions nested inside) instead of 4
  // separate, seemingly-unrelated rows for the same person.
  const groups = useMemo<StudentDocumentGroup[]>(() => {
    const byApp = new Map<string, StudentDocumentGroup>();
    for (const doc of filtered) {
      let group = byApp.get(doc.applicationId);
      if (!group) {
        group = { applicationId: doc.applicationId, application: doc.application, docs: [] };
        byApp.set(doc.applicationId, group);
      }
      group.docs.push(doc);
    }
    return Array.from(byApp.values());
  }, [filtered]);

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
                {isLoading ? "Loading…" : `${groups.length} student${groups.length !== 1 ? "s" : ""} · ${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No legal documents generated yet</p>
                <p className="text-xs text-muted-foreground">Click &quot;Generate New&quot; to create one for an approved application.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {groups.map((group) => (
                  <div key={group.applicationId} className="p-5">
                    <div
                      className="flex items-center justify-between gap-3 mb-3 cursor-pointer group"
                      onClick={() => router.push(`${basePath}/legal-documents/${group.applicationId}`)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight group-hover:underline">{group.application.fullName ?? "—"}</p>
                        <p className="text-xs font-mono text-muted-foreground">{group.application.applicationNumber}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBulkForwardGroup(group);
                          }}
                        >
                          <Send className="w-3 h-3" />
                          Forward All ({group.docs.length})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${basePath}/legal-documents/${group.applicationId}`);
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          Open
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-xs pl-4">Type</TableHead>
                            <TableHead className="text-xs">Document No.</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Generated</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Generated By</TableHead>
                            <TableHead className="text-xs text-right pr-4">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.docs.map((doc) => (
                            <TableRow key={doc.id} className="border-border">
                              <TableCell className="pl-4 py-3">
                                <span className="text-sm font-medium text-foreground">{LEGAL_DOCUMENT_TYPE_LABEL[doc.agreementType]}</span>
                              </TableCell>
                              <TableCell className="py-3">
                                <span className="text-xs font-mono text-foreground">{doc.documentNumber ?? "—"}</span>
                              </TableCell>
                              <TableCell className="py-3 hidden sm:table-cell">
                                <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge className={cn(STATUS_BADGE_CLASS[doc.status], "border-0 text-[10px] font-semibold")}>
                                  {doc.status.replaceAll("_", " ")}
                                </Badge>
                                {doc.forwardedToRole && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    Forwarded to {doc.forwardedToRole.charAt(0) + doc.forwardedToRole.slice(1).toLowerCase()}
                                    {doc.forwardedAt ? ` on ${formatDate(doc.forwardedAt)}` : ""}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="py-3 hidden md:table-cell">
                                <span className="text-xs text-muted-foreground truncate max-w-32 block">{doc.generatedByName ?? "—"}</span>
                              </TableCell>
                              <TableCell className="py-3 text-right pr-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:bg-muted hover:text-foreground gap-1"
                                    onClick={() => handleDownload(doc)}
                                  >
                                    <Download className="w-3 h-3" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:bg-muted hover:text-foreground gap-1"
                                    onClick={() => setForwardTarget(doc)}
                                  >
                                    <Send className="w-3 h-3" />
                                    Forward
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ForwardDialog agreement={forwardTarget} onClose={() => setForwardTarget(null)} />
      <BulkForwardDialog group={bulkForwardGroup} onClose={() => setBulkForwardGroup(null)} />
    </div>
  );
}

function ForwardDialog({
  agreement,
  onClose,
}: {
  agreement: GeneratedAgreementRecord | null;
  onClose: () => void;
}) {
  const [toRole, setToRole] = useState<UserRole>("INITIATOR");
  const [note, setNote] = useState("");
  const [forwardAgreement, { isLoading }] = useForwardGeneratedAgreementMutation();

  const handleForward = async () => {
    if (!agreement) return;
    try {
      await forwardAgreement({ id: agreement.id, body: { toRole, note: note.trim() || undefined } }).unwrap();
      toast.success(`Forwarded to ${toRole.charAt(0) + toRole.slice(1).toLowerCase()}.`);
      setNote("");
      onClose();
    } catch {
      toast.error("Couldn't forward this document");
    }
  };

  return (
    <Dialog
      open={!!agreement}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward document</DialogTitle>
          <DialogDescription>
            {agreement
              ? `Route "${LEGAL_DOCUMENT_TYPE_LABEL[agreement.agreementType]}" (${agreement.documentNumber ?? "—"}) to another team's queue to get it printed and physically signed.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Forward to</label>
            <Select value={toRole} onValueChange={(v) => setToRole(v as UserRole)}>
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORWARD_TARGET_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Note (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Student visits the branch every Tuesday"
              className="text-sm min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleForward} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Forward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkForwardDialog({
  group,
  onClose,
}: {
  group: StudentDocumentGroup | null;
  onClose: () => void;
}) {
  const [toRole, setToRole] = useState<UserRole>("INITIATOR");
  const [note, setNote] = useState("");
  const [forwardAgreement] = useForwardGeneratedAgreementMutation();
  const [forwarding, setForwarding] = useState(false);

  const handleForwardAll = async () => {
    if (!group) return;
    setForwarding(true);
    try {
      const results = await Promise.allSettled(
        group.docs.map((doc) =>
          forwardAgreement({ id: doc.id, body: { toRole, note: note.trim() || undefined } }).unwrap(),
        ),
      );
      const failed = results
        .map((r, i) => (r.status === "rejected" ? group.docs[i] : null))
        .filter((d): d is GeneratedAgreementRecord => d !== null);

      const roleLabel = toRole.charAt(0) + toRole.slice(1).toLowerCase();
      if (failed.length === 0) {
        toast.success(`All ${group.docs.length} documents forwarded to ${roleLabel}.`);
        setNote("");
        onClose();
      } else if (failed.length < group.docs.length) {
        toast.warning(
          `Forwarded ${group.docs.length - failed.length} of ${group.docs.length} — failed: ${failed.map((d) => LEGAL_DOCUMENT_TYPE_LABEL[d.agreementType]).join(", ")}.`,
        );
      } else {
        toast.error("Couldn't forward these documents");
      }
    } finally {
      setForwarding(false);
    }
  };

  return (
    <Dialog
      open={!!group}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward all documents</DialogTitle>
          <DialogDescription>
            {group
              ? `Route all ${group.docs.length} legal documents for ${group.application.fullName ?? group.application.applicationNumber} to another team's queue in one go.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Forward to</label>
            <Select value={toRole} onValueChange={(v) => setToRole(v as UserRole)}>
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORWARD_TARGET_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Note (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Student visits the branch every Tuesday"
              className="text-sm min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={forwarding}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleForwardAll} disabled={forwarding}>
            {forwarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Forward All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
