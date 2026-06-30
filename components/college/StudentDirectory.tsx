"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Upload, InboxIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMyVerificationsQuery } from "@/lib/api/collegeApi";
import { formatNPRShort } from "@/lib/formatters";
import type { CollegeMyVerification } from "@/types/api";

// ─── Avatar colour cycling ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-primary/10 text-primary",
  "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]",
  "bg-[oklch(0.528_0.113_235.573)]/10 text-[oklch(0.528_0.113_235.573)]",
  "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)]",
  "bg-destructive/10 text-destructive",
  "bg-muted text-muted-foreground",
] as const;

function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

function getAvatarBg(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Status badge ────────────────────────────────────────────────────────────
function getStatus(v: CollegeMyVerification): { label: string; style: string } {
  if (v.applicationStatus === "DRAFT") {
    return { label: "Application draft", style: "bg-muted text-muted-foreground border-0" };
  }
  if (!v.isApplicationVerified) {
    return { label: "Verify pending", style: "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0" };
  }
  if (!v.offerLetterUploaded) {
    return { label: "Offer letter pending", style: "bg-primary/10 text-primary border-0" };
  }
  if (!v.enrollmentDocUploaded) {
    return { label: "Enroll doc pending", style: "bg-[oklch(0.528_0.113_235.573)]/10 text-[oklch(0.528_0.113_235.573)] border-0" };
  }
  return { label: "Fully verified", style: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0" };
}

// ─── Loading skeleton ────────────────────────────────────────────────────────
function StudentSkeleton() {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentDirectory() {
  const [filter, setSearch] = useState("all");
  const [search, setSearchText] = useState("");

  const { data: verifications, isLoading } = useGetMyVerificationsQuery();

  // Derive unique course names for filter chips
  const courses = useMemo(() => {
    if (!verifications) return [];
    const counts = new Map<string, number>();
    for (const v of verifications) {
      const c = v.courseName ?? "Unknown";
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [verifications]);

  // Filter + search
  const filtered = useMemo(() => {
    if (!verifications) return [];
    return verifications.filter((v) => {
      const matchesCourse =
        filter === "all" ||
        (v.courseName ?? "Unknown") === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (v.studentName ?? "").toLowerCase().includes(q) ||
        v.applicationNumber.toLowerCase().includes(q) ||
        (v.courseName ?? "").toLowerCase().includes(q) ||
        (v.boardUniversity ?? "").toLowerCase().includes(q);
      return matchesCourse && matchesSearch;
    });
  }, [verifications, filter, search]);

  const totalCount = verifications?.length ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Student Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Students who sent you a college verification link appear here.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border shadow-none mb-5">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-sm font-semibold text-foreground">Student directory</CardTitle>
              {/* <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" disabled>
                  <Upload className="w-3.5 h-3.5" /> Import CSV
                </Button>
                <Button size="sm" className="gap-1.5 h-8 text-xs" disabled>
                  <UserPlus className="w-3.5 h-3.5" /> Add student
                </Button>
              </div> */}
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-4">
            {/* Dynamic filter chips */}
            {!isLoading && (
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSearch("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filter === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  All ({totalCount})
                </button>
                {courses.map(([course, count]) => (
                  <button
                    type="button"
                    key={course}
                    onClick={() => setSearch(course)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      filter === course
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {course} ({count})
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, application number, course..."
                className="pl-9 h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Student cards */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                <StudentSkeleton />
              </motion.div>
            ))}
          </>
        ) : !verifications || verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <InboxIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No students yet</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Students will appear here once they send you a college verification link and submit their loan application.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-foreground mb-1">No students match your search</p>
            <button
              type="button"
              className="text-xs text-primary underline"
              onClick={() => { setSearch("all"); setSearchText(""); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {filtered.map((v, i) => {
              const status = getStatus(v);
              const initials = getInitials(v.studentName);
              const avatarBg = getAvatarBg(i);
              const detail = [
                v.courseName,
                v.boardUniversity,
                v.applicationNumber,
                v.loanAmount != null ? formatNPRShort(v.loanAmount) : null,
              ].filter(Boolean).join(" · ");

              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <Card className="border-border shadow-none hover:shadow-sm transition-shadow">
                    <CardContent className="px-5 py-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                        {/* Left: avatar + info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarBg}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {v.studentName ?? "Unknown student"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-70">
                              {detail || v.applicationNumber}
                            </p>
                          </div>
                        </div>

                        {/* Right: status + actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className={`text-[10px] font-semibold ${status.style}`}>
                            {status.label}
                          </Badge>
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            <Link href={`/college-verify/${v.linkToken}`}>
                              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2.5 text-primary border-primary/30 hover:bg-primary/10 gap-1">
                                Verify <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                            <Link href="/college/offer-letter">
                              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2.5 hover:bg-muted">
                                Offer letter
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <p className="text-xs text-center text-muted-foreground py-3">
              Showing {filtered.length} of {totalCount} student{totalCount !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
