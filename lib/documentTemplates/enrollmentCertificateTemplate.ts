// Single source of truth for the Enrollment Certificate print/PDF layout —
// shared by EnrollmentCertificateGenerator.tsx and DocumentVaultViewer.tsx.

export interface EnrollmentCertificateTemplateData {
  collegeName: string;
  collegeCode?: string | null;
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
  studentFullName: string;
  tuRollNo?: string | null;
  enrollmentNo?: string | null;
  programName?: string | null;
  currentYear?: string | null;
  currentSemester?: string | null;
  academicYearBS?: string | null;
  studentStatus?: string | null;
  isEnrolled: boolean;
  hasBacklogs: boolean;
  disciplinaryHold: boolean;
  feeDueRs?: number | null;
  qrToken?: string | null;
  qrVerifyUrl?: string | null;
}

export function buildEnrollmentCertificateHtml(
  data: EnrollmentCertificateTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  const {
    collegeName,
    collegeCode,
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
    studentFullName,
    tuRollNo,
    enrollmentNo,
    programName,
    currentYear,
    currentSemester,
    academicYearBS,
    studentStatus,
    isEnrolled,
    hasBacklogs,
    disciplinaryHold,
    feeDueRs,
    qrToken,
    qrVerifyUrl,
  } = data;

  const today = new Date().toLocaleDateString("en-NP", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const displayDate = issuedDateAD || today;
  const feeDue = feeDueRs || 0;
  const fullRefNo = collegeCode ? `${collegeCode.toUpperCase()}/${refNo}` : refNo;

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
    ["Student Full Name", studentFullName],
    ["TU / University Roll No.", tuRollNo || "—"],
    ["Enrollment No.", enrollmentNo || "—"],
    ["Program / Course", programName || "—"],
    ["Current Year", `${currentYear} Year`],
    ["Current Semester", `Semester ${currentSemester}`],
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

  const printScript = opts.autoPrint
    ? `<script>
    window.onload = function () {
      setTimeout(function () { window.print(); window.onfocus = function () { window.close(); }; }, 200);
    };
  </script>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Enrollment Certificate — ${studentFullName}</title>
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
    This is to certify that <strong>${studentFullName}</strong>${tuRollNo ? `, bearing Roll No. <strong>${tuRollNo}</strong>,` : ""}
    is a <em>bona fide</em> student of <strong>${collegeName}</strong>${collegeAffiliation ? `, affiliated to ${collegeAffiliation}` : ""},
    currently enrolled in the <strong>${programName || "—"}</strong> program
    (Enrollment No.: <strong>${enrollmentNo || "—"}</strong>)
    during the Academic Year <strong>${academicYearBS}</strong>.
    The student is presently in <strong>${currentYear} Year / Semester ${currentSemester}</strong>
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
    <strong style="color:#166534">Verify at:</strong> ${qrVerifyUrl ?? ""} &nbsp;|&nbsp; Token: <strong>${qrToken ?? ""}</strong>
  </div>

  <div class="signatures">
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Registrar / Academic Officer</div><div class="sig-sub">${collegeName}</div></div>
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Principal / Campus Chief</div><div class="sig-sub">${collegeName} &nbsp;[Stamp]</div></div>
  </div>

  <div class="footer">
    Generated via Unnati Digital Platform · NRB Unified Directive 2081 · ${collegeName}${collegeRegNo ? ` · Reg. ${collegeRegNo}` : ""}
  </div>
  ${printScript}
</body>
</html>`;
}
