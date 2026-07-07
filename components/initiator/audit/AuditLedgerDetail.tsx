"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useCreateManualAuditEntryMutation } from "@/lib/api/dashboardApi";
import type { AuditCategory } from "@/types/dashboard";

const CATEGORIES: AuditCategory[] = ["APPROVAL", "DISBURSEMENT", "REPAYMENT", "COMMISSION", "SYSTEM"];

/** Manual audit entry form. Not scoped to one loan — `id` in the route only
 *  drives the Back destination, matching the notification templates page's convention. */
export function AuditLedgerDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [category, setCategory] = useState<AuditCategory>("SYSTEM");
  const [applicationId, setApplicationId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [createEntry, { isLoading: creating }] = useCreateManualAuditEntryMutation();

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required");
      return;
    }
    try {
      await createEntry({
        action: "MANUAL_AUDIT_ENTRY",
        category,
        applicationId: applicationId || undefined,
        remarks: remarks.trim(),
      }).unwrap();
      toast.success("Manual audit entry recorded.");
      setApplicationId("");
      setRemarks("");
    } catch {
      toast.error("Failed to record entry");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/audit-ledger`)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Manual Audit Entry</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Record an out-of-band action for compliance purposes — e.g. a phone-verbal approval or an offline check.
        </p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={category} onValueChange={(v) => setCategory(v as AuditCategory)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Application ID (optional)" value={applicationId} onChange={(e) => setApplicationId(e.target.value)} className="h-9 text-sm" />
        </div>
        <Textarea placeholder="Describe the action taken…" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} className="text-sm" />
        <Button size="sm" className="gap-1.5" disabled={creating} onClick={handleSubmit}>
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Record Entry
        </Button>
      </div>
    </motion.div>
  );
}
