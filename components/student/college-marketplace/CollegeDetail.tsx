"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  FileCheck,
  ClipboardList,
  BookOpen,
  Wallet,
  Landmark,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetCollegeByIdQuery } from "@/lib/api/marketplaceApi";
import { formatNPRShort } from "@/lib/formatters";
import { DEGREE_LABELS } from "./constants";
import { CourseCard } from "./CourseCard";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function CollegeDetail({ collegeId }: { collegeId: string }) {
  const {
    data: college,
    isLoading,
    isError,
  } = useGetCollegeByIdQuery(collegeId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-52 sm:h-72 w-full rounded-3xl" />
        <div className="px-4 sm:px-6 -mt-10 sm:-mt-12 relative">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-background" />
        </div>
        <div className="px-4 sm:px-6 mt-4 space-y-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4 sm:px-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !college) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Search className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-base font-bold text-foreground mb-1.5">
          College not found
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          It may have been removed or is no longer listed.
        </p>
        <Link href="/dashboard/college">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to College Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const location = [college.municipality, college.district, college.province]
    .filter(Boolean)
    .join(", ");
  const degreeLevels = Array.from(
    new Set(college.courses.map((c) => c.degreeLevel)),
  );
  const startingTuition = college.courses.length
    ? Math.min(...college.courses.map((c) => c.tuitionFee))
    : null;

  const stats = [
    {
      icon: BookOpen,
      label: `${college.courses.length} course${college.courses.length !== 1 ? "s" : ""}`,
    },
    ...(startingTuition !== null
      ? [{ icon: Wallet, label: `From ${formatNPRShort(startingTuition)}` }]
      : []),
    ...(degreeLevels.length
      ? [
          {
            icon: GraduationCap,
            label: degreeLevels.map((d) => DEGREE_LABELS[d]).join(" · "),
          },
        ]
      : []),
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-16">
      <Link
        href="/dashboard/college"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to College Marketplace
      </Link>

      {/* Hero banner */}
      <motion.div
        {...fadeUp(0)}
        className="relative h-52 sm:h-72 rounded-3xl overflow-hidden"
      >
        {college.bannerUrl ? (
          <Image
            src={college.bannerUrl}
            alt=""
            fill
            className="object-cover"
            priority
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
        <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
      </motion.div>

      {/* Identity block — logo overlaps the banner */}
      <div className="px-2 sm:px-4">
        <motion.div
          {...fadeUp(0.1)}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4"
        >
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {college.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {college.university && (
                <Badge variant="secondary" className="text-[10px] font-medium">
                  Affiliated with {college.university.name}
                </Badge>
              )}
              {location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {location}
                </span>
              )}
            </div>
          </div>

          {college.courses.length > 0 && (
            <a href="#courses" className="shrink-0">
              <Button size="sm" className="gap-1.5 shadow-sm">
                View Courses
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          )}
        </motion.div>

        {/* Quick stats */}
        {stats.length > 0 && (
          <motion.div
            {...fadeUp(0.15)}
            className="flex flex-wrap items-center gap-2 mt-5"
          >
            {stats.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-medium text-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                {label}
              </div>
            ))}
          </motion.div>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 items-start">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {college.description && (
              <motion.p
                {...fadeUp(0.2)}
                className="text-sm text-foreground/90 leading-relaxed"
              >
                {college.description}
              </motion.p>
            )}

            {(college.eligibility || college.requiredDocs) && (
              <motion.div
                {...fadeUp(0.25)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {college.eligibility && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileCheck className="w-3.5 h-3.5 text-primary" />
                      </span>
                      Eligibility
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {college.eligibility}
                    </p>
                  </div>
                )}
                {college.requiredDocs && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-3.5 h-3.5 text-primary" />
                      </span>
                      Required Documents
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {college.requiredDocs}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div id="courses" {...fadeUp(0.3)} className="scroll-mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground">
                  Available Courses
                </h2>
                {college.courses.length > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    {college.courses.length} listed
                  </Badge>
                )}
              </div>
              {college.courses.length === 0 ? (
                <div className="bg-muted/40 border border-dashed border-border rounded-2xl p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No courses are currently listed for this college.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {college.courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      collegeId={college.id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.aside
            {...fadeUp(0.2)}
            className="lg:sticky lg:top-6 space-y-4"
          >
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3.5">
                {college.university && (
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">
                        Affiliated University
                      </p>
                      <p className="text-xs font-semibold text-foreground truncate">
                        {college.university.name}
                      </p>
                    </div>
                  </div>
                )}
                {location && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">
                        Location
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {location}
                        {college.address ? ` — ${college.address}` : ""}
                      </p>
                    </div>
                  </div>
                )}
                {startingTuition !== null && (
                  <div className="flex items-start gap-2.5">
                    <Wallet className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">
                        Starting Tuition
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {formatNPRShort(startingTuition)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(college.website ||
                college.contactEmail ||
                college.contactPhone) && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2.5">
                    {college.website && (
                      <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate group-hover:underline">
                          {college.website}
                        </span>
                      </a>
                    )}
                    {college.contactEmail && (
                      <a
                        href={`mailto:${college.contactEmail}`}
                        className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate group-hover:underline">
                          {college.contactEmail}
                        </span>
                      </a>
                    )}
                    {college.contactPhone && (
                      <a
                        href={`tel:${college.contactPhone}`}
                        className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate group-hover:underline">
                          {college.contactPhone}
                        </span>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {college.courses.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#15C35B] to-[#0F7D3C] p-5 shadow-lg shadow-black/10">
                <Building2
                  className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4"
                  strokeWidth={1}
                />
                <p className="text-sm font-bold text-white relative">
                  Ready to apply?
                </p>
                <p className="text-xs text-white/80 mt-1 mb-4 relative leading-relaxed">
                  Pick a course below and start your loan application — college
                  and fee details are filled in for you.
                </p>
                <a href="#courses" className="relative block">
                  <Button
                    size="sm"
                    className="w-full gap-1.5 bg-white text-[#0F7D3C] hover:bg-white/90"
                  >
                    View Courses
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            )}
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
