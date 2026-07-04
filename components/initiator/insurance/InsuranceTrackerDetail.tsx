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
import { useInsuranceTrackerDetail } from "./useInsuranceTrackerDetail";
import type { PolicyStatusTone } from "./types";

const TONE_BADGE_CLASS: Record<PolicyStatusTone, string> = {
  success: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  warning: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  destructive: "bg-destructive/10 text-destructive",
};

/** Insurance Tracker is a portfolio-wide view, not scoped to one loan — `id` only drives the Back destination. */
export function InsuranceTrackerDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const { data } = useInsuranceTrackerDetail();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/insurance-checker")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Insurance Tracker</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Collateral & Loan Cover</p>
      </div>

      {/* Portfolio stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Active policies</p>
          <p className="text-2xl font-bold text-foreground">{data.activePoliciesCount}</p>
          <p className="text-xs text-[oklch(0.42_0.18_145)] dark:text-success mt-0.5">{data.activePoliciesSubLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Expiring in 30 days</p>
          <p className="text-2xl font-bold text-foreground">{data.expiring30DaysCount}</p>
          <p className="text-xs text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] mt-0.5">{data.expiring30DaysSubLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Expired / lapsed</p>
          <p className="text-2xl font-bold text-destructive">{data.expiredLapsedCount}</p>
          <p className="text-xs text-destructive mt-0.5">{data.expiredLapsedSubLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Sum insured vs loans</p>
          <p className="text-2xl font-bold text-foreground">{data.sumInsuredVsLoansLabel}</p>
          <p className="text-xs text-[oklch(0.42_0.18_145)] dark:text-success mt-0.5">{data.sumInsuredVsLoansSubLabel}</p>
        </div>
      </div>

      {/* Insurance tracker table */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Insurance tracker</h3>
          <div className="flex items-center gap-4">
            <button type="button" className="text-xs font-medium text-primary hover:underline">
              Add policy
            </button>
            <button type="button" className="text-xs font-medium text-primary hover:underline">
              Export
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 mb-4">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary">{data.nrbRequirementNote}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Borrower / Loan ref</TableHead>
              <TableHead className="text-xs">Insurance type</TableHead>
              <TableHead className="text-xs">Policy no.</TableHead>
              <TableHead className="text-xs">Sum insured</TableHead>
              <TableHead className="text-xs">Expiry / Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.policies.map((policy) => (
              <TableRow key={policy.id} className="border-border">
                <TableCell>
                  <p className="text-sm font-semibold text-foreground leading-tight">{policy.borrowerName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{policy.loanRef}</p>
                </TableCell>
                <TableCell className="text-xs text-foreground">{policy.insuranceType}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{policy.policyNo}</TableCell>
                <TableCell className={cn("text-xs font-semibold", policy.sumInsuredMissing ? "text-destructive" : "text-foreground")}>
                  {policy.sumInsuredLabel}
                </TableCell>
                <TableCell>
                  <Badge className={cn(TONE_BADGE_CLASS[policy.tone], "border-0 text-[10px] font-semibold")}>{policy.expiryStatusLabel}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
