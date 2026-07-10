"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { timeAgo, formatDate } from "@/lib/formatters";
import type { NotificationLogRow } from "@/types/dashboard";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  inferNotificationCategory,
} from "./notificationCategory";

export function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: NotificationLogRow;
  onMarkRead: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = inferNotificationCategory(notification.title, notification.message);
  const Icon = CATEGORY_ICON[category];

  const handleClick = () => {
    setExpanded((v) => !v);
    if (!notification.isRead) onMarkRead(notification.id);
  };

  return (
    <Card
      className={cn(
        "border-border shadow-none cursor-pointer transition-colors hover:bg-muted/30",
        !notification.isRead && "bg-primary/5",
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", CATEGORY_BADGE_CLASS[category])}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />}
              <p className={cn("text-sm truncate", notification.isRead ? "font-medium text-foreground" : "font-bold text-foreground")}>
                {notification.title}
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0" title={formatDate(notification.createdAt)}>
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          <p className={cn("text-sm text-muted-foreground", !expanded && "truncate")}>{notification.message}</p>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge className={cn(CATEGORY_BADGE_CLASS[category], "border-0 text-[10px] font-semibold")}>
              {CATEGORY_LABEL[category]}
            </Badge>
            {!notification.isRead && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold">Unread</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
