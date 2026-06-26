"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setApplicationId,
  resetApplication,
} from "@/lib/store/applicationSlice";
import { useGetMyApplicationsQuery } from "@/lib/api/applicationApi";
import { useDeleteDraftMutation } from "@/lib/api/applicationApi";
import { formatNPR, toNumber } from "@/lib/formatters";
import type { LoanApplication } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Trash2,
  BookOpen,
  Wallet,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { clearCredentials } from "@/lib/store/authSlice";

const STUDY_TYPE_LABELS: Record<string, string> = {
  PROGRAM: "Degree Program",
  COURSE: "Short Course",
  DIPLOMA: "Diploma",
  CERTIFICATION: "Certification",
};

function StatusBadge({ status }: { status: "DRAFT" | "SUBMITTED" }) {
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

function ApplicationCard({
  app,
  onContinue,
  onDelete,
}: {
  app: LoanApplication;
  onContinue: (app: LoanApplication) => void;
  onDelete: (id: string) => void;
}) {
  const isSubmitted = app.status === "SUBMITTED";
  const studyLabel = app.studyType
    ? (STUDY_TYPE_LABELS[app.studyType] ?? app.studyType)
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
            {app.courseName && (
              <div className="flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                    {app.courseName}
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
            {app.loanAmount && (
              <div className="flex items-start gap-2">
                <Wallet className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-xs font-semibold text-foreground">
                    {formatNPR(toNumber(app.loanAmount))}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isSubmitted ? "Submitted" : "Created"}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {new Date(
                    isSubmitted && app.submittedAt
                      ? app.submittedAt
                      : app.createdAt,
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            {isSubmitted ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Application under review
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
                  onClick={() => onDelete(app.id)}
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

function CardSkeleton() {
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

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { data: applications = [], isLoading } = useGetMyApplicationsQuery();
  const [deleteDraft, { isLoading: isDeleting }] = useDeleteDraftMutation();

  const handleContinue = (app: LoanApplication) => {
    dispatch(resetApplication());
    dispatch(setApplicationId({ id: app.id, number: app.applicationNumber }));
    router.push("/apply");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    try {
      await deleteDraft(id).unwrap();
      toast.success("Draft deleted.");
    } catch {
      toast.error("Failed to delete draft.");
    }
  };

  const handleSignOut = () => {
    dispatch(clearCredentials());
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  };

  const drafts = applications.filter((a) => a.status === "DRAFT");
  const submitted = applications.filter((a) => a.status === "SUBMITTED");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <GraduationCap className="w-5 h-5 text-primary" />
            GenZ Loan Edu Loan
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.email ? `Welcome back` : "My Applications"}
            </h1>
            {user?.email && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.email}
              </p>
            )}
          </div>
          <Link href="/apply">
            <Button size="sm" className="gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        {!isLoading && applications.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total",
                value: applications.length,
                color: "text-foreground",
              },
              {
                label: "In Progress",
                value: drafts.length,
                color: "text-amber-600",
              },
              {
                label: "Submitted",
                value: submitted.length,
                color: "text-emerald-600",
              },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              No applications yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Start your education loan application. It takes about 10 minutes
              to complete.
            </p>
            <Link href="/apply">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Start Application
              </Button>
            </Link>
          </div>
        )}

        {/* Draft applications */}
        {!isLoading && drafts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress ({drafts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drafts.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onContinue={handleContinue}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Submitted applications */}
        {!isLoading && submitted.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Submitted ({submitted.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submitted.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onContinue={handleContinue}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
