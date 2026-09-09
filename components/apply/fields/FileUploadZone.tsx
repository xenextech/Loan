"use client";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Image, CheckCircle2, AlertCircle, Loader2, Eye, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DocumentLightbox, type LightboxFile } from "./DocumentLightbox";

export interface ExistingFile {
  name: string;
  url: string;
  mimeType?: string;
  sizeKB?: number;
}

interface FileUploadZoneProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect?: (file: File | null) => void;
  hint?: string;
  variant?: "default" | "photo" | "document";
  className?: string;
  /** A file already uploaded to the server for this field (e.g. from a previous visit to this step). */
  existingFile?: ExistingFile | null;
  /** Called when the user removes a previously-uploaded (server-side) file. */
  onRemoveExisting?: () => void;
  /** True while a removal of the existing file is in flight. */
  isRemoving?: boolean;
}

export default function FileUploadZone({
  label,
  accept = "image/jpeg,image/png,application/pdf",
  maxSizeMB = 5,
  onFileSelect,
  hint,
  variant = "default",
  className,
  existingFile,
  onRemoveExisting,
  isRemoving,
}: FileUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxFile, setLightboxFile] = useState<LightboxFile | null>(null);
  // Once the user removes the server-side file, stop showing it even if the
  // parent hasn't refetched yet (avoids it flashing back before invalidation).
  // Reset whenever a *different* existing file shows up, using the
  // render-time "adjust state while rendering" pattern instead of an effect.
  const [dismissedExisting, setDismissedExisting] = useState(false);
  const [lastSeenUrl, setLastSeenUrl] = useState(existingFile?.url ?? null);
  if ((existingFile?.url ?? null) !== lastSeenUrl) {
    setLastSeenUrl(existingFile?.url ?? null);
    setDismissedExisting(false);
  }

  const handleFile = useCallback(
    (f: File) => {
      setError(null);
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be under ${maxSizeMB}MB`);
        return;
      }
      setFile(f);
      onFileSelect?.(f);
      if (f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
      } else {
        setPreview(null);
      }
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const showingExisting = !file && !!existingFile && !dismissedExisting;

  const removeFile = () => {
    if (file) {
      setFile(null);
      setPreview(null);
      onFileSelect?.(null);
      return;
    }
    if (showingExisting) {
      setDismissedExisting(true);
      onRemoveExisting?.();
    }
  };

  const isPhoto = variant === "photo";
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;

  // Build the LightboxFile from whatever is currently displayed
  const openLightbox = () => {
    if (file) {
      const url = preview ?? URL.createObjectURL(file);
      setLightboxFile({ name: file.name, url, mimeType: file.type });
    } else if (showingExisting && existingFile) {
      setLightboxFile({
        name: existingFile.name,
        url: existingFile.url,
        mimeType: existingFile.mimeType,
      });
    }
  };

  const handleQuickDownload = () => {
    let url = "";
    let name = "document";
    if (file) {
      // For images preview is a data-URL; for PDFs preview is null — create an object URL
      url = preview ?? URL.createObjectURL(file);
      name = file.name;
    } else if (showingExisting && existingFile) {
      url = existingFile.url;
      name = existingFile.name;
    }
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const displayName = file?.name ?? existingFile?.name ?? "";
  const displayPreview =
    preview ??
    (showingExisting && existingFile?.mimeType?.startsWith("image/")
      ? existingFile.url
      : null);
  const displaySizeKB = file ? file.size / 1024 : existingFile?.sizeKB;

  // Prefer the filename extension over the raw MIME subtype — subtypes like
  // "vnd.openxmlformats-officedocument.wordprocessingml.document" (.docx) are
  // long, unbroken strings with no whitespace, and were overflowing this row
  // since only the filename line (not this one) had truncation applied.
  const fileTypeLabel = (() => {
    const ext = displayName.includes(".") ? displayName.split(".").pop() : undefined;
    if (ext && ext.length <= 6) return ext.toUpperCase();
    const mime = file?.type ?? existingFile?.mimeType;
    return mime?.split("/")[1]?.toUpperCase() ?? "FILE";
  })();

  const hasFile = !!file || showingExisting;

  return (
    <div className={cn("space-y-2 w-full min-w-0", className)}>
      <AnimatePresence mode="wait">
        {hasFile ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className={cn(
              "relative w-full max-w-full rounded-xl border border-[oklch(0.62_0.18_145)]/30 bg-[oklch(0.62_0.18_145)]/5 overflow-hidden",
              isPhoto ? "h-40" : "p-4"
            )}
          >
            {displayPreview && isPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : displayPreview ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={displayPreview} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {displaySizeKB !== undefined ? `${displaySizeKB.toFixed(0)} KB` : "Uploaded"}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[oklch(0.62_0.18_145)] shrink-0" />
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {displaySizeKB !== undefined ? `${displaySizeKB.toFixed(0)} KB · ` : "Uploaded · "}
                    {fileTypeLabel}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[oklch(0.62_0.18_145)] shrink-0" />
              </div>
            )}

            {/* Action buttons: View · Download · Remove */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full bg-background/80 hover:bg-background shadow-sm"
                onClick={openLightbox}
                title="View document"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full bg-background/80 hover:bg-background shadow-sm"
                onClick={handleQuickDownload}
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isRemoving}
                className="w-7 h-7 rounded-full bg-background/80 hover:bg-background shadow-sm"
                onClick={removeFile}
                title="Remove"
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            htmlFor={inputId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex w-full max-w-full min-w-0 flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed transition-all",
              isPhoto ? "h-40" : "py-8 px-6",
              dragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-accent/30"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors shrink-0",
                dragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {isPhoto ? <Image className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <p className="text-sm font-semibold text-foreground mb-1 text-center wrap-break-word px-2">{label}</p>
            {hint && <p className="text-xs text-muted-foreground text-center wrap-break-word px-2">{hint}</p>}
            <p className="text-xs text-muted-foreground mt-2 text-center px-2">
              Drag & drop or{" "}
              <span className="text-primary font-medium">browse files</span>
              {" · "}Max {maxSizeMB}MB
            </p>
            <input
              id={inputId}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={handleInputChange}
            />
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Document Lightbox — rendered outside the card so it covers the full viewport */}
      <DocumentLightbox
        file={lightboxFile}
        onClose={() => setLightboxFile(null)}
      />
    </div>
  );
}
