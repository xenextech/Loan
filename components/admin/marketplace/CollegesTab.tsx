"use client";
import { useState } from "react";
import Image from "next/image";
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
import { GraduationCap, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetCollegesQuery,
  useDeleteCollegeMutation,
  useUpdateCollegeMutation,
} from "@/lib/api/marketplaceApi";
import type { MarketplaceCollege } from "@/types/college-marketplace";
import { CollegeFormDialog } from "./CollegeFormDialog";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

export function CollegesTab() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetCollegesQuery({
    search: search || undefined,
    includeInactive: true,
    limit: 100,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceCollege | null>(null);
  const [toDeactivate, setToDeactivate] = useState<MarketplaceCollege | null>(null);

  const [deleteCollege, { isLoading: deactivating }] = useDeleteCollegeMutation();
  const [updateCollege, { isLoading: reactivating }] = useUpdateCollegeMutation();

  const colleges = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: MarketplaceCollege) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleReactivate = async (c: MarketplaceCollege) => {
    try {
      await updateCollege({ id: c.id, body: { isActive: true } }).unwrap();
      toast.success("College reactivated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!toDeactivate) return;
    try {
      await deleteCollege(toDeactivate.id).unwrap();
      toast.success("College deactivated.");
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
            placeholder="Search colleges…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" />
          Add College
        </Button>
      </div>

      <CollegeFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <AlertDialog open={!!toDeactivate} onOpenChange={(v) => !v && setToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {toDeactivate?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will disappear from the student-facing marketplace immediately. Its courses stay
              linked and existing loan applications referencing it are unaffected. You can
              reactivate it any time.
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
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <GraduationCap className="w-7 h-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No colleges found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs pl-5 w-14"></TableHead>
                  <TableHead className="text-xs">College</TableHead>
                  <TableHead className="text-xs">University</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Courses</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleges.map((c) => (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="pl-5 py-3">
                      {c.logoUrl ? (
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0">
                          <Image src={c.logoUrl} alt="" fill className="object-cover" sizes="36px" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-sm font-semibold text-foreground leading-tight">{c.name}</p>
                      {c.isFeatured && (
                        <Badge variant="secondary" className="mt-1 text-[9px]">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {c.university?.name ?? "—"}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {[c.district, c.province].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-foreground">{c.courseCount}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          c.isActive
                            ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success"
                            : "bg-muted text-muted-foreground",
                          "border-0 text-[10px] font-semibold",
                        )}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)} aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {c.isActive ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setToDeactivate(c)}
                            aria-label="Deactivate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={reactivating}
                            onClick={() => handleReactivate(c)}
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
