"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGetMyApplicationsQuery } from "@/lib/api/applicationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationTrackerListCard, TrackerCardSkeleton } from "@/components/student/tracker/ApplicationTrackerListCard";
import { Search, Waypoints, Plus } from "lucide-react";

export default function ApplicationTrackerPage() {
  const { data: applications = [], isLoading } = useGetMyApplicationsQuery();
  const [search, setSearch] = useState("");

  const submitted = useMemo(() => applications.filter((a) => a.status === "SUBMITTED"), [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return submitted;
    return submitted.filter(
      (a) =>
        a.applicationNumber?.toLowerCase().includes(q) ||
        a.fullName?.toLowerCase().includes(q) ||
        (a.courseName ?? a.studyInformation?.courseName)?.toLowerCase().includes(q),
    );
  }, [submitted, search]);

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Application Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading…" : `Track the progress of ${submitted.length} submitted application${submitted.length !== 1 ? "s" : ""}.`}
          </p>
        </div>
        <Link href="/apply?new=1">
          <Button size="sm" className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </Link>
      </motion.div>

      {submitted.length > 0 && (
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by application no. or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <TrackerCardSkeleton key={i} />
          ))}
        </div>
      ) : submitted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Waypoints className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Nothing to track yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Once you submit an application, its progress will show up here.
          </p>
          <Link href="/apply?new=1">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Start Application
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No applications match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <ApplicationTrackerListCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
