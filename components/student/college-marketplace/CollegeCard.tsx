"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  BookOpen,
  Clock,
  Wallet,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNPRShort } from "@/lib/formatters";
import type { MarketplaceCollege } from "@/types/college-marketplace";

export function CollegeCard({ college }: { college: MarketplaceCollege }) {
  const location = [college.district, college.province].filter(Boolean).join(", ");

  return (
    <Card className="group border-border overflow-hidden p-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        {college.bannerUrl ? (
          <Image
            src={college.bannerUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="">
              <Image
            src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />

        {college.isFeatured && (
          <Badge className="absolute top-3 left-3 gap-1 bg-white/95 text-foreground border-0 shadow-sm text-[10px] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-5 pt-8">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {college.name}
          </h3>
        </div>

        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 shrink-0" />
            {location}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {college.university && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              {college.university.shortName ?? college.university.name}
            </Badge>
          )}
          {college.accreditation && (
            <Badge
              variant="outline"
              className="text-[10px] font-medium gap-1 border-primary/30 text-primary"
            >
              <BadgeCheck className="w-3 h-3" />
              {college.accreditation}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[10px] font-medium gap-1 border-emerald-500/30 text-emerald-600"
          >
            <ShieldCheck className="w-3 h-3" />
            Loan Available
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs border-t border-border pt-3 mb-4">
          <div className="flex flex-col items-start gap-0.5">
            <span className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              Courses
            </span>
            <span className="font-semibold text-foreground">{college.courseCount}</span>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              Duration
            </span>
            <span className="font-semibold text-foreground">
              {college.durationRange ?? "—"}
            </span>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Wallet className="w-3 h-3" />
              From
            </span>
            <span className="font-semibold text-foreground">
              {college.startingTuition !== null
                ? formatNPRShort(college.startingTuition)
                : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/college/${college.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full h-8 text-xs">
              View College
            </Button>
          </Link>
          <Link href={`/dashboard/college/${college.id}#courses`} className="flex-1">
            <Button size="sm" className="w-full h-8 text-xs gap-1 group/btn">
              Apply Loan
              <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function CollegeCardSkeleton() {
  return (
    <Card className="border-border overflow-hidden p-0">
      <Skeleton className="h-40 w-full rounded-none" />
      <CardContent className="p-5 pt-8 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
      </CardContent>
    </Card>
  );
}
