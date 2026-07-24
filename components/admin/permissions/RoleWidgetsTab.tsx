"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, LayoutGrid } from "lucide-react";
import { useGetRoleWidgetsQuery, useSetRoleWidgetsMutation } from "@/lib/api/permissionsApi";
import type { RoleWidgetStateRow } from "@/types/permissions";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

export function RoleWidgetsTab({ roleId }: { roleId: string }) {
  const { data: rows, isLoading } = useGetRoleWidgetsQuery(roleId);
  const [setRoleWidgets, { isLoading: saving }] = useSetRoleWidgetsMutation();
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [syncedRows, setSyncedRows] = useState<RoleWidgetStateRow[] | undefined>(undefined);
  if (rows !== syncedRows) {
    setSyncedRows(rows);
    setVisible(new Set((rows ?? []).filter((r) => r.visible).map((r) => r.key)));
  }

  const toggle = (key: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await setRoleWidgets({ roleId, visibleWidgetKeys: Array.from(visible) }).unwrap();
      toast.success("Dashboard widgets updated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {!rows?.length ? (
        <p className="text-sm text-muted-foreground">No widgets configured.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {rows.map((w) => (
            <div key={w.key} className="flex items-start gap-3 px-4 py-3">
              <LayoutGrid className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{w.label}</p>
                {w.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>
                )}
              </div>
              <Switch checked={visible.has(w.key)} onCheckedChange={() => toggle(w.key)} />
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <Button size="sm" className="gap-1.5" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Widgets
        </Button>
      </div>
    </div>
  );
}
