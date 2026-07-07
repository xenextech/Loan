"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Inbox } from "lucide-react";
import { formatNPR } from "@/lib/formatters";
import { useInitiatorApplications } from "@/components/initiator/hooks/useInitiatorApplications";
import { useDebounce } from "@/lib/useDebounce";

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded hidden md:block" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DocumentCenterList() {
  const router = useRouter();
  const basePath = useDashboardBasePath();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: applications, isLoading } = useInitiatorApplications();

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (app) =>
        app.studentName.toLowerCase().includes(q) ||
        app.applicationNumber.toLowerCase().includes(q) ||
        app.collegeName.toLowerCase().includes(q) ||
        app.program.toLowerCase().includes(q),
    );
  }, [applications, debouncedSearch]);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Document Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Offer letter verification, document vault, and agreements.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border shadow-none">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, ref no., college…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground sm:ml-auto shrink-0">
                {isLoading ? "Loading…" : `${filtered.length} application${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Inbox className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No applications found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs pl-5">Ref No.</TableHead>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">College</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Program</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-xs text-right pr-5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors border-border"
                      onClick={() => router.push(`${basePath}/document-center/${app.id}`)}
                    >
                      <TableCell className="pl-5 py-3.5">
                        <span className="text-xs font-mono font-semibold text-foreground">{app.applicationNumber}</span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">{app.studentName}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden md:table-cell">
                        <p className="text-xs text-foreground max-w-44 truncate">{app.collegeName}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden lg:table-cell">
                        <p className="text-xs text-foreground max-w-44 truncate">{app.program}</p>
                      </TableCell>
                      <TableCell className="py-3.5 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-foreground">{formatNPR(app.loanAmount)}</span>
                      </TableCell>
                      <TableCell className="py-3.5 text-right pr-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${basePath}/document-center/${app.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
