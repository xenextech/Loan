import type { UserRole } from "@/types/api";

/** Single source of truth for "which dashboard does this role land on". */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COLLEGE":
      return "/college";
    case "INITIATOR":
      return "/initiator";
    default:
      return "/dashboard";
  }
}
