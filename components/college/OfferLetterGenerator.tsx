"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  User,
  GraduationCap,
  Banknote,
  ClipboardList,
  BadgeCheck,
  Link2,
  Plus,
  X,
  Download,
  CheckCircle2,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateOfferLetterMutation } from "@/lib/api/templateApi";
import { useGetMyVerificationsQuery } from "@/lib/api/collegeApi";
import { buildOfferLetterHtml } from "@/lib/documentTemplates/offerLetterTemplate";
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

// ─── Sidebar section TOC ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: "sec-college", icon: Building2, label: "College / Institution" },
  { id: "sec-document", icon: FileText, label: "Document" },
  { id: "sec-student", icon: User, label: "Student" },
  { id: "sec-program", icon: GraduationCap, label: "Program" },
  { id: "sec-fees", icon: Banknote, label: "Fee Structure" },
  { id: "sec-conditions", icon: ClipboardList, label: "Conditions" },
  { id: "sec-signatories", icon: BadgeCheck, label: "Signatories" },
  { id: "sec-qr", icon: Link2, label: "QR / Verification" },
];

const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

function fmtNPR(n: number) {
  return "Rs " + n.toLocaleString("en-IN");
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

interface CustomFee {
  label: string;
  amount: number | "";
  perSemester: boolean;
}

// Defaults used both on first render and after a successful reset
const DEFAULT_CONDITIONS = [
  "Fee payment must be completed within 7 days of this offer letter.",
  "Original academic certificates must be submitted at the time of enrollment.",
  "This offer is subject to verification of academic credentials.",
];

const DEFAULT_SIGNATORIES = [
  {
    name: "",
    designation: "Head of Admissions",
    stamp_area_label: "Admission Office Seal",
  },
  {
    name: "",
    designation: "Principal / Campus Chief",
    stamp_area_label: "Principal's Seal",
  },
  {
    name: "",
    designation: "Finance Officer",
    stamp_area_label: "Finance Seal",
  },
];

function makeRefNo() {
  return `OFFER-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

function makeQrToken() {
  return `OFFER-${String(Date.now()).slice(-8)}`;
}

export default function OfferLetterGenerator() {
  // ── College ────────────────────────────────────────────────────────────────
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
      toast.error("Please select an image file (PNG, JPG, SVG, etc.).");
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
  const [refNo, setRefNo] = useState(() => makeRefNo());
  const [issuedDateAD, setIssuedDateAD] = useState("");
  const [issuedDateBS, setIssuedDateBS] = useState("");
  const [validUntilAD, setValidUntilAD] = useState("");
  const [validUntilBS, setValidUntilBS] = useState("");

  // ── Student ────────────────────────────────────────────────────────────────
  const [studentName, setStudentName] = useState("");
  const [studentDobAD, setStudentDobAD] = useState("");
  const [studentDobBS, setStudentDobBS] = useState("");
  const [citizenshipNo, setCitizenshipNo] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");

  // ── Program ────────────────────────────────────────────────────────────────
  const [progName, setProgName] = useState("");
  const [progFullName, setProgFullName] = useState("");
  const [progAffiliation, setProgAffiliation] = useState("");
  const [durationYears, setDurationYears] = useState("");
  const [totalSemesters, setTotalSemesters] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [academicYearBS, setAcademicYearBS] = useState("2081-082");
  const [intakeMonthBS, setIntakeMonthBS] = useState("");

  // ── Fees ───────────────────────────────────────────────────────────────────
  const [admissionFee, setAdmissionFee] = useState<number | "">("");
  const [tuitionPerSem, setTuitionPerSem] = useState<number | "">("");
  const [examFeePerSem, setExamFeePerSem] = useState<number | "">("");
  const [labFeePerSem, setLabFeePerSem] = useState<number | "">("");
  const [customFees, setCustomFees] = useState<CustomFee[]>([]);
  const [totalApprox, setTotalApprox] = useState<number | "">("");
  const [totalManual, setTotalManual] = useState(false); // true = user overrode total

  // ── Conditions ─────────────────────────────────────────────────────────────
  const [conditions, setConditions] = useState<string[]>(DEFAULT_CONDITIONS);

  // ── Signatories ────────────────────────────────────────────────────────────
  const [signatories, setSignatories] = useState(DEFAULT_SIGNATORIES);

  // ── QR ─────────────────────────────────────────────────────────────────────
  const [qrToken, setQrToken] = useState(() => makeQrToken());
  const [qrVerifyUrl, setQrVerifyUrl] = useState(
    () => `verify.Unnati.com.np/doc/${qrToken}`,
  );

  // ── Computed ───────────────────────────────────────────────────────────────
  const sems = Number(totalSemesters) || 0;
  const af = Number(admissionFee) || 0;
  const tf = Number(tuitionPerSem) || 0;
  const ef = Number(examFeePerSem) || 0;
  const lf = Number(labFeePerSem) || 0;
  const customFeesFilled = customFees.filter(
    (f) => f.label.trim() && Number(f.amount) > 0,
  );
  const customFeesTotal = customFeesFilled.reduce((sum, f) => {
    const amt = Number(f.amount) || 0;
    return sum + (f.perSemester ? amt * sems : amt);
  }, 0);
  const autoTotal = af + (tf + ef + lf) * sems + customFeesTotal;
  const displayTotal =
    totalManual && totalApprox !== "" ? Number(totalApprox) : autoTotal;

  const today = new Date().toLocaleDateString("en-NP", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [generated, setGenerated] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [createOfferLetter, { isLoading: isSaving }] =
    useCreateOfferLetterMutation();

  // ── Link to application (optional) ────────────────────────────────────────
  const { data: verifications } = useGetMyVerificationsQuery();
  const [applicationId, setApplicationId] = useState<string | undefined>(
    undefined,
  );

  function handleApplicationSelect(value: string) {
    if (value === "none") {
      setApplicationId(undefined);
      return;
    }
    setApplicationId(value);
    const match = verifications?.find((v) => v.applicationId === value);
    if (match?.studentName && !studentName) {
      setStudentName(match.studentName);
    }
  }

  // ── Reset form back to defaults (used after a successful save) ─────────────
  const resetForm = () => {
    // College
    setCollegeName("");
    setCollegeAddress("");
    setCollegeRegNo("");
    setCollegeAffiliation("");
    setCollegePhone("");
    setCollegeEmail("");
    setCollegeWebsite("");
    setLogoUrl("");
    setLogoFileName("");
    if (logoFileRef.current) logoFileRef.current.value = "";

    // Document
    setRefNo(makeRefNo());
    setIssuedDateAD("");
    setIssuedDateBS("");
    setValidUntilAD("");
    setValidUntilBS("");

    // Student
    setStudentName("");
    setStudentDobAD("");
    setStudentDobBS("");
    setCitizenshipNo("");
    setFatherName("");
    setMotherName("");
    setPermanentAddress("");
    setDistrict("");
    setProvince("");

    // Program
    setProgName("");
    setProgFullName("");
    setProgAffiliation("");
    setDurationYears("");
    setTotalSemesters("");
    setCreditHours("");
    setAcademicYearBS("2081-082");
    setIntakeMonthBS("");

    // Fees
    setAdmissionFee("");
    setTuitionPerSem("");
    setExamFeePerSem("");
    setLabFeePerSem("");
    setCustomFees([]);
    setTotalApprox("");
    setTotalManual(false);

    // Conditions
    setConditions(DEFAULT_CONDITIONS);

    // Signatories
    setSignatories(DEFAULT_SIGNATORIES);

    // QR
    const newToken = makeQrToken();
    setQrToken(newToken);
    setQrVerifyUrl(`verify.Unnati.com.np/doc/${newToken}`);

    // Misc
    setGenerated(false);
    setSavedId(null);
    setApplicationId(undefined);
  };

  // ── Save to database ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name before saving.");
      return;
    }
    try {
      const response = await createOfferLetter({
        ...(applicationId && { applicationId }),
        college: {
          collegeName,
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
          validUntilAD: validUntilAD || undefined,
          validUntilBS: validUntilBS || undefined,
        },
        student: {
          studentFullName: studentName,
          studentDobAD: studentDobAD || undefined,
          studentDobBS: studentDobBS || undefined,
          citizenshipNumber: citizenshipNo || undefined,
          fatherName: fatherName || undefined,
          motherName: motherName || undefined,
          permanentAddress: permanentAddress || undefined,
          district: district || undefined,
          province: province || undefined,
        },
        program: {
          programName: progName || undefined,
          programFullName: progFullName || undefined,
          programAffiliation: progAffiliation || undefined,
          durationYears: durationYears ? Number(durationYears) : undefined,
          totalSemesters: totalSemesters ? Number(totalSemesters) : undefined,
          creditHours: creditHours ? Number(creditHours) : undefined,
          academicYearBS: academicYearBS || undefined,
          intakeMonthBS: intakeMonthBS || undefined,
        },
        fees: {
          admissionFee: admissionFee !== "" ? admissionFee : undefined,
          tuitionPerSem: tuitionPerSem !== "" ? tuitionPerSem : undefined,
          examFeePerSem: examFeePerSem !== "" ? examFeePerSem : undefined,
          labFeePerSem: labFeePerSem !== "" ? labFeePerSem : undefined,
          totalApprox: displayTotal || undefined,
        },
        conditions: conditions.filter(Boolean),
        signatories: signatories.map((s) => ({
          name: s.name,
          designation: s.designation,
          stampAreaLabel: s.stamp_area_label || undefined,
        })),
        qr: {
          qrToken: qrToken || undefined,
          qrVerifyUrl: qrVerifyUrl || undefined,
        },
      }).unwrap();
      toast.success("Offer letter saved", {
        description: `ID: ${response.id.slice(0, 8)}…`,
      });
      resetForm();
    } catch (err) {
      console.error("Save offer letter failed:", err);
      const description =
        err && typeof err === "object" && "data" in err
          ? JSON.stringify((err as { data: unknown }).data)
          : err instanceof Error
            ? err.message
            : undefined;
      toast.error("Failed to save offer letter.", { description });
    }
  };

  // ── PDF download ───────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!collegeName || !studentName) {
      toast.error("Fill in college name and student name before downloading.");
      return;
    }

    const html = buildOfferLetterHtml(
      {
        collegeName,
        collegeAddress,
        collegeRegNo,
        collegeAffiliation,
        collegePhone,
        collegeEmail,
        collegeWebsite,
        logoUrl,
        refNo,
        issuedDateAD,
        issuedDateBS,
        validUntilAD,
        validUntilBS,
        studentName,
        studentDobAD,
        studentDobBS,
        citizenshipNumber: citizenshipNo,
        fatherName,
        motherName,
        permanentAddress,
        district,
        province,
        programName: progName,
        programFullName: progFullName,
        programAffiliation: progAffiliation,
        durationYears: durationYears || undefined,
        totalSemesters: totalSemesters || undefined,
        creditHours: creditHours || undefined,
        academicYearBS,
        intakeMonthBS,
        fees: {
          admissionFee: af,
          tuitionPerSem: tf,
          examFeePerSem: ef,
          labFeePerSem: lf,
          totalSemesters: sems,
          totalApprox: displayTotal,
          customFees: customFeesFilled.map((f) => ({
            label: f.label,
            amount: Number(f.amount) || 0,
            perSemester: f.perSemester,
          })),
        },
        conditions,
        signatories: signatories.map((s) => ({
          name: s.name,
          designation: s.designation,
          stampAreaLabel: s.stamp_area_label,
        })),
        qrToken,
        qrVerifyUrl,
      },
      { autoPrint: true },
    );

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked — allow popups to download the PDF.");
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
    toast.success("Offer letter ready", {
      description: "Click Download PDF to save.",
    });
  };

  // ─── Helpers for dynamic lists ───────────────────────────────────────────
  function updateCustomFee(
    idx: number,
    field: keyof CustomFee,
    val: string | number | boolean,
  ) {
    setCustomFees((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f)),
    );
  }
  function removeCustomFee(idx: number) {
    setCustomFees((prev) => prev.filter((_, i) => i !== idx));
  }
  function addCustomFee() {
    setCustomFees((prev) => [
      ...prev,
      { label: "", amount: "", perSemester: false },
    ]);
  }

  function updateCondition(idx: number, val: string) {
    setConditions((prev) => prev.map((c, i) => (i === idx ? val : c)));
  }
  function removeCondition(idx: number) {
    setConditions((prev) => prev.filter((_, i) => i !== idx));
  }
  function addCondition() {
    setConditions((prev) => [...prev, ""]);
  }

  function updateSignatory(
    idx: number,
    field: keyof (typeof signatories)[0],
    val: string,
  ) {
    setSignatories((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    );
  }
  function removeSignatory(idx: number) {
    setSignatories((prev) => prev.filter((_, i) => i !== idx));
  }
  function addSignatory() {
    setSignatories((prev) => [
      ...prev,
      { name: "", designation: "", stamp_area_label: "Seal" },
    ]);
  }

  // ─── Section fill indicators for sidebar ─────────────────────────────────
  const sectionFilled: Record<string, boolean> = {
    "sec-college": !!collegeName,
    "sec-document": !!refNo,
    "sec-student": !!studentName,
    "sec-program": !!progName,
    "sec-fees": af > 0 || tf > 0 || customFeesFilled.length > 0,
    "sec-conditions": conditions.some(Boolean),
    "sec-signatories": signatories.some((s) => s.name),
    "sec-qr": !!qrToken,
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Offer Letter Generator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the form — the document preview updates live as you type.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Col 1: Form */}
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
                    Admission Offer Letter
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preview updates as you fill in the form.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
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
              {/* ── Link to application (optional) ── */}
              <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20">
                <Field label="Link to loan application (optional)">
                  <Select
                    value={applicationId ?? "none"}
                    onValueChange={handleApplicationSelect}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Not linked to an application" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">
                        Not linked
                      </SelectItem>
                      {verifications?.map((v) => (
                        <SelectItem
                          key={v.applicationId}
                          value={v.applicationId}
                          className="text-xs"
                        >
                          {v.applicationNumber} — {v.studentName ?? "Unnamed"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  When linked, this document becomes visible in the
                  student&apos;s Document Vault and notifies the loan&apos;s
                  student, initiator, supporter, checker, and approver.
                </p>
              </div>

              {/* ── College ── */}
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
                  <Field label="Affiliation (college level)">
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
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] text-muted-foreground">
                      College logo
                    </Label>

                    {/* Upload button */}
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

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">
                        or paste URL
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* URL input */}
                    <Input
                      className="h-8 text-xs"
                      placeholder="https://college.edu.np/logo.png"
                      value={logoFileName ? "" : logoUrl}
                      disabled={!!logoFileName}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />

                    {/* Preview */}
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

              {/* ── Document ── */}
              <div>
                <SectionHead id="sec-document" label="Document" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Reference no.">
                    <Input
                      className="h-8 text-xs"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                    />
                  </Field>
                  <div /> {/* spacer */}
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
                  <Field label="Valid until (AD)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2024-12-31"
                      value={validUntilAD}
                      onChange={(e) => setValidUntilAD(e.target.value)}
                    />
                  </Field>
                  <Field label="Valid until (BS)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2081 Poush 15"
                      value={validUntilBS}
                      onChange={(e) => setValidUntilBS(e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <Separator />

              {/* ── Student ── */}
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
                  <Field label="Citizenship no.">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 43-01-76-05231"
                      value={citizenshipNo}
                      onChange={(e) => setCitizenshipNo(e.target.value)}
                    />
                  </Field>
                  <Field label="Date of birth (AD)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2001-05-12"
                      value={studentDobAD}
                      onChange={(e) => setStudentDobAD(e.target.value)}
                    />
                  </Field>
                  <Field label="Date of birth (BS)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. 2058 Jestha 29"
                      value={studentDobBS}
                      onChange={(e) => setStudentDobBS(e.target.value)}
                    />
                  </Field>
                  <Field label="Father's name">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Father's full name"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                    />
                  </Field>
                  <Field label="Mother's name">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Mother's full name"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                    />
                  </Field>
                  <Field label="Permanent address">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Ward / VDC / Municipality"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                    />
                  </Field>
                  <Field label="District">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Kathmandu"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </Field>
                  <Field label="Province">
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {NEPAL_PROVINCES.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <Separator />

              {/* ── Program ── */}
              <div>
                <SectionHead id="sec-program" label="Program" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Program short name *">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. BBA"
                      value={progName}
                      onChange={(e) => setProgName(e.target.value)}
                    />
                  </Field>
                  <Field label="Program full name">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Bachelor of Business Administration"
                      value={progFullName}
                      onChange={(e) => setProgFullName(e.target.value)}
                    />
                  </Field>
                  <Field label="Program affiliation">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Pokhara University"
                      value={progAffiliation}
                      onChange={(e) => setProgAffiliation(e.target.value)}
                    />
                  </Field>
                  <Field label="Duration (years)">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="e.g. 4"
                      value={durationYears}
                      onChange={(e) => setDurationYears(e.target.value)}
                    />
                  </Field>
                  <Field label="Total semesters">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="e.g. 8"
                      value={totalSemesters}
                      onChange={(e) => setTotalSemesters(e.target.value)}
                    />
                  </Field>
                  <Field label="Credit hours">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="e.g. 120"
                      value={creditHours}
                      onChange={(e) => setCreditHours(e.target.value)}
                    />
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
                  <Field label="Intake month (BS)">
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Bhadra 2081"
                      value={intakeMonthBS}
                      onChange={(e) => setIntakeMonthBS(e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <Separator />

              {/* ── Fees ── */}
              <div>
                <SectionHead id="sec-fees" label="Fee Structure (NPR)" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Admission fee (one-time)">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="0"
                      value={admissionFee}
                      onChange={(e) =>
                        setAdmissionFee(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field label="Tuition fee / semester">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="0"
                      value={tuitionPerSem}
                      onChange={(e) =>
                        setTuitionPerSem(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field label="Exam fee / semester">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="0"
                      value={examFeePerSem}
                      onChange={(e) =>
                        setExamFeePerSem(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field label="Lab fee / semester">
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="0"
                      value={labFeePerSem}
                      onChange={(e) =>
                        setLabFeePerSem(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                </div>

                {/* Custom fees — for colleges whose fee structure doesn't fit the fixed fields above */}
                <div className="mt-4">
                  <Label className="text-[10px] text-muted-foreground">
                    Custom fees (college-specific)
                  </Label>
                  <div className="space-y-2 mt-1.5">
                    {customFees.map((f, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input
                          className="h-8 text-xs flex-1"
                          placeholder="Fee label, e.g. Hostel fee, Uniform fee"
                          value={f.label}
                          onChange={(e) =>
                            updateCustomFee(i, "label", e.target.value)
                          }
                        />
                        <Input
                          className="h-8 text-xs w-28 shrink-0"
                          type="number"
                          placeholder="Amount"
                          value={f.amount}
                          onChange={(e) =>
                            updateCustomFee(
                              i,
                              "amount",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateCustomFee(i, "perSemester", !f.perSemester)
                          }
                          className={`h-8 px-2 rounded-md text-[10px] font-medium border shrink-0 whitespace-nowrap transition-colors ${
                            f.perSemester
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {f.perSemester ? "Per semester" : "One-time"}
                        </button>
                        <button
                          type="button"
                          aria-label="Remove fee"
                          onClick={() => removeCustomFee(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={addCustomFee}
                    >
                      <Plus className="w-3 h-3" /> Add custom fee
                    </Button>
                  </div>
                  {customFeesFilled.length > 0 && (
                    <p className="text-[10px] text-[oklch(0.55_0.18_80)] mt-2">
                      Custom fees are included in the total, live preview, and
                      PDF, but the backend doesn&apos;t yet store itemized
                      custom fees — only the combined total is saved when you
                      click Save. Re-enter them if you reopen a saved offer
                      letter.
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <Field
                    label={`Total (approx) — auto: ${autoTotal > 0 ? fmtNPR(autoTotal) : "fill fields above"}`}
                  >
                    <div className="flex gap-2 items-center">
                      <Input
                        className={`h-8 text-xs flex-1 ${!totalManual ? "bg-muted/40 text-[oklch(0.42_0.18_145)] font-semibold" : ""}`}
                        type="number"
                        placeholder="Auto-calculated"
                        value={
                          totalManual
                            ? totalApprox
                            : autoTotal > 0
                              ? autoTotal
                              : ""
                        }
                        readOnly={!totalManual}
                        onChange={(e) => {
                          if (totalManual)
                            setTotalApprox(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            );
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs whitespace-nowrap shrink-0"
                        onClick={() => {
                          setTotalManual((m) => !m);
                          setTotalApprox("");
                        }}
                      >
                        {totalManual ? "Use auto" : "Override"}
                      </Button>
                    </div>
                  </Field>
                </div>
              </div>

              <Separator />

              {/* ── Conditions ── */}
              <div>
                <SectionHead id="sec-conditions" label="Admission Conditions" />
                <div className="space-y-2">
                  {conditions.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-[10px] text-muted-foreground w-4 shrink-0">
                        {i + 1}.
                      </span>
                      <Input
                        className="h-8 text-xs flex-1"
                        placeholder="Condition text..."
                        value={c}
                        onChange={(e) => updateCondition(i, e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label="Remove condition"
                        onClick={() => removeCondition(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 mt-1"
                    onClick={addCondition}
                  >
                    <Plus className="w-3 h-3" /> Add condition
                  </Button>
                </div>
              </div>

              <Separator />

              {/* ── Signatories ── */}
              <div>
                <SectionHead id="sec-signatories" label="Signatories" />
                <div className="space-y-3">
                  {signatories.map((s, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="Signatory name"
                          value={s.name}
                          onChange={(e) =>
                            updateSignatory(i, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Designation
                        </Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. Principal"
                          value={s.designation}
                          onChange={(e) =>
                            updateSignatory(i, "designation", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="space-y-1 flex-1">
                          <Label className="text-[10px] text-muted-foreground">
                            Stamp label
                          </Label>
                          <Input
                            className="h-8 text-xs"
                            placeholder="e.g. Office Seal"
                            value={s.stamp_area_label}
                            onChange={(e) =>
                              updateSignatory(
                                i,
                                "stamp_area_label",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        {signatories.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove signatory"
                            onClick={() => removeSignatory(i)}
                            className="mb-0.5 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={addSignatory}
                  >
                    <Plus className="w-3 h-3" /> Add signatory
                  </Button>
                </div>
              </div>

              <Separator />

              {/* ── QR ── */}
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
                    Offer letter ready.{" "}
                    <button
                      type="button"
                      className="underline"
                      onClick={handleDownloadPDF}
                    >
                      Download PDF
                    </button>
                    {" · "}
                    <button type="button" className="underline">
                      Send to bank
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Col 2: Live preview (sticky) */}
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
                  NRB-compliant offer letter
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="bg-white rounded-lg p-4 font-mono text-[9.5px] border border-border shadow-sm leading-relaxed">
                {/* Letterhead */}
                <div className="border-b-2 border-primary pb-3 mb-3 flex items-start gap-2">
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="logo"
                      className="h-9 w-9 object-contain shrink-0 rounded"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  {!logoUrl && (
                    <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
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

                {/* Ref + dates */}
                <div className="flex justify-between text-[8px] text-muted-foreground mb-2">
                  <span>
                    <strong>Ref.:</strong> {refNo}
                  </span>
                  <span>
                    <strong>Date:</strong> {issuedDateAD || today}
                    {issuedDateBS && ` / ${issuedDateBS} BS`}
                  </span>
                </div>

                {/* Title */}
                <div className="bg-primary/10 text-center py-1.5 mb-3 rounded">
                  <p className="text-[9.5px] font-bold text-primary">
                    LETTER OF ADMISSION OFFER
                  </p>
                  <p className="text-[8px] text-primary/80">
                    {progFullName || progName ? (
                      <>
                        <L v={progFullName || progName} p="Program" />
                      </>
                    ) : (
                      <span className="italic text-muted-foreground/40">
                        [Program]
                      </span>
                    )}
                    {(progAffiliation || collegeAffiliation) && (
                      <> · {progAffiliation || collegeAffiliation}</>
                    )}
                  </p>
                </div>

                {/* Addressee */}
                <div className="bg-muted/40 rounded p-2 mb-2 text-[8.5px] leading-snug">
                  <strong>To,</strong>
                  <br />
                  <strong>
                    <L v={studentName} p="Student name" />
                  </strong>
                  {fatherName && <> &nbsp;| S/O: {fatherName}</>}
                  {motherName && <> / D/O: {motherName}</>}
                  <br />
                  Citizenship No.: <L v={citizenshipNo} p="—" />
                  &nbsp; DOB:{" "}
                  {studentDobAD || (
                    <span className="text-muted-foreground/40 italic">
                      [DOB]
                    </span>
                  )}
                  {studentDobBS && ` (${studentDobBS} BS)`}
                  <br />
                  Address: <L v={permanentAddress} p="Permanent address" />
                  {district && `, ${district}`}
                  {province && `, ${province} Province`}
                </div>

                {/* Opening para */}
                <p className="text-[8.5px] text-muted-foreground leading-snug mb-2">
                  Dear{" "}
                  <strong className="text-foreground">
                    <L v={studentName} p="Student" />
                  </strong>
                  , we are pleased to inform you that{" "}
                  <strong className="text-foreground">
                    <L v={collegeName} p="College" />
                  </strong>{" "}
                  has{" "}
                  <strong className="text-[oklch(0.42_0.18_145)]">
                    selected you for admission
                  </strong>{" "}
                  to <L v={progFullName || progName} p="the program" /> for AY{" "}
                  {academicYearBS}.
                  {(validUntilAD || validUntilBS) &&
                    ` Valid until ${validUntilAD || ""}${validUntilBS ? ` (${validUntilBS} BS)` : ""}.`}
                </p>

                {/* Program table */}
                <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                  Program Details
                </p>
                <table className="w-full text-[8px] border-collapse mb-2">
                  <tbody>
                    {[
                      ["Program", progFullName || progName || "—"],
                      [
                        "Affiliation",
                        progAffiliation || collegeAffiliation || "—",
                      ],
                      [
                        "Duration",
                        durationYears
                          ? `${durationYears} yr${Number(durationYears) !== 1 ? "s" : ""}`
                          : "—",
                      ],
                      ["Semesters", totalSemesters || "—"],
                      ["Credit Hrs", creditHours || "—"],
                      ["Academic Year (BS)", academicYearBS],
                      ["Intake (BS)", intakeMonthBS || "—"],
                    ].map(([f, v], i) => (
                      <tr key={f} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[45%]">
                          {f}
                        </td>
                        <td className="px-1.5 py-0.5 border border-border/50 font-medium">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Fee table */}
                <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                  Fee Structure (NPR)
                </p>
                <table className="w-full text-[8px] border-collapse mb-2">
                  <tbody>
                    {[
                      ["Admission fee", af > 0 ? fmtNPR(af) : "—"],
                      ["Tuition / sem", tf > 0 ? fmtNPR(tf) : "—"],
                      ["Exam fee / sem", ef > 0 ? fmtNPR(ef) : "—"],
                      ["Lab fee / sem", lf > 0 ? fmtNPR(lf) : "—"],
                      ...customFeesFilled.map((cf) => [
                        `${cf.label}${cf.perSemester ? " / sem" : ""}`,
                        fmtNPR(Number(cf.amount) || 0),
                      ]),
                      [
                        "Total (approx)",
                        displayTotal > 0 ? fmtNPR(displayTotal) + "/-" : "—",
                      ],
                    ].map(([f, v], i) => (
                      <tr key={f} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <td className="px-1.5 py-0.5 border border-border/50 text-muted-foreground w-[45%]">
                          {f}
                        </td>
                        <td
                          className={`px-1.5 py-0.5 border border-border/50 ${f === "Total (approx)" ? "font-bold text-[oklch(0.42_0.18_145)]" : "font-medium"}`}
                        >
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Conditions */}
                {conditions.some(Boolean) && (
                  <>
                    <p className="text-[8px] font-bold text-foreground mb-1 border-b border-border pb-0.5">
                      Conditions
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5 mb-2">
                      {conditions.filter(Boolean).map((c, i) => (
                        <li
                          key={i}
                          className="text-[8px] text-muted-foreground leading-snug"
                        >
                          {c}
                        </li>
                      ))}
                    </ol>
                  </>
                )}

                {/* Cert box */}
                <div className="bg-[oklch(0.62_0.18_145)]/8 border-l-2 border-[oklch(0.62_0.18_145)] px-2 py-1.5 mb-2 rounded-r text-[8px] leading-snug">
                  <strong>College Certification:</strong>{" "}
                  <L v={collegeName} p="College" /> certifies this offer for
                  bank education loan processing. Total fee:{" "}
                  <strong>
                    {displayTotal > 0 ? fmtNPR(displayTotal) + "/-" : "[total]"}
                  </strong>{" "}
                  (NPR).
                  <br />
                  <span className="text-primary">
                    QR: {qrVerifyUrl} · Token: {qrToken}
                  </span>
                </div>

                {/* Signatures */}
                <div className="flex justify-between mt-3 pt-2 border-t border-border">
                  {signatories.map((s, i) => (
                    <div key={i} className="flex-1 text-center text-[7.5px]">
                      <div className="border-t border-muted-foreground/30 mt-6 mb-1" />
                      <p className="font-bold text-foreground text-[8px]">
                        {s.name || s.designation}
                      </p>
                      <p className="text-muted-foreground">{s.designation}</p>
                      <p className="text-muted-foreground/50 italic">
                        [{s.stamp_area_label}]
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
