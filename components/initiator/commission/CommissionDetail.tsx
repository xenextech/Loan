"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommissionDetail } from "./useCommissionDetail";
import type { CapExposureTone, CommissionStatus } from "./types";

const STATUS_BADGE_CLASS: Record<CommissionStatus, string> = {
  Active: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  Credited: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  "Invoice due": "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Pending: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Onboarding: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
};

const CAP_BAR_CLASS: Record<CapExposureTone, string> = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  destructive: "bg-destructive",
};

const CAP_LABEL_CLASS: Record<CapExposureTone, string> = {
  success: "text-[oklch(0.42_0.18_145)] dark:text-success",
  warning: "text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  destructive: "text-destructive",
};

function InfoBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 mb-4">
      <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
      <p className="text-xs text-primary">{text}</p>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-1 py-2.5 border-t border-border">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

/** Commission dashboard is portfolio-wide, not scoped to one loan — `id` only drives the Back destination. */
export function CommissionDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const { data } = useCommissionDetail();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/commission")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Commission Management</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Bank & College Commission</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total earned (FY)</p>
          <p className="text-2xl font-bold text-foreground">{data.totalEarnedFYLabel}</p>
          <p className="text-xs text-[oklch(0.42_0.18_145)] dark:text-success mt-0.5">{data.totalEarnedFYSubLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">From banks</p>
          <p className="text-2xl font-bold text-foreground">{data.fromBanksLabel}</p>
          <p className="text-xs text-[oklch(0.42_0.18_145)] dark:text-success mt-0.5">{data.fromBanksSubLabel}</p>
        </div>
      </div>

      {/* Commission from banks */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Commission from banks</h3>
          <p className="text-xs text-muted-foreground">NRB digital lending cap: Rs 10L per loan</p>
        </div>

        <InfoBanner text={data.nrbReferenceNote} />

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Bank</TableHead>
              <TableHead className="text-xs">MOU type</TableHead>
              <TableHead className="text-xs">Rate</TableHead>
              <TableHead className="text-xs">Loans (FY)</TableHead>
              <TableHead className="text-xs">Total earned</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.bankCommissions.map((row) => (
              <TableRow key={row.bank} className="border-border">
                <TableCell className="text-sm font-semibold text-foreground">{row.bank}</TableCell>
                <TableCell className="text-xs text-foreground">{row.mouType}</TableCell>
                <TableCell className="text-xs text-foreground">{row.rate}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.loansFY}</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{row.totalEarnedLabel}</TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_BADGE_CLASS[row.status], "border-0 text-[10px] font-semibold")}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TotalRow label="Total from banks (FY 2081-82):" value={data.totalFromBanksLabel} />
      </div>

      {/* Follow-up commission */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1.5">Follow-up commission — repayment tracking</h3>
        <p className="text-xs text-muted-foreground mb-3">{data.followUpNote}</p>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Loan ref</TableHead>
              <TableHead className="text-xs">EMI no.</TableHead>
              <TableHead className="text-xs">EMI paid</TableHead>
              <TableHead className="text-xs">Follow-up comm.</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.followUpCommissions.map((row) => (
              <TableRow key={row.loanRef} className="border-border">
                <TableCell className="text-xs font-mono font-semibold text-foreground">{row.loanRef}</TableCell>
                <TableCell className="text-xs text-foreground">{row.emiNo}</TableCell>
                <TableCell className="text-xs text-foreground">{row.emiPaidLabel}</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{row.followUpCommLabel}</TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_BADGE_CLASS[row.status], "border-0 text-[10px] font-semibold")}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Colleges stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">From colleges</p>
          <p className="text-2xl font-bold text-foreground">{data.fromCollegesLabel}</p>
          <p className="text-xs text-[oklch(0.42_0.18_145)] dark:text-success mt-0.5">{data.fromCollegesSubLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Pending payment</p>
          <p className="text-2xl font-bold text-foreground">{data.pendingPaymentLabel}</p>
          <p className="text-xs text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] mt-0.5">{data.pendingPaymentSubLabel}</p>
        </div>
      </div>

      {/* Commission from colleges */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Commission from colleges</h3>
          <p className="text-xs text-muted-foreground">SaaS + per-document</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">College</TableHead>
              <TableHead className="text-xs">Model</TableHead>
              <TableHead className="text-xs">Rate</TableHead>
              <TableHead className="text-xs">This month</TableHead>
              <TableHead className="text-xs">FY total</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.collegeCommissions.map((row) => (
              <TableRow key={row.college} className="border-border">
                <TableCell className="text-sm font-semibold text-foreground">{row.college}</TableCell>
                <TableCell className="text-xs text-foreground">{row.model}</TableCell>
                <TableCell className="text-xs text-foreground">{row.rate}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.thisMonthLabel}</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{row.fyTotalLabel}</TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_BADGE_CLASS[row.status], "border-0 text-[10px] font-semibold")}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TotalRow label="Total from colleges (FY 2081-82):" value={data.totalFromCollegesLabel} />
      </div>

      {/* NRB cap compliance */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1.5">NRB cap compliance</h3>
        <p className="text-xs text-muted-foreground mb-4">{data.nrbCapNote}</p>
        <div className="space-y-4">
          {data.nrbCapExposure.map((row) => (
            <div
              key={row.borrowerLabel}
              className={cn("space-y-1.5", row.tone === "destructive" && "rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3")}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className={cn("text-sm font-semibold", row.tone === "destructive" ? "text-destructive" : "text-foreground")}>
                  {row.borrowerLabel}
                </p>
                <p className={cn("text-xs font-semibold shrink-0", CAP_LABEL_CLASS[row.tone])}>{row.exposureLabel}</p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full", CAP_BAR_CLASS[row.tone])}
                  style={{ width: `${Math.min(100, row.percentUsed)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
