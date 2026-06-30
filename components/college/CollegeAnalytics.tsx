"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const KPI_STATS = [
  { label: "Admission conversion (with loan)", value: "84%", sub: "↑ 11% vs no-loan", positive: true },
  { label: "Fee collection rate", value: "97%", sub: "↑ 9% loan-backed", positive: true },
  { label: "Dropout — loan cohort", value: "1.2%", sub: "vs 8.4% non-loan", positive: true },
  { label: "Avg bank processing", value: "5.8 days", sub: "↓ 2.4 days faster", positive: true },
];

const LOAN_UPTAKE = [
  { program: "BBA", pct: 72 },
  { program: "BBA-BI", pct: 65 },
  { program: "MBA", pct: 55 },
  { program: "EMBA", pct: 41 },
];

const BANK_SCORECARD = [
  { bank: "NIC Asia", sanction: "89%", days: "4.2d", rate: "9.5%", positive: true },
  { bank: "GenZ Loan", sanction: "94%", days: "2.1d", rate: "9.25%", positive: true },
  { bank: "NMB Bank", sanction: "81%", days: "6.8d", rate: "10.5%", positive: true },
  { bank: "Laxmi SR", sanction: "76%", days: "7.4d", rate: "10.0%", positive: false },
];

const FEE_COLLECTION = [
  { name: "Bikash Rai", program: "BBA", sem: "Sem 3", due: "Rs 77,000", source: "NIC Asia", status: "Pending", statusType: "info" as const },
  { name: "Priya Tamang", program: "MBA", sem: "Sem 2", due: "Rs 1,20,000", source: "NMB Bank", status: "Paid ✓", statusType: "success" as const },
  { name: "Anisha Gurung", program: "EMBA", sem: "Sem 2", due: "Rs 80,000", source: "Self", status: "Paid ✓", statusType: "success" as const },
  { name: "Dipesh Koirala", program: "BBA-BI", sem: "Sem 5", due: "Rs 77,000", source: "—", status: "Overdue", statusType: "error" as const },
];

const PIPELINE = [
  { stage: "College verify", count: 41, pct: 100, color: "bg-primary" },
  { stage: "Co-sign pending", count: 8, pct: 20, color: "bg-primary" },
  { stage: "Bank review", count: 21, pct: 51, color: "bg-[oklch(0.42_0.18_145)]" },
  { stage: "Sanctioned", count: 17, pct: 41, color: "bg-[oklch(0.42_0.18_145)]" },
  { stage: "Disbursed", count: 18, pct: 44, color: "bg-[oklch(0.42_0.18_145)]" },
  { stage: "Rejected", count: 4, pct: 10, color: "bg-destructive" },
];

const statusBadgeStyle = {
  info: "bg-primary/10 text-primary border-0",
  success: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0",
  warning: "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0",
  error: "bg-destructive/10 text-destructive border-0",
} as const;

export default function CollegeAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Loan uptake, fee collection, and bank performance insights for your institution.
        </p>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border shadow-none">
              <CardContent className="px-5 py-5">
                <p className="text-xs text-muted-foreground mb-2 leading-snug">{s.label}</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {s.positive
                    ? <TrendingUp className="w-3 h-3 text-[oklch(0.42_0.18_145)]" />
                    : <TrendingDown className="w-3 h-3 text-destructive" />
                  }
                  <p className="text-[11px] text-[oklch(0.42_0.18_145)]">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Loan uptake by program */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">Loan uptake by program</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-3">
                {LOAN_UPTAKE.map((p) => (
                  <div key={p.program} className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground font-medium">{p.program}</span>
                      <span className="text-xs font-bold text-primary">{p.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank scorecard */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">Bank scorecard</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-[10px] pl-5">Bank</TableHead>
                      <TableHead className="text-[10px]">Sanction %</TableHead>
                      <TableHead className="text-[10px]">Avg days</TableHead>
                      <TableHead className="text-[10px]">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BANK_SCORECARD.map((b) => (
                      <TableRow key={b.bank} className="border-border hover:bg-muted/30">
                        <TableCell className="pl-5 py-2.5 text-xs font-medium text-foreground">{b.bank}</TableCell>
                        <TableCell className={`py-2.5 text-xs font-semibold ${b.positive ? "text-[oklch(0.42_0.18_145)]" : "text-[oklch(0.55_0.18_80)]"}`}>
                          {b.sanction}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground">{b.days}</TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground">{b.rate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Fee collection intelligence */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">Fee collection intelligence</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-[10px] pl-5">Student</TableHead>
                      <TableHead className="text-[10px]">Program</TableHead>
                      <TableHead className="text-[10px]">Semester</TableHead>
                      <TableHead className="text-[10px]">Due</TableHead>
                      <TableHead className="text-[10px] hidden sm:table-cell">Source</TableHead>
                      <TableHead className="text-[10px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FEE_COLLECTION.map((f) => (
                      <TableRow key={f.name} className="border-border hover:bg-muted/30">
                        <TableCell className="pl-5 py-3 text-xs font-medium text-foreground">{f.name}</TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground">{f.program}</TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground">{f.sem}</TableCell>
                        <TableCell className="py-3 text-xs font-semibold text-foreground">{f.due}</TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground hidden sm:table-cell">{f.source}</TableCell>
                        <TableCell className="py-3">
                          <Badge className={`text-[9px] font-semibold ${statusBadgeStyle[f.statusType]}`}>
                            {f.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Loan application pipeline */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">Loan application pipeline</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-3">
                {PIPELINE.map((p) => (
                  <div key={p.stage} className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{p.stage}</span>
                      <span className="text-xs font-semibold text-foreground">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${p.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
