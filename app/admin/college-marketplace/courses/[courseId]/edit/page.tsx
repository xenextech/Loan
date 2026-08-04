"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RouteGuard } from "@/components/permissions/RouteGuard";
import { Button } from "@/components/ui/button";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { useGetCourseByIdQuery } from "@/lib/api/marketplaceApi";
import { CourseForm } from "@/components/admin/marketplace/CourseForm";

export default function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const { data: course, isLoading } = useGetCourseByIdQuery(courseId);

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
          <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Changes apply immediately to the live student-facing marketplace.
          </p>
        </div>
        {isLoading || !course ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CourseForm mode="edit" courseId={courseId} initialValues={course} />
        )}
      </div>
    </RouteGuard>
  );
}
