"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, CheckCircle2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface OcrField {
  key: string;
  label: string;
  value: string;
}

interface OcrProcessorProps {
  isProcessing: boolean;
  extractedData?: OcrField[];
}

const STAGES = [
  "Scanning document…",
  "Extracting text…",
  "Verifying data…",
  "Auto-filling fields…",
];

export default function OcrProcessor({ isProcessing, extractedData }: OcrProcessorProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setStage(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 18 + 6;
        return Math.min(next, 95);
      });
    }, 200);

    const stageInterval = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 700);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, [isProcessing]);

  if (!isProcessing && !extractedData) return null;

  return (
    <AnimatePresence mode="wait">
      {isProcessing ? (
        <motion.div
          key="processing"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Processing Document</p>
              <motion.p
                key={stage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                {STAGES[stage]}
              </motion.p>
            </div>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-1.5" />

          {/* Skeleton preview */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </motion.div>
      ) : extractedData && extractedData.length > 0 ? (
        <motion.div
          key="extracted"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[oklch(0.62_0.18_145)]/20 bg-[oklch(0.62_0.18_145)]/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-[oklch(0.62_0.18_145)]" />
            <span className="text-sm font-semibold text-foreground">
              Document processed successfully
            </span>
            <Sparkles className="w-3.5 h-3.5 text-primary ml-auto" />
          </div>
          <p className="text-xs text-muted-foreground">
            Fields below have been auto-filled. Please review and edit if needed.
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
