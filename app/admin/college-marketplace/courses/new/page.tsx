"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RouteGuard } from "@/components/permissions/RouteGuard";
import { Button } from "@/components/ui/button";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { CourseForm } from "@/components/admin/marketplace/CourseForm";

export default function NewCoursePage() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const searchParams = useSearchParams();
  const defaultCollegeId = searchParams.get("collegeId") ?? undefined;

  return (
    <RouteGuard menuKey="college-marketplace">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 mb-4 -ml-2"
          onClick={() => router.push(`${basePath}/college-marketplace?tab=courses`)}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Courses
        </Button>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Add Course</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new course under an existing college — it appears in the student marketplace immediately.
          </p>
        </div>
        <CourseForm mode="create" defaultCollegeId={defaultCollegeId} />
      </div>
    </RouteGuard>
  );
}
