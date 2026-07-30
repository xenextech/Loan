"use client";
import { useParams } from "next/navigation";
import { CourseDetail } from "@/components/student/college-marketplace/CourseDetail";

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  return <CourseDetail courseId={params.courseId} />;
}
