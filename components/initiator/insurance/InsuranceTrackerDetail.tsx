"use client";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import { useGetInsurancePolicyDetailQuery } from "@/lib/api/dashboardApi";
import type { InsurancePolicyStatus } from "@/types/dashboard";

const STATUS_BADGE_CLASS: Record<InsurancePolicyStatus, string> = {
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  EXPIRING_SOON: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  EXPIRED: "bg-destructive/10 text-destructive",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="font-medium text-foreground truncate">{value ?? "—"}</span>
    </div>
  );
}

export function InsuranceTrackerDetail({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const { data: policy, isLoading, error } = useGetInsurancePolicyDetailQuery(id);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-5">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!policy) {
    const status = error && "status" in error ? error.status : undefined;
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{status === 404 ? "Insurance policy not found." : "Couldn't load this policy."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/insurance-checker`)}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/insurance-checker`)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-foreground">{policy.application.fullName ?? "—"}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{policy.application.applicationNumber}</p>
        </div>
        <Badge className={cn(STATUS_BADGE_CLASS[policy.status], "border-0 text-xs font-semibold")}>{policy.status.replaceAll("_", " ")}</Badge>
      </div>

      <div className="rounded-xl border border-border p-5 space-y-2.5">
        <Row label="Policy Number" value={policy.policyNumber} />
        <Row label="Insurer" value={policy.insurer} />
        <Row label="Policy Type" value={policy.policyType} />
        <Row label="Sum Insured" value={formatNPR(policy.sumInsured)} />
        <Row label="Premium" value={policy.premiumAmount !== null ? formatNPR(policy.premiumAmount) : undefined} />
        <Row label="Start Date" value={policy.startDate ? formatDate(policy.startDate) : undefined} />
        <Row label="Expiry Date" value={formatDate(policy.expiryDate)} />
      </div>
    </motion.div>
  );
}
