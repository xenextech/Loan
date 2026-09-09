"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo, formatDate } from "@/lib/formatters";
import type { NotificationLogRow } from "@/types/dashboard";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  inferNotificationCategory,
} from "./notificationCategory";

// Regex that matches http(s) URLs in text.
const URL_REGEX = /(https?:\/\/[^\s]+)/;

/**
 * Splits a message string into alternating plain-text and URL segments,
 * rendering URLs as clickable anchor links.
 */
function MessageWithLinks({ text, collapsed }: { text: string; collapsed: boolean }) {
  const parts = text.split(URL_REGEX);

  return (
    <p className={cn("text-sm text-muted-foreground break-words", collapsed && "truncate")}>
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-0.5 text-primary underline underline-offset-2 hover:opacity-80 transition-opacity break-all"
            >
              {part}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

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

  // Check if message contains a URL so we can show an expand hint
  const hasUrl = URL_REGEX.test(notification.message);

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

          <MessageWithLinks text={notification.message} collapsed={!expanded} />

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge className={cn(CATEGORY_BADGE_CLASS[category], "border-0 text-[10px] font-semibold")}>
              {CATEGORY_LABEL[category]}
            </Badge>
            {!notification.isRead && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold">Unread</Badge>
            )}
            {hasUrl && !expanded && (
              <Badge className="bg-muted text-muted-foreground border-0 text-[10px] font-semibold gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" /> Contains link — click to expand
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
