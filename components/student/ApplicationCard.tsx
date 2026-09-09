"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatNPR, toNumber } from "@/lib/formatters";
import type { LoanApplication } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Trash2,
  BookOpen,
  Wallet,
  CalendarDays,
  Eye,
  ListChecks,
} from "lucide-react";

const STUDY_TYPE_LABELS: Record<string, string> = {
  PROGRAM: "Degree Program",
  COURSE: "Short Course",
  DIPLOMA: "Diploma",
  CERTIFICATION: "Certification",
};

export function StatusBadge({ status }: { status: "DRAFT" | "SUBMITTED" }) {
  if (status === "SUBMITTED") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10 gap-1.5">
        <CheckCircle2 className="w-3 h-3" />
        Submitted
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10 gap-1.5">
      <Clock className="w-3 h-3" />
      Draft
    </Badge>
  );
}

export function ApplicationCard({
  app,
  onContinue,
  onDelete,
}: {
  app: LoanApplication;
  onContinue: (app: LoanApplication) => void;
  onDelete: (app: LoanApplication) => void;
}) {
  const isSubmitted = app.status === "SUBMITTED";
  // Course/type/loan-amount come back nested under studyInformation /
  // loanInformation on every list & detail response — the flat fields on
  // LoanApplication are a fallback for the rare response shape that has
  // them directly (see the same pattern in lib/api/transforms.ts).
  const courseName = app.studyInformation?.courseName ?? app.courseName;
  const studyType = app.studyInformation?.studyType ?? app.studyType;
  const loanAmount = app.loanInformation?.loanAmount ?? app.loanAmount;
  const studyLabel = studyType
    ? (STUDY_TYPE_LABELS[studyType] ?? studyType)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-border hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSubmitted ? "bg-emerald-500/10" : "bg-amber-500/10"
                }`}
              >
                <FileText
                  className={`w-5 h-5 ${isSubmitted ? "text-emerald-600" : "text-amber-600"}`}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Application No.
                </p>
                <p className="text-sm font-bold text-foreground tracking-wide">
                  {app.applicationNumber}
                </p>
              </div>
            </div>
            <StatusBadge status={app.status} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {courseName && (
              <div className="flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                    {courseName}
                  </p>
                </div>
              </div>
            )}
            {studyLabel && (
              <div className="flex items-start gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-xs font-semibold text-foreground">
                    {studyLabel}
                  </p>
                </div>
              </div>
            )}
            {loanAmount && (
              <div className="flex items-start gap-2">
                <Wallet className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-xs font-semibold text-foreground">
                    {formatNPR(toNumber(loanAmount))}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isSubmitted ? "Submitted" : "Last saved"}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {new Date(
                    isSubmitted
                      ? (app.submittedAt ?? app.createdAt)
                      : (app.draftSavedAt ?? app.updatedAt ?? app.createdAt),
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {/* Where Continue will pick the draft back up — the step it was
                on when it was saved. */}
            {!isSubmitted && app.currentStep != null && (
              <div className="flex items-start gap-2">
                <ListChecks className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="text-xs font-semibold text-foreground">
                    Step {app.currentStep} of 4
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            {isSubmitted ? (
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Under review
                </div>
                <Link href={`/dashboard/applications/${app.id}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5"
                  onClick={() => onContinue(app)}
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(app)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CardSkeleton() {
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
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 rounded-lg" />
      </CardContent>
    </Card>
  );
}
