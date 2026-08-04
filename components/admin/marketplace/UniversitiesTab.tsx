"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Landmark, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetUniversitiesQuery,
  useDeleteUniversityMutation,
  useUpdateUniversityMutation,
} from "@/lib/api/marketplaceApi";
import type { MarketplaceUniversity } from "@/types/college-marketplace";
import { UniversityFormDialog } from "./UniversityFormDialog";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

export function UniversitiesTab() {
  const { data: universities, isLoading } = useGetUniversitiesQuery({ includeInactive: true });
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceUniversity | null>(null);
  const [toDeactivate, setToDeactivate] = useState<MarketplaceUniversity | null>(null);

  const [deleteUniversity, { isLoading: deactivating }] = useDeleteUniversityMutation();
  const [updateUniversity, { isLoading: reactivating }] = useUpdateUniversityMutation();

  const filtered = (universities ?? []).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (u: MarketplaceUniversity) => {
    setEditing(u);
    setFormOpen(true);
  };

  const handleReactivate = async (u: MarketplaceUniversity) => {
    try {
      await updateUniversity({ id: u.id, body: { isActive: true } }).unwrap();
      toast.success("University reactivated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!toDeactivate) return;
    try {
      await deleteUniversity(toDeactivate.id).unwrap();
      toast.success("University deactivated.");
      setToDeactivate(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search universities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" />
          Add University
        </Button>
      </div>

      <UniversityFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <AlertDialog open={!!toDeactivate} onOpenChange={(v) => !v && setToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {toDeactivate?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden from student-facing filters and the college form&apos;s university
              picker. Colleges already linked to it are unaffected — you can reactivate it any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deactivating}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeactivate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-border shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Landmark className="w-7 h-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No universities found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs pl-5">Name</TableHead>
                  <TableHead className="text-xs">Short Name</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="border-border">
                    <TableCell className="pl-5 py-3 text-sm font-semibold text-foreground">{u.name}</TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">{u.shortName ?? "—"}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          u.isActive
                            ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success"
                            : "bg-muted text-muted-foreground",
                          "border-0 text-[10px] font-semibold",
                        )}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)} aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {u.isActive ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setToDeactivate(u)}
                            aria-label="Deactivate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={reactivating}
                            onClick={() => handleReactivate(u)}
                            aria-label="Reactivate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
