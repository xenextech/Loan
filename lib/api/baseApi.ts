import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "@/lib/store/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001"}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    // Avoid circular import — cast instead of importing RootState
    const token = (getState() as { auth: { token: string | null } }).auth?.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Unwrap the backend's { success, statusCode, message, data, timestamp } envelope
// and auto-logout on 401.
const baseQueryWithUnwrap: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(clearCredentials());
      // Also wipe every cached query response (permissions/menu, dashboard
      // data, …) — not just the auth slice — so a different role logging in
      // right after never sees a stale cached result from this session.
      // Dispatched as a raw action (not `baseApi.util.resetApiState()`) to
      // avoid a circular import: this file IS baseApi, still being defined.
      api.dispatch({ type: "api/resetApiState" });
      // clearCredentials only resets Redux state — the route gates (e.g.
      // app/initiator/layout.tsx) read localStorage directly and only on mount,
      // so a stale token there would otherwise keep the app "logged in" while
      // every request silently 401s (surfacing as bogus "not found" pages).
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return result;
  }

  if (result.data && typeof result.data === "object" && "data" in result.data) {
    return { data: (result.data as { data: unknown }).data };
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithUnwrap,
  tagTypes: [
    "Application",
    "Document",
    "AdminApp",
    "Dashboard",
    "Notification",
    "CollegeTemplate",
    "DisbursementCondition",
    "EmiSchedule",
    "NotificationTemplate",
    "InsurancePolicy",
    "CommissionPartner",
    "CommissionEntry",
    "GeneratedAgreement",
    "CollectionActivity",
    "DocumentVault",
    "Permission",
    "Role",
    "RolePermission",
    "RoleMenu",
    "RoleWidget",
    "CollegeCatalog",
  ],
  endpoints: () => ({}),
});
