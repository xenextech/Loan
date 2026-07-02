"use client";

import { Plus, Trash2 } from "lucide-react";
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

export interface RepeatableTableColumn {
  key: string;
  header: string;
  className?: string;
  render: (index: number) => React.ReactNode;
}

interface RepeatableTableProps {
  columns: RepeatableTableColumn[];
  rowCount: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addLabel: string;
  emptyLabel: string;
  disabled?: boolean;
}

/** Generic add/remove row table driven by an RHF `useFieldArray` result from the caller. */
export function RepeatableTable({
  columns,
  rowCount,
  onAdd,
  onRemove,
  addLabel,
  emptyLabel,
  disabled,
}: RepeatableTableProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("text-xs font-semibold", col.className)}>
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowCount === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-8 text-center text-sm text-muted-foreground whitespace-normal">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              Array.from({ length: rowCount }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className="align-top py-2.5 whitespace-normal min-w-36">
                      {col.render(index)}
                    </TableCell>
                  ))}
                  <TableCell className="align-top py-2.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={disabled}
                      onClick={() => onRemove(index)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
