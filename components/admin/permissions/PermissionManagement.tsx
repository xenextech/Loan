"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetRolesQuery, useCreateRoleMutation } from "@/lib/api/permissionsApi";
import { RolePermissionsTab } from "./RolePermissionsTab";
import { RoleSidebarTab } from "./RoleSidebarTab";
import { RoleWidgetsTab } from "./RoleWidgetsTab";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

function CreateRoleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createRole, { isLoading }] = useCreateRoleMutation();

  const handleCreate = async () => {
    if (!code.trim() || !name.trim()) return;
    try {
      await createRole({
        code: code.trim().toUpperCase().replace(/\s+/g, "_"),
        name: name.trim(),
        description: description.trim() || undefined,
      }).unwrap();
      toast.success("Role created.");
      setCode("");
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new role</DialogTitle>
          <DialogDescription>
            For this role to be assignable to a real user, it also needs to be added as a value in
            the backend&apos;s UserRole enum (one additive migration) — this creates the
            permission-configuration side only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-code">Role code</Label>
            <Input
              id="role-code"
              placeholder="e.g. REGIONAL_MANAGER"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-name">Display name</Label>
            <Input
              id="role-name"
              placeholder="e.g. Regional Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-description">Description (optional)</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={isLoading || !code.trim() || !name.trim()}
            onClick={handleCreate}
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PermissionManagement() {
  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Defaults to the first role until the user picks one — derived at render
  // time instead of synced via effect, since it's a pure function of `roles`.
  const effectiveRoleId = selectedRoleId ?? roles?.[0]?.id ?? null;
  const selectedRole = roles?.find((r) => r.id === effectiveRoleId) ?? null;

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Role &amp; Permission Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control which modules, sidebar items, and dashboard widgets each role can access — changes take effect immediately, no deploy required.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Role
        </Button>
      </motion.div>

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Roles list */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Roles</p>
            </CardHeader>
            <CardContent className="p-2">
              {rolesLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {roles?.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2",
                        effectiveRoleId === role.id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <span className="font-medium truncate flex-1">{role.name}</span>
                      {role.isSystem && (
                        <Lock
                          className={cn(
                            "w-3 h-3 shrink-0",
                            effectiveRoleId === role.id ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected role's access configuration */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!selectedRole ? (
            <Card className="border-border shadow-none">
              <CardContent className="py-24 flex flex-col items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select a role to configure its access.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">{selectedRole.name}</h2>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    {selectedRole.code}
                  </Badge>
                </div>
                {selectedRole.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedRole.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="permissions">
                  <TabsList className="mx-5 mt-4">
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="sidebar">Sidebar Access</TabsTrigger>
                    <TabsTrigger value="widgets">Dashboard Widgets</TabsTrigger>
                  </TabsList>
                  <TabsContent value="permissions">
                    <RolePermissionsTab roleId={selectedRole.id} />
                  </TabsContent>
                  <TabsContent value="sidebar">
                    <RoleSidebarTab roleId={selectedRole.id} />
                  </TabsContent>
                  <TabsContent value="widgets">
                    <RoleWidgetsTab roleId={selectedRole.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
