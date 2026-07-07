"use client";

import { usePathname } from "next/navigation";

/**
 * First path segment of the current route (e.g. `/initiator` or `/supporter`).
 * The dashboard-wide feature modules (Applications, Approval Workflow, Disbursement,
 * EMI Schedule, Notification, Document Center, Insurance Checker, Commission, Audit
 * Ledger) are shared verbatim across every internal role's portal — the backend gates
 * them all to the same staff-role list — so their internal navigation is built off
 * this instead of a hardcoded `/initiator` prefix.
 */
export function useDashboardBasePath(): string {
  const pathname = usePathname();
  const [, firstSegment] = pathname.split("/");
  return `/${firstSegment}`;
}
