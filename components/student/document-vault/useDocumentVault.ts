import { MOCK_DOCUMENTS } from "./mockDocuments";
import type { DocumentVaultItem } from "./types";

/**
 * Single seam between the Document Vault UI and its data source. No backend
 * endpoint exists yet, so this returns the mock dataset shaped exactly like
 * an RTK Query hook result — swap the body for
 * `return useGetDocumentVaultQuery();` (backed by a new
 * `lib/api/documentVaultApi.ts` endpoint returning `DocumentVaultItem[]`)
 * once the real API ships. DocumentVault.tsx and DocumentCard.tsx only ever
 * consume this hook's return shape, so neither needs to change.
 */
export function useDocumentVault(): {
  data: DocumentVaultItem[];
  isLoading: boolean;
  error: unknown;
} {
  return { data: MOCK_DOCUMENTS, isLoading: false, error: null };
}
