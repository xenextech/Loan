import { Check, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ComplianceCheck, CreditScoringParameter } from "./types";

interface CreditScoringSectionProps {
  creditScore: {
    weighted: number;
    max: number;
    grade: string;
    riskLabel: string;
    percentage: number;
    parameters: CreditScoringParameter[];
  };
  complianceChecks: ComplianceCheck[];
}

/** Credit scoring breakdown + NRB compliance checklist — shared by the mock demo and the real-application view. */
export function CreditScoringSection({ creditScore, complianceChecks }: CreditScoringSectionProps) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h3 className="text-sm font-bold text-foreground">Credit scoring — live</h3>
          <p className="text-xs text-muted-foreground">
            {creditScore.grade} · Score {creditScore.percentage.toFixed(1)}%
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-5">
          <div className="flex-1 min-w-50">
            <p className="text-xs text-muted-foreground mb-1">Weighted score</p>
            <p className="text-2xl font-bold text-foreground mb-2">
              {creditScore.weighted} / {creditScore.max}
            </p>
            <Progress value={creditScore.percentage} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>A1</span>
              <span>A2</span>
              <span>A3</span>
              <span>A4</span>
              <span>B-</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 self-center">
            <span className="text-sm font-bold text-[oklch(0.42_0.18_145)] dark:text-success">{creditScore.grade}</span>
            <span className="text-[9px] text-muted-foreground">{creditScore.riskLabel}</span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground mb-1">Percentage</p>
            <p className="text-xl font-bold text-foreground">{creditScore.percentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">Parameter</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground text-xs">Value</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground text-xs text-right">Wt</th>
                <th className="py-2 font-medium text-muted-foreground text-xs text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {creditScore.parameters.map((param) => (
                <tr key={param.label} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 text-foreground">{param.label}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{param.value}</td>
                  <td className="py-2 pr-4 text-right text-foreground">{param.weight}</td>
                  <td className="py-2 text-right font-semibold text-[oklch(0.42_0.18_145)] dark:text-success">{param.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground mb-2.5">NRB compliance check</h3>
        <ul className="space-y-1.5">
          {complianceChecks.map((check) => (
            <li key={check.label} className="flex items-start gap-2 text-sm">
              {check.passed ? (
                <Check className="w-4 h-4 text-[oklch(0.42_0.18_145)] dark:text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              )}
              <span className={check.passed ? "text-foreground" : "text-destructive"}>{check.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
