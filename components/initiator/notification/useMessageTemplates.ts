import { getMockMessageTemplates } from "./mockMessageTemplates";
import type { MessageTemplate } from "./mockMessageTemplates";

/** Returns the notification message templates. Mock-only for now — see `mockMessageTemplates.ts`. */
export function useMessageTemplates(): {
  data: MessageTemplate[];
  isLoading: boolean;
} {
  return {
    data: getMockMessageTemplates(),
    isLoading: false,
  };
}
