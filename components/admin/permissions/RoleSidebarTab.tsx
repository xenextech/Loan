"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Lock } from "lucide-react";
import { useGetRoleMenuQuery, useSetRoleMenuMutation } from "@/lib/api/permissionsApi";
import { resolveIcon } from "@/lib/permissions/iconMap";
import type { RoleMenuStateRow } from "@/types/permissions";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

export function RoleSidebarTab({ roleId }: { roleId: string }) {
  const { data: rows, isLoading } = useGetRoleMenuQuery(roleId);
  const [setRoleMenu, { isLoading: saving }] = useSetRoleMenuMutation();
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [syncedRows, setSyncedRows] = useState<RoleMenuStateRow[] | undefined>(undefined);
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
      await setRoleMenu({ roleId, visibleMenuItemKeys: Array.from(visible) }).unwrap();
      toast.success("Sidebar access updated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  const groups = new Map<string, typeof rows>();
  for (const row of rows ?? []) {
    const label = row.groupLabel ?? "Other";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(row);
  }

  return (
    <div className="p-5 space-y-6">
      {Array.from(groups.entries()).map(([groupLabel, items]) => (
        <div key={groupLabel}>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {groupLabel}
          </p>
          <div className="divide-y divide-border rounded-lg border border-border">
            {items!.map((item) => {
              const Icon = resolveIcon(item.icon);
              return (
                <div key={item.key} className="flex items-center gap-3 px-4 py-2.5">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  {item.isApiGuarded && (
                    <Badge
                      variant="outline"
                      className="text-[9px] gap-1 border-primary/30 text-primary font-medium"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      API enforced
                    </Badge>
                  )}
                  <Switch checked={visible.has(item.key)} onCheckedChange={() => toggle(item.key)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-2 border-t border-border">
        <Button size="sm" className="gap-1.5" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Sidebar Access
        </Button>
        <p className="text-[11px] text-muted-foreground mt-2">
          Hiding an item also blocks direct URL access wherever the corresponding API route enforces it server-side.
        </p>
      </div>
    </div>
  );
}
