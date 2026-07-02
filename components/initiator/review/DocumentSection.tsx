import { DocumentCard } from "./DocumentCard";
import type { DocumentItem } from "../types/initiator";

interface DocumentGridProps {
  documents: DocumentItem[];
  onOpen: (document: DocumentItem) => void;
  emptyLabel?: string;
}

/** Grid of document cards shown inside a tab panel for one category (Student/Parent/College). */
export function DocumentGrid({ documents, onOpen, emptyLabel = "No documents uploaded yet." }: DocumentGridProps) {
  if (documents.length === 0) {
    return <p className="text-xs text-muted-foreground py-6 text-center">{emptyLabel}</p>;
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onOpen={onOpen} />
      ))}
    </div>
  );
}
