"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROGRAM_DEFAULTS: Record<string, { sems: number; tui: number; ex: number }> = {
  bba: { sems: 8, tui: 65000, ex: 4500 },
  mba: { sems: 4, tui: 90000, ex: 5500 },
  bbabi: { sems: 8, tui: 65000, ex: 4500 },
  emba: { sems: 4, tui: 1_00_000, ex: 6000 },
};

function fmt(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-IN");
}

const COMPLIANCE_ITEMS = [
  "Loan within NRB domestic limit (up to Rs 1 crore)",
  "Rate above NRB minimum floor (9.5% meets guideline)",
  "Moratorium = course duration (48 months) + 6-12 months grace",
  "Repayment tenure within 15 year NRB cap",
  "DTI ratio: family income must cover EMI within 50% monthly",
  "Direct college disbursement eliminates fund diversion risk",
];

export default function FeeCalculator() {
  const [program, setProgram] = useState("bba");
  const [adm, setAdm] = useState(25000);
  const [tui, setTui] = useState(65000);
  const [ex, setEx] = useState(4500);
  const [lib, setLib] = useState(3000);
  const [act, setAct] = useState(2500);
  const [tech, setTech] = useState(2000);
  const [intern, setIntern] = useState(5000);
  const [sems, setSems] = useState(8);

  const [emiRate, setEmiRate] = useState(9.5);
  const [emiMonths, setEmiMonths] = useState(120);
  const [moraMonths, setMoraMonths] = useState(54);

  const onProgramChange = (p: string) => {
    setProgram(p);
    const d = PROGRAM_DEFAULTS[p];
    if (d) { setTui(d.tui); setEx(d.ex); setSems(d.sems); }
  };

  const totalFee = adm + tui * sems + ex * sems + lib * sems + act * sems + tech * sems + intern;

  const calcEMI = useCallback(() => {
    const P = totalFee;
    const rm = emiRate / 100 / 12;
    if (rm === 0) return { emi: P / emiMonths, interest: 0, total: P };
    const emi = P * rm * Math.pow(1 + rm, emiMonths) / (Math.pow(1 + rm, emiMonths) - 1);
    const total = emi * emiMonths;
    return { emi: Math.round(emi), interest: Math.round(total - P), total: Math.round(total) };
  }, [totalFee, emiRate, emiMonths]);

  const { emi, interest, total: totalRepay } = calcEMI();

  const breakdownRows = [
    { label: "Admission fee (Sem 1 only)", value: adm },
    { label: `Tuition × ${sems} sems`, value: tui * sems },
    { label: `Exam fee × ${sems} sems`, value: ex * sems },
    { label: `Library × ${sems} sems`, value: lib * sems },
    { label: `Activity × ${sems} sems`, value: act * sems },
    { label: `Tech × ${sems} sems`, value: tech * sems },
    { label: "Project / internship fee", value: intern },
  ];

  const num = (v: string) => parseInt(v.replace(/\D/g, ""), 10) || 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Fee Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calculate total course fees, recommended loan amount, and EMI for students.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Fee configurator */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Program fee configurator</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Select program</Label>
                <Select value={program} onValueChange={onProgramChange}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bba" className="text-xs">BBA (4yr, 8 sem, 120 cr hrs)</SelectItem>
                    <SelectItem value="mba" className="text-xs">MBA (2yr, 4 sem, 60 cr hrs)</SelectItem>
                    <SelectItem value="bbabi" className="text-xs">BBA-BI (4yr, 8 sem, 120 cr hrs)</SelectItem>
                    <SelectItem value="emba" className="text-xs">EMBA (2yr, 4 sem, 48 cr hrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                  Fee components (NPR)
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "Admission fee (one-time)", value: adm, set: (v: string) => setAdm(num(v)) },
                    { label: "Tuition fee per semester", value: tui, set: (v: string) => setTui(num(v)) },
                    { label: "Exam fee per semester", value: ex, set: (v: string) => setEx(num(v)) },
                    { label: "Library fee per semester", value: lib, set: (v: string) => setLib(num(v)) },
                    { label: "Activity fee per semester", value: act, set: (v: string) => setAct(num(v)) },
                    { label: "Tech fee per semester", value: tech, set: (v: string) => setTech(num(v)) },
                    { label: "Internship/project fee (once)", value: intern, set: (v: string) => setIntern(num(v)) },
                    { label: "No. of semesters", value: sems, set: (v: string) => setSems(num(v)) },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{row.label}</Label>
                      <Input
                        type="number"
                        value={row.value}
                        onChange={(e) => row.set(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: breakdown + EMI + compliance */}
        <div className="space-y-5">
          {/* Fee breakdown */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Fee breakdown</CardTitle>
                  <span className="text-[10px] text-muted-foreground">per semester</span>
                </div>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-1.5">
                {breakdownRows.map((r) => (
                  <div key={r.label} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-xs font-medium text-foreground">{fmt(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 border-t border-border mt-1">
                  <span className="text-sm font-semibold text-foreground">Total course fee</span>
                  <span className="text-sm font-bold text-foreground">{fmt(totalFee)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2.5 bg-[oklch(0.62_0.18_145)]/10 rounded-xl mt-2">
                  <span className="text-xs font-semibold text-[oklch(0.42_0.18_145)]">Recommended loan amount</span>
                  <span className="text-sm font-bold text-[oklch(0.42_0.18_145)]">{fmt(totalFee)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* EMI calculator */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">EMI calculator</CardTitle>
                  <span className="text-[10px] text-muted-foreground">NRB floating rate</span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Interest rate (% p.a.)", value: emiRate, set: (v: string) => setEmiRate(parseFloat(v) || 9.5) },
                    { label: "Loan tenure (months)", value: emiMonths, set: (v: string) => setEmiMonths(num(v)) },
                    { label: "Moratorium (months)", value: moraMonths, set: (v: string) => setMoraMonths(num(v)) },
                    { label: "Loan amount (NPR)", value: totalFee, set: () => {} },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{f.label}</Label>
                      <Input
                        type="number"
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        readOnly={f.label === "Loan amount (NPR)"}
                        className={`h-8 text-xs ${f.label === "Loan amount (NPR)" ? "bg-muted/40" : ""}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Monthly EMI</span>
                    <span className="text-base font-bold text-[oklch(0.42_0.18_145)]">{fmt(emi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Total interest</span>
                    <span className="text-xs font-semibold text-foreground">{fmt(interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Total repayment</span>
                    <span className="text-xs font-semibold text-foreground">{fmt(totalRepay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">EMI starts (post-moratorium)</span>
                    <span className="text-xs font-medium text-foreground">After {moraMonths} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* NRB compliance */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border shadow-none">
              <CardHeader className="px-5 py-4 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">NRB compliance check</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-2.5">
                {COMPLIANCE_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.42_0.18_145)] shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-snug">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
