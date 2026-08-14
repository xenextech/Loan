"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, PanelRightOpen, PanelRightClose, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { VerificationFormPanel } from "./VerificationFormPanel";
import { DocumentReviewPanel } from "./DocumentReviewPanel";
import type { InitiatorApplicationDetail } from "../types/initiator";

/**
 * Underwriting review layout. The verification form opens full-width; the
 * "Application Review" button slides in the document review workspace
 * (Application Summary + Application Review tabs) from the right, resizing
 * the form panel down to make room — both driven by one width/opacity
 * transition so the reveal reads as a single smooth slide.
 */
export function VerificationLayout({ detail }: { detail: InitiatorApplicationDetail }) {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Sticky page header — fixed height so the columns below can size against it precisely. */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 sm:px-6 py-3 lg:h-16 lg:py-0 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground shrink-0" onClick={() => router.push("/initiator")}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Separator orientation="vertical" className="h-6 shrink-0 hidden sm:block" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Initiator Verification
          </p>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-bold text-foreground font-mono truncate">{detail.applicationNumber}</h1>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">{detail.studentName}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowReview((v) => !v)}>
            {showReview ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showReview ? "Hide Review" : "Application Review"}</span>
          </Button>
          {detail.status === "INITIATOR_CREATED" ? (
            <Badge className="bg-[oklch(0.55_0.15_260)]/15 text-[oklch(0.42_0.15_260)] border-0 text-xs font-semibold gap-1 hidden sm:inline-flex">
              <UserPlus className="w-3 h-3" /> Initiator Created
            </Badge>
          ) : (
            <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-xs font-semibold gap-1 hidden sm:inline-flex">
              <CheckCircle2 className="w-3 h-3" /> Verified by College
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-semibold">
            {detail.workflowStage}
          </Badge>
        </div>
      </header>

      <div className="flex flex-col md:flex-row md:items-start">
        <div
          className={cn(
            "w-full border-border md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-[width] duration-300 ease-in-out",
            showReview ? "md:w-[60%] lg:w-[45%] border-r-0 md:border-r" : "md:w-full border-r-0",
          )}
        >
          <VerificationFormPanel detail={detail} />
        </div>
        <div
          className={cn(
            "overflow-hidden transition-[width,opacity] duration-300 ease-in-out bg-muted/20",
            showReview ? "w-full md:w-[40%] lg:w-[55%] opacity-100" : "w-0 opacity-0",
          )}
        >
          <div
            className={cn(
              "w-full min-w-[min(100%,26rem)] md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-transform duration-300 ease-in-out",
              showReview ? "translate-x-0" : "translate-x-8",
            )}
          >
            <DocumentReviewPanel detail={detail} />
          </div>
        </div>
      </div>
    </div>
  );
}
