"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inbox, ShieldCheck, ShieldAlert, ShieldX, Percent, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import { useGetInsuranceStatsQuery, useGetInsurancePoliciesQuery, useCreateInsurancePolicyMutation } from "@/lib/api/dashboardApi";
import type { InsurancePolicyStatus } from "@/types/dashboard";

const STATUS_BADGE_CLASS: Record<InsurancePolicyStatus, string> = {
  ACTIVE: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  EXPIRING_SOON: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  EXPIRED: "bg-destructive/10 text-destructive",
};

function StatCard({ icon: Icon, label, value, iconBg }: { icon: React.ElementType; label: string; value: string | number; iconBg: string }) {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="px-5 py-5">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export function InsuranceCheckerList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ applicationId: "", policyNumber: "", insurer: "", sumInsured: "", expiryDate: "" });

  const { data: stats, isLoading: statsLoading } = useGetInsuranceStatsQuery();
  const { data: policies, isLoading: policiesLoading } = useGetInsurancePoliciesQuery({ page, limit: 20 });
  const [createPolicy, { isLoading: creating }] = useCreateInsurancePolicyMutation();

  const rows = policies?.data ?? [];

  const handleCreate = async () => {
    if (!form.applicationId || !form.policyNumber || !form.insurer || !form.sumInsured || !form.expiryDate) {
      toast.error("All fields except premium are required");
      return;
    }
    try {
      await createPolicy({
        applicationId: form.applicationId,
        policyNumber: form.policyNumber,
        insurer: form.insurer,
        sumInsured: Number(form.sumInsured),
        expiryDate: new Date(form.expiryDate).toISOString(),
      }).unwrap();
      toast.success("Policy added.");
      setForm({ applicationId: "", policyNumber: "", insurer: "", sumInsured: "", expiryDate: "" });
      setShowAdd(false);
    } catch {
      toast.error("Failed to add policy — check the application ID is valid.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Policy attachment and expiry tracking across the loan book.</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="w-4 h-4" /> Add Policy
        </Button>
      </motion.div>

      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShieldCheck} label="Active Policies" value={stats?.activeCount ?? 0} iconBg="bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)]" />
          <StatCard icon={ShieldAlert} label="Expiring in 30 Days" value={stats?.expiringIn30DaysCount ?? 0} iconBg="bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)]" />
          <StatCard icon={ShieldX} label="Expired" value={stats?.expiredCount ?? 0} iconBg="bg-destructive/10 text-destructive" />
          <StatCard icon={Percent} label="Sum Insured / Loan Book" value={stats?.sumInsuredToLoanRatio !== null && stats?.sumInsuredToLoanRatio !== undefined ? `${stats.sumInsuredToLoanRatio}%` : "—"} iconBg="bg-primary/10 text-primary" />
        </div>
      )}

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="border-border shadow-none">
            <CardContent className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Input placeholder="Application ID" value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))} className="h-9 text-sm" />
                <Input placeholder="Policy Number" value={form.policyNumber} onChange={(e) => setForm((f) => ({ ...f, policyNumber: e.target.value }))} className="h-9 text-sm" />
                <Input placeholder="Insurer" value={form.insurer} onChange={(e) => setForm((f) => ({ ...f, insurer: e.target.value }))} className="h-9 text-sm" />
                <Input type="number" placeholder="Sum Insured (NPR)" value={form.sumInsured} onChange={(e) => setForm((f) => ({ ...f, sumInsured: e.target.value }))} className="h-9 text-sm" />
                <Input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} className="h-9 text-sm" />
              </div>
              <Button size="sm" className="gap-1.5" disabled={creating} onClick={handleCreate}>
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Save Policy
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <CardTitle className="text-sm font-semibold text-foreground">Policies</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {policiesLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No insurance policies recorded</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Borrower</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Policy No.</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Insurer</TableHead>
                      <TableHead className="text-xs">Sum Insured</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Expiry</TableHead>
                      <TableHead className="text-xs text-right pr-5">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((policy) => (
                      <TableRow
                        key={policy.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                        onClick={() => router.push(`/initiator/insurance-checker/${policy.id}`)}
                      >
                        <TableCell className="pl-5 py-3.5">
                          <p className="text-sm font-semibold text-foreground leading-tight">{policy.application.fullName ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{policy.application.applicationNumber}</p>
                        </TableCell>
                        <TableCell className="py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-foreground">{policy.policyNumber}</span>
                        </TableCell>
                        <TableCell className="py-3.5 hidden md:table-cell">
                          <span className="text-xs text-foreground">{policy.insurer}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className="text-xs font-semibold text-foreground">{formatNPR(policy.sumInsured)}</span>
                        </TableCell>
                        <TableCell className="py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{formatDate(policy.expiryDate)}</span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-5">
                          <Badge className={cn(STATUS_BADGE_CLASS[policy.status], "border-0 text-[10px] font-semibold")}>
                            {policy.status.replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {policies && policies.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Page {policies.meta.page} of {policies.meta.totalPages}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!policies.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!policies.meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
