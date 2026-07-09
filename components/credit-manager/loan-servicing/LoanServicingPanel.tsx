"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Settings2, PhoneCall, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { useDashboardBasePath } from "@/lib/useDashboardBasePath";
import {
  useConfigureLoanServicingMutation,
  useNotifyLoanServicingBorrowerMutation,
  useRecordCollectionActivityMutation,
  useGetCollectionActivityQuery,
  useFlagLoanNeedsReviewMutation,
  useResolveLoanReviewMutation,
} from "@/lib/api/dashboardApi";
import { formatNPR } from "@/lib/formatters";
import type { CollectionActivityType, LoanAccountRecord, RepaymentFrequency } from "@/types/dashboard";

const ACTIVITY_TYPE_LABEL: Record<CollectionActivityType, string> = {
  CALL: "Phone call",
  SMS: "SMS",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  VISIT: "Field visit",
  NOTE: "Note",
  OTHER: "Other",
};

const FREQUENCY_LABEL: Record<RepaymentFrequency, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const FREQUENCY_PERIOD_MONTHS: Record<RepaymentFrequency, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
};

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Something went wrong. Please try again.";
}

export default function LoanServicingPanel({
  applicationId,
  loanAccount,
  disbursementAmount,
}: {
  applicationId: string;
  loanAccount: LoanAccountRecord | null | undefined;
  /** Actual disbursed amount (Disbursement.totalDisbursedAmount), falling back to the
   *  approved credit limit when nothing has been disbursed yet — this is the real
   *  principal used for EMI calculations, visible here but never editable. */
  disbursementAmount: number | null;
}) {
  const router = useRouter();
  const basePath = useDashboardBasePath();

  const [configOpen, setConfigOpen] = useState(false);
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [frequency, setFrequency] = useState<RepaymentFrequency>("MONTHLY");
  const [interestFrequency, setInterestFrequency] = useState<RepaymentFrequency>("MONTHLY");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [grace, setGrace] = useState("0");
  const [startDate, setStartDate] = useState("");

  const tenureNum = Number(tenure);
  const periodMonths = FREQUENCY_PERIOD_MONTHS[frequency];
  const tenureInvalid = tenure.trim() !== "" && Number.isFinite(tenureNum) && tenureNum > 0 && tenureNum % periodMonths !== 0;

  const [activityOpen, setActivityOpen] = useState(false);
  const [activityType, setActivityType] = useState<CollectionActivityType>("CALL");
  const [activityNotes, setActivityNotes] = useState("");
  const [contactedPerson, setContactedPerson] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");

  const [configureServicing, { isLoading: configuring }] = useConfigureLoanServicingMutation();
  const [notifyBorrower, { isLoading: notifying }] = useNotifyLoanServicingBorrowerMutation();
  const [recordActivity, { isLoading: recordingActivity }] = useRecordCollectionActivityMutation();
  const [flagNeedsReview, { isLoading: flagging }] = useFlagLoanNeedsReviewMutation();
  const [resolveReview, { isLoading: resolving }] = useResolveLoanReviewMutation();
  const { data: activityLog, isLoading: activityLoading } = useGetCollectionActivityQuery(
    { applicationId, page: 1, limit: 10 },
    { skip: !applicationId },
  );

  if (!loanAccount) {
    return (
      <p className="text-sm text-muted-foreground">
        This application has no loan account yet — loan servicing becomes available once it is approved.
      </p>
    );
  }

  const isCleared = loanAccount.status === "CLEARED";
  const isNeedsReview = loanAccount.status === "NEEDS_REVIEW";
  const isConfigured = !!loanAccount.configuredAt;

  const handleConfigure = async () => {
    try {
      await configureServicing({
        applicationId,
        data: {
          finalInterestRate: rate.trim() ? Number(rate) : undefined,
          finalTenureMonths: tenure.trim() ? Number(tenure) : undefined,
          repaymentFrequency: frequency,
          interestFrequency,
          finalPrincipalAmount: principalAmount.trim() ? Number(principalAmount) : undefined,
          gracePeriodMonths: grace.trim() ? Number(grace) : undefined,
          emiStartDate: startDate ? new Date(startDate).toISOString() : undefined,
        },
      }).unwrap();
      toast.success("EMI has been scheduled and notified to students and parents");
      router.push(basePath);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleNotify = async () => {
    try {
      const result = await notifyBorrower(applicationId).unwrap();
      toast.success(
        `Student ${result.studentNotified ? "notified" : "not notified (no account)"}. ` +
          `Parent ${result.parentNotified ? `notified via ${result.parentChannel}` : "not notified (no phone on file)"}.`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleRecordActivity = async () => {
    if (!activityNotes.trim()) return;
    try {
      await recordActivity({
        applicationId,
        data: { activityType, notes: activityNotes.trim(), contactedPerson: contactedPerson.trim() || undefined },
      }).unwrap();
      toast.success("Collection activity logged.");
      setActivityOpen(false);
      setActivityNotes("");
      setContactedPerson("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleFlagReview = async () => {
    if (!reviewReason.trim()) return;
    try {
      await flagNeedsReview({ applicationId, data: { reason: reviewReason.trim() } }).unwrap();
      toast.success("Loan moved to Needs Review.");
      setReviewOpen(false);
      setReviewReason("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleResolveReview = async () => {
    try {
      await resolveReview({ applicationId, data: { resolutionNotes: resolveNotes.trim() || undefined } }).unwrap();
      toast.success("Loan resolved back to Active.");
      setResolveNotes("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {isNeedsReview && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="text-sm font-bold">Needs Review</h3>
          </div>
          <p className="text-sm text-foreground">{loanAccount.reviewReason}</p>
          <p className="text-xs text-muted-foreground">
            Flagged {loanAccount.reviewRequestedAt ? formatDate(loanAccount.reviewRequestedAt) : "—"}
          </p>
          <div className="pt-1 space-y-2">
            <Textarea
              placeholder="Resolution notes (optional)"
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              className="text-sm"
              rows={2}
            />
            <Button size="sm" onClick={handleResolveReview} disabled={resolving} className="gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolve — back to Active
            </Button>
          </div>
        </div>
      )}

      {/* Stage 1 — Configuration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Loan Servicing Configuration</h2>
          </div>
          {!isCleared && (
            <Button size="sm" variant="outline" onClick={() => setConfigOpen((v) => !v)}>
              {isConfigured ? "Reconfigure" : "Configure"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Disbursement Amount</p>
            <p className="text-sm font-semibold text-foreground">{disbursementAmount !== null ? formatNPR(disbursementAmount) : "Not yet disbursed"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Final Interest Rate</p>
            <p className="text-sm font-semibold text-foreground">{loanAccount.finalInterestRate !== null ? `${loanAccount.finalInterestRate}%` : "Uses approved rate"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Final Tenure</p>
            <p className="text-sm font-semibold text-foreground">{loanAccount.finalTenureMonths !== null ? `${loanAccount.finalTenureMonths} months` : "Uses approved tenure"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EMI Timeline</p>
            <p className="text-sm font-semibold text-foreground">{FREQUENCY_LABEL[loanAccount.repaymentFrequency]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Frequency</p>
            <p className="text-sm font-semibold text-foreground">{loanAccount.interestFrequency !== null ? FREQUENCY_LABEL[loanAccount.interestFrequency] : "Same as EMI timeline"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Final Principal Amount</p>
            <p className="text-sm font-semibold text-foreground">{loanAccount.finalPrincipalAmount !== null ? formatNPR(loanAccount.finalPrincipalAmount) : "Uses disbursed amount"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Grace Period</p>
            <p className="text-sm font-semibold text-foreground">{loanAccount.gracePeriodMonths} month(s)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">First Due Date</p>
            <p className="text-sm font-semibold text-foreground">{loanAccount.firstDueDate ? formatDate(loanAccount.firstDueDate) : "—"}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {isConfigured ? `Configured ${formatDate(loanAccount.configuredAt)}` : "Not yet configured — the EMI schedule uses the originally approved terms."}
        </p>

        {configOpen && !isCleared && (
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              The approved loan amount is locked and cannot be changed here. Leave a field blank to keep the approved value.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Final Interest Rate (%)</Label>
                <Input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Final Tenure (months)</Label>
                <Input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">EMI Timeline</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as RepaymentFrequency)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(FREQUENCY_LABEL) as [RepaymentFrequency, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Interest Frequency</Label>
                <Select value={interestFrequency} onValueChange={(v) => setInterestFrequency(v as RepaymentFrequency)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(FREQUENCY_LABEL) as [RepaymentFrequency, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Final Principal Amount</Label>
                <Input type="number" min={1} value={principalAmount} onChange={(e) => setPrincipalAmount(e.target.value)} className="h-9 text-sm" placeholder="Uses disbursed amount" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Grace Period (months)</Label>
                <Input type="number" min={0} value={grace} onChange={(e) => setGrace(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">EMI Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            {tenureInvalid && (
              <p className="text-xs text-destructive">
                Tenure must be a multiple of {periodMonths} month(s) for {FREQUENCY_LABEL[frequency].toLowerCase()} repayment.
              </p>
            )}
            <Button size="sm" onClick={handleConfigure} disabled={configuring || tenureInvalid} className="gap-1.5">
              Save &amp; regenerate schedule
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Stage 2 — Notify */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Notify Student &amp; Parent</h2>
          </div>
          <Button size="sm" variant="outline" onClick={handleNotify} disabled={!isConfigured || notifying}>
            Send Notification
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {!isConfigured
            ? "Configure loan servicing first."
            : loanAccount.borrowerNotifiedAt
              ? `Last notified ${formatDate(loanAccount.borrowerNotifiedAt)}.`
              : "Not yet notified."}
        </p>
      </div>

      <Separator />

      {/* Stage 4 — Collection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Collection &amp; Follow-up</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setActivityOpen((v) => !v)}>
            Log Activity
          </Button>
        </div>

        {activityOpen && (
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Activity Type</Label>
                <Select value={activityType} onValueChange={(v) => setActivityType(v as CollectionActivityType)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_TYPE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Contacted (optional)</Label>
                <Input value={contactedPerson} onChange={(e) => setContactedPerson(e.target.value)} placeholder="student / parent" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)} rows={2} className="text-sm" />
            </div>
            <Button size="sm" onClick={handleRecordActivity} disabled={recordingActivity || !activityNotes.trim()}>
              Save
            </Button>
          </div>
        )}

        {activityLoading ? (
          <Skeleton className="h-16 rounded-lg" />
        ) : !activityLog || activityLog.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collection activity recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {activityLog.data.map((a) => (
              <li key={a.id} className="text-xs px-3 py-2 rounded-lg bg-muted/40 space-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{ACTIVITY_TYPE_LABEL[a.activityType]}</span>
                  <span className="text-muted-foreground">{formatDate(a.createdAt)}</span>
                </div>
                <p className="text-muted-foreground">{a.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isNeedsReview && !isCleared && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Needs Review</h2>
              </div>
              <Button size="sm" variant="outline" className={cn(reviewOpen && "bg-muted")} onClick={() => setReviewOpen((v) => !v)}>
                Flag for Review
              </Button>
            </div>
            {reviewOpen && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                <Textarea
                  placeholder="Reason (required) — e.g. repeated missed installments, collection escalation, restructuring needed"
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <Button size="sm" variant="destructive" onClick={handleFlagReview} disabled={flagging || !reviewReason.trim()}>
                  Move to Needs Review
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {isCleared && (
        <>
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge className="bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success border-0 text-xs font-semibold">Cleared</Badge>
            <span>{loanAccount.clearedAt ? `on ${formatDate(loanAccount.clearedAt)}` : ""} — servicing actions are locked.</span>
          </div>
        </>
      )}
    </div>
  );
}
