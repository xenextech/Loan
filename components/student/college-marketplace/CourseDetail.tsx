"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  Languages,
  Layers,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetCourseByIdQuery } from "@/lib/api/marketplaceApi";
import { formatNPR, calculateEMI } from "@/lib/formatters";
import { CATEGORY_LABELS, DEGREE_LABELS } from "./constants";
import { RelatedCourses } from "./RelatedCourses";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// Same illustrative rate used in the apply form's LoanAmountField — kept as
// a local constant rather than importing from that component, to avoid
// coupling this read-only preview to an unrelated form component's internals.
const INDICATIVE_RATE = 11;
const MAX_LOAN = 1500000;

function estimateMonths(duration: string): number {
  const lower = duration.toLowerCase();
  if (lower.includes("year")) return (parseFloat(lower) || 4) * 12 + 12;
  if (lower.includes("month")) return (parseInt(lower) || 24) + 6;
  return 60;
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { data: course, isLoading, isError } = useGetCourseByIdQuery(courseId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-52 sm:h-72 w-full rounded-3xl" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Search className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-base font-bold text-foreground mb-1.5">Course not found</p>
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

  const { college } = course;
  const applyHref = `/apply?collegeId=${college.id}&courseId=${course.id}`;
  const goToApply = () => router.push(applyHref);

  const courseInfoRows = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: Calendar, label: "Intake", value: course.intake },
    { icon: Layers, label: "Credits", value: course.credits ? String(course.credits) : null },
    { icon: Languages, label: "Medium", value: course.medium },
    { icon: Users, label: "Attendance", value: course.attendanceType },
    { icon: FileCheck, label: "Eligibility", value: course.eligibility },
  ].filter((row) => row.value);

  const loanAmount = Math.min(course.totalFee, MAX_LOAN);
  const months = estimateMonths(course.duration);
  const emi = calculateEMI(loanAmount, INDICATIVE_RATE, months);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-16">
      <Link
        href={`/dashboard/college/${college.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {college.name}
      </Link>

      {/* Hero */}
      <motion.div {...fadeUp(0)} className="relative h-52 sm:h-72 rounded-3xl overflow-hidden">
        {course.bannerUrl ? (
          <Image src={course.bannerUrl} alt="" fill className="object-cover" priority />
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
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge className="bg-white/95 text-foreground border-0 shadow-sm text-[10px] font-semibold">
            {DEGREE_LABELS[course.degreeLevel]}
          </Badge>
          <Badge className="bg-white/95 text-foreground border-0 shadow-sm text-[10px] font-semibold">
            {CATEGORY_LABELS[course.category]}
          </Badge>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="mt-5">
        <Link
          href={`/dashboard/college/${college.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {college.logoUrl ? (
            <span className="w-5 h-5 rounded-md overflow-hidden relative shrink-0 bg-muted">
              <Image src={college.logoUrl} alt="" fill className="object-contain" />
            </span>
          ) : (
            <Building2 className="w-3.5 h-3.5 shrink-0" />
          )}
          {college.name}
          {college.university && ` · ${college.university.name}`}
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mt-2">
          {course.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className="text-[10px] font-medium gap-1 border-emerald-500/30 text-emerald-600"
          >
            <ShieldCheck className="w-3 h-3" />
            Loan Eligible
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-medium text-foreground">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-medium text-foreground">
            <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />
            {formatNPR(course.tuitionFee)}
          </div>
          {course.seatsAvailable != null && (
            <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-medium text-foreground">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              {course.seatsAvailable} seats
            </div>
          )}
          <Button size="sm" className="gap-1.5 shadow-sm ml-auto" onClick={goToApply}>
            Apply Loan
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          {(course.description || course.learningOutcomes.length > 0 || course.industryDemand) && (
            <motion.div {...fadeUp(0.1)} className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">Course Overview</h2>
              {course.description && (
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                  {course.description}
                </p>
              )}
              {course.learningOutcomes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                    <ListChecks className="w-3.5 h-3.5 text-primary" />
                    What You&apos;ll Learn
                  </h3>
                  <ul className="space-y-1.5">
                    {course.learningOutcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.industryDemand && (
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    Industry Demand
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {course.industryDemand}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Fee structure */}
          <motion.div {...fadeUp(0.15)} className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">Fee Structure</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {course.admissionFee != null && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Admission Fee</p>
                  <p className="text-sm font-bold text-foreground">
                    {formatNPR(course.admissionFee)}
                  </p>
                </div>
              )}
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">Tuition Fee</p>
                <p className="text-sm font-bold text-foreground">{formatNPR(course.tuitionFee)}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-3">
                <p className="text-[10px] text-primary mb-0.5">Total Estimated Cost</p>
                <p className="text-sm font-bold text-primary">{formatNPR(course.totalFee)}</p>
              </div>
            </div>
            {course.feeBreakdown && course.feeBreakdown.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-border">
                {course.feeBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">
                      {formatNPR(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Course information */}
          {courseInfoRows.length > 0 && (
            <motion.div {...fadeUp(0.2)} className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Course Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {courseInfoRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-xs font-semibold text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Curriculum */}
          {course.curriculum && course.curriculum.length > 0 && (
            <motion.div {...fadeUp(0.25)} className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-2">Curriculum</h2>
              <Accordion type="single" collapsible defaultValue="semester-0">
                {course.curriculum.map((sem, i) => (
                  <AccordionItem key={i} value={`semester-${i}`}>
                    <AccordionTrigger className="text-sm font-semibold">
                      {sem.semester}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {sem.subjects.map((subject, j) => (
                          <li
                            key={j}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          )}

          {/* Career opportunities */}
          {course.careerOutcomes && course.careerOutcomes.length > 0 && (
            <motion.div {...fadeUp(0.3)} className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Career Opportunities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.careerOutcomes.map((career, i) => (
                  <div key={i} className="border border-border rounded-xl p-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-primary" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">{career.title}</p>
                        {career.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {career.description}
                          </p>
                        )}
                        {career.salaryRange && (
                          <Badge variant="secondary" className="text-[10px] mt-1.5">
                            {career.salaryRange}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Related courses */}
          <motion.div {...fadeUp(0.35)}>
            <RelatedCourses courseId={course.id} />
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.aside {...fadeUp(0.15)} className="lg:sticky lg:top-6 space-y-4">
          {/* College info */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">
              About the College
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-muted overflow-hidden shrink-0 relative flex items-center justify-center">
                {college.logoUrl ? (
                  <Image src={college.logoUrl} alt="" fill className="object-contain p-1" />
                ) : (
                  <Building2 className="w-5 h-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{college.name}</p>
                {college.university && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {college.university.name}
                  </p>
                )}
              </div>
            </div>

            {college.accreditation && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium gap-1 border-primary/30 text-primary mb-3"
              >
                <ShieldCheck className="w-3 h-3" />
                {college.accreditation}
              </Badge>
            )}

            <div className="space-y-2.5 mb-4">
              {[college.municipality, college.district, college.province]
                .filter(Boolean)
                .join(", ") && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {[college.municipality, college.district, college.province]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {college.contactEmail && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {college.contactEmail}
                </div>
              )}
              {college.contactPhone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {college.contactPhone}
                </div>
              )}
            </div>

            <Link href={`/dashboard/college/${college.id}`}>
              <Button variant="outline" size="sm" className="w-full text-xs">
                View College
              </Button>
            </Link>
          </div>

          {/* Student loan CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#15C35B] to-[#0F7D3C] p-5 shadow-lg shadow-black/10">
            <Wallet className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4" strokeWidth={1} />
            <p className="text-sm font-bold text-white relative mb-3">Student Loan</p>

            <div className="relative space-y-2.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Tuition Fee</span>
                <span className="font-bold text-white">{formatNPR(course.tuitionFee)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Est. Loan Amount</span>
                <span className="font-bold text-white">{formatNPR(loanAmount)}</span>
              </div>
              <Separator className="bg-white/20" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">Indicative EMI</span>
                <span className="text-base font-bold text-white">
                  {formatNPR(emi)}
                  <span className="text-[10px] font-normal text-white/70">/mo</span>
                </span>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed">
                Based on {INDICATIVE_RATE}% p.a. over {months} months — actual terms vary after
                approval.
              </p>
            </div>

            <ul className="relative space-y-1 mb-4">
              {["Up to 100% of tuition fee financed", "Flexible repayment tenure", "No collateral for eligible amounts"].map(
                (benefit) => (
                  <li key={benefit} className="flex items-start gap-1.5 text-[11px] text-white/90">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                    {benefit}
                  </li>
                ),
              )}
            </ul>

            <Button
              size="sm"
              className="w-full gap-1.5 bg-white text-[#0F7D3C] hover:bg-white/90 relative"
              onClick={goToApply}
            >
              Apply for Education Loan
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
