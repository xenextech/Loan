"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { VerificationFormPanel } from "./VerificationFormPanel";
import { DocumentReviewPanel } from "./DocumentReviewPanel";
import type { InitiatorApplicationDetail } from "../types/initiator";

/**
 * Split-screen underwriting review layout: the existing multi-step
 * verification form on the left, a live document review workspace on the
 * right. Both scroll independently on desktop; on mobile they stack with the
 * form first.
 */
export function VerificationLayout({ detail }: { detail: InitiatorApplicationDetail }) {
  const router = useRouter();

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
          <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-xs font-semibold gap-1 hidden sm:inline-flex">
            <CheckCircle2 className="w-3 h-3" /> Verified by College
          </Badge>
          <Badge variant="outline" className="text-xs font-semibold">
            {detail.workflowStage}
          </Badge>
        </div>
      </header>

      {/* Split body: stacked on mobile (form first), 60/40 on tablet, 45/55 on desktop.
          Each column becomes independently scrollable from md+ so the reviewer never
          loses their place in the form while checking documents. */}
      <div className="flex flex-col md:flex-row md:items-start">
        <div className="w-full md:w-[60%] lg:w-[45%] border-r-0 md:border-r border-border md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto">
          <VerificationFormPanel detail={detail} />
        </div>
        <div className="w-full md:w-[40%] lg:w-[55%] md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto bg-muted/20">
          <DocumentReviewPanel detail={detail} />
        </div>
      </div>
    </div>
  );
}
