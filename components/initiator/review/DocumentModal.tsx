"use client";

import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { DocumentPreview } from "./DocumentPreview";
import type { DocumentItem } from "../types/initiator";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

interface DocumentModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentModal({ document: doc, open, onOpenChange }: DocumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100%-2rem)] h-[85vh] flex flex-col p-0 gap-0 sm:max-w-4xl" showCloseButton={false}>
        {/* Keying on the document id remounts the toolbar fresh (zoom/rotation reset to defaults)
            whenever a different document is opened, instead of syncing state via an effect. */}
        {doc && <DocumentModalBody key={doc.id} doc={doc} />}
      </DialogContent>
    </Dialog>
  );
}

function DocumentModalBody({ doc }: { doc: DocumentItem }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isImage = doc.fileType === "image";

  return (
    <TooltipProvider>
      <DialogHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
        <DialogTitle className="text-sm font-semibold truncate">{doc.label}</DialogTitle>

        <div className="flex items-center gap-1 shrink-0">
          {isImage && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
                    disabled={zoom <= ZOOM_MIN}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>

              <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
                    disabled={zoom >= ZOOM_MAX}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    aria-label="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-5 mx-1" />
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <a href={doc.url} download={doc.label} target="_blank" rel="noopener noreferrer" aria-label="Download document">
                  <Download className="w-4 h-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
      </DialogHeader>

      <div className="flex-1 min-h-0 overflow-auto">
        <DocumentPreview document={doc} variant="full" zoom={zoom} rotation={rotation} className="min-h-full" />
      </div>
    </TooltipProvider>
  );
}
