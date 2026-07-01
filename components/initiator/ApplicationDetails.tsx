"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, FileText, User, Wallet, GraduationCap } from "lucide-react";
import { formatNPR } from "@/lib/formatters";
import { useInitiatorApplicationDetail } from "./hooks/useInitiatorApplicationDetail";
import StudentInfoCard from "./components/StudentInfoCard";
import CollegeReviewCard from "./components/CollegeReviewCard";
import InitiatorForm from "./components/InitiatorForm";

export default function InitiatorApplicationDetails({ id }: { id: string }) {
  const router = useRouter();
  const { data: detail, isLoading } = useInitiatorApplicationDetail(id);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => router.push("/initiator")}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-6 w-48 rounded" />
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-foreground font-mono">
                {detail?.applicationNumber ?? "—"}
              </h1>
              <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-xs font-semibold gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified by College
              </Badge>
            </div>
          )}
        </div>
      </motion.div>

      {isLoading ? (
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
      ) : !detail ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <FileText className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Application not found</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/initiator")}>
            Back to list
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="space-y-8"
        >
          {/* Quick summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: User, label: "Student", value: detail.studentName },
              { icon: GraduationCap, label: "College", value: detail.collegeName },
              { icon: Wallet, label: "Loan Amount", value: formatNPR(detail.loanAmount) },
              { icon: FileText, label: "Program", value: detail.program },
            ].map(({ icon: Icon, label, value }) => (
              <Card key={label} className="border-border shadow-none">
                <CardContent className="px-4 py-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug truncate">
                    {value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section 1 — Student Information */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">1. Student Information</h2>
            <StudentInfoCard student={detail.studentInfo} />
          </section>

          <Separator />

          {/* Section 2 — College Verification Form (read-only) */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">2. College Verification Form</h2>
            <CollegeReviewCard verification={detail.collegeVerification} />
          </section>

          <Separator />

          {/* Section 3 — Initiator Verification Form */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">3. Initiator Verification</h2>
            <InitiatorForm defaultValues={detail.initiatorVerification} />
          </section>
        </motion.div>
      )}
    </div>
  );
}
