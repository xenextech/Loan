"use client";
import { motion } from "framer-motion";
import {
  FileText,
  Building2,
  Banknote,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  InboxIcon,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyVerificationsQuery } from "@/lib/api/collegeApi";
import { useCurrentUser } from "@/lib/hooks";
import { formatNPRShort } from "@/lib/formatters";
import type { CollegeMyVerification } from "@/types/api";

const STATS = [
  { icon: FileText, label: "Offer letters issued", value: "41", sub: "↑ 12 this month", positive: true, iconBg: "bg-primary/10 text-primary" },
  { icon: Building2, label: "Loan applications", value: "28", sub: "↑ 8 to banks", positive: true, iconBg: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]" },
  { icon: Banknote, label: "Total disbursed", value: "Rs 89L", sub: "↑ 14% vs last sem", positive: true, iconBg: "bg-[oklch(0.528_0.113_235.573)]/15 text-[oklch(0.528_0.113_235.573)]" },
  { icon: Clock, label: "Pending co-sign", value: "6", sub: "2 overdue >7d", positive: false, iconBg: "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)]" },
];

const ALERTS = [
  {
    type: "warning" as const,
    icon: AlertTriangle,
    text: "2 co-sign requests overdue — parents not responding",
    time: "Today",
  },
  {
    type: "info" as const,
    icon: Info,
    text: "NIC Asia Bank lowered rate to 9.5% — BBA students eligible",
    time: "Yesterday",
  },
  {
    type: "success" as const,
    icon: CheckCircle2,
    text: "4 students received disbursement — Laxmi Sunrise batch",
    time: "2 days ago",
  },
  {
    type: "error" as const,
    icon: AlertCircle,
    text: "Offer letter AIM-OFFER-2081-082/0039 expiring in 8 days",
    time: "3 days ago",
  },
];

const alertStyles = {
  warning: "border-l-[oklch(0.75_0.18_80)] bg-[oklch(0.75_0.18_80)]/5",
  info: "border-l-primary bg-primary/5",
  success: "border-l-[oklch(0.62_0.18_145)] bg-[oklch(0.62_0.18_145)]/5",
  error: "border-l-destructive bg-destructive/5",
} as const;

const alertIconStyles = {
  warning: "text-[oklch(0.55_0.18_80)]",
  info: "text-primary",
  success: "text-[oklch(0.42_0.18_145)]",
  error: "text-destructive",
} as const;

const PARTNER_BANKS = [
  { name: "NIC Asia Bank", detail: "9.5% · 27 slots", status: "active" as const },
  { name: "NMB Bank", detail: "10.5% · open", status: "active" as const },
  { name: "Laxmi Sunrise", detail: "10.0% · 14 slots", status: "active" as const },
  { name: "Kumari Bank", detail: "Renew MOU 2081", status: "renew" as const },
  { name: "GenZ Loan", detail: "Digital · 9.25%", status: "digital" as const },
  { name: "Global IME", detail: "Pending sign", status: "pending" as const },
];

const bankDetailStyles = {
  active: "text-[oklch(0.42_0.18_145)]",
  renew: "text-[oklch(0.55_0.18_80)]",
  digital: "text-[oklch(0.528_0.113_235.573)]",
  pending: "text-[oklch(0.55_0.18_80)]",
} as const;

function verificationStageBadge(v: CollegeMyVerification): { label: string; style: string } {
  if (v.applicationStatus === "DRAFT") {
    return { label: "Draft", style: "bg-muted text-muted-foreground border-0" };
  }
  if (v.isApplicationVerified) {
    return { label: "Verified", style: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0" };
  }
  return { label: "Pending verify", style: "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0" };
}

function StatCard({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
      <Card className="border-border shadow-none">
        <CardContent className="px-5 py-5">
          <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
            <stat.icon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{stat.value}</p>
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className={`text-[11px] mt-1 ${stat.positive ? "text-[oklch(0.42_0.18_145)]" : "text-destructive"}`}>
            {stat.sub}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  { label: "Generate admission offer letter", href: "/college/offer-letter", primary: true },
  { label: "Create bank / GenZ Loan agreement", href: "/college/agreements", primary: false },
  { label: "Add student to directory", href: "/college/students", primary: false },
  { label: "Calculate fees and loan amount", href: "/college/fee-calculator", primary: false },
];

export default function CollegeOverview() {
  const currentUser = useCurrentUser();
  const { data: verifications, isLoading: verLoading } = useGetMyVerificationsQuery();

  const totalApps = verifications?.length ?? 0;
  const verifiedCount = verifications?.filter((v) => v.isApplicationVerified).length ?? 0;
  const offerLetterCount = verifications?.filter((v) => v.offerLetterUploaded).length ?? 0;
  const pendingCount = verifications?.filter((v) => !v.isApplicationVerified && v.applicationStatus === "SUBMITTED").length ?? 0;

  const liveStats = [
    { ...STATS[0], value: verLoading ? "—" : String(offerLetterCount), sub: `of ${totalApps} total` },
    { ...STATS[1], value: verLoading ? "—" : String(totalApps), sub: `${verifiedCount} verified` },
    { ...STATS[2], value: verLoading ? "—" : String(verifiedCount), sub: "enrollment confirmed" },
    { ...STATS[3], value: verLoading ? "—" : String(pendingCount), sub: "awaiting verification", positive: pendingCount === 0 },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs text-muted-foreground mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-foreground">College Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentUser?.email ?? "College Portal"}
        </p>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {liveStats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 0.07} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5">
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.label} href={a.href}>
                    <button type="button" className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      a.primary
                        ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                    }`}>
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      {a.label}
                    </button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>


          {/* Partner banks */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Partner banks</CardTitle>
                  <span className="text-[10px] text-muted-foreground">6 active MOUs</span>
                </div>
              </CardHeader>
              <CardContent className="px-5 py-3 space-y-2">
                {PARTNER_BANKS.map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{b.name}</span>
                    <span className={`text-[11px] font-medium ${bankDetailStyles[b.status]}`}>{b.detail}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column: real verifications table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border shadow-none h-fit">
            <CardHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Recent loan applications</CardTitle>
                <Link href="/college/students">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1 hover:bg-primary/10 hover:text-primary">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {verLoading ? (
                <div className="px-5 py-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-lg" />
                  ))}
                </div>
              ) : !verifications || verifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <InboxIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No applications yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Applications you verify via college verification links will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Student</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Course</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifications.slice(0, 8).map((v) => {
                      const badge = verificationStageBadge(v);
                      return (
                        <TableRow key={v.id} className="border-border hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-5 py-3.5">
                            <p className="text-sm font-medium text-foreground leading-tight">
                              {v.studentName ?? "—"}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{v.applicationNumber}</p>
                          </TableCell>
                          <TableCell className="py-3.5 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">{v.courseName ?? "—"}</span>
                          </TableCell>
                          <TableCell className="py-3.5">
                            <span className="text-xs font-semibold text-foreground">
                              {v.loanAmount != null ? formatNPRShort(v.loanAmount) : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5">
                            <Badge className={`text-[10px] font-semibold ${badge.style}`}>
                              {badge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3.5 pr-5 text-right">
                            <Link href={`/college-verify/${v.linkToken}`}>
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10">
                                Open <ArrowRight className="w-3 h-3 ml-0.5 inline" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
