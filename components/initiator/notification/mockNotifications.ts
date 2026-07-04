import type { NotificationCenterData, NotificationChannelCount, NotificationLogEntry } from "./types";

/**
 * Standing in for a future notification-log backend module (SMS/WhatsApp/Email/App
 * delivery tracking) — none of that exists on the API yet. Swap `useNotificationCenter`
 * for a real RTK Query hook once it does; the call signature already matches.
 */

const CHANNEL_COUNTS: NotificationChannelCount[] = [
  { channel: "SMS", count: 98 },
  { channel: "WhatsApp", count: 82 },
  { channel: "Email", count: 44 },
  { channel: "App", count: 24 },
];

const LOG: NotificationLogEntry[] = [
  {
    id: "log-1",
    timeLabel: "29 Jun 09:00",
    to: "Sharada Sah · 9812261375",
    channel: "WhatsApp",
    type: "EMI reminder — 1 month",
    status: "Delivered",
  },
  {
    id: "log-2",
    timeLabel: "29 Jun 09:01",
    to: "Sharada Sah",
    channel: "App",
    type: "EMI reminder — 1 month",
    status: "Read",
  },
  {
    id: "log-3",
    timeLabel: "29 Jun 08:30",
    to: "Krishna Yadav · 9841xxxxxx",
    channel: "SMS",
    type: "Overdue Day 12 — pay now",
    status: "Delivered",
  },
  {
    id: "log-4",
    timeLabel: "28 Jun 16:00",
    to: "Sunita BK",
    channel: "SMS",
    type: "Near NPA warning — Day 29",
    status: "Failed",
  },
  {
    id: "log-5",
    timeLabel: "28 Jun 15:00",
    to: "Sita Devi",
    channel: "Email",
    type: "Insurance expiry — 8 days",
    status: "Opened",
  },
  {
    id: "log-6",
    timeLabel: "28 Jun 14:00",
    to: "AIM College",
    channel: "Email",
    type: "Disbursement confirmation",
    status: "Delivered",
  },
  {
    id: "log-7",
    timeLabel: "28 Jun 10:00",
    to: "All borrowers",
    channel: "WhatsApp",
    type: "Interest rate change notice",
    status: "Sent 142",
  },
];

const NOTIFICATION_CENTER: NotificationCenterData = {
  totalCount: 248,
  channelCounts: CHANNEL_COUNTS,
  log: LOG,
};

export function getMockNotificationCenter(): NotificationCenterData {
  return NOTIFICATION_CENTER;
}
