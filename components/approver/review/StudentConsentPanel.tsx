"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Clock, Copy, Loader2, Mail, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/formatters";
import { useGetStudentConsentQuery, useSendStudentConsentMutation } from "@/lib/api/dashboardApi";

function getApiErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.join(", ");
    }
  }
  return undefined;
}

/**
 * Lets the Approver write custom terms & conditions and send them to the
 * student (GET/POST /dashboard/approval/:id/student-consent). The student
 * consents from inside their own logged-in dashboard, not an anonymous link —
 * consent is tied to their real account, the same identity guarantee every
 * other authenticated action in this app relies on.
 */
export function StudentConsentPanel({ applicationId }: { applicationId: string }) {
  const { data: consent, isLoading } = useGetStudentConsentQuery(applicationId);
  const [sendConsent, { isLoading: isSending }] = useSendStudentConsentMutation();
  const [termsText, setTermsText] = useState("");
  // Seed the textarea from the already-sent terms exactly once, when they
  // first arrive — done during render (not an effect) so it applies before
  // paint, and re-seeds if the applicationId changes (different consent record).
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (consent && seededFor !== consent.id) {
    setTermsText(consent.termsText);
    setSeededFor(consent.id);
  }

  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    if (!termsText.trim()) return;
    try {
      const result = await sendConsent({ applicationId, termsText: termsText.trim() }).unwrap();
      setLastLink(result.consentLink);
      toast.success("Consent request emailed to the student");
    } catch (err) {
      toast.error("Failed to send consent request", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  const copyLink = () => {
    if (!lastLink) return;
    navigator.clipboard.writeText(lastLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  }

  const consented = Boolean(consent?.consentedAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {consented ? (
          <Badge className="bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0 text-xs font-semibold gap-1">
            <CheckCircle2 className="w-3 h-3" /> Consented {consent?.consentedAt ? `on ${formatDate(consent.consentedAt)}` : ""}
          </Badge>
        ) : consent ? (
          <Badge className="bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0 text-xs font-semibold gap-1">
            <Clock className="w-3 h-3" /> Sent — awaiting student consent
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
            Not sent yet
          </Badge>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-consent-text" className="text-xs text-muted-foreground">
          {consent ? "Terms & conditions" : "Terms & conditions to send"}
        </Label>
        <Textarea
          id="student-consent-text"
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
          placeholder="Write the terms & conditions the student needs to consent to…"
          rows={5}
          className="text-sm"
        />
        {consent && (
          <p className="text-[11px] text-muted-foreground/70">
            Editing and resending replaces the terms above — the student will need to consent again.
          </p>
        )}
      </div>

      <Button size="sm" onClick={handleSend} disabled={isSending || !termsText.trim()} className="gap-1.5">
        {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        {consent ? "Resend to Student" : "Send to Student"}
      </Button>

      {lastLink && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs font-medium text-foreground">Emailed to the student</p>
            </div>
            <Button variant={copied ? "default" : "outline"} size="sm" className="h-7 px-2.5 gap-1.5 text-xs shrink-0" onClick={copyLink}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs font-mono text-muted-foreground break-all bg-background rounded-lg px-2.5 py-2 border border-border">
            {lastLink}
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            The student must be signed into their own account to view and consent — this link alone can&apos;t be used by anyone else.
          </p>
        </div>
      )}
    </div>
  );
}
