"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetApplicationQuery, useGetApplicationTrackerQuery } from "@/lib/api/applicationApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApplicationSummaryCard } from "@/components/student/tracker/ApplicationSummaryCard";
import { TrackerTimeline } from "@/components/student/tracker/TrackerTimeline";
import { ActivityFeed } from "@/components/student/tracker/ActivityFeed";
import {
  StudentInfoSection,
  FamilyInfoSection,
  CourseInfoSection,
  LoanInfoSection,
  DocumentsSection,
} from "@/components/student/ApplicationDetailSections";
import { ArrowLeft, FileText } from "lucide-react";

export default function ApplicationTrackerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: tracker, isLoading: trackerLoading, error: trackerError } = useGetApplicationTrackerQuery(id, { skip: !id });
  const { data: application, isLoading: appLoading, error: appError } = useGetApplicationQuery(id, { skip: !id });

  const isLoading = trackerLoading || appLoading;
  const error = trackerError ?? appError;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!tracker || !application) {
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
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/tracker")}>
          Back to tracker
        </Button>
      </div>
    );
  }

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
        onClick={() => router.push("/dashboard/tracker")}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <ApplicationSummaryCard tracker={tracker} application={application} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="border-border lg:col-span-2 h-fit">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Application Progress</h3>
            <TrackerTimeline timeline={tracker.timeline} currentStageKey={tracker.currentStageKey} />
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Application Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <StudentInfoSection app={application} />
              <FamilyInfoSection app={application} />
              <CourseInfoSection app={application} />
              <LoanInfoSection app={application} />
              <DocumentsSection app={application} />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <Card className="border-border">
                <CardContent className="p-5">
                  <ActivityFeed timeline={tracker.timeline} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
