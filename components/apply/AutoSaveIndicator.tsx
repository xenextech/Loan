"use client";
import { Cloud, CloudOff, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/formatters";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  onSaveNow?: () => void;
}

export default function AutoSaveIndicator({
  status,
  lastSavedAt,
  hasUnsavedChanges,
  onSaveNow,
}: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {status === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Saving…</span>
          </motion.div>
        )}
        {status === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1.5 text-[oklch(0.62_0.18_145)]"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="text-xs">
              Saved {lastSavedAt ? timeAgo(lastSavedAt) : ""}
            </span>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1.5 text-destructive"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span className="text-xs">Save failed</span>
          </motion.div>
        )}
        {status === "idle" && hasUnsavedChanges && (
          <motion.div
            key="unsaved"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1.5 text-warning"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          </motion.div>
        )}
      </AnimatePresence>

      {onSaveNow && hasUnsavedChanges && status !== "saving" && (
        <button
          onClick={onSaveNow}
          className={cn(
            "flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          )}
        >
          <Save className="w-3 h-3" />
          Save now
        </button>
      )}
    </div>
  );
}
