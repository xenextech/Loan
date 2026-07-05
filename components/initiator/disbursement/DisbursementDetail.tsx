"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import {
  useGetDashboardApplicationDetailQuery,
  useGetDisbursementConditionsQuery,
  useAddDisbursementConditionMutation,
  useUpdateDisbursementConditionMutation,
  useConfirmDisbursementMutation,
} from "@/lib/api/dashboardApi";

export function DisbursementDetail({ id }: { id: string }) {
  const router = useRouter();
  const [newConditionLabel, setNewConditionLabel] = useState("");
  const [trancheAmount, setTrancheAmount] = useState("");
  const [accountCredited, setAccountCredited] = useState("");

  const { data: application, isLoading: appLoading, error: appError } = useGetDashboardApplicationDetailQuery(id);
  const { data: conditions, isLoading: conditionsLoading } = useGetDisbursementConditionsQuery(id);
  const [addCondition, { isLoading: adding }] = useAddDisbursementConditionMutation();
  const [updateCondition, { isLoading: updating }] = useUpdateDisbursementConditionMutation();
  const [confirmDisbursement, { isLoading: confirming }] = useConfirmDisbursementMutation();

  const isLoading = appLoading || conditionsLoading;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
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
        <Button variant="outline" size="sm" onClick={() => router.push("/initiator/disbursment")}>
          Back to list
        </Button>
      </div>
    );
  }

  const amount = application.creditLimit ?? 0;
  const rows = conditions ?? [];
  const allDone = rows.length > 0 && rows.every((c) => c.status === "DONE");

  const handleAddCondition = async () => {
    if (!newConditionLabel.trim()) return;
    try {
      await addCondition({ applicationId: id, label: newConditionLabel.trim() }).unwrap();
      setNewConditionLabel("");
    } catch {
      toast.error("Failed to add condition");
    }
  };

  const toggleCondition = async (conditionId: string, done: boolean) => {
    try {
      await updateCondition({ applicationId: id, conditionId, status: done ? "DONE" : "PENDING" }).unwrap();
    } catch {
      toast.error("Failed to update condition");
    }
  };

  const handleConfirm = async () => {
    const amountValue = Number(trancheAmount);
    if (!amountValue || amountValue <= 0) {
      toast.error("Enter a valid tranche amount");
      return;
    }
    try {
      await confirmDisbursement({
        applicationId: id,
        data: { trancheNumber: 1, amount: amountValue, accountCredited: accountCredited || undefined },
      }).unwrap();
      toast.success(`Disbursement of ${formatNPR(amountValue)} confirmed for ${application.applicationNumber}.`);
      setTrancheAmount("");
      setAccountCredited("");
    } catch {
      toast.error("Failed to confirm disbursement");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/disbursment")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-bold text-foreground font-mono">{application.applicationNumber}</h2>
          <span className="text-sm text-muted-foreground truncate">— {application.fullName ?? "—"}</span>
        </div>
        <Badge variant="outline" className="text-xs font-medium">{formatNPR(amount)}</Badge>
      </div>

      {/* Conditions checklist */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Disbursement conditions</h3>
          <p className="text-xs text-muted-foreground">{rows.filter((c) => c.status === "DONE").length} / {rows.length} done</p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">No conditions added yet.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {rows.map((condition) => (
              <li key={condition.id} className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 text-left"
                  disabled={updating}
                  onClick={() => toggleCondition(condition.id, condition.status !== "DONE")}
                >
                  {condition.status === "DONE" ? (
                    <Check className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={cn("truncate", condition.status === "DONE" ? "text-foreground" : "text-muted-foreground")}>
                    {condition.label}
                  </span>
                </button>
                <Badge
                  className={cn(
                    condition.status === "DONE"
                      ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success"
                      : condition.status === "MISSING"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground",
                    "border-0 text-[10px] font-semibold shrink-0",
                  )}
                >
                  {condition.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a condition…"
            value={newConditionLabel}
            onChange={(e) => setNewConditionLabel(e.target.value)}
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddCondition()}
          />
          <Button size="sm" variant="outline" className="h-9 gap-1.5" disabled={adding || !newConditionLabel.trim()} onClick={handleAddCondition}>
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </Button>
        </div>
      </div>

      {/* Confirm disbursement */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Confirm disbursement tranche</h3>
        {!allDone && (
          <p className="text-xs text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)] mb-3">
            All conditions should be marked Done before disbursing — you can still record a tranche if needed.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Input
            type="number"
            placeholder="Tranche amount (NPR)"
            value={trancheAmount}
            onChange={(e) => setTrancheAmount(e.target.value)}
            className="h-9 text-sm"
          />
          <Input
            placeholder="Account credited (optional)"
            value={accountCredited}
            onChange={(e) => setAccountCredited(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <Button
          disabled={confirming || !trancheAmount}
          className="w-full gap-1.5 bg-[oklch(0.42_0.18_145)] hover:bg-[oklch(0.36_0.18_145)] text-white h-11 disabled:opacity-60"
          onClick={handleConfirm}
        >
          {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Confirm Disbursement
        </Button>
      </div>
    </motion.div>
  );
}
