export type NotificationChannel = "SMS" | "WhatsApp" | "Email" | "App";

export interface NotificationLogEntry {
  id: string;
  timeLabel: string;
  to: string;
  channel: NotificationChannel;
  type: string;
  status: string;
}

export interface NotificationChannelCount {
  channel: NotificationChannel;
  count: number;
}

export interface NotificationCenterData {
  totalCount: number;
  channelCounts: NotificationChannelCount[];
  log: NotificationLogEntry[];
}
