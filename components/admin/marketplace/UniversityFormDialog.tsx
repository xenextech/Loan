"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save } from "lucide-react";
import {
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
} from "@/lib/api/marketplaceApi";
import type { MarketplaceUniversity } from "@/types/college-marketplace";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

interface UniversityFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: MarketplaceUniversity | null;
}

export function UniversityFormDialog({ open, onOpenChange, editing }: UniversityFormDialogProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset fields when the dialog transitions to open, adjusted during render
  // (React's recommended alternative to a reset effect) rather than in a
  // useEffect, so there's no extra render pass between "opened" and "populated".
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(editing?.name ?? "");
      setShortName(editing?.shortName ?? "");
      setIsActive(editing?.isActive ?? true);
    }
  }

  const [createUniversity, { isLoading: creating }] = useCreateUniversityMutation();
  const [updateUniversity, { isLoading: updating }] = useUpdateUniversityMutation();
  const isLoading = creating || updating;

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (editing) {
        await updateUniversity({
          id: editing.id,
          body: { name: name.trim(), shortName: shortName.trim() || undefined, isActive },
        }).unwrap();
        toast.success("University updated.");
      } else {
        await createUniversity({
          name: name.trim(),
          shortName: shortName.trim() || undefined,
        }).unwrap();
        toast.success("University created.");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit University" : "Add University"}</DialogTitle>
          <DialogDescription>
            Universities/boards are the affiliating body a college can optionally belong to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="university-name">Name</Label>
            <Input
              id="university-name"
              placeholder="e.g. Tribhuvan University"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="university-short-name">Short name (optional)</Label>
            <Input
              id="university-short-name"
              placeholder="e.g. TU"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          {editing && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <Label htmlFor="university-active" className="text-sm">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive universities are hidden from student-facing filters.
                </p>
              </div>
              <Switch id="university-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" disabled={isLoading || !name.trim()} onClick={handleSave}>
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : editing ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {editing ? "Save Changes" : "Create University"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
