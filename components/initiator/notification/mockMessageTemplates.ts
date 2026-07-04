export type TemplateTone = "success" | "destructive" | "info" | "warning" | "purple";

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
  tone: TemplateTone;
}

/**
 * Standing in for a future message-template management backend module — none of that
 * exists on the API yet. Swap `useMessageTemplates` for a real RTK Query hook once it
 * does; the call signature already matches.
 */
const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl-emi-due-reminder",
    title: "EMI due reminder",
    body: "Dear {name}, your EMI of Rs {amount} is due on {date}. Pay via {link}. — BFCL/Unnati",
    tone: "success",
  },
  {
    id: "tpl-overdue-notice",
    title: "Overdue notice",
    body: "Dear {name}, your EMI of Rs {amount} is {days} days overdue. Penal interest Rs {penal}. Pay now.",
    tone: "destructive",
  },
  {
    id: "tpl-loan-approval-status",
    title: "Loan approval status",
    body: "Dear {name}, your loan application {ref} has been {status}. Next step: {action}.",
    tone: "info",
  },
  {
    id: "tpl-document-expiry",
    title: "Document expiry",
    body: "Dear {name}, your {doc_type} expires on {date}. Renew to avoid loan hold. Contact: {phone}.",
    tone: "warning",
  },
  {
    id: "tpl-marketing-new-products",
    title: "Marketing / new products",
    body: "Dear {name}, BFCL now offers {product} at {rate}%. Apply via Unnati app: {link}.",
    tone: "purple",
  },
];

export function getMockMessageTemplates(): MessageTemplate[] {
  return MESSAGE_TEMPLATES;
}
