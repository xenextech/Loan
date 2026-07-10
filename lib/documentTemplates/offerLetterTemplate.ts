// Single source of truth for the Offer Letter print/PDF layout — shared by
// OfferLetterGenerator.tsx (college's own Download PDF button) and
// DocumentVaultViewer.tsx (student's Document Vault View/Download), so both
// render the exact same document instead of the vault showing a stripped-down
// summary.

export interface OfferLetterFeesInput {
  admissionFee?: number;
  tuitionPerSem?: number;
  examFeePerSem?: number;
  labFeePerSem?: number;
  totalSemesters?: number | string | null;
  totalApprox?: number;
  customFees?: { label: string; amount: number; perSemester: boolean }[];
}

export interface OfferLetterTemplateData {
  collegeName: string;
  collegeAddress?: string | null;
  collegeRegNo?: string | null;
  collegeAffiliation?: string | null;
  collegePhone?: string | null;
  collegeEmail?: string | null;
  collegeWebsite?: string | null;
  logoUrl?: string | null;
  refNo: string;
  issuedDateAD?: string | null;
  issuedDateBS?: string | null;
  validUntilAD?: string | null;
  validUntilBS?: string | null;
  studentName: string;
  studentDobAD?: string | null;
  studentDobBS?: string | null;
  citizenshipNumber?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  permanentAddress?: string | null;
  district?: string | null;
  province?: string | null;
  programName?: string | null;
  programFullName?: string | null;
  programAffiliation?: string | null;
  durationYears?: number | string | null;
  totalSemesters?: number | string | null;
  creditHours?: number | string | null;
  academicYearBS?: string | null;
  intakeMonthBS?: string | null;
  fees: OfferLetterFeesInput;
  conditions?: string[] | null;
  signatories?: { name: string; designation: string; stampAreaLabel?: string }[] | null;
  qrToken?: string | null;
  qrVerifyUrl?: string | null;
}

function fmtNPR(n: number) {
  return "Rs " + n.toLocaleString("en-IN");
}

export function buildOfferLetterHtml(
  data: OfferLetterTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  const {
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
    fatherName,
    motherName,
    citizenshipNumber,
    studentDobAD,
    studentDobBS,
    permanentAddress,
    district,
    province,
    programName,
    programFullName,
    programAffiliation,
    durationYears,
    totalSemesters,
    creditHours,
    academicYearBS,
    intakeMonthBS,
    fees,
    conditions,
    signatories,
    qrToken,
    qrVerifyUrl,
  } = data;

  const today = new Date().toLocaleDateString("en-NP", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const displayDate = issuedDateAD || today;

  const af = fees.admissionFee || 0;
  const tf = fees.tuitionPerSem || 0;
  const ef = fees.examFeePerSem || 0;
  const lf = fees.labFeePerSem || 0;
  const sems = Number(fees.totalSemesters ?? totalSemesters) || 0;
  const customFeesFilled = (fees.customFees ?? []).filter(
    (f) => f.label.trim() && f.amount > 0,
  );
  const customFeesTotal = customFeesFilled.reduce(
    (sum, f) => sum + (f.perSemester ? f.amount * sems : f.amount),
    0,
  );
  const autoTotal = af + (tf + ef + lf) * sems + customFeesTotal;
  const displayTotal = fees.totalApprox || autoTotal;

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${collegeName}" style="height:56px;object-fit:contain;margin-right:14px">`
    : `<div style="width:56px;height:56px;background:#dcfce7;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:14px;font-size:20px;font-weight:800;color:#166534">${collegeName.charAt(0)}</div>`;

  const conditionRows = (conditions ?? [])
    .filter(Boolean)
    .map((c) => `<li style="margin-bottom:5px;font-size:9.5pt">${c}</li>`)
    .join("");

  const sigList = signatories ?? [];
  const sigCols = sigList
    .map(
      (s) => `
        <div style="text-align:center;width:${Math.floor(100 / (sigList.length || 1))}%">
          <div style="border-top:1px solid #9ca3af;margin:44px 14px 6px"></div>
          <div style="font-weight:700;font-size:9.5pt">${s.name || s.designation}</div>
          <div style="font-size:8.5pt;color:#6b7280">${s.designation}</div>
          <div style="font-size:8pt;color:#9ca3af;font-style:italic">[${s.stampAreaLabel ?? ""}]</div>
        </div>`,
    )
    .join("");

  const programRows = [
    ["Program (Short)", programName || "—"],
    ["Program (Full)", programFullName || "—"],
    ["Affiliation", programAffiliation || collegeAffiliation || "—"],
    [
      "Duration",
      durationYears
        ? `${durationYears} Year${Number(durationYears) !== 1 ? "s" : ""}`
        : "—",
    ],
    ["Total Semesters", totalSemesters || "—"],
    ["Credit Hours", creditHours || "—"],
    ["Academic Year (BS)", academicYearBS || "—"],
    ["Intake Month (BS)", intakeMonthBS || "—"],
  ]
    .map(
      ([f, v], i) =>
        `<tr style="background:${i % 2 === 1 ? "#f9fafb" : "#fff"}"><td style="padding:6px 10px;border:1px solid #d1d5db;width:42%;color:#6b7280">${f}</td><td style="padding:6px 10px;border:1px solid #d1d5db;font-weight:500">${v}</td></tr>`,
    )
    .join("");

  const feeRows = [
    ["Admission Fee (one-time)", af > 0 ? fmtNPR(af) : "—"],
    ["Tuition Fee / Semester", tf > 0 ? fmtNPR(tf) : "—"],
    ["Exam Fee / Semester", ef > 0 ? fmtNPR(ef) : "—"],
    ["Lab Fee / Semester", lf > 0 ? fmtNPR(lf) : "—"],
    ...customFeesFilled.map((f) => [
      `${f.label}${f.perSemester ? " / Semester" : " (one-time)"}`,
      fmtNPR(f.amount),
    ]),
    [
      "Total (Approx)",
      displayTotal > 0 ? fmtNPR(displayTotal) + "/- (NPR)" : "—",
    ],
  ]
    .map(
      ([f, v], i) =>
        `<tr style="background:${i % 2 === 1 ? "#f9fafb" : "#fff"}"><td style="padding:6px 10px;border:1px solid #d1d5db;width:42%;color:#6b7280">${f}</td><td style="padding:6px 10px;border:1px solid #d1d5db;${f === "Total (Approx)" ? "font-weight:700;color:#166534" : ""}">${v}</td></tr>`,
    )
    .join("");

  const printScript = opts.autoPrint
    ? `<script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
        window.onfocus = function () { window.close(); };
      }, 200);
    };
  </script>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Offer Letter — ${studentName}</title>
  <style>
    @page { size: A4; margin: 16mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #111; line-height: 1.55; }
    .header { border-bottom: 2.5px solid #15c35b; padding-bottom: 12px; margin-bottom: 12px; display: flex; align-items: center; }
    .college-name { font-size: 13.5pt; font-weight: 800; color: #0a7a38; text-transform: uppercase; }
    .college-meta { font-size: 8.5pt; color: #6b7280; margin-top: 3px; line-height: 1.45; }
    .meta-row { display: flex; justify-content: space-between; font-size: 9pt; color: #6b7280; margin-bottom: 10px; }
    .title-banner { background: #f0fdf4; border: 1px solid #bbf7d0; text-align: center; padding: 9px; margin-bottom: 13px; border-radius: 4px; }
    .title-banner h2 { font-size: 12pt; color: #166534; font-weight: 700; }
    .title-banner p  { font-size: 9pt; color: #166534; margin-top: 2px; }
    .addressee { font-size: 9.5pt; margin-bottom: 10px; line-height: 1.7; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; }
    .body-text { font-size: 9.5pt; margin-bottom: 13px; line-height: 1.65; }
    h3 { font-size: 10pt; font-weight: 700; margin: 12px 0 7px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt; }
    table thead tr { background: #15803d; color: #fff; }
    table thead th { padding: 7px 10px; text-align: left; }
    ol { padding-left: 18px; margin-bottom: 12px; }
    .cert-box { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 10px 14px; margin-bottom: 14px; font-size: 9pt; line-height: 1.65; border-radius: 0 4px 4px 0; }
    .signatures { display: flex; justify-content: space-between; margin-top: 28px; padding-top: 12px; border-top: 1px solid #d1d5db; }
    .footer { text-align: center; font-size: 7.5pt; color: #9ca3af; margin-top: 14px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <div>
      <div class="college-name">${collegeName}</div>
      <div class="college-meta">
        ${collegeAffiliation ? `Affiliated to ${collegeAffiliation}` : ""}
        ${collegeRegNo ? ` | Reg. No.: ${collegeRegNo}` : ""}
        ${collegeAddress ? `<br>${collegeAddress}` : ""}
        ${collegePhone || collegeEmail || collegeWebsite ? `<br>${[collegePhone, collegeEmail, collegeWebsite].filter(Boolean).join(" · ")}` : ""}
      </div>
    </div>
  </div>

  <div class="meta-row">
    <span><strong>Ref. No.:</strong> ${refNo}</span>
    <span><strong>Issued (AD):</strong> ${issuedDateAD || displayDate}${issuedDateBS ? ` &nbsp;/&nbsp; ${issuedDateBS} (BS)` : ""}</span>
  </div>

  <div class="title-banner">
    <h2>LETTER OF ADMISSION OFFER</h2>
    <p>${programFullName || programName || "Program"} · ${programAffiliation || collegeAffiliation || "Affiliated University"}</p>
  </div>

  <div class="addressee">
    <strong>To,</strong><br>
    <strong>${studentName}</strong>${fatherName ? ` &nbsp;|&nbsp; S/O: ${fatherName}` : ""}${motherName ? ` / D/O: ${motherName}` : ""}<br>
    Citizenship No.: ${citizenshipNumber || "—"}&nbsp;&nbsp;
    DOB: ${studentDobAD || "—"}${studentDobBS ? ` (${studentDobBS} BS)` : ""}<br>
    Permanent Address: ${permanentAddress || "—"}${district ? `, ${district}` : ""}${province ? `, ${province} Province` : ""}
  </div>

  <div class="body-text">
    Dear <strong>${studentName}</strong>,<br>
    We are pleased to inform you that the Admission Committee of <strong>${collegeName}</strong> has
    <strong>selected you for admission</strong> to the program detailed below for Academic Year
    ${academicYearBS}. This offer is issued as per ${programAffiliation || collegeAffiliation || "University"} guidelines
    and NRB Unified Directives 2081. ${validUntilAD || validUntilBS ? `This offer is valid until ${validUntilAD || ""}${validUntilBS ? ` (${validUntilBS} BS)` : ""}.` : ""}
  </div>

  <h3>Program Details</h3>
  <table>
    <thead><tr><th style="width:42%">Field</th><th>Detail</th></tr></thead>
    <tbody>${programRows}</tbody>
  </table>

  <h3>Fee Structure (NPR)</h3>
  <table>
    <thead><tr><th style="width:42%">Fee Head</th><th>Amount</th></tr></thead>
    <tbody>${feeRows}</tbody>
  </table>

  ${conditionRows ? `<h3>Admission Conditions</h3><ol>${conditionRows}</ol>` : ""}

  <div class="cert-box">
    <strong>College Certification for Bank:</strong> ${collegeName} certifies this offer letter for
    education loan processing at any NRB-licensed bank. Total course fee of
    <strong>${displayTotal > 0 ? fmtNPR(displayTotal) + "/-" : "—"}</strong> (NPR) is official.
    Disbursement shall be made directly to the college fee account.<br>
    <span style="color:#166534;font-size:8.5pt">
      QR Verify: ${qrVerifyUrl ?? ""} &nbsp;|&nbsp; Token: ${qrToken ?? ""}
    </span>
  </div>

  <div class="signatures">${sigCols}</div>

  <div class="footer">
    Generated via Unnati Digital Platform · NRB Unified Directive 2081 · ${collegeName}
    ${collegeWebsite ? ` · ${collegeWebsite}` : ""}
  </div>
  ${printScript}
</body>
</html>`;
}
