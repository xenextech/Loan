"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Maximize2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { DocumentPreview } from "./DocumentPreview";
import type { DocumentItem } from "../types/initiator";

interface DocumentCardProps {
  document: DocumentItem;
  onOpen: (document: DocumentItem) => void;
}

function DocumentCardImpl({ document: doc, onOpen }: DocumentCardProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card hover:shadow-sm transition-shadow group">
      <button
        type="button"
        onClick={() => onOpen(doc)}
        className="block w-full aspect-[4/3] relative outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={`Open ${doc.label} fullscreen`}
      >
        <DocumentPreview document={doc} variant="thumbnail" className="absolute inset-0 flex items-center justify-center" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </div>
      </button>

      <div className="px-3 py-2.5 space-y-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{doc.label}</p>
          {doc.uploadedAt && (
            <p className="text-[10px] text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="flex-1 gap-1"
            onClick={() => onOpen(doc)}
          >
            <Maximize2 className="w-3 h-3" />
            Fullscreen
          </Button>
          <Button type="button" variant="outline" size="icon-xs" asChild>
            <a href={doc.url} download={doc.label} target="_blank" rel="noopener noreferrer" aria-label={`Download ${doc.label}`}>
              <Download className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DocumentCard = memo(DocumentCardImpl);
