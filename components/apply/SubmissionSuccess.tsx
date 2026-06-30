"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Home,
  Users,
  GraduationCap,
  Check,
} from "lucide-react";
import { useState } from "react";
import { formatNPR } from "@/lib/formatters";

interface SubmissionSuccessProps {
  applicationNumber: string;
  loanAmount: number;
  courseName: string;
  submittedAt: string;
  parentLink?: string;
  collegeLink?: string;
}

const TIMELINE = [
  { label: "Application Submitted", status: "completed" as const },
  { label: "Under Review", status: "current" as const },
  { label: "Credit Assessment", status: "pending" as const },
  { label: "Approval", status: "pending" as const },
  { label: "Disbursement", status: "pending" as const },
];

function CopyLinkCard({
  icon: Icon,
  label,
  hint,
  link,
  color,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
  link: string;
  color: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        </div>
        <Button
          variant={copied ? "default" : "outline"}
          size="sm"
          className="shrink-0 h-8 px-3 gap-1.5 transition-all"
          onClick={copy}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy link
            </>
          )}
        </Button>
      </div>
      <p className="mt-2.5 text-xs font-mono text-muted-foreground break-all bg-background rounded-lg px-3 py-2 border border-border">
        {link}
      </p>
    </div>
  );
}

export default function SubmissionSuccess({
  applicationNumber,
  loanAmount,
  courseName,
  submittedAt,
  parentLink,
  collegeLink,
}: SubmissionSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(applicationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasLinks = parentLink || collegeLink;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[oklch(0.62_0.18_145)]/15 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[oklch(0.62_0.18_145)]/25 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-[oklch(0.62_0.18_145)]" />
              </div>
            </div>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-[oklch(0.62_0.18_145)]/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground text-sm">
            We&apos;ll review your application and get back to you within 3–5 business days.
          </p>
        </motion.div>

        {/* Application details */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="shadow-sm mb-4">
            <CardContent className="p-6 space-y-5">
              {/* Application number */}
              <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Application Number</p>
                  <p className="text-base font-bold text-foreground font-mono">{applicationNumber}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyRef}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-center text-[oklch(0.62_0.18_145)] -mt-3">Copied to clipboard!</p>
              )}

              <Separator />

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Status",
                    value: (
                      <Badge className="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0 text-xs font-semibold">
                        <Clock className="w-3 h-3 mr-1" />
                        Under Review
                      </Badge>
                    ),
                  },
                  {
                    label: "Loan Amount",
                    value: <span className="text-sm font-bold">{formatNPR(loanAmount)}</span>,
                  },
                  {
                    label: "Program",
                    value: <span className="text-sm font-medium">{courseName}</span>,
                  },
                  {
                    label: "Submitted",
                    value: (
                      <span className="text-sm font-medium">
                        {new Date(submittedAt).toLocaleDateString("en-NP", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    {item.value}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-4">Application Timeline</p>
                <div className="space-y-3">
                  {TIMELINE.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.status === "completed"
                            ? "bg-[oklch(0.62_0.18_145)]"
                            : item.status === "current"
                            ? "bg-primary animate-pulse"
                            : "bg-border"
                        }`}
                      />
                      <span className={`text-xs ${item.status === "pending" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                        {item.label}
                      </span>
                      {item.status === "completed" && (
                        <CheckCircle2 className="w-3 h-3 text-[oklch(0.62_0.18_145)] ml-auto" />
                      )}
                      {item.status === "current" && (
                        <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary">
                          In progress
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification links */}
          {hasLinks && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Verification Links</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Share these links with your contacts. They expire in 30 days.
                    </p>
                  </div>
                  {parentLink && (
                    <CopyLinkCard
                      icon={Users}
                      label="Parent / Guardian"
                      hint="Share this with your parent so they can view the application"
                      link={parentLink}
                      color="bg-blue-500/10 text-blue-600"
                    />
                  )}
                  {collegeLink && (
                    <CopyLinkCard
                      icon={GraduationCap}
                      label="College / Institution"
                      hint="Share this with your college to upload their documents"
                      link={collegeLink}
                      color="bg-teal-500/10 text-teal-600"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-11" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full h-11" size="lg">
                View My Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
