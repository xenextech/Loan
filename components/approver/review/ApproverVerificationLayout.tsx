"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentReviewPanel } from "@/components/initiator/review/DocumentReviewPanel";
import { STAGE_LABEL, STAGE_BADGE_CLASS, NO_STAGE_LABEL, NO_STAGE_BADGE_CLASS } from "@/components/initiator/approval/stageBadge";
import { ApproverAssessmentPanel } from "./ApproverAssessmentPanel";
import type { ApproverApplicationDetail } from "../types/approver";

/**
 * Approve review layout. The verification form opens full-width; the
 * "Application Review" button slides in the document review workspace
 * (Application Summary + Application Review tabs) from the right, resizing
 * the form panel down to make room — matches the Initiator's `VerificationLayout`.
 */
export function ApproverVerificationLayout({ detail }: { detail: ApproverApplicationDetail }) {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 sm:px-6 py-3 lg:h-16 lg:py-0 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground shrink-0" onClick={() => router.push("/approver")}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Separator orientation="vertical" className="h-6 shrink-0 hidden sm:block" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Approve Verification
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
          {detail.branch && (
            <Badge variant="outline" className="text-xs font-medium hidden sm:inline-flex">
              {detail.branch}
            </Badge>
          )}
          <Badge className={cn(detail.stage ? STAGE_BADGE_CLASS[detail.stage] : NO_STAGE_BADGE_CLASS, "border-0 font-semibold text-xs")}>
            {detail.stage ? STAGE_LABEL[detail.stage] : NO_STAGE_LABEL}
          </Badge>
        </div>
      </header>

      {/* Body: form panel resizes between full-width and its split width; the review
          panel collapses to 0 width when hidden (clipped via overflow-hidden) and
          expands to its split width when shown — one shared transition duration
          keeps both edges moving together, reading as a single slide. */}
      <div className="flex flex-col md:flex-row md:items-start">
        <div
          className={cn(
            "w-full border-border md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-[width] duration-300 ease-in-out",
            showReview ? "md:w-[60%] lg:w-[45%] border-r-0 md:border-r" : "md:w-full border-r-0",
          )}
        >
          <ApproverAssessmentPanel detail={detail} />
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
