"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Zap,
  Users,
  UserCheck,
  ArrowRight,
  Download,
  CheckCircle2,
  ImageIcon,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Landmark } from "lucide-react";

const AGREEMENT_TYPES = [
  { icon: Building2, label: "College–Bank MOU", key: "mou" as const, count: 6 },
  { icon: Zap, label: "College–Unnati MOU", key: "Unnati" as const, count: 1 },
  {
    icon: Users,
    label: "Student loan agreement",
    key: "student" as const,
    count: 28,
  },
  {
    icon: UserCheck,
    label: "Guarantor undertaking",
    key: "guarantor" as const,
    count: 28,
  },
  {
    icon: ArrowRight,
    label: "Disbursement instruction",
    key: "disbursement" as const,
    count: 18,
  },
] as const;

type AgreementKey = (typeof AGREEMENT_TYPES)[number]["key"];

const MOU_STATUS = [
  { name: "NIC Asia Bank", badge: "Active 2082", type: "active" as const },
  { name: "NMB Bank", badge: "Active 2082", type: "active" as const },
  { name: "Unnati", badge: "Active 2083", type: "digital" as const },
  { name: "Laxmi Sunrise", badge: "Active 2082", type: "active" as const },
  { name: "Kumari Bank", badge: "Renew needed", type: "renew" as const },
  { name: "Global IME", badge: "Pending sign", type: "pending" as const },
];

const mouBadgeStyle = {
  active: "bg-[oklch(0.62_0.18_145)]/15 text-[oklch(0.42_0.18_145)] border-0",
  digital:
    "bg-[oklch(0.528_0.113_235.573)]/10 text-[oklch(0.528_0.113_235.573)] border-0",
  renew: "bg-[oklch(0.75_0.18_80)]/15 text-[oklch(0.55_0.18_80)] border-0",
  pending: "bg-destructive/10 text-destructive border-0",
} as const;

const MORATORIUM_LABELS: Record<string, string> = {
  "course+1": "Course duration + 1 year",
  "course+6m": "Course duration + 6 months",
};

const YEARS = ["1st", "2nd", "3rd", "4th"] as const;
const SEMS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

function CertToggle({
  label,
  checked,
  onChange,
  positiveLabel = "Yes",
  negativeLabel = "No",
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  positiveLabel?: string;
  negativeLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-foreground">{label}</span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${checked ? "bg-[oklch(0.62_0.18_145)] text-white border-[oklch(0.62_0.18_145)]" : "bg-transparent text-muted-foreground border-border hover:bg-muted"}`}
        >
          {positiveLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${!checked ? "bg-destructive/80 text-white border-destructive/80" : "bg-transparent text-muted-foreground border-border hover:bg-muted"}`}
        >
          {negativeLabel}
        </button>
      </div>
    </div>
  );
}

function L({ v, p }: { v: string; p: string }) {
  if (v) return <>{v}</>;
  return <span className="text-muted-foreground/40 italic">[{p}]</span>;
}

function Field({
  label,
  children,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={`space-y-1 ${span2 ? "sm:col-span-2" : ""}`}>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function certIcon(v: boolean, positive: boolean) {
  return v === positive ? (
    <span className="text-[oklch(0.42_0.18_145)] font-bold">✓ </span>
  ) : (
    <span className="text-destructive font-bold">✗ </span>
  );
}

export default function AgreementsView() {
  const [activeType, setActiveType] = useState<AgreementKey>("mou");
  const [generated, setGenerated] = useState(false);

  // ── College (shared) ───────────────────────────────────────────────────────
  const [collegeName, setCollegeName] = useState("");
  const [collegeAddress, setCollegeAddress] = useState("");
  const [collegeRegNo, setCollegeRegNo] = useState("");
  const [collegeAffiliation, setCollegeAffiliation] = useState("");
  const [collegePhone, setCollegePhone] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [collegeWebsite, setCollegeWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const logoFileRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
      setLogoFileName(file.name);
    };
    reader.readAsDataURL(file);
  }
  function clearLogo() {
    setLogoUrl("");
    setLogoFileName("");
    if (logoFileRef.current) logoFileRef.current.value = "";
  }

  // ── Document (shared) ──────────────────────────────────────────────────────
  const [refNo, setRefNo] = useState(
    () => `AGR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  );
  const [issuedDateAD, setIssuedDateAD] = useState("");
  const [issuedDateBS, setIssuedDateBS] = useState("");

  // ── MOU fields ─────────────────────────────────────────────────────────────
  const [bank, setBank] = useState("NIC Asia Bank Ltd.");
  const [branchManager, setBranchManager] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [maxLoan, setMaxLoan] = useState("");
  const [rate, setRate] = useState("");
  const [moratorium, setMoratorium] = useState("course+1");
  const [validYears, setValidYears] = useState("2");
  const [executionDate, setExecutionDate] = useState("");

  // ── Student fields ─────────────────────────────────────────────────────────
  const [studentName, setStudentName] = useState("");
  const [tuRollNo, setTuRollNo] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [programName, setProgramName] = useState("");
  const [currentYear, setCurrentYear] = useState("1st");
  const [currentSem, setCurrentSem] = useState("1");
  const [academicYearBS, setAcademicYearBS] = useState("2081-082");
  const [studentStatus, setStudentStatus] = useState("Active");

  // ── Certifications ─────────────────────────────────────────────────────────
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [hasBacklogs, setHasBacklogs] = useState(false);
  const [disciplinaryHold, setDisciplinaryHold] = useState(false);
  const [feeDueRs, setFeeDueRs] = useState<number | "">(0);

  // ── QR ─────────────────────────────────────────────────────────────────────
  const [qrToken, setQrToken] = useState(
    () => `AGR-${String(Date.now()).slice(-8)}`,
  );
  const [qrVerifyUrl, setQrVerifyUrl] = useState(
    () => `verify.Unnati.com.np/doc/AGR-${String(Date.now()).slice(-8)}`,
  );

  const feeDue = feeDueRs === "" ? 0 : Number(feeDueRs);
  const today = new Date().toLocaleDateString("en-NP", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const displayDate = issuedDateAD || today;
  const isMOU = activeType === "mou" || activeType === "Unnati";
  const isStudent = !isMOU;
  const typeLabel =
    AGREEMENT_TYPES.find((a) => a.key === activeType)?.label ?? "Agreement";

  const logoHtmlSnippet = logoUrl
    ? `<img src="${logoUrl}" alt="" style="height:52px;object-fit:contain;margin-right:12px">`
    : `<div style="width:50px;height:50px;background:#dcfce7;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:12px;font-size:18px;font-weight:800;color:#166534">${collegeName.charAt(0) || "?"}</div>`;

  const collegeMetaHtml =
    [
      collegeAffiliation ? `Affiliated to ${collegeAffiliation}` : "",
      collegeRegNo ? `Reg. No.: ${collegeRegNo}` : "",
    ]
      .filter(Boolean)
      .join(" | ") +
    (collegeAddress ? `<br>${collegeAddress}` : "") +
    ([collegePhone, collegeEmail, collegeWebsite].filter(Boolean).length
      ? `<br>${[collegePhone, collegeEmail, collegeWebsite].filter(Boolean).join(" · ")}`
      : "");

  // ── PDF: MOU ───────────────────────────────────────────────────────────────
  const handleDownloadMOU = () => {
    if (!collegeName) {
      toast.error("Fill in college name.");
      return;
    }
    const partyBName = activeType === "Unnati" ? "Unnati Pvt. Ltd." : bank;
    const clauses = [
      `${collegeName} shall verify student enrollment and issue certified documents via the Unnati platform, acting as facilitating intermediary only.`,
      `${partyBName} shall offer education loans up to ${maxLoan || "[Max Loan]"} at ${rate || "[Rate]"} with moratorium equal to ${MORATORIUM_LABELS[moratorium] ?? moratorium}.`,
      `Unnati Pvt. Ltd. shall provide the digital platform for document generation, QR verification, and application dispatch, charging 0.25% origination fee per disbursed loan.`,
      `Loan disbursements shall be made directly to ${collegeName}'s designated fee account at ${partyBName} in semester tranches.`,
      `${collegeName} shall notify ${partyBName} and Unnati of any student dropout or suspension within 15 days.`,
      `This MOU is valid for ${validYears} year${validYears !== "1" ? "s" : ""} from execution date${executionDate ? ` (${executionDate})` : ""}, renewable by mutual consent 30 days prior to expiry.`,
    ]
      .map(
        (c, i) =>
          `<div style="display:flex;gap:10px;margin-bottom:9px"><span style="font-weight:700;min-width:16px">${i + 1}.</span><p style="margin:0;font-size:9.5pt;color:#374151;line-height:1.65">${c}</p></div>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MOU — ${collegeName}</title>
<style>@page{size:A4;margin:18mm 20mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Times New Roman",Times,serif;font-size:11pt;color:#111;line-height:1.55}.hdr{border-bottom:2.5px solid #15c35b;padding-bottom:12px;margin-bottom:12px;display:flex;align-items:center}.cn{font-size:13.5pt;font-weight:800;color:#0a7a38;text-transform:uppercase}.cm{font-size:8.5pt;color:#6b7280;margin-top:3px;line-height:1.4}.mr{display:flex;justify-content:space-between;font-size:9pt;color:#6b7280;margin-bottom:10px}.tb{background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;padding:9px;margin-bottom:13px;border-radius:4px}.tb h2{font-size:12pt;color:#166534;font-weight:700}.tb p{font-size:9pt;color:#166534;margin-top:2px}.pg{display:grid;grid-template-columns:1fr 40px 1fr;gap:10px;align-items:center;margin-bottom:10px}.pb{border:1px solid #d1d5db;border-radius:6px;padding:9px 13px}.pn{font-size:10pt;font-weight:700}.pl{font-size:8pt;color:#6b7280;margin-top:2px}.pc{text-align:center;font-size:9pt;color:#6366f1;font-weight:600;margin-bottom:13px}.terms{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}h3{font-size:10pt;font-weight:700;margin-bottom:9px;border-bottom:1px solid #e5e7eb;padding-bottom:5px}table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:9.5pt}td,th{padding:6px 10px;border:1px solid #d1d5db}thead tr{background:#15803d;color:#fff}.cb{background:#f0fdf4;border-left:3px solid #22c55e;padding:9px 13px;margin-bottom:14px;font-size:8.5pt;line-height:1.65;border-radius:0 4px 4px 0}.sigs{display:flex;justify-content:space-between;margin-top:32px;padding-top:12px;border-top:1px solid #d1d5db}.sig{text-align:center;width:30%;font-size:9pt}.sl{border-top:1px solid #9ca3af;margin:38px 10px 6px}.sn{font-weight:700}.ss{font-size:8pt;color:#6b7280}.ft{text-align:center;font-size:8pt;color:#9ca3af;margin-top:16px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
</head><body>
<div class="hdr">${logoHtmlSnippet}<div><div class="cn">${collegeName}</div><div class="cm">${collegeMetaHtml}</div></div></div>
<div class="mr"><span><strong>Ref. No.:</strong> ${refNo}</span><span><strong>Date:</strong> ${displayDate}${issuedDateBS ? ` / ${issuedDateBS} BS` : ""}</span></div>
<div class="tb"><h2>TRIPARTITE MEMORANDUM OF UNDERSTANDING</h2><p>Education Loan Facilitation Agreement · NRB Compliant</p></div>
<div class="pg">
  <div class="pb"><div class="pn">${collegeName}</div><div class="pl">Party A — Facilitating Institution${collegeRegNo ? `<br>Reg. ${collegeRegNo}` : ""}</div></div>
  <div style="text-align:center;font-size:9pt;font-weight:700;color:#6b7280">AND</div>
  <div class="pb"><div class="pn">${partyBName}</div><div class="pl">Party B — Lending Institution</div></div>
</div>
<div class="pc">+ Unnati Pvt. Ltd. (Party C — Digital Platform Intermediary)</div>
<div class="terms"><h3>Key Terms</h3><table><thead><tr><th style="width:42%">Parameter</th><th>Value</th></tr></thead><tbody>
<tr><td style="color:#6b7280">Maximum Loan per Student</td><td style="font-weight:600">${maxLoan || "—"}</td></tr>
<tr style="background:#f9fafb"><td style="color:#6b7280">Interest Rate</td><td style="font-weight:600">${rate || "—"}</td></tr>
<tr><td style="color:#6b7280">Moratorium Period</td><td style="font-weight:600">${MORATORIUM_LABELS[moratorium] ?? moratorium}</td></tr>
<tr style="background:#f9fafb"><td style="color:#6b7280">MOU Validity</td><td style="font-weight:600">${validYears} year${validYears !== "1" ? "s" : ""} from execution</td></tr>
</tbody></table></div>
<h3>Agreement Clauses</h3>${clauses}
<div class="cb"><strong>Digital Verification:</strong> ${qrVerifyUrl} · Token: ${qrToken}</div>
<div class="sigs">
  <div class="sig"><div class="sl"></div><div class="sn">${principalName || "Principal"}</div><div class="ss">${collegeName}</div><div class="ss">Party A</div></div>
  <div class="sig"><div class="sl"></div><div class="sn">${branchManager || "Branch Manager"}</div><div class="ss">${partyBName}</div><div class="ss">Party B</div></div>
  <div class="sig"><div class="sl"></div><div class="sn">CEO / Authorised Rep.</div><div class="ss">Unnati Pvt. Ltd.</div><div class="ss">Party C</div></div>
</div>
<div class="ft">Generated via Unnati Digital Platform · NRB Unified Directive 2081</div>
<script>window.onload=function(){setTimeout(function(){window.print();window.onfocus=function(){window.close();}},200);}</script>
</body></html>`;
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked.");
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  // ── PDF: Student agreement ─────────────────────────────────────────────────
  const handleDownloadStudentAgreement = () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name.");
      return;
    }
    const certRows = [
      [
        "Currently Enrolled",
        isEnrolled ? "✓ Yes — Confirmed" : "✗ Not confirmed",
      ],
      ["Academic Backlogs", hasBacklogs ? "✗ Yes (has backlogs)" : "✓ None"],
      ["Disciplinary Hold", disciplinaryHold ? "✗ Yes" : "✓ None"],
      [
        "Fee Dues (NPR)",
        feeDue > 0 ? `Rs ${feeDue.toLocaleString("en-IN")}` : "✓ Nil",
      ],
    ]
      .map(
        ([f, v], i) =>
          `<tr style="background:${i % 2 === 1 ? "#f9fafb" : "#fff"}"><td style="padding:6px 10px;border:1px solid #d1d5db;width:45%;color:#6b7280">${f}</td><td style="padding:6px 10px;border:1px solid #d1d5db;font-weight:500">${v}</td></tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${typeLabel} — ${studentName}</title>
<style>@page{size:A4;margin:18mm 20mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Times New Roman",Times,serif;font-size:11pt;color:#111;line-height:1.6}.hdr{border-bottom:2.5px solid #15c35b;padding-bottom:12px;margin-bottom:12px;display:flex;align-items:center}.cn{font-size:13.5pt;font-weight:800;color:#0a7a38;text-transform:uppercase}.cm{font-size:8.5pt;color:#6b7280;margin-top:3px}.mr{display:flex;justify-content:space-between;font-size:9pt;color:#6b7280;margin-bottom:10px}.tb{background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;padding:9px;margin-bottom:12px;border-radius:4px}.tb h2{font-size:12pt;color:#166534;font-weight:700}.tb p{font-size:9pt;color:#166534;margin-top:2px}.bt{font-size:10pt;margin-bottom:12px;line-height:1.7;text-align:justify}table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:9.5pt}thead tr{background:#15803d;color:#fff}thead th{padding:7px 10px;text-align:left}h3{font-size:10pt;font-weight:700;margin-bottom:7px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}.cb{background:#f0fdf4;border-left:3px solid #22c55e;padding:9px 13px;margin-bottom:14px;font-size:8.5pt;line-height:1.65;border-radius:0 4px 4px 0}.sigs{display:flex;justify-content:space-between;margin-top:36px;padding-top:12px;border-top:1px solid #d1d5db}.sig{text-align:center;width:30%;font-size:9pt}.sl{border-top:1px solid #9ca3af;margin:38px 10px 6px}.sn{font-weight:700}.ss{font-size:8pt;color:#6b7280}.ft{text-align:center;font-size:8pt;color:#9ca3af;margin-top:16px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
</head><body>
<div class="hdr">${logoHtmlSnippet}<div><div class="cn">${collegeName}</div><div class="cm">${collegeMetaHtml}</div></div></div>
<div class="mr"><span><strong>Ref. No.:</strong> ${refNo}</span><span><strong>Date:</strong> ${displayDate}${issuedDateBS ? ` / ${issuedDateBS} BS` : ""}</span></div>
<div class="tb"><h2>${typeLabel.toUpperCase()}</h2><p>${programName || "Education Loan"} · ${collegeName} · NRB Compliant</p></div>
<div class="bt">This certifies that <strong>${studentName}</strong> is a bona fide student of <strong>${collegeName}</strong>${collegeAffiliation ? `, affiliated to ${collegeAffiliation},` : ","} enrolled in <strong>${programName || "—"}</strong> (${currentYear} Year / Semester ${currentSem}, Academic Year ${academicYearBS}). Status: <strong>${studentStatus}</strong>.<br><br>This document is issued for education loan processing and constitutes the college's formal certification of the student's eligibility.</div>
<h3>Student Details</h3>
<table><thead><tr><th style="width:42%">Field</th><th>Detail</th></tr></thead><tbody>
${[
  ["Student Name", studentName],
  ["TU / Univ. Roll No.", tuRollNo || "—"],
  ["Enrollment No.", enrollmentNo || "—"],
  ["Program / Course", programName || "—"],
  ["Year / Semester", `${currentYear} Year · Sem ${currentSem}`],
  ["Academic Year (BS)", academicYearBS],
  ["Enrollment Status", studentStatus],
]
  .map(
    ([f, v], i) =>
      `<tr style="background:${i % 2 === 1 ? "#f9fafb" : "#fff"}"><td style="padding:6px 10px;border:1px solid #d1d5db;color:#6b7280">${f}</td><td style="padding:6px 10px;border:1px solid #d1d5db;font-weight:500">${v}</td></tr>`,
  )
  .join("")}
</tbody></table>
<h3>College Certifications for Bank</h3>
<table><thead><tr><th style="width:45%">Certification</th><th>Status</th></tr></thead><tbody>${certRows}</tbody></table>
<div class="cb"><strong>College Certification:</strong> ${collegeName} certifies all above information to be true.<br><strong style="color:#166534">${qrVerifyUrl}</strong> · Token: <strong>${qrToken}</strong></div>
<div class="sigs">
  <div class="sig"><div class="sl"></div><div class="sn">Registrar / Academic Officer</div><div class="ss">${collegeName}</div></div>
  <div class="sig"><div class="sl"></div><div class="sn">Principal / Campus Chief</div><div class="ss">${collegeName} [Stamp]</div></div>
  <div class="sig"><div class="sl"></div><div class="sn">Student Signature</div><div class="ss">${studentName}</div></div>
</div>
<div class="ft">Generated via Unnati Digital Platform · NRB Unified Directive 2081</div>
<script>window.onload=function(){setTimeout(function(){window.print();window.onfocus=function(){window.close();}},200);}</script>
</body></html>`;
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked.");
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const handleDownload = () =>
    isMOU ? handleDownloadMOU() : handleDownloadStudentAgreement();

  const handleGenerate = () => {
    if (!collegeName) {
      toast.error("Fill in college name first.");
      return;
    }
    if (isStudent && !studentName) {
      toast.error("Fill in student name.");
      return;
    }
    setGenerated(true);
    toast.success("Agreement ready", {
      description: "Click Download PDF to save.",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-bold text-foreground">Agreements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select an agreement type — the form and live preview update
          accordingly.
        </p>
      </motion.div>

      {/* Agreement type switcher — full width, above the form/preview split */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-5"
      >
        <Tabs
          value={activeType}
          onValueChange={(v) => {
            setActiveType(v as AgreementKey);
            setGenerated(false);
          }}
        >
          <TabsList className="w-full h-auto p-1 flex-wrap justify-start gap-1 bg-muted/60">
            {AGREEMENT_TYPES.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="gap-1.5 text-xs py-1.5 px-3"
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                <Badge variant="outline" className="text-[9px] ml-0.5 px-1.5">
                  {t.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Col 1: Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          key={activeType}
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {typeLabel}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preview updates live as you fill the form.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Landmark className="w-3.5 h-3.5" /> MOU Status
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64">
                      <p className="text-xs font-semibold text-foreground px-0.5 pb-1">
                        Bank &amp; platform MOUs
                      </p>
                      {MOU_STATUS.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-center justify-between px-0.5 py-1"
                        >
                          <span className="text-xs text-foreground">
                            {m.name}
                          </span>
                          <Badge
                            className={`text-[9px] font-semibold ${mouBadgeStyle[m.type]}`}
                          >
                            {m.badge}
                          </Badge>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleDownload}
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* College — always visible */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                  College / Institution (Party A)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Institution name *">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Ace Institute of Management"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                    />
                  </Field>
                  <Field label="Address">
                    <Input
                      className="h-8 text-xs"
                      placeholder="City / Street"
                      value={collegeAddress}
                      onChange={(e) => setCollegeAddress(e.target.value)}
                    />
                  </Field>
                  <Field label="Registration no.">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2/059/060"
                      value={collegeRegNo}
                      onChange={(e) => setCollegeRegNo(e.target.value)}
                    />
                  </Field>
                  <Field label="Affiliation">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Pokhara University"
                      value={collegeAffiliation}
                      onChange={(e) => setCollegeAffiliation(e.target.value)}
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      className="h-8 text-xs"
                      placeholder="+977-1-XXXXXXX"
                      value={collegePhone}
                      onChange={(e) => setCollegePhone(e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      className="h-8 text-xs"
                      placeholder="info@college.edu.np"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                    />
                  </Field>
                  <Field label="Website">
                    <Input
                      className="h-8 text-xs"
                      placeholder="www.college.edu.np"
                      value={collegeWebsite}
                      onChange={(e) => setCollegeWebsite(e.target.value)}
                    />
                  </Field>
                  {/* Logo */}
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] text-muted-foreground">
                      College logo
                    </Label>
                    <div className="flex gap-2 items-center">
                      <input
                        ref={logoFileRef}
                        type="file"
                        accept="image/*"
                        aria-label="Upload college logo"
                        className="hidden"
                        onChange={handleLogoFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => logoFileRef.current?.click()}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {logoFileName ? "Change image" : "Upload image"}
                      </Button>
                      {logoFileName && (
                        <span className="text-[10px] text-muted-foreground truncate flex-1">
                          {logoFileName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">
                        or paste URL
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <Input
                      className="h-8 text-xs"
                      placeholder="https://..."
                      value={logoFileName ? "" : logoUrl}
                      disabled={!!logoFileName}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    {logoUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-10 w-10 object-contain rounded bg-white p-0.5 border border-border shrink-0"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <p className="text-[10px] text-foreground flex-1 truncate">
                          {logoFileName || "Logo from URL"}
                        </p>
                        <button
                          type="button"
                          aria-label="Remove logo"
                          onClick={clearLogo}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Document — always visible */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                  Document
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Reference no.">
                    <Input
                      className="h-8 text-xs"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                    />
                  </Field>
                  <Field label="Issued date (AD)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2024-09-01"
                      value={issuedDateAD}
                      onChange={(e) => setIssuedDateAD(e.target.value)}
                    />
                  </Field>
                  <Field label="Issued date (BS)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2081 Bhadra 16"
                      value={issuedDateBS}
                      onChange={(e) => setIssuedDateBS(e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <Separator />

              {/* MOU fields */}
              {isMOU && (
                <>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                      {activeType === "Unnati"
                        ? "Unnati (Party B)"
                        : "Bank / Lender (Party B)"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeType === "mou" ? (
                        <Field label="Bank">
                          <Select value={bank} onValueChange={setBank}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "NIC Asia Bank Ltd.",
                                "NMB Bank Ltd.",
                                "Laxmi Sunrise Bank Ltd.",
                                "Kumari Bank Ltd.",
                                "Global IME Bank Ltd.",
                              ].map((b) => (
                                <SelectItem
                                  key={b}
                                  value={b}
                                  className="text-xs"
                                >
                                  {b}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      ) : (
                        <Field label="Party B">
                          <Input
                            className="h-8 text-xs bg-muted/40"
                            value="Unnati Pvt. Ltd."
                            readOnly
                          />
                        </Field>
                      )}
                      <Field label="Branch manager / Signatory">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Full name"
                          value={branchManager}
                          onChange={(e) => setBranchManager(e.target.value)}
                        />
                      </Field>
                      <Field label="College authorized signatory">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Principal / Campus Chief"
                          value={principalName}
                          onChange={(e) => setPrincipalName(e.target.value)}
                        />
                      </Field>
                      <Field label="Execution date (BS)">
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. 2081 Ashadh 15"
                          value={executionDate}
                          onChange={(e) => setExecutionDate(e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                      Loan Terms
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Max loan per student (NPR)">
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. Rs 10,00,000"
                          value={maxLoan}
                          onChange={(e) => setMaxLoan(e.target.value)}
                        />
                      </Field>
                      <Field label="Interest rate">
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. 9.5% p.a. floating"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                        />
                      </Field>
                      <Field label="Moratorium period">
                        <Select
                          value={moratorium}
                          onValueChange={setMoratorium}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="course+1" className="text-xs">
                              Course duration + 1 year
                            </SelectItem>
                            <SelectItem value="course+6m" className="text-xs">
                              Course duration + 6 months
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="MOU validity (years)">
                        <Select
                          value={validYears}
                          onValueChange={setValidYears}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1" className="text-xs">
                              1 year
                            </SelectItem>
                            <SelectItem value="2" className="text-xs">
                              2 years
                            </SelectItem>
                            <SelectItem value="3" className="text-xs">
                              3 years
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Student fields */}
              {isStudent && (
                <>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                      Student
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Full name *">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Student's full name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                        />
                      </Field>
                      <Field label="Program / Course">
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. BBA"
                          value={programName}
                          onChange={(e) => setProgramName(e.target.value)}
                        />
                      </Field>
                      <Field label="TU / University roll no.">
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. 1234567"
                          value={tuRollNo}
                          onChange={(e) => setTuRollNo(e.target.value)}
                        />
                      </Field>
                      <Field label="Enrollment no.">
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. AIM-BBA-2081-0041"
                          value={enrollmentNo}
                          onChange={(e) => setEnrollmentNo(e.target.value)}
                        />
                      </Field>
                      <Field label="Current year">
                        <Select
                          value={currentYear}
                          onValueChange={setCurrentYear}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {YEARS.map((y) => (
                              <SelectItem key={y} value={y} className="text-xs">
                                {y} Year
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Current semester">
                        <Select
                          value={currentSem}
                          onValueChange={setCurrentSem}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEMS.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                Semester {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Academic year (BS)">
                        <Select
                          value={academicYearBS}
                          onValueChange={setAcademicYearBS}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "2080-081",
                              "2081-082",
                              "2082-083",
                              "2083-084",
                            ].map((y) => (
                              <SelectItem key={y} value={y} className="text-xs">
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Status">
                        <Select
                          value={studentStatus}
                          onValueChange={setStudentStatus}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Active", "On Leave", "Suspended"].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                      Certifications (College declares)
                    </p>
                    <div className="rounded-lg border border-border overflow-hidden mb-3">
                      <CertToggle
                        label="Student is currently enrolled"
                        checked={isEnrolled}
                        onChange={setIsEnrolled}
                      />
                      <CertToggle
                        label="Has academic backlogs"
                        checked={hasBacklogs}
                        onChange={setHasBacklogs}
                      />
                      <CertToggle
                        label="Disciplinary hold on record"
                        checked={disciplinaryHold}
                        onChange={setDisciplinaryHold}
                      />
                    </div>
                    <Field label="Pending fee dues (NPR) — 0 = no dues">
                      <Input
                        className="h-8 text-xs"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={feeDueRs}
                        onChange={(e) =>
                          setFeeDueRs(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  </div>
                  <Separator />
                </>
              )}

              {/* QR — always visible */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                  QR / Verification
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Token">
                    <Input
                      className="h-8 text-xs font-mono"
                      value={qrToken}
                      onChange={(e) => {
                        setQrToken(e.target.value);
                        setQrVerifyUrl(
                          `verify.Unnati.com.np/doc/${e.target.value}`,
                        );
                      }}
                    />
                  </Field>
                  <Field label="Verify URL">
                    <Input
                      className="h-8 text-xs font-mono"
                      value={qrVerifyUrl}
                      onChange={(e) => setQrVerifyUrl(e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {generated && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[oklch(0.62_0.18_145)]/10 rounded-xl border border-[oklch(0.62_0.18_145)]/20">
                  <CheckCircle2 className="w-4 h-4 text-[oklch(0.42_0.18_145)] shrink-0" />
                  <p className="text-xs text-[oklch(0.42_0.18_145)] font-medium">
                    Agreement ready.{" "}
                    <button
                      type="button"
                      className="underline"
                      onClick={handleDownload}
                    >
                      Download PDF
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Col 2: Live preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          key={`preview-${activeType}`}
          className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto"
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-foreground">
                  Live document preview
                </CardTitle>
                <span className="text-[9px] text-muted-foreground">
                  {typeLabel}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="bg-white rounded-lg p-4 font-mono text-[9.5px] border border-border shadow-sm leading-relaxed">
                {/* Letterhead */}
                <div className="border-b-2 border-primary pb-3 mb-3 flex items-start gap-2">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="logo"
                      className="h-9 w-9 object-contain shrink-0 rounded"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0">
                      {collegeName.charAt(0) || "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-[10.5px] font-extrabold text-primary uppercase tracking-wide leading-tight">
                      <L v={collegeName} p="College Name" />
                    </p>
                    <p className="text-[8px] text-muted-foreground mt-0.5 leading-snug">
                      {collegeAffiliation && (
                        <>Affiliated to {collegeAffiliation}</>
                      )}
                      {collegeRegNo && <> · Reg. {collegeRegNo}</>}
                      {collegeAddress && (
                        <>
                          <br />
                          {collegeAddress}
                        </>
                      )}
                      {(collegePhone || collegeEmail) && (
                        <>
                          <br />
                          {[collegePhone, collegeEmail]
                            .filter(Boolean)
                            .join(" · ")}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-[8px] text-muted-foreground mb-2">
                  <span>
                    <strong>Ref.:</strong> {refNo}
                  </span>
                  <span>
                    <strong>Date:</strong> {displayDate}
                    {issuedDateBS && ` / ${issuedDateBS} BS`}
                  </span>
                </div>

                <div className="bg-primary/10 text-center py-1.5 mb-3 rounded">
                  <p className="text-[9.5px] font-bold text-primary">
                    {typeLabel.toUpperCase()}
                  </p>
                  {isMOU && (
                    <p className="text-[8px] text-primary/70">
                      NRB Compliant · Education Loan Facilitation
                    </p>
                  )}
                  {isStudent && (
                    <p className="text-[8px] text-primary/70">
                      <L v={programName} p="Program" /> ·{" "}
                      <L v={collegeName} p="College" />
                    </p>
                  )}
                </div>

                {/* MOU preview */}
                {isMOU && (
                  <>
                    <div className="grid grid-cols-[1fr_28px_1fr] gap-2 items-center mb-2">
                      <div className="border border-border rounded-lg p-2">
                        <p className="text-[9px] font-bold">
                          <L v={collegeName} p="College" />
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          Party A
                        </p>
                      </div>
                      <p className="text-center text-[8px] font-bold text-muted-foreground">
                        AND
                      </p>
                      <div className="border border-border rounded-lg p-2">
                        <p className="text-[9px] font-bold">
                          {activeType === "Unnati" ? "Unnati Pvt. Ltd." : bank}
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          Party B
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-[8px] text-[oklch(0.528_0.113_235.573)] font-semibold mb-2">
                      + Unnati Pvt. Ltd. (Party C)
                    </p>
                    <table className="w-full text-[8px] border-collapse mb-2">
                      <tbody>
                        {[
                          ["Max Loan", maxLoan || "—"],
                          ["Rate", rate || "—"],
                          [
                            "Moratorium",
                            MORATORIUM_LABELS[moratorium] ?? moratorium,
                          ],
                          [
                            "Validity",
                            `${validYears} yr${validYears !== "1" ? "s" : ""}`,
                          ],
                        ].map(([k, v], i) => (
                          <tr
                            key={k}
                            className={i % 2 === 1 ? "bg-muted/40" : ""}
                          >
                            <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[40%]">
                              {k}
                            </td>
                            <td className="px-1.5 py-0.5 border border-border/50 font-semibold">
                              {v}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-[oklch(0.62_0.18_145)]/8 border-l-2 border-[oklch(0.62_0.18_145)] px-2 py-1.5 mb-2 rounded-r text-[8px]">
                      <span className="text-primary">
                        QR: {qrVerifyUrl} · {qrToken}
                      </span>
                    </div>
                    <div className="flex justify-between mt-3 pt-2 border-t border-border">
                      {[
                        {
                          n: principalName || "Principal",
                          o: collegeName || "College",
                          p: "Party A",
                        },
                        {
                          n: branchManager || "Manager",
                          o: activeType === "Unnati" ? "Unnati" : bank,
                          p: "Party B",
                        },
                        { n: "CEO", o: "Unnati", p: "Party C" },
                      ].map((s) => (
                        <div
                          key={s.p}
                          className="flex-1 text-center text-[7.5px]"
                        >
                          <div className="border-t border-muted-foreground/30 mt-5 mb-1" />
                          <p className="font-bold text-foreground">{s.n}</p>
                          <p className="text-muted-foreground">{s.o}</p>
                          <p className="text-muted-foreground">{s.p}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Student agreement preview */}
                {isStudent && (
                  <>
                    <p className="text-[8.5px] text-muted-foreground leading-snug mb-2">
                      This certifies that{" "}
                      <strong className="text-foreground">
                        <L v={studentName} p="Student name" />
                      </strong>{" "}
                      is enrolled in{" "}
                      <strong className="text-foreground">
                        <L v={programName} p="Program" />
                      </strong>{" "}
                      at{" "}
                      <strong className="text-foreground">
                        <L v={collegeName} p="College" />
                      </strong>{" "}
                      — {currentYear} Year / Sem {currentSem}, AY{" "}
                      {academicYearBS}. Status:{" "}
                      <strong className="text-foreground">
                        {studentStatus}
                      </strong>
                      .
                    </p>
                    <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                      Student Details
                    </p>
                    <table className="w-full text-[8px] border-collapse mb-2">
                      <tbody>
                        {[
                          ["Name", studentName || "—"],
                          ["TU Roll", tuRollNo || "—"],
                          ["Enroll. No", enrollmentNo || "—"],
                          ["Program", programName || "—"],
                          ["Yr / Sem", `${currentYear} · Sem ${currentSem}`],
                          ["AY (BS)", academicYearBS],
                          ["Status", studentStatus],
                        ].map(([f, v], i) => (
                          <tr
                            key={f}
                            className={i % 2 === 1 ? "bg-muted/30" : ""}
                          >
                            <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[38%]">
                              {f}
                            </td>
                            <td className="px-1.5 py-0.5 border border-border/50 font-medium">
                              {v}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                      <ShieldCheck className="w-3 h-3 inline mr-0.5 text-[oklch(0.42_0.18_145)]" />{" "}
                      Certifications
                    </p>
                    <table className="w-full text-[8px] border-collapse mb-2">
                      <tbody>
                        {[
                          {
                            label: "Enrolled",
                            v: certIcon(isEnrolled, true),
                            t: isEnrolled ? "Yes" : "No",
                          },
                          {
                            label: "Backlogs",
                            v: certIcon(hasBacklogs, false),
                            t: hasBacklogs ? "Yes" : "None",
                          },
                          {
                            label: "Disciplinary Hold",
                            v: certIcon(disciplinaryHold, false),
                            t: disciplinaryHold ? "Yes" : "None",
                          },
                          {
                            label: "Fee Dues",
                            v: certIcon(feeDue === 0, true),
                            t:
                              feeDue > 0
                                ? `Rs ${feeDue.toLocaleString("en-IN")}`
                                : "Nil",
                          },
                        ].map(({ label, v, t }, i) => (
                          <tr
                            key={label}
                            className={i % 2 === 1 ? "bg-muted/30" : ""}
                          >
                            <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[40%]">
                              {label}
                            </td>
                            <td className="px-1.5 py-0.5 border border-border/50">
                              {v}
                              {t}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-[oklch(0.62_0.18_145)]/8 border-l-2 border-[oklch(0.62_0.18_145)] px-2 py-1.5 mb-2 rounded-r text-[8px]">
                      <strong>Verified:</strong>{" "}
                      <L v={collegeName} p="College" />
                      <br />
                      <span className="text-primary">
                        QR: {qrVerifyUrl} · {qrToken}
                      </span>
                    </div>
                    <div className="flex justify-between mt-3 pt-2 border-t border-border">
                      {["Registrar", "Principal [Stamp]", "Student"].map(
                        (sig) => (
                          <div
                            key={sig}
                            className="flex-1 text-center text-[7.5px]"
                          >
                            <div className="border-t border-muted-foreground/30 mt-5 mb-1" />
                            <p className="font-bold text-foreground text-[8px]">
                              {sig}
                            </p>
                            <p className="text-muted-foreground">
                              {sig === "Student"
                                ? studentName || "Student"
                                : collegeName || "College"}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}

                <p className="text-[7.5px] text-muted-foreground text-center mt-2">
                  Generated via Unnati Digital Platform · NRB Unified Directive
                  2081
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
