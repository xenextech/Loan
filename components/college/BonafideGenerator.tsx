"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  User,
  ShieldCheck,
  Link2,
  Download,
  CheckCircle2,
  X,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateAgreementMutation } from "@/lib/api/templateApi";
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

// ─── Section TOC ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "sec-college",      icon: Building2,   label: "College / Institution" },
  { id: "sec-document",     icon: FileText,    label: "Document"              },
  { id: "sec-student",      icon: User,        label: "Student"               },
  { id: "sec-certs",        icon: ShieldCheck, label: "Certifications"        },
  { id: "sec-qr",           icon: Link2,       label: "QR / Verification"     },
];

// ─── Cert toggle row ─────────────────────────────────────────────────────────
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
          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
            checked
              ? "bg-[oklch(0.62_0.18_145)] text-white border-[oklch(0.62_0.18_145)]"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {positiveLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
            !checked
              ? "bg-destructive/80 text-white border-destructive/80"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
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

function SectionHead({ id, label }: { id: string; label: string }) {
  return (
    <p
      id={id}
      className="text-sm font-bold text-black uppercase tracking-wider mb-3 pb-2 border-b border-border scroll-mt-6"
    >
      {label}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const YEARS  = ["1st", "2nd", "3rd", "4th"] as const;
const SEMS   = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const STATUS = ["Active", "On Leave", "Suspended"] as const;

function certIcon(v: boolean, positive: boolean) {
  return v === positive
    ? <span className="text-[oklch(0.42_0.18_145)] font-bold">✓</span>
    : <span className="text-destructive font-bold">✗</span>;
}

export default function AgreementGenerator() {
  // ── College ────────────────────────────────────────────────────────────────
  const [collegeName,        setCollegeName]        = useState("");
  const [collegeAddress,     setCollegeAddress]     = useState("");
  const [collegeRegNo,       setCollegeRegNo]       = useState("");
  const [collegeAffiliation, setCollegeAffiliation] = useState("");
  const [collegePhone,       setCollegePhone]       = useState("");
  const [collegeEmail,       setCollegeEmail]       = useState("");
  const [collegeWebsite,     setCollegeWebsite]     = useState("");
  const [logoUrl,            setLogoUrl]            = useState("");
  const [logoFileName,       setLogoFileName]       = useState("");
  const logoFileRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => { setLogoUrl(ev.target?.result as string); setLogoFileName(file.name); };
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    setLogoUrl(""); setLogoFileName("");
    if (logoFileRef.current) logoFileRef.current.value = "";
  }

  // ── Document ───────────────────────────────────────────────────────────────
  const [refNo,        setRefNo]        = useState(() => `Agreement-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
  const [issuedDateAD, setIssuedDateAD] = useState("");
  const [issuedDateBS, setIssuedDateBS] = useState("");

  // ── Student ────────────────────────────────────────────────────────────────
  const [studentName,    setStudentName]    = useState("");
  const [tuRollNo,       setTuRollNo]       = useState("");
  const [enrollmentNo,   setEnrollmentNo]   = useState("");
  const [programName,    setProgramName]    = useState("");
  const [currentYear,    setCurrentYear]    = useState("1st");
  const [currentSem,     setCurrentSem]     = useState("1");
  const [academicYearBS, setAcademicYearBS] = useState("2081-082");
  const [studentStatus,  setStudentStatus]  = useState("Active");

  // ── Certifications ─────────────────────────────────────────────────────────
  const [isEnrolled,       setIsEnrolled]       = useState(true);
  const [hasBacklogs,      setHasBacklogs]      = useState(false);
  const [disciplinaryHold, setDisciplinaryHold] = useState(false);
  const [feeDueRs,         setFeeDueRs]         = useState<number | "">(0);

  // ── QR ─────────────────────────────────────────────────────────────────────
  const [qrToken,     setQrToken]     = useState(() => `BON-${String(Date.now()).slice(-8)}`);
  const [qrVerifyUrl, setQrVerifyUrl] = useState(() => `verify.genzloan.com.np/doc/BON-${String(Date.now()).slice(-8)}`);

  const [generated, setGenerated] = useState(false);
  const [savedId,   setSavedId]   = useState<string | null>(null);
  const [createAgreement, { isLoading: isSaving }] = useCreateAgreementMutation();

  const today = new Date().toLocaleDateString("en-NP", { day: "numeric", month: "long", year: "numeric" });
  const displayDate = issuedDateAD || today;
  const feeDue = feeDueRs === "" ? 0 : Number(feeDueRs);

  const handleSave = async () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name before saving.");
      return;
    }
    const response = await createAgreement({
      college: { collegeName, collegeAddress: collegeAddress || undefined, collegeRegNo: collegeRegNo || undefined, collegeAffiliation: collegeAffiliation || undefined, collegePhone: collegePhone || undefined, collegeEmail: collegeEmail || undefined, collegeWebsite: collegeWebsite || undefined, logoUrl: logoUrl || undefined },
      document: { refNo, issuedDateAD: issuedDateAD || undefined, issuedDateBS: issuedDateBS || undefined },
      student: { studentFullName: studentName, tuRollNo: tuRollNo || undefined, enrollmentNo: enrollmentNo || undefined, programName: programName || undefined, currentYear: currentYear || undefined, currentSemester: currentSem || undefined, academicYearBS: academicYearBS || undefined, studentStatus: studentStatus || undefined },
      certifications: { isEnrolled, hasBacklogs, disciplinaryHold, feeDueRs: feeDue },
      qr: { qrToken: qrToken || undefined, qrVerifyUrl: qrVerifyUrl || undefined },
    });
    if ("error" in response || !response.data) {
      console.error("Save agreement failed:", response);
      toast.error("Failed to save. Please check your connection and try again.");
      return;
    }
    setSavedId(response.data.id);
    toast.success("Bonafide certificate saved", { description: `ID: ${response.data.id.slice(0, 8)}…` });
  };

  const sectionFilled: Record<string, boolean> = {
    "sec-college":  !!collegeName,
    "sec-document": !!refNo,
    "sec-student":  !!studentName,
    "sec-certs":    true,
    "sec-qr":       !!qrToken,
  };

  // ── PDF ────────────────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name before downloading.");
      return;
    }

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${collegeName}" style="height:56px;object-fit:contain;margin-right:14px">`
      : `<div style="width:52px;height:52px;background:#dcfce7;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:14px;font-size:18px;font-weight:800;color:#166534">${collegeName.charAt(0)}</div>`;

    const certRows = [
      ["Enrolled as Student", isEnrolled  ? "✓ Confirmed"       : "✗ Not confirmed"],
      ["Academic Backlogs",   hasBacklogs ? "✗ Yes (has backlogs)" : "✓ None"],
      ["Disciplinary Hold",   disciplinaryHold ? "✗ Yes"         : "✓ None"],
      ["Fee Dues (NPR)",      feeDue > 0  ? `Rs ${feeDue.toLocaleString("en-IN")}` : "✓ Nil (fully paid)"],
    ].map(([f, v], i) => `<tr style="background:${i%2===1?"#f9fafb":"#fff"}"><td style="padding:7px 12px;border:1px solid #d1d5db;width:50%;font-weight:500">${f}</td><td style="padding:7px 12px;border:1px solid #d1d5db">${v}</td></tr>`).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Agreement Certificate — ${studentName}</title>
  <style>
    @page { size: A4; margin: 18mm 22mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #111; line-height: 1.6; }
    .header { border-bottom: 2.5px solid #15c35b; padding-bottom: 14px; margin-bottom: 14px; display: flex; align-items: center; }
    .college-name { font-size: 14pt; font-weight: 800; color: #0a7a38; text-transform: uppercase; }
    .college-meta { font-size: 8.5pt; color: #6b7280; margin-top: 3px; line-height: 1.45; }
    .meta-row { display: flex; justify-content: space-between; font-size: 9pt; color: #6b7280; margin-bottom: 12px; }
    .title-box { border: 2px solid #15c35b; text-align: center; padding: 12px; margin-bottom: 16px; border-radius: 6px; }
    .title-box h2 { font-size: 14pt; color: #166534; font-weight: 700; letter-spacing: 2px; }
    .title-box p  { font-size: 9pt; color: #166534; margin-top: 3px; }
    .body-text { font-size: 10.5pt; margin-bottom: 14px; line-height: 1.75; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt; }
    table thead tr { background: #15803d; color: #fff; }
    table thead th { padding: 8px 12px; text-align: left; }
    .cert-box { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 10px 16px; margin-bottom: 16px; font-size: 9pt; line-height: 1.65; border-radius: 0 4px 4px 0; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 14px; border-top: 1px solid #d1d5db; }
    .sig { text-align: center; width: 42%; font-size: 9pt; }
    .sig-line { border-top: 1px solid #9ca3af; margin: 42px 14px 7px; }
    .sig-name { font-weight: 600; }
    .sig-sub  { font-size: 8.5pt; color: #6b7280; }
    .footer { text-align: center; font-size: 8pt; color: #9ca3af; margin-top: 18px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <div>
      <div class="college-name">${collegeName}</div>
      <div class="college-meta">
        ${collegeAffiliation ? `Affiliated to ${collegeAffiliation}` : ""}${collegeRegNo ? ` | Reg. No.: ${collegeRegNo}` : ""}
        ${collegeAddress ? `<br>${collegeAddress}` : ""}
        ${[collegePhone, collegeEmail, collegeWebsite].filter(Boolean).length ? `<br>${[collegePhone, collegeEmail, collegeWebsite].filter(Boolean).join(" · ")}` : ""}
      </div>
    </div>
  </div>

  <div class="meta-row">
    <span><strong>Ref. No.:</strong> ${refNo}</span>
    <span><strong>Date (AD):</strong> ${issuedDateAD || displayDate}${issuedDateBS ? ` &nbsp;/&nbsp; ${issuedDateBS} (BS)` : ""}</span>
  </div>

  <div class="title-box">
    <h2>Agreement CERTIFICATE</h2>
    <p>Issued for Education Loan Processing · NRB Compliant</p>
  </div>

  <div class="body-text">
    This is to certify that <strong>${studentName}</strong> is a <em>bona fide</em> student of
    <strong>${collegeName}</strong>${collegeAffiliation ? `, affiliated to ${collegeAffiliation}` : ""},
    currently enrolled in the <strong>${programName || "—"}</strong> program during the
    Academic Year <strong>${academicYearBS}</strong>. The student is in
    <strong>${currentYear} Year / Semester ${currentSem}</strong> and holds the status of
    <strong>${studentStatus}</strong>.<br><br>
    This certificate is issued at the student's request for the purpose of processing an
    education loan at an NRB-licensed bank or financial institution.
  </div>

  <table>
    <thead><tr><th style="width:35%">Field</th><th>Details</th></tr></thead>
    <tbody>
      ${[
        ["Student Name",         studentName],
        ["TU / University Roll No.", tuRollNo || "—"],
        ["Enrollment No.",       enrollmentNo || "—"],
        ["Program / Course",     programName || "—"],
        ["Current Year",         currentYear + " Year"],
        ["Current Semester",     "Semester " + currentSem],
        ["Academic Year (BS)",   academicYearBS],
        ["Enrollment Status",    studentStatus],
      ].map(([f, v], i) => `<tr style="background:${i%2===1?"#f9fafb":"#fff"}"><td style="padding:6px 12px;border:1px solid #d1d5db;color:#6b7280">${f}</td><td style="padding:6px 12px;border:1px solid #d1d5db;font-weight:500">${v}</td></tr>`).join("")}
    </tbody>
  </table>

  <h4 style="font-size:10pt;font-weight:700;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:5px">
    College Certification for Bank
  </h4>
  <table>
    <thead><tr><th style="width:50%">Certification Item</th><th>Status</th></tr></thead>
    <tbody>${certRows}</tbody>
  </table>

  <div class="cert-box">
    <strong>Certification Statement:</strong> ${collegeName} hereby certifies all the above
    information to be true and correct to the best of our knowledge. This document is
    digitally registered and can be verified at:<br>
    <strong style="color:#166534">${qrVerifyUrl}</strong> &nbsp;|&nbsp; Token: <strong>${qrToken}</strong>
  </div>

  <div class="signatures">
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Registrar / Academic Officer</div><div class="sig-sub">${collegeName}</div></div>
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Principal / Campus Chief</div><div class="sig-sub">${collegeName} &nbsp;[Stamp]</div></div>
  </div>

  <div class="footer">
    Generated via GenZ Loan Digital Platform · NRB Unified Directive 2081 · ${collegeName}
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); window.onfocus = function () { window.close(); }; }, 200);
    };
  </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { toast.error("Popup blocked — please allow popups."); return; }
    win.document.write(html);
    win.document.close();
  };

  const handleGenerate = () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name first.");
      return;
    }
    setGenerated(true);
    toast.success("Certificate ready", { description: "Click Download PDF to save." });
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Agreement Certificate</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Certify student enrollment status for education loan processing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-5 items-start">

        {/* Col 1: TOC sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-3 lg:sticky lg:top-6"
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-4 py-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-foreground">Form sections</CardTitle>
            </CardHeader>
            <CardContent className="p-1.5 space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-muted transition-colors group"
                >
                  <s.icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate flex-1">
                    {s.label}
                  </span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sectionFilled[s.id] ? "bg-[oklch(0.62_0.18_145)]" : "bg-muted-foreground/25"}`} />
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={handleGenerate}>Preview</Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "…" : savedId ? "Saved ✓" : "Save"}
            </Button>
            <Button size="sm" className="flex-1 text-xs h-8 gap-1" onClick={handleDownloadPDF}>
              <Download className="w-3.5 h-3.5" /> PDF
            </Button>
          </div>
        </motion.div>

        {/* Col 2: Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">Agreement Certificate</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Preview updates as you fill the form.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleGenerate}>Preview</Button>
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving…" : savedId ? "Saved ✓" : "Save"}
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={handleDownloadPDF}>
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6">

              {/* College */}
              <div>
                <SectionHead id="sec-college" label="College / Institution"/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Institution name *">
                    <Input className="h-8 text-xs" placeholder="e.g. Ace Institute of Management" value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                  </Field>
                  <Field label="Address">
                    <Input className="h-8 text-xs" placeholder="City / Street" value={collegeAddress} onChange={e => setCollegeAddress(e.target.value)} />
                  </Field>
                  <Field label="Registration no.">
                    <Input className="h-8 text-xs" placeholder="e.g. 2/059/060" value={collegeRegNo} onChange={e => setCollegeRegNo(e.target.value)} />
                  </Field>
                  <Field label="Affiliation">
                    <Input className="h-8 text-xs" placeholder="e.g. Pokhara University" value={collegeAffiliation} onChange={e => setCollegeAffiliation(e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input className="h-8 text-xs" placeholder="+977-1-XXXXXXX" value={collegePhone} onChange={e => setCollegePhone(e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input className="h-8 text-xs" placeholder="info@college.edu.np" value={collegeEmail} onChange={e => setCollegeEmail(e.target.value)} />
                  </Field>
                  <Field label="Website">
                    <Input className="h-8 text-xs" placeholder="www.college.edu.np" value={collegeWebsite} onChange={e => setCollegeWebsite(e.target.value)} />
                  </Field>

                  {/* Logo — upload or URL */}
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] text-muted-foreground">College logo</Label>
                    <div className="flex gap-2 items-center">
                      <input ref={logoFileRef} type="file" accept="image/*" aria-label="Upload college logo" className="hidden" onChange={handleLogoFile} />
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => logoFileRef.current?.click()}>
                        <ImageIcon className="w-3.5 h-3.5" />
                        {logoFileName ? "Change image" : "Upload image"}
                      </Button>
                      {logoFileName && <span className="text-[10px] text-muted-foreground truncate flex-1">{logoFileName}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">or paste URL</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <Input className="h-8 text-xs" placeholder="https://college.edu.np/logo.png" value={logoFileName ? "" : logoUrl} disabled={!!logoFileName} onChange={e => setLogoUrl(e.target.value)} />
                    {logoUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="Logo preview" className="h-10 w-10 object-contain rounded bg-white p-0.5 border border-border shrink-0" onError={e => (e.currentTarget.style.display = "none")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-foreground truncate">{logoFileName || "Logo from URL"}</p>
                          <p className="text-[9px] text-muted-foreground">Will appear in preview and PDF</p>
                        </div>
                        <button type="button" aria-label="Remove logo" onClick={clearLogo} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Document */}
              <div>
                <SectionHead id="sec-document" label="Document" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Reference no.">
                    <Input className="h-8 text-xs" value={refNo} onChange={e => setRefNo(e.target.value)} />
                  </Field>
                  <Field label="Issued date (AD)">
                    <Input className="h-8 text-xs" placeholder="e.g. 2024-09-01" value={issuedDateAD} onChange={e => setIssuedDateAD(e.target.value)} />
                  </Field>
                  <Field label="Issued date (BS)">
                    <Input className="h-8 text-xs" placeholder="e.g. 2081 Bhadra 16" value={issuedDateBS} onChange={e => setIssuedDateBS(e.target.value)} />
                  </Field>
                </div>
              </div>

              <Separator />

              {/* Student */}
              <div>
                <SectionHead id="sec-student" label="Student" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full name *">
                    <Input className="h-8 text-xs" placeholder="Student's full name" value={studentName} onChange={e => setStudentName(e.target.value)} />
                  </Field>
                  <Field label="Program / Course">
                    <Input className="h-8 text-xs" placeholder="e.g. BBA" value={programName} onChange={e => setProgramName(e.target.value)} />
                  </Field>
                  <Field label="TU / University roll no.">
                    <Input className="h-8 text-xs" placeholder="e.g. 1234567" value={tuRollNo} onChange={e => setTuRollNo(e.target.value)} />
                  </Field>
                  <Field label="Enrollment no.">
                    <Input className="h-8 text-xs" placeholder="e.g. AIM-BBA-2081-0041" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} />
                  </Field>
                  <Field label="Current year">
                    <Select value={currentYear} onValueChange={setCurrentYear}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {YEARS.map(y => <SelectItem key={y} value={y} className="text-xs">{y} Year</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Current semester">
                    <Select value={currentSem} onValueChange={setCurrentSem}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SEMS.map(s => <SelectItem key={s} value={s} className="text-xs">Semester {s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Academic year (BS)">
                    <Select value={academicYearBS} onValueChange={setAcademicYearBS}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2080-081" className="text-xs">2080-081 (2023-2024)</SelectItem>
                        <SelectItem value="2081-082" className="text-xs">2081-082 (2024-2025)</SelectItem>
                        <SelectItem value="2082-083" className="text-xs">2082-083 (2025-2026)</SelectItem>
                        <SelectItem value="2083-084" className="text-xs">2083-084 (2026-2027)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Enrollment status">
                    <Select value={studentStatus} onValueChange={setStudentStatus}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <Separator />

              {/* Certifications */}
              <div className="">
                <SectionHead id="sec-certs" label="Certifications (College declares)" />
                <div className="rounded-lg border border-border overflow-hidden p-2">
                  <CertToggle label="Student is currently enrolled" checked={isEnrolled} onChange={setIsEnrolled} positiveLabel="Yes" negativeLabel="No" />
                  <CertToggle label="Has academic backlogs" checked={hasBacklogs} onChange={setHasBacklogs} positiveLabel="Yes" negativeLabel="No" />
                  <CertToggle label="Disciplinary hold on record" checked={disciplinaryHold} onChange={setDisciplinaryHold} positiveLabel="Yes" negativeLabel="No" />
                </div>
                <div className="mt-3">
                  <Field label="Pending fee dues (NPR) — enter 0 for no dues">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={feeDueRs}
                      onChange={e => setFeeDueRs(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </Field>
                </div>
              </div>

              <Separator />

              {/* QR */}
              <div>
                <SectionHead id="sec-qr" label="QR / Verification" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Token">
                    <Input className="h-8 text-xs font-mono" value={qrToken} onChange={e => { setQrToken(e.target.value); setQrVerifyUrl(`verify.genzloan.com.np/doc/${e.target.value}`); }} />
                  </Field>
                  <Field label="Verify URL">
                    <Input className="h-8 text-xs font-mono" value={qrVerifyUrl} onChange={e => setQrVerifyUrl(e.target.value)} />
                  </Field>
                </div>
              </div>

              {generated && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[oklch(0.62_0.18_145)]/10 rounded-xl border border-[oklch(0.62_0.18_145)]/20">
                  <CheckCircle2 className="w-4 h-4 text-[oklch(0.42_0.18_145)] shrink-0" />
                  <p className="text-xs text-[oklch(0.42_0.18_145)] font-medium">
                    Certificate ready.{" "}
                    <button type="button" className="underline" onClick={handleDownloadPDF}>Download PDF</button>
                    {" · "}
                    <button type="button" className="underline">Send to bank</button>
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>

        {/* Col 3: Live preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto"
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-foreground">Live document preview</CardTitle>
                <span className="text-[9px] text-muted-foreground">Agreement Certificate</span>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="bg-white rounded-lg p-4 font-mono text-[9.5px] border border-border shadow-sm leading-relaxed">

                {/* Letterhead */}
                <div className="border-b-2 border-primary pb-3 mb-3 flex items-start gap-2">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="logo" className="h-9 w-9 object-contain shrink-0 rounded" onError={e => (e.currentTarget.style.display = "none")} />
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
                      {collegeAffiliation && <>Affiliated to {collegeAffiliation}</>}
                      {collegeRegNo && <> · Reg. {collegeRegNo}</>}
                      {collegeAddress && <><br />{collegeAddress}</>}
                      {(collegePhone || collegeEmail) && <><br />{[collegePhone, collegeEmail].filter(Boolean).join(" · ")}</>}
                    </p>
                  </div>
                </div>

                {/* Ref + date */}
                <div className="flex justify-between text-[8px] text-muted-foreground mb-2">
                  <span><strong>Ref.:</strong> {refNo}</span>
                  <span><strong>Date:</strong> {issuedDateAD || today}{issuedDateBS && ` / ${issuedDateBS} BS`}</span>
                </div>

                {/* Title */}
                <div className="border-2 border-primary text-center py-2 mb-3 rounded">
                  <p className="text-[10px] font-bold text-primary tracking-widest">Agreement CERTIFICATE</p>
                  <p className="text-[8px] text-primary/70">Education Loan Processing · NRB Compliant</p>
                </div>

                {/* Body */}
                <p className="text-[8.5px] text-muted-foreground leading-snug mb-3">
                  This is to certify that{" "}
                  <strong className="text-foreground"><L v={studentName} p="Student name" /></strong>{" "}
                  is a <em>bona fide</em> student of{" "}
                  <strong className="text-foreground"><L v={collegeName} p="College" /></strong>
                  {collegeAffiliation && <>, affiliated to {collegeAffiliation}</>}, currently enrolled in{" "}
                  <strong className="text-foreground"><L v={programName} p="Program" /></strong> during Academic Year{" "}
                  <strong className="text-foreground">{academicYearBS}</strong> — {currentYear} Year / Semester {currentSem}.
                </p>

                {/* Student details table */}
                <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">Student Details</p>
                <table className="w-full text-[8px] border-collapse mb-2">
                  <tbody>
                    {[
                      ["Full Name",        studentName || "—"],
                      ["TU Roll No.",      tuRollNo    || "—"],
                      ["Enrollment No.",   enrollmentNo || "—"],
                      ["Program",          programName || "—"],
                      ["Year / Semester",  `${currentYear} Year · Sem ${currentSem}`],
                      ["Academic Year",    academicYearBS],
                      ["Status",           studentStatus],
                    ].map(([f, v], i) => (
                      <tr key={f} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[42%]">{f}</td>
                        <td className="px-1.5 py-0.5 border border-border/50 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Certifications */}
                <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">College Certifications</p>
                <table className="w-full text-[8px] border-collapse mb-2">
                  <tbody>
                    {[
                      { label: "Currently Enrolled",    val: certIcon(isEnrolled,       true),  text: isEnrolled ? "Yes" : "No"  },
                      { label: "Academic Backlogs",      val: certIcon(hasBacklogs,      false), text: hasBacklogs ? "Yes (has backlogs)" : "None" },
                      { label: "Disciplinary Hold",      val: certIcon(disciplinaryHold, false), text: disciplinaryHold ? "Yes" : "None" },
                      { label: "Fee Dues (NPR)",         val: certIcon(feeDue === 0,     true),  text: feeDue > 0 ? `Rs ${feeDue.toLocaleString("en-IN")}` : "Nil (fully paid)" },
                    ].map(({ label, val, text }, i) => (
                      <tr key={label} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[42%]">{label}</td>
                        <td className="px-1.5 py-0.5 border border-border/50">
                          <span className="mr-1">{val}</span>{text}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* QR cert box */}
                <div className="bg-[oklch(0.62_0.18_145)]/8 border-l-2 border-[oklch(0.62_0.18_145)] px-2 py-1.5 mb-3 rounded-r text-[8px] leading-snug">
                  <strong>Verified by:</strong> {collegeName || "[College]"}<br />
                  <span className="text-primary">QR: {qrVerifyUrl} · Token: {qrToken}</span>
                </div>

                {/* Signatures */}
                <div className="flex justify-between mt-3 pt-2 border-t border-border">
                  {["Registrar / Academic Officer", "Principal / Campus Chief"].map((sig) => (
                    <div key={sig} className="flex-1 text-center text-[7.5px]">
                      <div className="border-t border-muted-foreground/30 mt-6 mb-1" />
                      <p className="font-bold text-foreground text-[8px]">{sig}</p>
                      <p className="text-muted-foreground"><L v={collegeName} p="College" /></p>
                    </div>
                  ))}
                </div>

                <p className="text-[7.5px] text-muted-foreground text-center mt-2">
                  Generated via GenZ Loan Digital Platform · NRB Unified Directive 2081
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
