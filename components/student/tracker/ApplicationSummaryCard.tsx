import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNPR, formatDate, toNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ApplicationTracker, LoanApplication } from "@/types/api";
import { OVERALL_STATUS_LABEL, OVERALL_STATUS_BADGE_CLASS, ROLE_LABEL } from "./trackerBadge";
import { FileText, Wallet, CalendarDays, RefreshCcw, Building2, UserCog, ArrowRightCircle } from "lucide-react";

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export function ApplicationSummaryCard({ tracker, application }: { tracker: ApplicationTracker; application: LoanApplication }) {
  const loanAmount = application.loanInformation?.loanAmount ?? application.loanAmount;
  // Backend doesn't expose the college's verified `collegeName` on the student's
  // own GET /applications/:id (only staff/college-portal endpoints do) — the
  // student's own declared institution (studyInformation.boardUniversity) is
  // the closest real data available for this slot.
  const institution = application.studyInformation?.boardUniversity ?? application.boardUniversity;
  const currentIndex = tracker.timeline.findIndex((s) => s.key === tracker.currentStageKey);
  const nextStage = currentIndex >= 0 ? tracker.timeline.slice(currentIndex + 1).find((s) => s.status === "PENDING") : undefined;

  return (
    <Card className="border-border">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Application No.</p>
              <p className="text-base font-bold text-foreground tracking-wide font-mono">
                {tracker.applicationNumber ?? "—"}
              </p>
            </div>
          </div>
          <Badge className={cn(OVERALL_STATUS_BADGE_CLASS[tracker.currentStatus], "border-0 font-semibold")}>
            {OVERALL_STATUS_LABEL[tracker.currentStatus]}
          </Badge>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {tracker.currentStageLabel ?? "Not started"}
            </p>
            <p className="text-xs font-semibold text-foreground">
              {tracker.progressPercentage}% · {tracker.completedStages}/{tracker.totalStages} stages
            </p>
          </div>
          <Progress value={tracker.progressPercentage} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
          {loanAmount ? <InfoItem icon={Wallet} label="Loan Amount" value={formatNPR(toNumber(loanAmount))} /> : null}
          <InfoItem icon={CalendarDays} label="Applied" value={formatDate(application.submittedAt ?? application.createdAt)} />
          <InfoItem icon={RefreshCcw} label="Last Updated" value={formatDate(application.updatedAt)} />
          <InfoItem icon={Building2} label="Institution / Board" value={institution} />
          <InfoItem
            icon={UserCog}
            label="Current Handler"
            value={tracker.currentOwnerRole ? ROLE_LABEL[tracker.currentOwnerRole] : undefined}
          />
          <InfoItem icon={ArrowRightCircle} label="Next Step" value={nextStage?.label} />
        </div>
      </CardContent>
    </Card>
  );
}
