import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/formatters";
import type { RepaymentScheduleEntry } from "@/types/api";
import { EMI_STATUS_BADGE_CLASS, EMI_STATUS_LABEL } from "./repaymentBadges";
import { Receipt } from "lucide-react";

// There is no dedicated payment-history API yet — settled installments
// (PAID/PARTIAL) are derived from the same schedule already fetched for the
// EMI Schedule tab, which is the closest available proxy. Payment Date,
// Receipt Number, and Payment Method aren't tracked fields in the current
// system, so those columns show "—" rather than fabricated values.
export function PaymentHistoryTab({ schedule }: { schedule: RepaymentScheduleEntry[] }) {
  const paid = schedule.filter((e) => e.status === "PAID" || e.status === "PARTIAL");

  if (paid.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Receipt className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No payment history</p>
        <p className="text-xs text-muted-foreground max-w-xs text-center">
          Payments you make against your EMI schedule will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Showing settled installments. Payment date, receipt number, and payment method aren&apos;t tracked yet.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Payment Date</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Receipt Number</TableHead>
              <TableHead className="text-xs">Amount Paid</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Payment Method</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paid.map((entry) => (
              <TableRow key={entry.installmentNumber} className="border-border">
                <TableCell className="text-xs text-muted-foreground">—</TableCell>
                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">—</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{formatNPR(entry.emiAmount)}</TableCell>
                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">—</TableCell>
                <TableCell>
                  <Badge className={cn(EMI_STATUS_BADGE_CLASS[entry.status], "border-0 text-[10px] font-semibold")}>
                    {EMI_STATUS_LABEL[entry.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
