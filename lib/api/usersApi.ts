import { baseApi } from "./baseApi";
import type { NotificationLogRow } from "@/types/dashboard";

// The current user's own account-scoped endpoints (GET /users/me/*). Distinct
// from dashboardApi's staff-only /dashboard/notifications/log — this one is
// guarded by JwtAuthGuard only (no RolesGuard), so any authenticated role
// (student, parent, staff) can read their own notifications.
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Raw Prisma Notification rows, newest first, capped at 50 server-side —
    // same row shape dashboardApi.ts already types as NotificationLogRow, so
    // it's reused rather than redeclared.
    getMyNotifications: builder.query<NotificationLogRow[], void>({
      query: () => "/users/me/notifications",
      providesTags: ["Notification"],
    }),
    // Backend does updateMany({ id, userId }) — returns { count }, not the
    // updated row; silently count:0 if the id doesn't belong to this user.
    markNotificationRead: builder.mutation<{ count: number }, string>({
      query: (id) => ({ url: `/users/me/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetMyNotificationsQuery, useMarkNotificationReadMutation } = usersApi;
