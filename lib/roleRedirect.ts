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
    case "SUPPORTER":
      return "/supporter";
    case "CHECKER":
      return "/checker";
    case "APPROVER":
      return "/approver";
    case "CREDIT_MANAGER":
      return "/credit-manager";
    default:
      return "/dashboard";
  }
}
