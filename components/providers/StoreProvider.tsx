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

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(store);
  return (
    <Provider store={storeRef.current}>
      <AuthRehydrator />
      <SessionWatcher />
      {children}
    </Provider>
  );
}
