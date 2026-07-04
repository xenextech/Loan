import { getMockAuditLedger } from "./mockAuditLedger";
import type { AuditLedgerData } from "./types";

/**
 * Returns the immutable audit-ledger log (all actions, all users, all branches).
 * Mock-only for now — see `mockAuditLedger.ts`.
 */
export function useAuditLedger(): {
  data: AuditLedgerData;
  isLoading: boolean;
} {
  return {
    data: getMockAuditLedger(),
    isLoading: false,
  };
}
