"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatNPR, formatDate, toNumber } from "@/lib/formatters";
import { useGetApplicationTrackerQuery } from "@/lib/api/applicationApi";
import type { LoanApplication } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, BookOpen, Wallet, CalendarDays, ArrowRight } from "lucide-react";
import { OVERALL_STATUS_LABEL, OVERALL_STATUS_BADGE_CLASS } from "./trackerBadge";
import { cn } from "@/lib/utils";

export function ApplicationTrackerListCard({ app }: { app: LoanApplication }) {
  const { data: tracker, isLoading } = useGetApplicationTrackerQuery(app.id);
  const loanAmount = app.loanInformation?.loanAmount ?? app.loanAmount;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Link href={`/dashboard/tracker/${app.id}`}>
        <Card className="border-border hover:shadow-md transition-all duration-200 group cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Application No.</p>
                  <p className="text-sm font-bold text-foreground tracking-wide">{app.applicationNumber}</p>
                </div>
              </div>
              {tracker && (
                <Badge className={cn(OVERALL_STATUS_BADGE_CLASS[tracker.currentStatus], "border-0 font-semibold")}>
                  {OVERALL_STATUS_LABEL[tracker.currentStatus]}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(app.courseName ?? app.studyInformation?.courseName) && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {app.courseName ?? app.studyInformation?.courseName}
                    </p>
                  </div>
                </div>
              )}
              {loanAmount ? (
                <div className="flex items-start gap-2">
                  <Wallet className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="text-xs font-semibold text-foreground">{formatNPR(toNumber(loanAmount))}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-xs font-semibold text-foreground">{formatDate(app.submittedAt ?? app.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              {isLoading ? (
                <Skeleton className="h-8 rounded-lg" />
              ) : tracker ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-foreground truncate">{tracker.currentStageLabel ?? "Not started"}</p>
                    <p className="text-xs font-semibold text-muted-foreground shrink-0">{tracker.progressPercentage}%</p>
                  </div>
                  <Progress value={tracker.progressPercentage} />
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-1 pt-3 text-xs font-semibold text-primary">
              View Tracker <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function TrackerCardSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 rounded-lg" />
      </CardContent>
    </Card>
  );
}
