"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { DocumentReviewPanel } from "@/components/initiator/review/DocumentReviewPanel";
import { SupporterAssessmentPanel } from "./SupporterAssessmentPanel";
import type { SupporterApplicationDetail } from "../types/supporter";

/**
 * Split-screen Support review layout — mirrors the Initiator's `VerificationLayout`
 * exactly (sticky header, 45/55 split, independently-scrolling columns) so the two
 * roles feel like one continuous product. The right-hand document workspace is the
 * *same* `DocumentReviewPanel` the Initiator uses, reused as-is.
 */
export function SupporterVerificationLayout({ detail }: { detail: SupporterApplicationDetail }) {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 sm:px-6 py-3 lg:h-16 lg:py-0 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground shrink-0" onClick={() => router.push("/supporter")}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Separator orientation="vertical" className="h-6 shrink-0 hidden sm:block" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Support Verification
          </p>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-bold text-foreground font-mono truncate">{detail.applicationNumber}</h1>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">{detail.studentName}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold gap-1 hidden sm:inline-flex">
            <ClipboardCheck className="w-3 h-3" /> Approved by Initiator
          </Badge>
          <Badge variant="outline" className="text-xs font-semibold">
            {detail.workflowStage}
          </Badge>
        </div>
      </header>

      <div className="flex flex-col md:flex-row md:items-start">
        <div className="w-full md:w-[60%] lg:w-[45%] border-r-0 md:border-r border-border md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto">
          <SupporterAssessmentPanel detail={detail} />
        </div>
        <div className="w-full md:w-[40%] lg:w-[55%] md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto bg-muted/20">
          <DocumentReviewPanel detail={detail} />
        </div>
      </div>
    </div>
  );
}
