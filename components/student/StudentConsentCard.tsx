"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/formatters";
import { useGetConsentQuery, useAcceptConsentMutation } from "@/lib/api/applicationApi";

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
 * Terms & conditions the Approver has sent for this application. Renders
 * nothing if none have been sent yet. Consent is recorded against the
 * logged-in session (GET/POST /applications/:id/consent[/accept]) — the
 * student must be signed into the account that owns this application.
 */
export function StudentConsentCard({ applicationId }: { applicationId: string }) {
  const { data: consent, isLoading } = useGetConsentQuery(applicationId);
  const [acceptConsent, { isLoading: isAccepting }] = useAcceptConsentMutation();
  const [checked, setChecked] = useState(false);

  if (isLoading || !consent) return null;

  const consented = Boolean(consent.consentedAt);

  const handleAccept = async () => {
    try {
      await acceptConsent(applicationId).unwrap();
      toast.success("Consent recorded");
    } catch (err) {
      toast.error("Failed to record your consent", { description: getApiErrorMessage(err) ?? "Please try again." });
    }
  };

  return (
    <Card className={consented ? "border-border" : "border-primary/40 shadow-sm"}>
      <CardContent className="p-5 lg:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${consented ? "bg-[oklch(0.62_0.18_145)]/10" : "bg-primary/10"}`}>
            {consented ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-[oklch(0.55_0.18_145)]" />
            ) : (
              <FileSignature className="w-4.5 h-4.5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {consented ? "Terms & Conditions Consented" : "Action Required: Review Terms & Conditions"}
            </p>
            {consented && consent.consentedAt && (
              <p className="text-xs text-muted-foreground">Consented on {formatDate(consent.consentedAt)}</p>
            )}
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {consent.termsText}
        </div>

        {!consented && (
          <>
            <div className="flex items-start gap-2.5">
              <Checkbox id="dashboard-consent-agree" checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" />
              <Label htmlFor="dashboard-consent-agree" className="text-sm font-normal leading-snug cursor-pointer">
                I have read and agree to the terms &amp; conditions above.
              </Label>
            </div>
            <Button onClick={handleAccept} disabled={!checked || isAccepting} className="gap-1.5">
              {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              I Consent
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
