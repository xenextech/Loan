import { Check, XCircle, MinusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ILLUSTRATIVE_CREDIT_PARAMETERS } from "./defaultCreditScore";
import type { CreditScoreResult, NrbChecklistItem } from "@/types/dashboard";

interface CreditScoringSectionProps {
  creditScore: CreditScoreResult;
  checklist: NrbChecklistItem[];
}

/** Live weighted credit score + derived NRB compliance checklist for a single application. */
export function CreditScoringSection({ creditScore, checklist }: CreditScoringSectionProps) {
  const { overall } = creditScore;

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Credit scoring — live</h3>
          <p className="text-xs text-muted-foreground">
            {overall.grade} · {overall.riskCategory} risk
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-5">
          <div className="flex-1 min-w-50">
            <p className="text-xs text-muted-foreground mb-1">Weighted score</p>
            <p className="text-2xl font-bold text-foreground mb-2">
              {overall.score} / {overall.weight}
            </p>
            <Progress value={overall.percentage} className="h-2" />
          </div>
          <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 self-center">
            <span className="text-sm font-bold text-[oklch(0.42_0.18_145)] dark:text-success">{overall.grade}</span>
            <span className="text-[9px] text-muted-foreground">{overall.riskCategory}</span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground mb-1">Percentage</p>
            <p className="text-xl font-bold text-foreground">{overall.percentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 border border-border/70 px-3 py-2 mb-3">
          <p className="text-[11px] text-muted-foreground">
            Illustrative parameter view — reference only. The API returns just the aggregate score/grade above; it
            doesn&apos;t expose a per-parameter weight/score breakdown.
          </p>
        </div>
        <div className="overflow-x-auto opacity-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">Parameter</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">Basis</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground text-xs text-right">Wt</th>
              </tr>
            </thead>
            <tbody>
              {ILLUSTRATIVE_CREDIT_PARAMETERS.map((param) => (
                <tr key={param.label} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 text-foreground">{param.label}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{param.value}</td>
                  <td className="py-2 pr-4 text-right text-foreground">{param.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground mb-2.5">NRB compliance check</h3>
        <ul className="space-y-1.5">
          {checklist.map((check) => (
            <li key={check.label} className="flex items-start gap-2 text-sm">
              {!check.tracked ? (
                <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              ) : check.value ? (
                <Check className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              )}
              <span className={!check.tracked ? "text-muted-foreground/70 italic" : check.value ? "text-foreground" : "text-destructive"}>
                {check.label}
                {!check.tracked && " (not tracked yet)"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
