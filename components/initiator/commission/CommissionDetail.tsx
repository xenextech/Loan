"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import {
  useGetCommissionEntriesQuery,
  useCreateCommissionEntryMutation,
  useUpdateCommissionEntryMutation,
} from "@/lib/api/dashboardApi";
import type { CommissionEntryStatus } from "@/types/dashboard";

const STATUS_BADGE_CLASS: Record<CommissionEntryStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  INVOICE_DUE: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  PAID: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
};

/** Commission ledger entries for a single partner — `id` is a CommissionPartner id. */
export function CommissionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: entries, isLoading } = useGetCommissionEntriesQuery({ partnerId: id, page: 1, limit: 50 });
  const [createEntry, { isLoading: creating }] = useCreateCommissionEntryMutation();
  const [updateEntry] = useUpdateCommissionEntryMutation();

  const partnerName = entries?.data[0]?.partner.name;

  const handleAddEntry = async () => {
    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await createEntry({ partnerId: id, amount: amountValue, month: new Date(`${month}-01`).toISOString() }).unwrap();
      setAmount("");
      toast.success("Entry added.");
    } catch {
      toast.error("Failed to add entry");
    }
  };

  const handleMarkPaid = async (entryId: string) => {
    try {
      await updateEntry({ id: entryId, data: { status: "PAID" } }).unwrap();
    } catch {
      toast.error("Failed to update entry");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/commission")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Commission Entries</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{partnerName ?? "Partner"}</p>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Add Entry</h3>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Amount (NPR)" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9 text-sm" />
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 text-sm w-40" />
          <Button size="sm" className="gap-1.5 shrink-0" disabled={creating} onClick={handleAddEntry}>
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !entries?.data.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Inbox className="w-7 h-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No commission entries for this partner yet</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Month</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.data.map((entry) => (
              <TableRow key={entry.id} className="border-border">
                <TableCell className="text-xs text-muted-foreground">{formatDate(entry.month)}</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{formatNPR(entry.amount)}</TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_BADGE_CLASS[entry.status], "border-0 text-[10px] font-semibold")}>{entry.status.replaceAll("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {entry.status !== "PAID" && (
                    <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => handleMarkPaid(entry.id)}>
                      Mark Paid
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </motion.div>
  );
}
