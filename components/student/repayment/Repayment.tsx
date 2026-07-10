"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGetMyApplicationsQuery, useGetApplicationTrackerQuery } from "@/lib/api/applicationApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { ScheduleTab } from "./ScheduleTab";
import { PaymentHistoryTab } from "./PaymentHistoryTab";
import { Wallet, ClipboardList, RefreshCw } from "lucide-react";

// Mirrors the same "current active loan" filter used by the Application
// Tracker list (status === "SUBMITTED"), picking the most recently submitted
// one — a student normally has at most one loan progressing through the
// pipeline at a time, so no separate application picker UI is needed here.
function pickActiveApplicationId(
  applications: { id: string; status: string; submittedAt?: string | null; createdAt: string }[],
): string | undefined {
  const submitted = applications.filter((a) => a.status === "SUBMITTED");
  const sorted = [...submitted].sort(
    (a, b) =>
      new Date(b.submittedAt ?? b.createdAt).getTime() -
      new Date(a.submittedAt ?? a.createdAt).getTime(),
  );
  return sorted[0]?.id;
}

export function Repayment() {
  const { data: applications = [], isLoading: appsLoading } = useGetMyApplicationsQuery();
  const activeApplicationId = useMemo(() => pickActiveApplicationId(applications), [applications]);

  const {
    data: tracker,
    isLoading: trackerLoading,
    isFetching: trackerFetching,
    error: trackerError,
    refetch,
  } = useGetApplicationTrackerQuery(activeApplicationId ?? "", { skip: !activeApplicationId });

  const isLoading = appsLoading || (!!activeApplicationId && trackerLoading);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!activeApplicationId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">No active loan</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Repayment information appears here once you have a submitted application moving through approval.
          </p>
          <Link href="/apply">
            <Button className="gap-2">Start Application</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (trackerError || !tracker) {
    const status = trackerError && "status" in trackerError ? trackerError.status : undefined;
    const message =
      status === 404
        ? "Application not found."
        : status === 403
          ? "You don't have access to this application."
          : "Couldn't load your repayment information. Please try again.";
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Wallet className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={trackerFetching} onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!tracker.repayment) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Loan not yet configured</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Once your Credit Manager finalizes your interest rate, tenure, and repayment schedule, your EMI details
            will appear here.
          </p>
          <Link href={`/dashboard/tracker/${activeApplicationId}`}>
            <Button variant="outline" className="gap-2">
              View Application Progress
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { repayment } = tracker;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Repayment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your active loan — {tracker.applicationNumber ?? "your application"}.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">EMI Schedule</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <OverviewTab repayment={repayment} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab schedule={repayment.schedule} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <PaymentHistoryTab schedule={repayment.schedule} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
