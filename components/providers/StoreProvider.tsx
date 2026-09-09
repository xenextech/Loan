"use client";
import { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { store } from "@/lib/store/index";
import type { RootState, AppDispatch } from "@/lib/store/index";
import { rehydrateAuth } from "@/lib/store/authSlice";
import type { AuthUser } from "@/lib/store/authSlice";
import { getTokenExpiryMs } from "@/lib/auth/tokenExpiry";
import { performLogout } from "@/lib/auth/authActions";
import { useGetMeQuery } from "@/lib/api/authApi";

function AuthRehydrator() {
  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      const raw = localStorage.getItem("auth_user");
      if (token && raw) {
        const user: AuthUser = JSON.parse(raw);
        store.dispatch(rehydrateAuth({ token, user }));
      }
    } catch {
      // Malformed localStorage data — ignore
    }
  }, []);
  return null;
}

// setTimeout delays overflow past ~24.8 days (2^31-1 ms) and fire immediately —
// chain shorter timeouts so a 7-day token expiry still schedules correctly.
const MAX_TIMEOUT_MS = 2_147_483_647;

function scheduleAt(timestampMs: number, callback: () => void): () => void {
  let cancelled = false;
  let handle: ReturnType<typeof setTimeout>;

  const tick = () => {
    if (cancelled) return;
    const remaining = timestampMs - Date.now();
    if (remaining <= 0) {
      callback();
      return;
    }
    handle = setTimeout(tick, Math.min(remaining, MAX_TIMEOUT_MS));
  };
  tick();

  return () => {
    cancelled = true;
    clearTimeout(handle);
  };
}

// Proactively logs the user out the moment their JWT expires, instead of
// waiting for them to hit an API call that 401s (baseApi.ts handles that case).
function SessionWatcher() {
  const token = useSelector((s: RootState) => s.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!token) return;

    const expiryMs = getTokenExpiryMs(token);
    if (expiryMs === null) return;

    const logout = () => {
      performLogout(dispatch);
      if (window.location.pathname !== "/login") {
        toast.error("Session expired", {
          description: "Please log in again to continue.",
        });
        window.location.href = "/login";
      }
    };

    if (expiryMs <= Date.now()) {
      logout();
      return;
    }

    return scheduleAt(expiryMs, logout);
  }, [token, dispatch]);

  return null;
}

// SessionWatcher only catches a token past its own JWT `exp` claim. It can't
// catch a session the *backend* has independently invalidated (revoked,
// signing secret rotated, admin action) before that — and nothing else in
// the app ever asks the backend "is this still valid" unless the user
// happens to hit a protected endpoint. On a public page (landing, marketing)
// that never does, Redux/localStorage keep looking authenticated
// indefinitely. This pings /auth/me once on load and periodically after —
// a 401 is handled entirely by baseApi.ts's centralized handler already
// (clears credentials, shows the session-expired toast, redirects), so this
// component only needs to trigger the check.
function SessionValidator() {
  const token = useSelector((s: RootState) => s.auth.token);
  useGetMeQuery(undefined, {
    skip: !token,
    pollingInterval: 5 * 60 * 1000,
  });
  return null;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthRehydrator />
      <SessionWatcher />
      <SessionValidator />
      {children}
    </Provider>
  );
}
