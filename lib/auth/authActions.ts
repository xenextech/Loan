import type { AppDispatch } from "@/lib/store/index";
import { clearCredentials } from "@/lib/store/authSlice";
import { baseApi } from "@/lib/api/baseApi";

/**
 * Logs the user out AND wipes every cached RTK Query response.
 *
 * `clearCredentials()` alone only resets the `auth` slice — every other API
 * slice's cache (permissions/menu, dashboard data, application data, …)
 * survives in the Redux store untouched. Since login/logout happen via
 * client-side navigation (no hard page reload), a different role logging in
 * on the same tab right after would still see the *previous* user's cached
 * responses — e.g. GET /permissions/me still returning the old role's
 * sidebar — until something forces a refetch. This is why "refresh fixes
 * it": a full reload starts RTK Query's cache from empty.
 *
 * Always call this instead of dispatching `clearCredentials()` directly.
 */
export function performLogout(dispatch: AppDispatch) {
  dispatch(clearCredentials());
  dispatch(baseApi.util.resetApiState());
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  } catch {
    // Storage unavailable — non-fatal, credentials are already cleared from Redux.
  }

  // The service worker never caches API responses, but it does cache
  // same-origin <img> assets (stale-while-revalidate) — on a shared device,
  // a different role logging in next shouldn't even transiently see a
  // previous user's cached avatar/document thumbnail. Belt-and-suspenders
  // alongside the fetch-handler's own allowlist.
  if (typeof navigator !== "undefined" && navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_RUNTIME_CACHES" });
  }
}
