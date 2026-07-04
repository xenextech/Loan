"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Filter, Download, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationCenter } from "./useNotificationCenter";
import { useMessageTemplates } from "./useMessageTemplates";
import type { TemplateTone } from "./mockMessageTemplates";
import type { NotificationChannel } from "./types";

const CHANNEL_BADGE_CLASS: Record<NotificationChannel, string> = {
  WhatsApp: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  App: "bg-primary/10 text-primary",
  SMS: "bg-[var(--warning)]/15 text-[oklch(0.5_0.16_80)] dark:text-[var(--warning)]",
  Email: "bg-primary/10 text-primary",
};

const TONE_SWATCH_CLASS: Record<TemplateTone, string> = {
  success: "bg-[var(--success)]/15",
  destructive: "bg-destructive/10",
  info: "bg-primary/10",
  warning: "bg-[var(--warning)]/15",
  purple: "bg-[oklch(0.85_0.08_300)]",
};

/** Highlights `{token}` placeholders inside a template body. */
function TemplateBodyText({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <p className="text-xs text-muted-foreground">
      {parts.map((part, i) =>
        /^\{[^}]+\}$/.test(part) ? (
          <span key={i} className="text-primary font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

/** Notification Center is a cross-application log, not scoped to one loan — `id` only drives the Back destination. */
export function NotificationCenterDetail({ id: _id }: { id: string }) {
  const router = useRouter();
  const { data } = useNotificationCenter();
  const { data: templates } = useMessageTemplates();
  const [activeChannel, setActiveChannel] = useState<"All" | NotificationChannel>("All");

  const filteredLog = useMemo(
    () => (activeChannel === "All" ? data.log : data.log.filter((entry) => entry.channel === activeChannel)),
    [data.log, activeChannel],
  );

  const isFailed = (status: string) => status.toLowerCase().startsWith("failed");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 self-start" onClick={() => router.push("/initiator/notification")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-lg font-bold text-foreground">Notification Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Unnati Initiator Portal · Cross-channel Delivery Log</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Notification log</h3>
          <div className="flex items-center gap-4">
            <button type="button" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button type="button" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveChannel("All")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
              activeChannel === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            All ({data.totalCount})
          </button>
          {data.channelCounts.map((c) => (
            <button
              key={c.channel}
              type="button"
              onClick={() => setActiveChannel(c.channel)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                activeChannel === c.channel ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c.channel} ({c.count})
            </button>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Time</TableHead>
              <TableHead className="text-xs">To</TableHead>
              <TableHead className="text-xs">Channel</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLog.map((entry) => (
              <TableRow key={entry.id} className="border-border">
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{entry.timeLabel}</TableCell>
                <TableCell className="text-sm text-foreground">{entry.to}</TableCell>
                <TableCell>
                  <Badge className={cn(CHANNEL_BADGE_CLASS[entry.channel], "border-0 text-[10px] font-semibold")}>{entry.channel}</Badge>
                </TableCell>
                <TableCell className="text-xs text-foreground">{entry.type}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      isFailed(entry.status)
                        ? "bg-destructive/10 text-destructive"
                        : "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
                      "border-0 text-[10px] font-semibold",
                    )}
                  >
                    {entry.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Message templates */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h3 className="text-sm font-bold text-foreground">Message templates</h3>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> New template
          </Button>
        </div>

        <ul className="divide-y divide-border">
          {templates.map((template) => (
            <li key={template.id} className="flex items-start gap-4 py-4 first:pt-0">
              <div className={cn("w-9 h-9 rounded-lg shrink-0", TONE_SWATCH_CLASS[template.tone])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{template.title}</p>
                <TemplateBodyText text={template.body} />
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Edit
                </button>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Preview
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
