import { getMockNotificationCenter } from "./mockNotifications";
import type { NotificationCenterData } from "./types";

/**
 * Returns the notification log (SMS/WhatsApp/Email/App delivery tracking) for the
 * Notification Center. This is a cross-application log, not scoped to one loan — mock-only
 * for now, see `mockNotifications.ts`.
 */
export function useNotificationCenter(): {
  data: NotificationCenterData;
  isLoading: boolean;
} {
  return {
    data: getMockNotificationCenter(),
    isLoading: false,
  };
}
