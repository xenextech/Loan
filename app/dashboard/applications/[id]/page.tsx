"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetApplicationQuery } from "@/lib/api/applicationApi";
import { formatNPR, formatDate, toNumber } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/student/ApplicationCard";
import { StudentConsentCard } from "@/components/student/StudentConsentCard";
import {
  StudentInfoSection,
  FamilyInfoSection,
  CourseInfoSection,
  LoanInfoSection,
  DocumentsSection,
} from "@/components/student/ApplicationDetailSections";
import { ArrowLeft, FileText, Wallet, CalendarDays, Waypoints } from "lucide-react";

/**
 * Plain, read-only single-application detail page — backed only by
 * GET /applications/:id (no tracker/timeline data). Distinct from
 * /dashboard/tracker/[id], which layers the lifecycle tracker on top of the
 * same application detail sections.
 */
export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: application, isLoading, error } = useGetApplicationQuery(id, { skip: !id });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!application) {
    const status = error && "status" in error ? error.status : undefined;
    const message =
      status === 404
        ? "Application not found."
        : status === 403
          ? "You don't have access to this application."
          : status !== undefined
            ? `Couldn't load this application (error ${status}). Please try again.`
            : "Application not found.";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const loanAmount = application.loanInformation?.loanAmount ?? application.loanAmount;
  const isSubmitted = application.status === "SUBMITTED";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6"
    >
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground -ml-2 self-start"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <Card className="border-border">
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Application No.</p>
                <p className="text-base font-bold text-foreground tracking-wide font-mono">
                  {application.applicationNumber ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={application.status} />
              {isSubmitted && (
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => router.push(`/dashboard/tracker/${application.id}`)}>
                  <Waypoints className="w-3.5 h-3.5" />
                  Track Progress
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
            {loanAmount ? (
              <div className="flex items-start gap-2.5">
                <Wallet className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-sm font-semibold text-foreground">{formatNPR(toNumber(loanAmount))}</p>
                </div>
              </div>
            ) : null}
            <div className="flex items-start gap-2.5">
              <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{isSubmitted ? "Submitted" : "Created"}</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(isSubmitted ? (application.submittedAt ?? application.createdAt) : application.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isSubmitted && <StudentConsentCard applicationId={application.id} />}

      <div className="space-y-4">
        <StudentInfoSection app={application} />
        <FamilyInfoSection app={application} />
        <CourseInfoSection app={application} />
        <LoanInfoSection app={application} />
        <DocumentsSection app={application} />
      </div>
    </motion.div>
  );
}
