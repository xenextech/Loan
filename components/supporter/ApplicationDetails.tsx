"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { useSupporterApplicationDetail } from "./hooks/useSupporterApplicationDetail";
import { SupporterVerificationLayout } from "./review/SupporterVerificationLayout";

export default function SupporterApplicationDetails({ id }: { id: string }) {
  const router = useRouter();
  const { data: detail, isLoading } = useSupporterApplicationDetail(id);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => router.push("/supporter")}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border shadow-none">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-24 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Application not found</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/supporter")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <SupporterVerificationLayout detail={detail} />
    </motion.div>
  );
}
