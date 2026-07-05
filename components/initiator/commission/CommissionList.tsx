"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Percent, Landmark, GraduationCap, Wallet, Inbox, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import {
  useGetCommissionSummaryQuery,
  useGetCommissionByBankQuery,
  useGetCommissionByCollegeQuery,
  useGetNrbCapComplianceQuery,
  useCreateCommissionPartnerMutation,
} from "@/lib/api/dashboardApi";
import type { CommissionPartnerType, CommissionRateType } from "@/types/dashboard";

type Tab = "banks" | "colleges" | "nrb-cap";

function StatCard({ icon: Icon, label, value, iconBg }: { icon: React.ElementType; label: string; value: string; iconBg: string }) {
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

export function CommissionList() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("banks");
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [form, setForm] = useState({ partnerType: "BANK" as CommissionPartnerType, name: "", rateType: "PERCENTAGE" as CommissionRateType, rateValue: "", mouReference: "" });

  const { data: summary, isLoading: summaryLoading } = useGetCommissionSummaryQuery();
  const { data: banks, isLoading: banksLoading } = useGetCommissionByBankQuery({ page: 1, limit: 50 });
  const { data: colleges, isLoading: collegesLoading } = useGetCommissionByCollegeQuery({ page: 1, limit: 50 });
  const { data: nrbCap, isLoading: nrbCapLoading } = useGetNrbCapComplianceQuery({ page: 1, limit: 50 });
  const [createPartner, { isLoading: creating }] = useCreateCommissionPartnerMutation();

  const handleCreatePartner = async () => {
    if (!form.name.trim() || !form.rateValue) {
      toast.error("Name and rate value are required");
      return;
    }
    try {
      await createPartner({
        partnerType: form.partnerType,
        name: form.name.trim(),
        rateType: form.rateType,
        rateValue: Number(form.rateValue),
        mouReference: form.mouReference || undefined,
      }).unwrap();
      toast.success("Partner created.");
      setForm({ partnerType: "BANK", name: "", rateType: "PERCENTAGE", rateValue: "", mouReference: "" });
      setShowAddPartner(false);
    } catch {
      toast.error("Failed to create partner");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commission Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Partner MOU rates and the commission earnings ledger.</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => setShowAddPartner((s) => !s)}>
          <Plus className="w-4 h-4" /> Add Partner
        </Button>
      </motion.div>

      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Wallet} label="Total Earned (YTD)" value={formatNPR(summary?.totalEarned ?? 0)} iconBg="bg-primary/10 text-primary" />
          <StatCard icon={Landmark} label="From Banks" value={formatNPR(summary?.fromBanks ?? 0)} iconBg="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)]" />
          <StatCard icon={GraduationCap} label="From Colleges" value={formatNPR(summary?.fromColleges ?? 0)} iconBg="bg-primary/8 text-primary" />
          <StatCard icon={Percent} label="Pending Payment" value={formatNPR(summary?.pendingPayment ?? 0)} iconBg="bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)]" />
        </div>
      )}

      {showAddPartner && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="border-border shadow-none">
            <CardContent className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Select value={form.partnerType} onValueChange={(v) => setForm((f) => ({ ...f, partnerType: v as CommissionPartnerType }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="COLLEGE">College</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Partner name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-9 text-sm sm:col-span-2" />
                <Select value={form.rateType} onValueChange={(v) => setForm((f) => ({ ...f, rateType: v as CommissionRateType }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FLAT">Flat</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Rate value" value={form.rateValue} onChange={(e) => setForm((f) => ({ ...f, rateValue: e.target.value }))} className="h-9 text-sm" />
              </div>
              <Input placeholder="MOU reference (optional)" value={form.mouReference} onChange={(e) => setForm((f) => ({ ...f, mouReference: e.target.value }))} className="h-9 text-sm max-w-sm" />
              <Button size="sm" className="gap-1.5" disabled={creating} onClick={handleCreatePartner}>
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Save Partner
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              {([
                { key: "banks", label: "By Bank" },
                { key: "colleges", label: "By College" },
                { key: "nrb-cap", label: "NRB Cap Compliance" },
              ] as { key: Tab; label: string }[]).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                    tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {tab === "banks" && (
              banksLoading ? <Skeleton className="h-40 m-5 rounded" /> : !banks?.data.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2"><Inbox className="w-7 h-7 text-muted-foreground" /><p className="text-sm text-muted-foreground">No bank partners yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Bank</TableHead>
                      <TableHead className="text-xs">Rate</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">MOU Ref</TableHead>
                      <TableHead className="text-xs">Loans</TableHead>
                      <TableHead className="text-xs text-right pr-5">Total Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banks.data.map((row) => (
                      <TableRow key={row.id} className="cursor-pointer hover:bg-muted/40 border-border" onClick={() => router.push(`/initiator/commission/${row.id}`)}>
                        <TableCell className="pl-5 py-3.5 text-sm font-semibold text-foreground">{row.name}</TableCell>
                        <TableCell className="py-3.5 text-xs text-foreground">{row.rateValue}{row.rateType === "PERCENTAGE" ? "%" : ""}</TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground hidden sm:table-cell">{row.mouReference ?? "—"}</TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground">{row.loans}</TableCell>
                        <TableCell className="py-3.5 text-right pr-5 text-xs font-semibold text-foreground">{formatNPR(row.totalEarned)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}

            {tab === "colleges" && (
              collegesLoading ? <Skeleton className="h-40 m-5 rounded" /> : !colleges?.data.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2"><Inbox className="w-7 h-7 text-muted-foreground" /><p className="text-sm text-muted-foreground">No college partners yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">College</TableHead>
                      <TableHead className="text-xs">Rate</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">MOU Ref</TableHead>
                      <TableHead className="text-xs">Loans</TableHead>
                      <TableHead className="text-xs text-right pr-5">Total Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colleges.data.map((row) => (
                      <TableRow key={row.id} className="cursor-pointer hover:bg-muted/40 border-border" onClick={() => router.push(`/initiator/commission/${row.id}`)}>
                        <TableCell className="pl-5 py-3.5 text-sm font-semibold text-foreground">{row.name}</TableCell>
                        <TableCell className="py-3.5 text-xs text-foreground">{row.rateValue}{row.rateType === "PERCENTAGE" ? "%" : ""}</TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground hidden sm:table-cell">{row.mouReference ?? "—"}</TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground">{row.loans}</TableCell>
                        <TableCell className="py-3.5 text-right pr-5 text-xs font-semibold text-foreground">{formatNPR(row.totalEarned)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}

            {tab === "nrb-cap" && (
              nrbCapLoading ? <Skeleton className="h-40 m-5 rounded" /> : !nrbCap?.data.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2"><Inbox className="w-7 h-7 text-muted-foreground" /><p className="text-sm text-muted-foreground">No applications with a credit limit set yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Borrower</TableHead>
                      <TableHead className="text-xs">Credit Limit</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">NRB Cap</TableHead>
                      <TableHead className="text-xs">Utilization</TableHead>
                      <TableHead className="text-xs text-right pr-5">Compliant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nrbCap.data.map((row) => (
                      <TableRow key={row.applicationId} className="border-border">
                        <TableCell className="pl-5 py-3.5">
                          <p className="text-sm font-semibold text-foreground leading-tight">{row.borrower ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{row.refNo}</p>
                        </TableCell>
                        <TableCell className="py-3.5 text-xs text-foreground">{formatNPR(row.creditLimit)}</TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground hidden sm:table-cell">{formatNPR(row.nrbCapAmount)}</TableCell>
                        <TableCell className="py-3.5 text-xs text-foreground">{row.utilizationPercent}%</TableCell>
                        <TableCell className="py-3.5 text-right pr-5">
                          <Badge className={cn(row.compliant ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success" : "bg-destructive/10 text-destructive", "border-0 text-[10px] font-semibold")}>
                            {row.compliant ? "Compliant" : "Exceeds Cap"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
