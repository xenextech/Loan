"use client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Eye, Download } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import type { DocumentVaultItem } from "./types";

const FILE_TYPE_ICON = { PDF: FileText, IMAGE: ImageIcon } as const;

function handlePlaceholderAction(action: "View" | "Download", doc: DocumentVaultItem) {
  const url = action === "View" ? doc.previewUrl : doc.downloadUrl;
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  toast.info(`${action} isn't available yet`, {
    description: "This document library uses placeholder data until the Document Vault API is connected.",
  });
}

export function DocumentCard({ document }: { document: DocumentVaultItem }) {
  const FileIcon = FILE_TYPE_ICON[document.fileType];

  return (
    <Card className="border-border shadow-none">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-tight truncate" title={document.documentName}>
              {document.documentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{document.uploadedBy}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant="outline" className="text-[10px] font-medium">{document.category}</Badge>
          <Badge className="bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success border-0 text-[10px] font-semibold">
            Available
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-xs">
          <div>
            <p className="text-muted-foreground">Uploaded</p>
            <p className="font-medium text-foreground">{formatDate(document.uploadedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">File</p>
            <p className="font-medium text-foreground">{document.fileType} · {document.fileSize}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            onClick={() => handlePlaceholderAction("View", document)}
          >
            <Eye className="w-3.5 h-3.5" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            onClick={() => handlePlaceholderAction("Download", document)}
          >
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
