"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  Wallet,
  ArrowRight,
  GraduationCap,
  Building2,
  ShieldCheck,
  Sparkles,
  Flame,
  FileCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/formatters";
import type { MarketplaceCourse } from "@/types/college-marketplace";
import { CATEGORY_LABELS, DEGREE_LABELS } from "./constants";
import Image from "next/image";

interface CourseCardProps {
  course: MarketplaceCourse;
  collegeId: string;

  collegeName?: string;
  universityName?: string | null;
}

export function CourseCard({ course, collegeId, collegeName, universityName }: CourseCardProps) {
  const router = useRouter();

  return (
    <Card className="group border-border overflow-hidden p-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative h-36 bg-linear-to-br from-[#15C35B] to-[#0F7D3C] flex items-center justify-center overflow-hidden">
        {course.bannerUrl ? (
          <Image
            src={course.bannerUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {course.isFeatured && (
            <Badge className="gap-1 bg-white/95 text-foreground border-0 shadow-sm text-[9px] font-semibold px-1.5 h-4">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              Featured
            </Badge>
          )}
          {course.isPopular && (
            <Badge className="gap-1 bg-white/95 text-foreground border-0 shadow-sm text-[9px] font-semibold px-1.5 h-4">
              <Flame className="w-2.5 h-2.5 text-orange-500" />
              Popular
            </Badge>
          )}
        </div>
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 h-4 bg-white/95 text-foreground border-0"
        >
          {DEGREE_LABELS[course.degreeLevel]}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="text-sm font-bold text-foreground leading-snug mb-1 line-clamp-2">
          {course.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{CATEGORY_LABELS[course.category]}</p>

        {collegeName && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-2 truncate">
            <Building2 className="w-3 h-3 shrink-0" />
            {collegeName}
            {universityName ? ` · ${universityName}` : ""}
          </p>
        )}

        <Badge
          variant="outline"
          className="text-[9px] font-medium gap-1 border-emerald-500/30 text-emerald-600 mb-3"
        >
          <ShieldCheck className="w-2.5 h-2.5" />
          Loan Eligible
        </Badge>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs border-t border-border pt-3">
          <div className="flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{course.duration}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-muted-foreground">Tuition</p>
              <p className="font-semibold text-foreground">{formatNPR(course.tuitionFee)}</p>
            </div>
          </div>
          {course.seatsAvailable != null && (
            <div className="flex items-start gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Seats</p>
                <p className="font-semibold text-foreground">{course.seatsAvailable}</p>
              </div>
            </div>
          )}
        </div>

        {course.eligibility && (
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 mb-3 line-clamp-2">
            <FileCheck className="w-3 h-3 mt-0.5 shrink-0" />
            {course.eligibility}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/college/course/${course.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full h-8 text-xs">
              View Details
            </Button>
          </Link>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5 group/btn shadow-sm"
            onClick={() => router.push(`/apply?collegeId=${collegeId}&courseId=${course.id}`)}
          >
            Apply Loan
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
