import { useGetDocumentVaultQuery } from "@/lib/api/documentVaultApi";
import type { DocumentVaultItem } from "./types";

/**
 * Single seam between the Document Vault UI and its data source. Backed by
 * GET /documents/vault (see lib/api/documentVaultApi.ts). DocumentVault.tsx
 * and DocumentCard.tsx only ever consume this hook's return shape.
 */
export function useDocumentVault(): {
  data: DocumentVaultItem[];
  isLoading: boolean;
  error: unknown;
} {
  const { data, isLoading, error } = useGetDocumentVaultQuery();
  return { data: data ?? [], isLoading, error };
}
