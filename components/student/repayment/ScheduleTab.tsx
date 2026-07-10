"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatNPR, formatDate } from "@/lib/formatters";
import type { RepaymentScheduleEntry } from "@/types/api";
import { EMI_STATUS_BADGE_CLASS, EMI_STATUS_LABEL } from "./repaymentBadges";
import { ChevronLeft, ChevronRight, CalendarX2 } from "lucide-react";

const PAGE_SIZE = 12;

export function ScheduleTab({ schedule }: { schedule: RepaymentScheduleEntry[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(schedule.length / PAGE_SIZE));
  const rows = useMemo(
    () => schedule.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [schedule, page],
  );

  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <CalendarX2 className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Repayment schedule not generated</p>
        <p className="text-xs text-muted-foreground max-w-xs text-center">
          Your EMI schedule will appear here once the Credit Manager finalizes your loan terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">#</TableHead>
              <TableHead className="text-xs">Due Date</TableHead>
              <TableHead className="text-xs">EMI Amount</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Principal</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Interest</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Outstanding Balance</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((entry) => (
              <TableRow key={entry.installmentNumber} className="border-border">
                <TableCell className="text-xs text-muted-foreground">{entry.installmentNumber}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(entry.dueDate)}</TableCell>
                <TableCell className="text-xs font-semibold text-foreground">{formatNPR(entry.emiAmount)}</TableCell>
                <TableCell className="text-xs text-foreground hidden sm:table-cell">{formatNPR(entry.principalComponent)}</TableCell>
                <TableCell className="text-xs text-foreground hidden sm:table-cell">{formatNPR(entry.interestComponent)}</TableCell>
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{formatNPR(entry.outstandingBalance)}</TableCell>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-3 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
