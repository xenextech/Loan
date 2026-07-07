"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Loader2, Inbox } from "lucide-react";
import {
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
} from "@/lib/api/dashboardApi";
import type { NotificationChannel } from "@/types/dashboard";

const CHANNELS: NotificationChannel[] = ["APP", "EMAIL", "SMS", "WHATSAPP"];

/** Message-template management. Not scoped to a single application — `id` in the
 *  route only drives the Back destination, matching the notification log's own convention. */
export function NotificationCenterDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<NotificationChannel>("SMS");
  const [body, setBody] = useState("");

  const { data: templates, isLoading } = useGetNotificationTemplatesQuery({ page: 1, limit: 50 });
  const [createTemplate, { isLoading: creating }] = useCreateNotificationTemplateMutation();
  const [deleteTemplate] = useDeleteNotificationTemplateMutation();
  const [updateTemplate] = useUpdateNotificationTemplateMutation();

  const handleCreate = async () => {
    if (!name.trim() || !body.trim()) {
      toast.error("Name and body are required");
      return;
    }
    try {
      await createTemplate({ name: name.trim(), channel, body: body.trim() }).unwrap();
      setName("");
      setBody("");
      toast.success("Template created");
    } catch {
      toast.error("Failed to create template");
    }
  };

  const handleToggleActive = async (templateId: string, isActive: boolean) => {
    try {
      await updateTemplate({ id: templateId, data: { isActive } }).unwrap();
    } catch {
      toast.error("Failed to update template");
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId).unwrap();
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push(`${basePath}/notification`)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Message Templates</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Reusable notification templates with {"{placeholders}"} like {"{name}"}/{"{amount}"}/{"{date}"}.</p>
      </div>

      {/* New template form */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">New Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm sm:col-span-2" />
          <Select value={channel} onValueChange={(v) => setChannel(v as NotificationChannel)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="Dear {name}, your EMI of Rs {amount} is due on {date}."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="text-sm"
        />
        <Button size="sm" className="gap-1.5" disabled={creating} onClick={handleCreate}>
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create Template
        </Button>
      </div>

      {/* Existing templates */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Existing Templates</h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : !templates?.data.length ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <Inbox className="w-6 h-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No templates yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {templates.data.map((template) => (
              <li key={template.id} className="flex items-start gap-4 py-4 first:pt-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{template.name}</p>
                    <Badge variant="outline" className="text-[10px] font-semibold">{template.channel}</Badge>
                    {!template.isActive && <Badge className="bg-muted text-muted-foreground border-0 text-[10px] font-semibold">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{template.body}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => handleToggleActive(template.id, !template.isActive)}
                  >
                    {template.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(template.id)}
                    aria-label="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
