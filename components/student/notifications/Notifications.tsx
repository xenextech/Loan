"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, RefreshCw } from "lucide-react";
import { useGetMyNotificationsQuery, useMarkNotificationReadMutation } from "@/lib/api/usersApi";
import { NotificationCard } from "./NotificationCard";

function NotificationCardSkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 rounded-xl border border-border">
      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-3 w-full max-w-md rounded" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function Notifications() {
  const { data: notifications, isLoading, isFetching, error, refetch } = useGetMyNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();

  return (
    <div className="p-6 lg:p-8 max-w-8xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Updates about your loan application, EMI schedule, and repayment.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <NotificationCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Bell className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Couldn&apos;t load your notifications. Please try again.</p>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={isFetching} onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">No notifications available.</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            You&apos;ll receive updates about your loan application and repayment here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={(id) => markRead(id)} />
          ))}
        </div>
      )}
    </div>
  );
}
