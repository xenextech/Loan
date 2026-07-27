"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Inbox, FileText, Download, Upload, UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { useDebounce } from "@/lib/useDebounce";
import { useAppSelector } from "@/lib/hooks";
import {
  useGetGeneratedAgreementsQuery,
  useUploadSignedAgreementMutation,
} from "@/lib/api/dashboardApi";
import type { GeneratedAgreementRecord, GeneratedAgreementStatus, GeneratedAgreementType } from "@/types/dashboard";
import type { ApplicationRef } from "@/types/dashboard";
import { LEGAL_DOCUMENT_TYPE_LABEL, downloadGeneratedAgreement } from "@/lib/documentTemplates/legalDocumentTemplate";
import FileUploadZone from "@/components/apply/fields/FileUploadZone";

const STATUS_BADGE_CLASS: Record<GeneratedAgreementStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGNATURE: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  SIGNED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

const AGREEMENT_TYPE_OPTIONS: GeneratedAgreementType[] = ["LOAN_AGREEMENT", "GUARANTEE_DEED", "HYPOTHECATION", "PROMISSORY_NOTE"];

function isUnsigned(doc: GeneratedAgreementRecord) {
  return doc.status !== "SIGNED" && doc.status !== "ACTIVE";
}

interface ApplicationGroup {
  applicationId: string;
  application: ApplicationRef;
  college: string | null;
  course: string | null;
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

export function LegalDocumentVaultList() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const [studentSearch, setStudentSearch] = useState("");
  const [academicSearch, setAcademicSearch] = useState("");
  const [agreementType, setAgreementType] = useState<GeneratedAgreementType | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [uploadTarget, setUploadTarget] = useState<GeneratedAgreementRecord | null>(null);
  const [bulkUploadGroup, setBulkUploadGroup] = useState<ApplicationGroup | null>(null);

  const debouncedStudentSearch = useDebounce(studentSearch, 300);
  const debouncedAcademicSearch = useDebounce(academicSearch, 300);

  const { data: agreements, isLoading } = useGetGeneratedAgreementsQuery(
    {
      forwardedToRole: role,
      page: 1,
      limit: 100,
      search: debouncedStudentSearch || undefined,
      academicSearch: debouncedAcademicSearch || undefined,
      agreementType: agreementType === "ALL" ? undefined : agreementType,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { skip: !role },
  );

  const rows = useMemo(() => agreements?.data ?? [], [agreements]);

  // All 4 legal documents are now generated together for an application, so
  // this vault groups by application — showing every forwarded document
  // type in one place with a single "Upload all signed" action, instead of
  // 4 separate unrelated-looking rows the initiator has to hunt down.
  const groups = useMemo<ApplicationGroup[]>(() => {
    const byApp = new Map<string, ApplicationGroup>();
    for (const doc of rows) {
      let group = byApp.get(doc.applicationId);
      if (!group) {
        group = {
          applicationId: doc.applicationId,
          application: doc.application,
          college: doc.templateSnapshot?.collegeName ?? null,
          course: doc.templateSnapshot?.courseName ?? null,
          docs: [],
        };
        byApp.set(doc.applicationId, group);
      }
      group.docs.push(doc);
    }
    return Array.from(byApp.values());
  }, [rows]);

  const handleDownload = (doc: GeneratedAgreementRecord) => {
    const opened = downloadGeneratedAgreement(doc);
    if (!opened) {
      toast.error("Couldn't open the document", {
        description: "This document has no saved content to render, or your browser blocked the popup.",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Legal Document Vault</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Legal documents forwarded to you by Credit Management — print, collect physical signatures, and upload all signed copies together.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Student name or application no…"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Input
                placeholder="Academic — college or course…"
                value={academicSearch}
                onChange={(e) => setAcademicSearch(e.target.value)}
                className="h-9 text-sm"
              />
              <Select value={agreementType} onValueChange={(v) => setAgreementType(v as GeneratedAgreementType | "ALL")}>
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue placeholder="Legal — document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All document types</SelectItem>
                  {AGREEMENT_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{LEGAL_DOCUMENT_TYPE_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-sm" />
                <span className="text-xs text-muted-foreground shrink-0">to</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {isLoading ? "Loading…" : `${groups.length} application${groups.length !== 1 ? "s" : ""} · ${rows.length} document${rows.length !== 1 ? "s" : ""}`}
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No documents forwarded to you yet</p>
                <p className="text-xs text-muted-foreground">Documents a Credit Manager forwards to your role will show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {groups.map((group) => {
                  const unsignedCount = group.docs.filter(isUnsigned).length;
                  return (
                    <div key={group.applicationId} className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{group.application.fullName ?? "—"}</p>
                          <p className="text-xs font-mono text-muted-foreground">{group.application.applicationNumber}</p>
                          {(group.college || group.course) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {[group.college, group.course].filter(Boolean).join(" — ")}
                            </p>
                          )}
                        </div>
                        {unsignedCount > 0 && (
                          <Button
                            size="sm"
                            className="gap-1.5 shrink-0"
                            onClick={() => setBulkUploadGroup(group)}
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            Upload signed documents ({unsignedCount} pending)
                          </Button>
                        )}
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-border">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent border-border">
                              <TableHead className="text-xs pl-4">Document</TableHead>
                              <TableHead className="text-xs hidden sm:table-cell">Forwarded</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                              <TableHead className="text-xs text-right pr-4">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.docs.map((doc) => (
                              <TableRow key={doc.id} className="border-border">
                                <TableCell className="pl-4 py-3">
                                  <p className="text-sm font-medium text-foreground leading-tight">{LEGAL_DOCUMENT_TYPE_LABEL[doc.agreementType]}</p>
                                  <p className="text-xs font-mono text-muted-foreground">{doc.documentNumber ?? "—"}</p>
                                </TableCell>
                                <TableCell className="py-3 hidden sm:table-cell">
                                  <p className="text-xs text-muted-foreground">{doc.forwardedAt ? formatDate(doc.forwardedAt) : "—"}</p>
                                  {doc.forwardNote && <p className="text-[10px] text-muted-foreground max-w-40 truncate" title={doc.forwardNote}>{doc.forwardNote}</p>}
                                </TableCell>
                                <TableCell className="py-3">
                                  <Badge className={cn(STATUS_BADGE_CLASS[doc.status], "border-0 text-[10px] font-semibold")}>
                                    {doc.status.replaceAll("_", " ")}
                                  </Badge>
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
                                      Print
                                    </Button>
                                    {isUnsigned(doc) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary gap-1"
                                        onClick={() => setUploadTarget(doc)}
                                      >
                                        <Upload className="w-3 h-3" />
                                        Upload
                                      </Button>
                                    )}
                                    {doc.documentUrl && (
                                      <a
                                        href={doc.documentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 h-7 px-2 text-xs font-medium text-primary hover:underline"
                                      >
                                        <FileText className="w-3 h-3" />
                                        View signed
                                      </a>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <UploadSignedDialog agreement={uploadTarget} onClose={() => setUploadTarget(null)} />
      <BulkUploadSignedDialog group={bulkUploadGroup} onClose={() => setBulkUploadGroup(null)} />
    </div>
  );
}

function UploadSignedDialog({
  agreement,
  onClose,
}: {
  agreement: GeneratedAgreementRecord | null;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadSigned, { isLoading }] = useUploadSignedAgreementMutation();

  const handleUpload = async () => {
    if (!agreement || !file) return;
    try {
      await uploadSigned({ id: agreement.id, file }).unwrap();
      toast.success("Signed document uploaded — marked as SIGNED.");
      setFile(null);
      onClose();
    } catch {
      toast.error("Couldn't upload the signed document");
    }
  };

  return (
    <Dialog
      open={!!agreement}
      onOpenChange={(open) => {
        if (!open) {
          setFile(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload signed document</DialogTitle>
          <DialogDescription>
            {agreement
              ? `Upload the scanned/photographed copy of "${LEGAL_DOCUMENT_TYPE_LABEL[agreement.agreementType]}" (${agreement.documentNumber ?? "—"}) once the student has physically signed it.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <FileUploadZone
            label="Signed document"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            maxSizeMB={5}
            onFileSelect={setFile}
            hint="JPG, PNG, WEBP, or PDF — up to 5 MB"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleUpload} disabled={isLoading || !file}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkUploadSignedDialog({
  group,
  onClose,
}: {
  group: ApplicationGroup | null;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploadSigned] = useUploadSignedAgreementMutation();
  const [uploading, setUploading] = useState(false);

  const unsignedDocs = useMemo(() => group?.docs.filter(isUnsigned) ?? [], [group]);
  const selectedCount = unsignedDocs.filter((doc) => files[doc.id]).length;

  const handleClose = () => {
    setFiles({});
    onClose();
  };

  const handleUploadAll = async () => {
    if (!group || selectedCount === 0) return;
    setUploading(true);
    try {
      const targets = unsignedDocs.filter((doc) => files[doc.id]);
      const results = await Promise.allSettled(
        targets.map((doc) => uploadSigned({ id: doc.id, file: files[doc.id] as File }).unwrap()),
      );
      const failed = results
        .map((r, i) => (r.status === "rejected" ? targets[i] : null))
        .filter((d): d is GeneratedAgreementRecord => d !== null);

      if (failed.length === 0) {
        toast.success(`${targets.length} signed document${targets.length !== 1 ? "s" : ""} uploaded.`);
        handleClose();
      } else if (failed.length < targets.length) {
        toast.warning(
          `Uploaded ${targets.length - failed.length} of ${targets.length} — failed: ${failed.map((d) => LEGAL_DOCUMENT_TYPE_LABEL[d.agreementType]).join(", ")}.`,
        );
      } else {
        toast.error("Couldn't upload the signed documents");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={!!group}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload all signed documents</DialogTitle>
          <DialogDescription>
            {group
              ? `Upload each signed copy for ${group.application.fullName ?? group.application.applicationNumber} — add as many as you have ready, then submit them together.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 max-h-[60vh] overflow-y-auto">
          {unsignedDocs.map((doc) => (
            <FileUploadZone
              key={doc.id}
              label={`${LEGAL_DOCUMENT_TYPE_LABEL[doc.agreementType]}${doc.documentNumber ? ` (${doc.documentNumber})` : ""}`}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              maxSizeMB={5}
              onFileSelect={(file) => setFiles((f) => ({ ...f, [doc.id]: file }))}
              hint="JPG, PNG, WEBP, or PDF — up to 5 MB"
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleUploadAll} disabled={uploading || selectedCount === 0}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            Upload {selectedCount > 0 ? `${selectedCount} ` : ""}Document{selectedCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
