"use client";

import { toast } from "sonner";
import { CheckCircle2, Landmark, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import {
  useGetBankAccountOpeningQuery,
  useCompleteBankAccountOpeningMutation,
} from "@/lib/api/applicationApi";

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
 * Bank Account Opening requirement — inserted after Parent + College
 * verification, before the application is eligible for the Initiator's
 * queue. Renders nothing until the backend has created the requirement
 * (GET /applications/:id/bank-account is null until both of those
 * verifications are complete).
 *
 * MVP: there is no real bank API/webhook yet, so the button both opens the
 * partner bank's URL AND immediately reports completion — see
 * BankAccountOpeningService on the backend for how that simulation is
 * isolated so it can later be replaced with an actual callback/webhook
 * without redesigning this card.
 */
export function BankAccountOpeningCard({ applicationId }: { applicationId: string }) {
  const { data: bankAccount, isLoading } = useGetBankAccountOpeningQuery(applicationId);
  const [completeBankAccountOpening, { isLoading: isCompleting }] =
    useCompleteBankAccountOpeningMutation();

  if (isLoading || !bankAccount) return null;

  const completed = bankAccount.status === "COMPLETED";

  const handleOpenBank = async () => {
    window.open(bankAccount.bankUrl, "_blank", "noopener,noreferrer");
    try {
      await completeBankAccountOpening(applicationId).unwrap();
      toast.success("Bank account requirement completed", {
        description: "Your application has been forwarded to the Initiator.",
      });
    } catch (err) {
      toast.error("Couldn't record your bank account opening", {
        description: getApiErrorMessage(err) ?? "Please try again.",
      });
    }
  };

  return (
    <Card className={completed ? "border-border" : "border-primary/40 shadow-sm"}>
      <CardContent className="p-5 lg:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${completed ? "bg-[oklch(0.62_0.18_145)]/10" : "bg-primary/10"}`}>
            {completed ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-[oklch(0.55_0.18_145)]" />
            ) : (
              <Landmark className="w-4.5 h-4.5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {completed ? "Bank Account Opening Completed" : "Action Required: Bank Account Opening"}
            </p>
            {completed && bankAccount.completedAt && (
              <p className="text-xs text-muted-foreground">Completed on {formatDate(bankAccount.completedAt)}</p>
            )}
          </div>
        </div>

        {!completed && (
          <>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.55_0.18_145)]" /> Parent verification completed
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.55_0.18_145)]" /> College verification completed
              </li>
            </ul>
            <p className="text-sm text-foreground leading-relaxed">
              Before we can process your application further, please open a bank account with our partner bank.
              Once completed, your application will proceed to the Initiator for processing.
            </p>
            <Button onClick={handleOpenBank} disabled={isCompleting} className="gap-1.5">
              {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Open Bank Account
            </Button>
            <p className="text-xs text-muted-foreground">Status: Pending</p>
          </>
        )}

        {completed && (
          <p className="text-sm text-foreground leading-relaxed">
            Your application is now moving to the next stage.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
