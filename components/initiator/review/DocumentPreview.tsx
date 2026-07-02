"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "../types/initiator";

interface DocumentPreviewProps {
  document: DocumentItem;
  variant: "thumbnail" | "full";
  zoom?: number;
  rotation?: number;
  className?: string;
}

/**
 * Renders a document's visual preview. PDFs never mount an iframe in the
 * "thumbnail" variant — only the fullscreen modal pays that cost — so a grid
 * of a dozen documents never spins up a dozen embedded PDF viewers at once.
 */
export function DocumentPreview({ document: doc, variant, zoom = 1, rotation = 0, className }: DocumentPreviewProps) {
  const [imgError, setImgError] = useState(false);

  if (doc.fileType === "pdf") {
    if (variant === "thumbnail") {
      return (
        <div className={cn("flex flex-col items-center justify-center gap-1.5 bg-muted/50", className)}>
          <FileText className="w-7 h-7 text-muted-foreground/70" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">PDF Document</span>
        </div>
      );
    }
    return (
      <iframe
        src={doc.url}
        title={doc.label}
        className={cn("w-full h-full bg-white", className)}
        loading="lazy"
      />
    );
  }

  if (imgError) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1.5 bg-muted/50 text-muted-foreground", className)}>
        <ImageOff className="w-6 h-6" />
        <span className="text-[10px]">Preview unavailable</span>
      </div>
    );
  }

  if (variant === "thumbnail") {
    return (
      <div className={cn("relative bg-muted/40", className)}>
        <Image
          src={doc.url}
          alt={doc.label}
          fill
          sizes="(min-width: 1024px) 240px, 45vw"
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center overflow-hidden bg-black/5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- needs free-form zoom/rotate transforms next/image's layout system doesn't support */}
      <img
        src={doc.url}
        alt={doc.label}
        onError={() => setImgError(true)}
        className="max-w-none transition-transform duration-150 ease-out"
        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, maxHeight: zoom === 1 ? "100%" : undefined }}
      />
    </div>
  );
}
