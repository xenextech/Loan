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
  ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateEnrollmentCertMutation } from "@/lib/api/templateApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { id: "sec-college", icon: Building2, label: "College / Institution" },
  { id: "sec-document", icon: FileText, label: "Document" },
  { id: "sec-student", icon: User, label: "Student" },
  { id: "sec-certs", icon: ShieldCheck, label: "Certifications" },
  { id: "sec-qr", icon: Link2, label: "QR / Verification" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function scrollTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function certIcon(v: boolean, positive: boolean) {
  return v === positive ? (
    <span className="text-[oklch(0.42_0.18_145)] font-bold">✓</span>
  ) : (
    <span className="text-destructive font-bold">✗</span>
  );
}

const YEARS = ["1st", "2nd", "3rd", "4th"] as const;
const SEMS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const STATUS = ["Active", "On Leave", "Suspended"] as const;

function makeDefaultRef(bsYear = "2081") {
  return `ENROLL/${bsYear}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
}
function makeDefaultToken() {
  return `ENR-${String(Date.now()).slice(-8)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EnrollmentCertificateGenerator() {
  // ── College ────────────────────────────────────────────────────────────────
  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
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

  // ── Document ───────────────────────────────────────────────────────────────
  const [refNo, setRefNo] = useState(() => makeDefaultRef());
  const [issuedDateAD, setIssuedDateAD] = useState("");
  const [issuedDateBS, setIssuedDateBS] = useState("");

  // ── Student ────────────────────────────────────────────────────────────────
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
  const [qrToken, setQrToken] = useState(() => makeDefaultToken());
  const [qrVerifyUrl, setQrVerifyUrl] = useState(
    () => `verify.genzloan.com.np/doc/${makeDefaultToken()}`,
  );

  const [generated, setGenerated] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [createEnrollmentCert, { isLoading: isSaving }] =
    useCreateEnrollmentCertMutation();

  const today = new Date().toLocaleDateString("en-NP", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const displayDate = issuedDateAD || today;
  const feeDue = feeDueRs === "" ? 0 : Number(feeDueRs);

  // Compose ref with college code prefix: KMC/ENROLL/2081/0031
  const fullRefNo = collegeCode
    ? `${collegeCode.toUpperCase()}/${refNo}`
    : refNo;

  const sectionFilled: Record<string, boolean> = {
    "sec-college": !!collegeName,
    "sec-document": !!refNo,
    "sec-student": !!studentName,
    "sec-certs": true,
    "sec-qr": !!qrToken,
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name before saving.");
      return;
    }
    const response = await createEnrollmentCert({
      college: {
        collegeName,
        collegeCode: collegeCode || undefined,
        collegeAddress: collegeAddress || undefined,
        collegeRegNo: collegeRegNo || undefined,
        collegeAffiliation: collegeAffiliation || undefined,
        collegePhone: collegePhone || undefined,
        collegeEmail: collegeEmail || undefined,
        collegeWebsite: collegeWebsite || undefined,
        logoUrl: logoUrl || undefined,
      },
      document: {
        refNo,
        issuedDateAD: issuedDateAD || undefined,
        issuedDateBS: issuedDateBS || undefined,
      },
      student: {
        studentFullName: studentName,
        tuRollNo: tuRollNo || undefined,
        enrollmentNo: enrollmentNo || undefined,
        programName: programName || undefined,
        currentYear: currentYear || undefined,
        currentSemester: currentSem || undefined,
        academicYearBS: academicYearBS || undefined,
        studentStatus: studentStatus || undefined,
      },
      certifications: {
        isEnrolled,
        hasBacklogs,
        disciplinaryHold,
        feeDueRs: feeDue,
      },
      qr: {
        qrToken: qrToken || undefined,
        qrVerifyUrl: qrVerifyUrl || undefined,
      },
    });
    if ("error" in response || !response.data) {
      console.error("Save enrollment cert failed:", response);
      toast.error("Failed to save enrollment certificate.");
      return;
    }
    setSavedId(response.data.id);
    toast.success("Enrollment certificate saved", {
      description: `ID: ${response.data.id.slice(0, 8)}…`,
    });
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
      [
        "Active Enrollment",
        isEnrolled ? "✓ Confirmed — Currently Enrolled" : "✗ Not Confirmed",
      ],
      ["Academic Backlogs", hasBacklogs ? "✗ Yes (has backlogs)" : "✓ None"],
      [
        "Disciplinary Hold",
        disciplinaryHold ? "✗ Yes — Hold Placed" : "✓ None",
      ],
      [
        "Fee Dues (NPR)",
        feeDue > 0
          ? `Rs ${feeDue.toLocaleString("en-IN")}`
          : "✓ Nil (Fully Paid)",
      ],
    ]
      .map(
        ([f, v], i) =>
          `<tr style="background:${i % 2 === 1 ? "#f9fafb" : "#fff"}">
          <td style="padding:7px 12px;border:1px solid #d1d5db;width:50%;font-weight:500">${f}</td>
          <td style="padding:7px 12px;border:1px solid #d1d5db">${v}</td>
        </tr>`,
      )
      .join("");

    const studentRows = [
      ["Student Full Name", studentName],
      ["TU / University Roll No.", tuRollNo || "—"],
      ["Enrollment No.", enrollmentNo || "—"],
      ["Program / Course", programName || "—"],
      ["Current Year", `${currentYear} Year`],
      ["Current Semester", `Semester ${currentSem}`],
      ["Academic Year (BS)", academicYearBS],
      ["Enrollment Status", studentStatus],
    ]
      .map(
        ([f, v], i) =>
          `<tr style="background:${i % 2 === 1 ? "#f9fafb" : "#fff"}">
          <td style="padding:6px 12px;border:1px solid #d1d5db;color:#6b7280">${f}</td>
          <td style="padding:6px 12px;border:1px solid #d1d5db;font-weight:500">${v}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Enrollment Certificate — ${studentName}</title>
  <style>
    @page { size: A4; margin: 18mm 22mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #111; line-height: 1.6; }
    .header { border-bottom: 2.5px solid #15c35b; padding-bottom: 14px; margin-bottom: 14px; display: flex; align-items: center; }
    .college-name { font-size: 14pt; font-weight: 800; color: #0a7a38; text-transform: uppercase; }
    .college-meta { font-size: 8.5pt; color: #6b7280; margin-top: 3px; line-height: 1.45; }
    .meta-row { display: flex; justify-content: space-between; font-size: 9pt; color: #6b7280; margin-bottom: 12px; }
    .title-box { border: 2px solid #15c35b; text-align: center; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px; }
    .title-box h2 { font-size: 15pt; color: #166534; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; }
    .title-box p  { font-size: 9pt; color: #166534; margin-top: 4px; }
    .body-text { font-size: 10.5pt; margin-bottom: 14px; line-height: 1.8; text-align: justify; }
    h4.section-head { font-size: 10pt; font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9.5pt; }
    table thead tr { background: #15803d; color: #fff; }
    table thead th { padding: 8px 12px; text-align: left; }
    .cert-box { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 10px 16px; margin-bottom: 16px; font-size: 9pt; line-height: 1.65; border-radius: 0 4px 4px 0; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 14px; border-top: 1px solid #d1d5db; }
    .sig { text-align: center; width: 42%; font-size: 9pt; }
    .sig-line { border-top: 1px solid #9ca3af; margin: 42px 14px 7px; }
    .sig-name { font-weight: 600; }
    .sig-sub  { font-size: 8.5pt; color: #6b7280; }
    .footer   { text-align: center; font-size: 8pt; color: #9ca3af; margin-top: 18px; }
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
    <span><strong>Ref. No.:</strong> ${fullRefNo}</span>
    <span><strong>Date (AD):</strong> ${issuedDateAD || displayDate}${issuedDateBS ? ` &nbsp;/&nbsp; ${issuedDateBS} (BS)` : ""}</span>
  </div>

  <div class="title-box">
    <h2>Enrollment Certificate</h2>
    <p>Issued for Education Loan Processing · NRB Compliant · ${collegeName}</p>
  </div>

  <div class="body-text">
    This is to certify that <strong>${studentName}</strong>${tuRollNo ? `, bearing Roll No. <strong>${tuRollNo}</strong>,` : ""}
    is a <em>bona fide</em> student of <strong>${collegeName}</strong>${collegeAffiliation ? `, affiliated to ${collegeAffiliation}` : ""},
    currently enrolled in the <strong>${programName || "—"}</strong> program
    (Enrollment No.: <strong>${enrollmentNo || "—"}</strong>)
    during the Academic Year <strong>${academicYearBS}</strong>.
    The student is presently in <strong>${currentYear} Year / Semester ${currentSem}</strong>
    with an enrollment status of <strong>${studentStatus}</strong>.<br><br>
    This Enrollment Certificate is issued on behalf of the institution at the student's request,
    solely for the purpose of applying for an education loan at an NRB-licensed bank or
    financial institution, and shall remain valid for the academic year stated above.
  </div>

  <h4 class="section-head">Academic Status</h4>
  <table>
    <thead><tr><th style="width:38%">Field</th><th>Details</th></tr></thead>
    <tbody>${studentRows}</tbody>
  </table>

  <h4 class="section-head">College Certifications for Bank</h4>
  <table>
    <thead><tr><th style="width:50%">Certification</th><th>Status</th></tr></thead>
    <tbody>${certRows}</tbody>
  </table>

  <div class="cert-box">
    <strong>Official Certification:</strong> ${collegeName} hereby certifies that all the above
    information is true, accurate, and verifiable. This document carries the official seal of
    the institution and is digitally registered on the Unnati platform.<br>
    <strong style="color:#166534">Verify at:</strong> ${qrVerifyUrl} &nbsp;|&nbsp; Token: <strong>${qrToken}</strong>
  </div>

  <div class="signatures">
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Registrar / Academic Officer</div><div class="sig-sub">${collegeName}</div></div>
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Principal / Campus Chief</div><div class="sig-sub">${collegeName} &nbsp;[Stamp]</div></div>
  </div>

  <div class="footer">
    Generated via Unnati Digital Platform · NRB Unified Directive 2081 · ${collegeName}${collegeRegNo ? ` · Reg. ${collegeRegNo}` : ""}
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); window.onfocus = function () { window.close(); }; }, 200);
    };
  </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked — please allow popups.");
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const handleGenerate = () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name first.");
      return;
    }
    setGenerated(true);
    toast.success("Certificate ready", {
      description: "Click Download PDF to save.",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Enrollment Certificate
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Certify student enrollment and academic standing for education loan
          processing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Col 1 — Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Enrollment Certificate
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preview updates as you fill the form.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving…" : savedId ? "Saved ✓" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Section jump-nav — replaces the old sidebar TOC column */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-5 py-2.5 border-b border-border bg-muted/20">
              {SECTIONS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <s.icon className="w-3 h-3 shrink-0" />
                  {s.label}
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${sectionFilled[s.id] ? "bg-[oklch(0.62_0.18_145)]" : "bg-muted-foreground/25"}`}
                  />
                </button>
              ))}
            </div>

            <CardContent className="p-5 space-y-6">
              {/* College */}
              <div>
                <SectionHead id="sec-college" label="College / Institution" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Institution name *">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Ace Institute of Management"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                    />
                  </Field>
                  <Field label="College code (for ref no.)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. AIM, KMC, PU"
                      value={collegeCode}
                      onChange={(e) => setCollegeCode(e.target.value)}
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
                      placeholder="e.g. Tribhuvan University"
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
                      placeholder="https://college.edu.np/logo.png"
                      value={logoFileName ? "" : logoUrl}
                      disabled={!!logoFileName}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    {logoUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="h-10 w-10 object-contain rounded bg-white p-0.5 border border-border shrink-0"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-foreground truncate">
                            {logoFileName || "Logo from URL"}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            Will appear in preview and PDF
                          </p>
                        </div>
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

              {/* Document */}
              <div>
                <SectionHead id="sec-document" label="Document" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field
                    label={`Reference no. ${collegeCode ? `(${collegeCode.toUpperCase()}/${refNo})` : ""}`}
                  >
                    <Input
                      className="h-8 text-xs font-mono"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder="ENROLL/2081/0031"
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
                {collegeCode && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Full ref:{" "}
                    <span className="font-mono text-foreground">
                      {fullRefNo}
                    </span>
                  </p>
                )}
              </div>

              <Separator />

              {/* Student */}
              <div>
                <SectionHead id="sec-student" label="Student" />
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
                      placeholder="e.g. BBA, BIT, B.Sc. CSIT"
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
                    <Select value={currentYear} onValueChange={setCurrentYear}>
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
                    <Select value={currentSem} onValueChange={setCurrentSem}>
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
                        <SelectItem value="2080-081" className="text-xs">
                          2080-081 (2023-2024)
                        </SelectItem>
                        <SelectItem value="2081-082" className="text-xs">
                          2081-082 (2024-2025)
                        </SelectItem>
                        <SelectItem value="2082-083" className="text-xs">
                          2082-083 (2025-2026)
                        </SelectItem>
                        <SelectItem value="2083-084" className="text-xs">
                          2083-084 (2026-2027)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Enrollment status">
                    <Select
                      value={studentStatus}
                      onValueChange={setStudentStatus}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <Separator />

              {/* Certifications */}
              <div>
                <SectionHead
                  id="sec-certs"
                  label="Certifications (College declares)"
                />
                <div className="rounded-lg border border-border overflow-hidden p-2">
                  <CertToggle
                    label="Student is actively enrolled"
                    checked={isEnrolled}
                    onChange={setIsEnrolled}
                    positiveLabel="Yes"
                    negativeLabel="No"
                  />
                  <CertToggle
                    label="Has academic backlogs"
                    checked={hasBacklogs}
                    onChange={setHasBacklogs}
                    positiveLabel="Yes"
                    negativeLabel="No"
                  />
                  <CertToggle
                    label="Disciplinary hold on record"
                    checked={disciplinaryHold}
                    onChange={setDisciplinaryHold}
                    positiveLabel="Yes"
                    negativeLabel="No"
                  />
                </div>
                <div className="mt-3">
                  <Field label="Pending fee dues (NPR) — enter 0 for no dues">
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
              </div>

              <Separator />

              {/* QR */}
              <div>
                <SectionHead id="sec-qr" label="QR / Verification" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Token">
                    <Input
                      className="h-8 text-xs font-mono"
                      value={qrToken}
                      onChange={(e) => {
                        setQrToken(e.target.value);
                        setQrVerifyUrl(
                          `verify.genzloan.com.np/doc/${e.target.value}`,
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
                    Certificate ready.{" "}
                    <button
                      type="button"
                      className="underline"
                      onClick={handleDownloadPDF}
                    >
                      Download PDF
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Col 2 — Live preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto"
        >
          <Card className="border-border shadow-none">
            <CardHeader className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-foreground">
                  Live document preview
                </CardTitle>
                <span className="text-[9px] text-muted-foreground">
                  Enrollment Certificate
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

                {/* Ref + date */}
                <div className="flex justify-between text-[8px] text-muted-foreground mb-2">
                  <span>
                    <strong>Ref.:</strong> {fullRefNo}
                  </span>
                  <span>
                    <strong>Date:</strong> {displayDate}
                    {issuedDateBS && ` / ${issuedDateBS} BS`}
                  </span>
                </div>

                {/* Title */}
                <div className="border-2 border-primary text-center py-2 mb-3 rounded">
                  <p className="text-[10px] font-extrabold text-primary tracking-widest uppercase">
                    Enrollment Certificate
                  </p>
                  <p className="text-[8px] text-primary/70">
                    Education Loan Processing · NRB Compliant
                  </p>
                </div>

                {/* Body */}
                <p className="text-[8.5px] text-muted-foreground leading-snug mb-3">
                  This is to certify that{" "}
                  <strong className="text-foreground">
                    <L v={studentName} p="Student name" />
                  </strong>
                  {tuRollNo && (
                    <>
                      , bearing Roll No.{" "}
                      <strong className="text-foreground">{tuRollNo}</strong>,
                    </>
                  )}{" "}
                  is a <em>bona fide</em> student of{" "}
                  <strong className="text-foreground">
                    <L v={collegeName} p="College" />
                  </strong>
                  {collegeAffiliation && (
                    <>, affiliated to {collegeAffiliation}</>
                  )}
                  , currently enrolled in{" "}
                  <strong className="text-foreground">
                    <L v={programName} p="Program" />
                  </strong>{" "}
                  during Academic Year{" "}
                  <strong className="text-foreground">{academicYearBS}</strong>{" "}
                  — {currentYear} Year / Semester {currentSem}.
                </p>

                {/* Academic status table */}
                <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                  Academic Status
                </p>
                <table className="w-full text-[8px] border-collapse mb-2">
                  <tbody>
                    {[
                      ["Full Name", studentName || "—"],
                      ["Roll No.", tuRollNo || "—"],
                      ["Enrollment No.", enrollmentNo || "—"],
                      ["Program", programName || "—"],
                      [
                        "Year / Semester",
                        `${currentYear} Year · Sem ${currentSem}`,
                      ],
                      ["Academic Year", academicYearBS],
                      ["Status", studentStatus],
                    ].map(([f, v], i) => (
                      <tr key={f} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[42%]">
                          {f}
                        </td>
                        <td className="px-1.5 py-0.5 border border-border/50 font-medium">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Certification checkboxes */}
                <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                  College Certifications
                </p>
                <table className="w-full text-[8px] border-collapse mb-2">
                  <tbody>
                    {[
                      {
                        label: "Active Enrollment",
                        icon: certIcon(isEnrolled, true),
                        text: isEnrolled ? "Confirmed" : "Not Confirmed",
                      },
                      {
                        label: "Academic Backlogs",
                        icon: certIcon(hasBacklogs, false),
                        text: hasBacklogs ? "Yes (has backlogs)" : "None",
                      },
                      {
                        label: "Disciplinary Hold",
                        icon: certIcon(disciplinaryHold, false),
                        text: disciplinaryHold ? "Yes — Hold Placed" : "None",
                      },
                      {
                        label: "Fee Dues (NPR)",
                        icon: certIcon(feeDue === 0, true),
                        text:
                          feeDue > 0
                            ? `Rs ${feeDue.toLocaleString("en-IN")}`
                            : "Nil (Fully Paid)",
                      },
                    ].map(({ label, icon, text }, i) => (
                      <tr
                        key={label}
                        className={i % 2 === 1 ? "bg-muted/30" : ""}
                      >
                        <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[42%]">
                          {label}
                        </td>
                        <td className="px-1.5 py-0.5 border border-border/50">
                          <span className="mr-1">{icon}</span>
                          {text}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* QR cert box */}
                <div className="bg-[oklch(0.62_0.18_145)]/8 border-l-2 border-[oklch(0.62_0.18_145)] px-2 py-1.5 mb-3 rounded-r text-[8px] leading-snug">
                  <strong>Official cert by:</strong>{" "}
                  {collegeName || "[College]"}
                  <br />
                  <span className="text-primary">
                    Verify: {qrVerifyUrl} · Token: {qrToken}
                  </span>
                </div>

                {/* Signatures */}
                <div className="flex justify-between mt-3 pt-2 border-t border-border">
                  {[
                    "Registrar / Academic Officer",
                    "Principal / Campus Chief",
                  ].map((sig) => (
                    <div key={sig} className="flex-1 text-center text-[7.5px]">
                      <div className="border-t border-muted-foreground/30 mt-6 mb-1" />
                      <p className="font-bold text-foreground text-[8px]">
                        {sig}
                      </p>
                      <p className="text-muted-foreground">
                        <L v={collegeName} p="College" />
                      </p>
                    </div>
                  ))}
                </div>

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
