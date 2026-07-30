"use client";
import { useParams } from "next/navigation";
import { CollegeDetail } from "@/components/student/college-marketplace/CollegeDetail";

export default function CollegeDetailPage() {
  const params = useParams<{ collegeId: string }>();
  return <CollegeDetail collegeId={params.collegeId} />;
}
