import { getMockDocumentCenter } from "./mockDocumentCenter";
import type { DocumentCenterDetail } from "./types";

/**
 * Returns the offer-letter verification, document vault, and agreement generator data
 * for the Document Center. Mock-only for now — see `mockDocumentCenter.ts`.
 */
export function useDocumentCenterDetail(): {
  data: DocumentCenterDetail;
  isLoading: boolean;
} {
  return {
    data: getMockDocumentCenter(),
    isLoading: false,
  };
}
