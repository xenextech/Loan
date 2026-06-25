import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);

// Convenience selectors
export const useAuth = () => useAppSelector((s) => s.auth);
export const useIsAuthenticated = () => useAppSelector((s) => s.auth.isAuthenticated);
export const useCurrentUser = () => useAppSelector((s) => s.auth.user);
export const useIsAdmin = () => useAppSelector((s) => s.auth.user?.role === "ADMIN");
