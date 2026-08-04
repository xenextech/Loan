"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookOpen, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { formatNPR } from "@/lib/formatters";
import {
  useGetCoursesAdminQuery,
  useGetCollegesQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
} from "@/lib/api/marketplaceApi";
import { CATEGORY_LABELS } from "@/components/student/college-marketplace/constants";
import type { AdminCourseListItem } from "@/types/college-marketplace";
import { SearchableSelect } from "./SearchableSelect";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

const ALL_COLLEGES = "__all__";

export function CoursesTab() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [search, setSearch] = useState("");
  const [collegeId, setCollegeId] = useState(ALL_COLLEGES);
  const [toDeactivate, setToDeactivate] = useState<AdminCourseListItem | null>(null);

  const { data: collegesData } = useGetCollegesQuery({ includeInactive: true, limit: 100 });
  const { data, isLoading } = useGetCoursesAdminQuery({
    search: search || undefined,
    collegeId: collegeId === ALL_COLLEGES ? undefined : collegeId,
    includeInactive: true,
    limit: 100,
  });

  const [deleteCourse, { isLoading: deactivating }] = useDeleteCourseMutation();
  const [updateCourse, { isLoading: reactivating }] = useUpdateCourseMutation();

  const courses = data?.data ?? [];
  const colleges = collegesData?.data ?? [];

  const handleReactivate = async (course: AdminCourseListItem) => {
    try {
      await updateCourse({ id: course.id, body: { isActive: true } }).unwrap();
      toast.success("Course reactivated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!toDeactivate) return;
    try {
      await deleteCourse(toDeactivate.id).unwrap();
      toast.success("Course deactivated.");
      setToDeactivate(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
          <SearchableSelect
            value={collegeId}
            onChange={setCollegeId}
            options={[
              { value: ALL_COLLEGES, label: "All colleges" },
              ...colleges.map((c) => ({ value: c.id, label: c.name })),
            ]}
            placeholder="All colleges"
            searchPlaceholder="Search colleges…"
            emptyText="No college found."
            className="w-56"
          />
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => router.push(`${basePath}/college-marketplace/courses/new`)}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Course
        </Button>
      </div>

      <AlertDialog open={!!toDeactivate} onOpenChange={(v) => !v && setToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {toDeactivate?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will disappear from the student-facing marketplace and the /apply prefill flow
              immediately. Existing loan applications referencing it are unaffected. You can
              reactivate it any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deactivating}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeactivate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-border shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs pl-5">Course</TableHead>
                  <TableHead className="text-xs">College</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs text-right">Tuition Fee</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="border-border">
                    <TableCell className="pl-5 py-3">
                      <p className="text-sm font-semibold text-foreground leading-tight">{course.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {course.isFeatured && (
                          <Badge variant="secondary" className="text-[9px]">
                            Featured
                          </Badge>
                        )}
                        {course.isPopular && (
                          <Badge variant="secondary" className="text-[9px]">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">{course.college.name}</TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[course.category]}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">{course.duration}</TableCell>
                    <TableCell className="py-3 text-xs text-right text-foreground">
                      {formatNPR(course.tuitionFee)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          course.isActive
                            ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success"
                            : "bg-muted text-muted-foreground",
                          "border-0 text-[10px] font-semibold",
                        )}
                      >
                        {course.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => router.push(`${basePath}/college-marketplace/courses/${course.id}/edit`)}
                          aria-label="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {course.isActive ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setToDeactivate(course)}
                            aria-label="Deactivate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={reactivating}
                            onClick={() => handleReactivate(course)}
                            aria-label="Reactivate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
