"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inbox, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { useGetNotificationLogQuery } from "@/lib/api/dashboardApi";
import type { NotificationChannel, NotificationDeliveryStatus } from "@/types/dashboard";

const CHANNEL_TABS: { key: NotificationChannel | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "APP", label: "App" },
  { key: "EMAIL", label: "Email" },
  { key: "SMS", label: "SMS" },
  { key: "WHATSAPP", label: "WhatsApp" },
];

const STATUS_BADGE_CLASS: Record<NotificationDeliveryStatus, string> = {
  SENT: "bg-primary/10 text-primary",
  DELIVERED: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  READ: "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success",
  FAILED: "bg-destructive/10 text-destructive",
};

export function NotificationList() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [channel, setChannel] = useState<NotificationChannel | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetNotificationLogQuery({
    page,
    limit: 20,
    channel: channel === "ALL" ? undefined : channel,
  });

  const rows = data?.data ?? [];

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notification</h1>
          <p className="text-sm text-muted-foreground mt-1">Delivery log across every SMS/WhatsApp/Email/App notification sent.</p>
        </div>
        <Button size="sm" variant="outline" className="h-9 text-sm gap-1.5 shrink-0" onClick={() => router.push(`${basePath}/notification/templates`)}>
          <Settings2 className="w-4 h-4" />
          Message Templates
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-sm font-semibold text-foreground">Notification Log</CardTitle>
              <p className="text-xs text-muted-foreground">{isLoading ? "Loading…" : `${data?.meta.total ?? 0} sent`}</p>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              {CHANNEL_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setChannel(t.key); setPage(1); }}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                    channel === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded" /></div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No notifications sent yet</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs pl-5">Time</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Channel</TableHead>
                      <TableHead className="text-xs text-right pr-5">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((entry) => (
                      <TableRow key={entry.id} className="border-border">
                        <TableCell className="pl-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.createdAt)}</TableCell>
                        <TableCell className="py-3">
                          <p className="text-sm font-medium text-foreground leading-tight">{entry.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs">{entry.message}</p>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <Badge variant="outline" className="text-[10px] font-semibold">{entry.channel ?? "—"}</Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-5">
                          {entry.deliveryStatus ? (
                            <Badge className={cn(STATUS_BADGE_CLASS[entry.deliveryStatus], "border-0 text-[10px] font-semibold")}>{entry.deliveryStatus}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data && data.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
