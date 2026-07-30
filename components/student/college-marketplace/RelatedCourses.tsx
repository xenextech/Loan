"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRelatedCoursesQuery } from "@/lib/api/marketplaceApi";
import { CourseCard } from "./CourseCard";

const SCROLL_AMOUNT = 300;

export function RelatedCourses({ courseId }: { courseId: string }) {
  const { data: courses = [], isLoading } = useGetRelatedCoursesQuery(courseId);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-hidden">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          Related Courses
        </h2>
        <div className="hidden sm:flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll(-1)}
            aria-label="Scroll related courses left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll(1)}
            aria-label="Scroll related courses right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scroll-smooth"
      >
        {courses.map((course) => (
          <div key={course.id} className="w-72 shrink-0 snap-start">
            <CourseCard
              course={course}
              collegeId={course.collegeId}
              collegeName={course.college.name}
              universityName={course.college.university?.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
