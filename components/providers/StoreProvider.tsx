"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store/index";
import { rehydrateAuth } from "@/lib/store/authSlice";
import type { AuthUser } from "@/lib/store/authSlice";

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

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(store);
  return (
    <Provider store={storeRef.current}>
      <AuthRehydrator />
      {children}
    </Provider>
  );
}
