"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, FileText, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetEmiScheduleQuery,
  useGenerateEmiScheduleMutation,
  useMarkEmiPaidMutation,
  useGetEmiNotificationTriggersQuery,
} from "@/lib/api/dashboardApi";
import type { EmiStatus } from "@/types/dashboard";
import { NRB_CLASS_LABEL, NRB_CLASS_BADGE_CLASS } from "./nrbClassificationBadge";

export const STATUS_BADGE_CLASS: Record<EmiStatus, string> = {
  UPCOMING: "bg-muted text-muted-foreground",
  PAID: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  OVERDUE: "bg-destructive/10 text-destructive",
  PARTIAL: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
};

export function EmiScheduleDetail({ id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState("");

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: schedule, isLoading: scheduleLoading } = useGetEmiScheduleQuery({ applicationId: id, page: 1, limit: 100 });
  const { data: triggers } = useGetEmiNotificationTriggersQuery();
  const [generateSchedule, { isLoading: generating }] = useGenerateEmiScheduleMutation();
  const [markPaid, { isLoading: marking }] = useMarkEmiPaidMutation();

  if (appLoading || scheduleLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-52 rounded-lg" />
      </div>
    );
  }

  if (!application) {
    const status = appError && "status" in appError ? appError.status : undefined;
    const message = status === 404 ? "Application not found." : "Couldn't load this application. Please try again.";
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/emi-schedule`)}>
          Back to list
        </Button>
      </div>
    );
  }

  const rows = schedule?.data ?? [];

  const handleGenerate = async () => {
    try {
      await generateSchedule(id).unwrap();
      toast.success("EMI schedule generated.");
    } catch (err) {
      const message = err && typeof err === "object" && "data" in err ? (err.data as { message?: string })?.message : undefined;
      toast.error("Failed to generate schedule", { description: message ?? "Check that credit limit, interest rate, and period are set." });
    }
  };

  const handleMarkPaid = async (entryId: string) => {
    const amount = Number(paidAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid paid amount");
      return;
    }
    try {
      await markPaid({ entryId, applicationId: id, data: { paidAmount: amount, paidDate: new Date().toISOString() } }).unwrap();
      setPayingEntryId(null);
      setPaidAmount("");
      toast.success("Payment recorded.");
    } catch {
      toast.error("Failed to record payment");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/emi-schedule`)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-foreground font-mono">{application.applicationNumber}</h2>
          <span className="text-sm text-muted-foreground truncate">— {application.fullName ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            className={cn(NRB_CLASS_BADGE_CLASS[application.nrbClassification ?? "PASS"], "border-0 font-semibold text-xs")}
            title="NRB loan classification — recomputed daily from the oldest unpaid installment's days-overdue."
          >
            {NRB_CLASS_LABEL[application.nrbClassification ?? "PASS"]}
          </Badge>
          <Badge variant="outline" className="text-xs font-medium">{formatNPR(application.creditLimit ?? 0)}</Badge>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-bold text-foreground">Amortization schedule</h3>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={generating} onClick={handleGenerate}>
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {rows.length > 0 ? "Regenerate Schedule" : "Generate Schedule"}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No schedule yet — generate one once the application has a credit limit, interest rate, and period set.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Principal</TableHead>
                <TableHead className="text-xs">Interest</TableHead>
                <TableHead className="text-xs">EMI</TableHead>
                <TableHead className="text-xs">Balance</TableHead>
                <TableHead className="text-xs">Penal Interest</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow key={entry.id} className="border-border">
                  <TableCell className="text-xs text-muted-foreground">{entry.installmentNumber}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(entry.dueDate)}</TableCell>
                  <TableCell className="text-xs text-foreground">{formatNPR(entry.principalComponent)}</TableCell>
                  <TableCell className="text-xs text-foreground">{formatNPR(entry.interestComponent)}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{formatNPR(entry.emiAmount)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatNPR(entry.outstandingPrincipal)}</TableCell>
                  <TableCell className="text-xs font-semibold text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]">
                    {entry.penalInterestAccrued > 0 ? formatNPR(entry.penalInterestAccrued) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(STATUS_BADGE_CLASS[entry.status], "border-0 text-[10px] font-semibold")}>{entry.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.status === "PAID" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : payingEntryId === entry.id ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          className="h-7 w-24 text-xs"
                        />
                        <Button size="sm" className="h-7 text-xs" disabled={marking} onClick={() => handleMarkPaid(entry.id)}>
                          {marking ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => { setPayingEntryId(entry.id); setPaidAmount(String(entry.emiAmount)); }}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {triggers && triggers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">EMI notification triggers</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {triggers.map((t) => (
              <li key={t.trigger} className="flex items-center justify-between gap-3 text-xs px-3 py-2 rounded-lg bg-muted/40">
                <span className="font-medium text-foreground">{t.trigger}</span>
                <span className="text-muted-foreground">{t.messageType}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
