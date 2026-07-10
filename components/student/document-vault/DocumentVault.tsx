"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FolderOpen } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
import { DOCUMENT_CATEGORIES } from "./types";
import { useDocumentVault } from "./useDocumentVault";
import { DocumentCard } from "./DocumentCard";

type SortOrder = "newest" | "oldest";

export function DocumentVault() {
  const { data: documents, isLoading } = useDocumentVault();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const rows = documents.filter((doc) => {
      const matchesSearch = !q || doc.documentName.toLowerCase().includes(q);
      const matchesCategory = category === "all" || doc.category === category;
      return matchesSearch && matchesCategory;
    });
    return [...rows].sort((a, b) => {
      const diff = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      return sort === "newest" ? diff : -diff;
    });
  }, [documents, debouncedSearch, category, sort]);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Documents shared with you by your college and loan provider.
        </p>
      </motion.div>

      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-full sm:w-52 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)}>
            <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground sm:ml-auto shrink-0">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      )}

      {isLoading ? null : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">No documents available yet.</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Documents shared by your college or loan provider will appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No documents match your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
