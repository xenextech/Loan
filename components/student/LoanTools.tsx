"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { useCalculateEmiMutation, useCheckEligibilityMutation } from "@/lib/api/utilsApi";
import { formatNPR } from "@/lib/formatters";
import type { StudyType } from "@/types/api";

const STUDY_TYPE_OPTIONS: { value: StudyType; label: string }[] = [
  { value: "PROGRAM", label: "Degree Program" },
  { value: "COURSE", label: "Short Course" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "CERTIFICATION", label: "Certification" },
];

function EmiCalculatorCard() {
  const [principal, setPrincipal] = useState(500000);
  const [annualRate, setAnnualRate] = useState(9.5);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [calculateEmi, { data: result, isLoading, error }] = useCalculateEmiMutation();

  const handleCalculate = async () => {
    try {
      await calculateEmi({ principal, annualRate, tenureMonths }).unwrap();
    } catch {
      toast.error("Couldn't calculate EMI. Please check your inputs and try again.");
    }
  };

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          EMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Loan amount (NPR)</Label>
            <Input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Interest rate (% p.a.)</Label>
            <Input
              type="number"
              step="0.1"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Tenure (months)</Label>
            <Input
              type="number"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <Button size="sm" className="gap-1.5" onClick={handleCalculate} disabled={isLoading}>
          {isLoading ? "Calculating…" : "Calculate EMI"}
        </Button>

        {error && <p className="text-xs text-destructive">Couldn&apos;t calculate EMI. Please try again.</p>}

        {result && (
          <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Monthly EMI</span>
              <span className="text-base font-bold text-[oklch(0.42_0.18_145)] dark:text-success">{formatNPR(result.monthlyEmi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Total interest</span>
              <span className="text-xs font-semibold text-foreground">{formatNPR(result.totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Total payable</span>
              <span className="text-xs font-semibold text-foreground">{formatNPR(result.totalPayable)}</span>
            </div>

            {result.schedule.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">First 3 months</p>
                <div className="space-y-1">
                  {result.schedule.slice(0, 3).map((row) => (
                    <div key={row.month} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Month {row.month}</span>
                      <span className="text-foreground">
                        {formatNPR(row.emi)} · Balance {formatNPR(row.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EligibilityCheckerCard() {
  const [studyType, setStudyType] = useState<StudyType>("PROGRAM");
  const [loanAmount, setLoanAmount] = useState(500000);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [checkEligibility, { data: result, isLoading, error }] = useCheckEligibilityMutation();

  const handleCheck = async () => {
    try {
      await checkEligibility({
        studyType,
        loanAmount,
        monthlySalary: monthlySalary || undefined,
        tenureMonths: tenureMonths || undefined,
      }).unwrap();
    } catch {
      toast.error("Couldn't check eligibility. Please check your inputs and try again.");
    }
  };

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          Eligibility Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Study type</Label>
            <Select value={studyType} onValueChange={(v) => setStudyType(v as StudyType)}>
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STUDY_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Loan amount (NPR)</Label>
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Family monthly income (NPR, optional)</Label>
            <Input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Tenure (months, optional)</Label>
            <Input
              type="number"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <Button size="sm" className="gap-1.5" onClick={handleCheck} disabled={isLoading}>
          {isLoading ? "Checking…" : "Check Eligibility"}
        </Button>

        {error && <p className="text-xs text-destructive">Couldn&apos;t check eligibility. Please try again.</p>}

        {result && (
          <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Result</span>
              <Badge
                className={
                  result.eligible
                    ? "bg-[var(--success)]/15 text-[oklch(0.42_0.18_145)] dark:text-success border-0 gap-1"
                    : "bg-destructive/10 text-destructive border-0 gap-1"
                }
              >
                {result.eligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {result.eligible ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Max loan amount</span>
              <span className="text-xs font-semibold text-foreground">{formatNPR(result.maxLoanAmount)}</span>
            </div>
            {result.estimatedEmi !== undefined && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Estimated EMI</span>
                <span className="text-xs font-semibold text-foreground">{formatNPR(result.estimatedEmi)}</span>
              </div>
            )}
            {result.reasons.length > 0 && (
              <div className="pt-2 border-t border-border space-y-1">
                {result.reasons.map((reason, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    • {reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LoanTools() {
  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Loan Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estimate your EMI and check loan eligibility before you apply.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <EmiCalculatorCard />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <EligibilityCheckerCard />
        </motion.div>
      </div>
    </div>
  );
}
