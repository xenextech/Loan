"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save } from "lucide-react";
import {
  useGetPermissionsCatalogQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
} from "@/lib/api/permissionsApi";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

function moduleLabel(module: string): string {
  return module
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function actionLabel(action: string): string {
  return action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RolePermissionsTab({ roleId }: { roleId: string }) {
  const { data: catalog, isLoading: catalogLoading } = useGetPermissionsCatalogQuery();
  const { data: granted, isLoading: grantedLoading } = useGetRolePermissionsQuery(roleId);
  const [setRolePermissions, { isLoading: saving }] = useSetRolePermissionsMutation();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  // Re-syncs from the server whenever RTK Query hands back a new `granted`
  // reference (role switch, initial load, or a save invalidating the cache)
  // — reset at render time rather than in an effect, per React's guidance
  // for "adjusting state when a prop/query result changes".
  const [syncedGranted, setSyncedGranted] = useState<string[] | undefined>(undefined);
  if (granted !== syncedGranted) {
    setSyncedGranted(granted);
    setChecked(new Set(granted ?? []));
  }

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModule = (keys: string[], allChecked: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allChecked ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await setRolePermissions({ roleId, permissionKeys: Array.from(checked) }).unwrap();
      toast.success("Permissions updated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (catalogLoading || grantedLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {catalog?.permissionModules.map(({ module, permissions }) => {
        const keys = permissions.map((p) => p.key);
        const allChecked = keys.length > 0 && keys.every((k) => checked.has(k));
        return (
          <div key={module}>
            <div className="flex items-center gap-2 mb-2.5">
              <Checkbox
                checked={allChecked}
                onCheckedChange={() => toggleModule(keys, allChecked)}
                id={`module-${module}`}
              />
              <label
                htmlFor={`module-${module}`}
                className="text-sm font-semibold text-foreground cursor-pointer"
              >
                {moduleLabel(module)}
              </label>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pl-6">
              {permissions.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <Checkbox
                    id={p.key}
                    checked={checked.has(p.key)}
                    onCheckedChange={() => toggle(p.key)}
                  />
                  <label htmlFor={p.key} className="text-xs text-foreground cursor-pointer">
                    {actionLabel(p.action)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-border">
        <Button size="sm" className="gap-1.5" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Permissions
        </Button>
      </div>
    </div>
  );
}
