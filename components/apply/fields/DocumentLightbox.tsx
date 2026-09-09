"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LightboxFile {
  name: string;
  url: string;
  mimeType?: string;
}

interface DocumentLightboxProps {
  file: LightboxFile | null;
  onClose: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

export function DocumentLightbox({ file, onClose }: DocumentLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf =
    file?.mimeType === "application/pdf" ||
    file?.name.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [file?.url]);

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2)))),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2)))),
    []
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.key === "=" || e.key === "+") && !isPdf) zoomIn();
      if (e.key === "-" && !isPdf) zoomOut();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, zoomIn, zoomOut, isPdf]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isPdf) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
      }
    },
    [isPdf]
  );

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const rotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = () => {
    if (!file) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setFullscreen((f) => !f);
  };

  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black/88 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-white/50 shrink-0" />
            <p className="text-sm font-medium text-white/90 truncate max-w-[180px] sm:max-w-sm md:max-w-lg">
              {file.name}
            </p>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Image-only controls */}
            {!isPdf && (
              <>
                <ToolBtn icon={<ZoomOut className="w-4 h-4" />} label="Zoom out" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} />
                <button
                  onClick={resetView}
                  title="Reset view (click)"
                  className="px-2 py-1 text-xs font-mono text-white/60 hover:text-white transition-colors rounded min-w-[46px] text-center tabular-nums"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <ToolBtn icon={<ZoomIn className="w-4 h-4" />} label="Zoom in" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} />
                <div className="w-px h-5 bg-white/15 mx-1" />
                <ToolBtn icon={<RotateCw className="w-4 h-4" />} label="Rotate 90°" onClick={rotate} />
                <div className="w-px h-5 bg-white/15 mx-1" />
              </>
            )}

            <ToolBtn icon={<Download className="w-4 h-4" />} label="Download" onClick={handleDownload} />
            <ToolBtn
              icon={fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            />
            <div className="w-px h-5 bg-white/15 mx-1" />
            <ToolBtn
              icon={<X className="w-4 h-4" />}
              label="Close"
              onClick={onClose}
              className="hover:bg-red-500/25 hover:text-red-300"
            />
          </div>
        </div>

        {/* Content */}
        <div
          ref={containerRef}
          className={cn(
            "flex-1 relative",
            isPdf ? "overflow-hidden" : "overflow-auto flex items-center justify-center"
          )}
          onWheel={handleWheel}
        >
          {isPdf ? (
            <iframe
              src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
              title={file.name}
              className="w-full h-full bg-white border-0"
              loading="lazy"
            />
          ) : (
            <div className="p-6 flex items-center justify-center min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.name}
                draggable={false}
                className="max-w-none select-none rounded shadow-2xl"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.15s ease-out",
                  maxWidth: zoom <= 1 ? "100%" : undefined,
                  maxHeight: zoom <= 1 ? "80vh" : undefined,
                }}
              />
            </div>
          )}
        </div>

        {/* Footer hint */}
        {!isPdf && (
          <div className="py-2 bg-black/40 border-t border-white/8 shrink-0 text-center">
            <span className="text-[11px] text-white/35">
              Scroll to zoom · +/- keys · Click outside to close
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function ToolBtn({
  icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "w-8 h-8 text-white/65 hover:text-white hover:bg-white/10 disabled:opacity-25",
        className
      )}
    >
      {icon}
    </Button>
  );
}
