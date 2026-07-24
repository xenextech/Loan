// Single source of truth for the Legal Document (Loan Agreement / Guarantee
// Deed / Hypothecation / Promissory Note) preview & print layout — shared by
// the Credit Manager's live generator preview (pre-submission, built from
// the application's effective loan terms) and the read-only viewer for an
// already-generated GeneratedAgreementRecord (post-submission, built from
// its stored templateSnapshot). Both cases feed the exact same shape so the
// live preview the Credit Manager edits is pixel-identical to what gets
// persisted.
//
// LOAN_AGREEMENT renders as a Nepali-language "कर्जा प्रस्ताव पत्र" (loan
// proposal letter) — structure and clause text mirror the bank's own paper
// template (see lib/nepaliNumber.ts for the amount-in-words helper). The
// lending financial institution's name is editable per document (via
// `institutionName`, defaulting to "Unnati") since the platform may generate
// documents on behalf of different partner banks/NBFCs, not just Unnati.
// Fields the application data doesn't capture (borrower address, citizenship
// no., collateral parcel details, branch name, etc.) are left as dotted
// blanks for manual completion, same as on the paper original. The other
// three document types keep the existing generic English template, which
// also honors `institutionName`.

import NepaliDate from "nepali-date-converter";
import { formatNepaliRupeeWords, toDevanagariNumeral } from "@/lib/nepaliNumber";
import type { GeneratedAgreementRecord } from "@/types/dashboard";

export type LegalDocumentType =
  | "LOAN_AGREEMENT"
  | "GUARANTEE_DEED"
  | "HYPOTHECATION"
  | "PROMISSORY_NOTE";

// Nepali titles, matching the bank's own paper documents verbatim (as
// uploaded): कर्जा प्रस्ताव पत्र, व्यक्तिगत जमानत, कर्जा तमसुक, and कर्जा रकम
// निकासा अनुरोध पत्र — shown as-is in the Document Type picker and on each
// generated document, same as LOAN_AGREEMENT already does.
export const LEGAL_DOCUMENT_TYPE_LABEL: Record<LegalDocumentType, string> = {
  LOAN_AGREEMENT: "कर्जा प्रस्ताव पत्र",
  GUARANTEE_DEED: "व्यक्तिगत जमानत",
  PROMISSORY_NOTE: "कर्जा तमसुक",
  HYPOTHECATION: "कर्जा रकम निकासा अनुरोध पत्र",
};

export interface LegalDocumentTemplateData {
  documentNumber?: string | null;
  agreementType: LegalDocumentType;
  status?: "DRAFT" | "PENDING_SIGNATURE" | "SIGNED" | "ACTIVE";
  studentName: string;
  applicationNumber: string;
  collegeName?: string | null;
  courseName?: string | null;
  loanProduct?: string | null;
  finalDisbursementAmount: number | null;
  interestRate: number | null;
  tenureMonths: number | null;
  gracePeriodMonths?: number | null;
  repaymentFrequency?: string | null;
  emiAmount: number | null;
  totalRepayment: number | null;
  guarantor?: {
    name: string | null;
    relationship: string | null;
    netWorth: string | null;
    /** Citizenship certificate number — not captured anywhere else in the
     *  application, so this is manually typed by the Credit Manager when
     *  filling in the Loan Agreement's blanks. */
    citizenshipNo?: string | null;
    citizenshipIssueDate?: string | null;
    citizenshipOffice?: string | null;
    address?: string | null;
    /** GUARANTEE_DEED only — traditional citizenship parentage/permanent
     *  address fields that document's paper template uses. */
    fatherOrHusbandName?: string | null;
    grandfatherName?: string | null;
    permanentDistrict?: string | null;
    permanentMunicipality?: string | null;
    permanentWardNo?: string | null;
    age?: string | null;
  } | null;
  remarks?: string | null;
  generatedByName: string;
  generatedAt?: string | null;
  /** Display name of the lending financial institution (bank / finance
   *  company) issuing this document. Editable per document since the same
   *  platform may generate documents on behalf of different partner
   *  banks/NBFCs, not just Unnati itself. Defaults to "Unnati". */
  institutionName?: string | null;
  /** The following are blanks on the paper Loan Agreement ("...................")
   *  that have no source elsewhere in the application data — the Credit
   *  Manager fills them in by hand in the generator form. All optional;
   *  left as dotted blanks in the rendered document when not provided. */
  studentAddress?: string | null;
  studentCitizenshipNo?: string | null;
  studentCitizenshipOffice?: string | null;
  /** Name of the branch manager co-signing on behalf of the institution. */
  branchManagerName?: string | null;
  /** GUARANTEE_DEED / PROMISSORY_NOTE only — traditional citizenship
   *  parentage/permanent-address fields those templates use in place of
   *  the simpler address block LOAN_AGREEMENT uses. */
  studentCitizenshipIssueDate?: string | null;
  studentFatherOrHusbandName?: string | null;
  studentGrandfatherName?: string | null;
  studentPermanentDistrict?: string | null;
  studentPermanentMunicipality?: string | null;
  studentPermanentWardNo?: string | null;
  /** PROMISSORY_NOTE only — collateral/mortgage security details (धितो
   *  सुरक्षणको विवरण table). */
  collateralOwnerName?: string | null;
  collateralAddress?: string | null;
  collateralPlotNo?: string | null;
  collateralArea?: string | null;
  collateralRemarks?: string | null;
  /** HYPOTHECATION only — कर्जा रकम निकासा अनुरोध पत्र specific fields. */
  approvalLetterDate?: string | null;
  loanExpiryDate?: string | null;
  borrowerPosition?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
}

const DEFAULT_INSTITUTION_NAME = "Unnati";

function formatNpr(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `NPR ${v.toLocaleString("en-IN")}`;
}

function formatDate(v?: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NP", { day: "numeric", month: "long", year: "numeric" });
}

/** Best-effort AD -> BS conversion for display; falls back to a blank if the date is out of the library's supported range. */
function formatBsDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "................";
  try {
    return NepaliDate.fromAD(d).format("YYYY÷MM÷DD", "np");
  } catch {
    return "................";
  }
}

const BLANK = "....................";

export function buildLegalDocumentHtml(
  data: LegalDocumentTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  switch (data.agreementType) {
    case "LOAN_AGREEMENT":
      return buildLoanProposalLetterHtml(data, opts);
    case "GUARANTEE_DEED":
      return buildGuaranteeDeedHtml(data, opts);
    case "PROMISSORY_NOTE":
      return buildPromissoryNoteHtml(data, opts);
    case "HYPOTHECATION":
      return buildDisbursementRequestHtml(data, opts);
  }
}

// ---------------------------------------------------------------------------
// LOAN_AGREEMENT — कर्जा प्रस्ताव पत्र (Nepali loan proposal letter)
// ---------------------------------------------------------------------------

function buildLoanProposalLetterHtml(
  data: LegalDocumentTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  const {
    documentNumber,
    studentName,
    applicationNumber,
    collegeName,
    courseName,
    finalDisbursementAmount,
    interestRate,
    tenureMonths,
    gracePeriodMonths,
    guarantor,
    remarks,
    generatedByName,
    generatedAt,
    institutionName: institutionNameInput,
    studentAddress,
    studentCitizenshipNo,
    studentCitizenshipOffice,
    branchManagerName,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  const loanAmountWords = finalDisbursementAmount != null ? formatNepaliRupeeWords(finalDisbursementAmount) : `रू.${BLANK} (रकम अद्यावधि तोकिएको छैन)`;
  const loanAmountEnglish = finalDisbursementAmount != null ? formatNpr(finalDisbursementAmount) : "—";
  const interestRateNp = interestRate != null ? `${toDevanagariNumeral(interestRate)}%` : BLANK;
  const tenureNp = tenureMonths != null ? `${toDevanagariNumeral(tenureMonths)} महिना` : BLANK;
  const moratoriumNp = gracePeriodMonths ? `${toDevanagariNumeral(gracePeriodMonths)} महिना` : "शून्य";
  const purposeText = [courseName, collegeName].filter(Boolean).join(", ");
  const bsDate = formatBsDate(generatedAt);

  const addressLine = studentAddress?.trim() || BLANK;
  const citizenshipNoLine = studentCitizenshipNo?.trim() || BLANK;
  const citizenshipOfficeLine = studentCitizenshipOffice?.trim() || BLANK;
  const branchManagerLine = branchManagerName?.trim() || BLANK;
  const guarantorCitizenshipNo = guarantor?.citizenshipNo?.trim() || BLANK;
  const guarantorCitizenshipIssueDate = guarantor?.citizenshipIssueDate?.trim() || BLANK;
  const guarantorCitizenshipOffice = guarantor?.citizenshipOffice?.trim() || BLANK;
  const guarantorAddress = guarantor?.address?.trim() || BLANK;

  const guarantorLine = guarantor?.name
    ? `श्री÷श्रीमती <strong>${guarantor.name}</strong>${guarantor.relationship ? ` (${guarantor.relationship})` : ""} को व्यक्तिगत जमानी`
    : `श्री÷श्रीमती ${BLANK} को व्यक्तिगत जमानी`;

  const termsClauses = [
    "क) कर्जा पूर्णरूपमा चुक्ता नगरेसम्म वा कुनै दायित्व बाँकी रहेसम्म ऋणीले तलका शर्तहरू अविच्छिन्न पालना गर्नुपर्नेछ ।",
    "ख) ऋणीले नेपालको प्रचलित कानून तथा वित्तीय संस्थाको समय–समयमा तोकेको तथा नेपाल राष्ट्र बैंकले जारी गरेको निर्देशन पालना गर्न स्वीकार गर्नुपर्नेछ।",
    "ग) ऋणीको कुनै विवरण परिवर्तन भएमा तुरुन्त वित्तीय संस्थालाई जानकारी दिनुपर्नेछ।",
    "घ) धितो सम्पत्तिमा कसैले अतिक्रमण गरेमा वा चोरी भएमा ऋणीले वित्तीय संस्थालाई जानकारी दिनुपर्नेछ।",
    "ङ) ऋणी तथा एकाघर परिवार, जमानीदाताले वित्तीय संस्थाको ०.५% भन्दा बढी शेयर धारण गर्न पाइने छैन (राष्ट्र बैंकले तोकेको सीमाभन्दा बढी हुन नहुने)।",
    "च) ऋणीले वित्तीय संस्था विरुद्ध मुद्दा मामिला गरेमा वित्तीय संस्थाले तुरुन्त सम्पूर्ण लेना फिर्ता माग गर्नेछ।",
    "छ) कर्जा तथा व्याज नतिरेमा वा कालोसूची निर्देशन विपरीत कार्य गरेमा कर्जा सूचना केन्द्रले कालोसूचीमा राखिनेछ ।",
    "ज) ऋणीको वित्तीय संस्थामा रहेको मुद्दती, चल्ती, बचत खाताको रकम कट्टा गरी व्याज, साँवा, शुल्क असुल गर्ने अधिकार वित्तीय संस्थालाई रहनेछ ।",
    "झ) ऋणीले यसै वित्तीय संस्थामा चल्ती/बचत खाता राखी कारोबार गर्नुपर्नेछ, अन्य संस्थामा कर्जा भए विवरण दिनुपर्नेछ।",
    "ञ) सूचना, पत्राचार गर्दा खाता खोल्दा दिएको ठेगानामा गरिनेछ । ठेगाना परिवर्तन भएमा लिखित जानकारी दिनुपर्नेछ, नदिएमा सोही ठेगानामा गरिएको सञ्चार आधिकारिक मानिनेछ ।",
    "ट) चेकबुक, स्टेटमेन्ट, कार्ड, डिजिटल बैंकिङ विवरण गोप्य र सुरक्षित राख्नु ऋणीको जिम्मेवारी हुनेछ । ऋणीको कमजोरीबाट भएको हानीको जिम्मेवारी ऋणी स्वयंले लिनु पर्नेछ ।",
    "ठ) नेपाल राष्ट्र बैंकको ग्राहक संरक्षण निर्देशन बमोजिम वित्तीय संस्था ग्राहकहित संरक्षणमा प्रतिबद्ध रहनेछ।",
  ];

  const defaultClauses = [
    "क) व्याज तालिका अनुसार भुक्तानी नभएमा वा बीमा प्रिमियम वा अन्य लेना बाँकी रहेमा ।",
    "ख) कर्जा सम्झौता वा यस प्रस्ताव पत्रको कुनै शर्त उल्लङ्घन भएमा ।",
    "ग) स्वीकृत कर्जा रकम कानूनद्वारा वर्जित कार्यमा प्रयोग गरेमा ।",
    "घ) ऋणीले दिएको कुनै विवरण भ्रमपूर्ण, बाँझिने, नबुझिने, झुट्टा वा गलत ठहरिएमा ।",
    "ङ) ऋणीले दिएको तथ्याङ्क वा सूचना गलत रहेको वित्तीय संस्थालाई थाहा भएमा ।",
    "च) सुरक्षणको हिनामिना, भुक्तानीका स्रोत बन्द, वा साँवा/व्याज/फि/बीमा आदि तिर्न अस्वीकार गरेमा ।",
    "छ) धितो सम्पत्तिमा अड्चन, धावा, वा कानूनी आदेश आएमा, वा सम्पत्ति अधिग्रहण भएमा ।",
    "ज) ऋणीले कर्जा तिर्न असमर्थता प्रकट गरेमा ।",
    "झ) ऋणी बेपत्ता भएमा वा ९० दिनसम्म सम्पर्कमा नआएमा ।",
    "ञ) ऋणी कानूनद्वारा बर्जित कार्यमा संलग्न रहेको गम्भीर आरोप वा प्रमाणित भएमा वा अपराधिक गतिविधिमा संलग्न प्रमाणित भएमा ।",
    "ट) बक्यौता, बीमा शुल्क, लिलाम खर्च, कालोसूची शुल्क, पुनरसंरचना व्याज आदि बापत आधारदरमा अधिकतम ५% प्रिमियम थप गरी व्याज लगाउन सकिनेछ ।",
  ];

  const defaultActions = [
    "(१) सम्पूर्ण साँवा/व्याज/लेना फिर्ता माग गर्ने,",
    "(२) हर्जाना ब्याज लगाउने,",
    "(३) धितो कब्जा गरी बिक्री प्रक्रिया थाल्ने,",
    "(४) यस प्रस्ताब पत्रको सबै शर्त भंग मानी कारबाही गर्ने,",
    "(५) अरू कर्जा पनि फिर्ता माग गर्ने,",
    "(६) ऋणीका सबै अधिकार स्वतः निलम्बन गर्ने,",
    "(७) कालोसूचीमा राख्ने । असुलीको क्रममा धितो बिक्री, भोग, चलन, कब्जा, वहाल गर्न पाउनेछ । ऋणीको जुनसुकै खाताबाट रकम कट्टा गर्न सक्नेछ ।",
  ];

  const precedentClauses = [
    "क) ऋणीलाई यस कर्जा प्रस्ताव पत्रमा उल्लेख गरिएका शर्त स्वीकार्य भएमा मितिले १५ दिनभित्र हस्ताक्षर गरी फिर्ता दिनुपर्नेछ ।",
    "ख) प्रस्ताव स्वीकार गर्नुअगावै प्रतिकूल परिस्थिति आएमा वित्तीय संस्थाले कर्जा सुविधा फिर्ता गर्न सक्नेछ ।",
  ];

  const selfDeclarationClauses = [
    "क) वित्तीय संस्थासँगको सबै कारोबारसम्बन्धी लिखतहरू कानूनी रूपमा म र जमानतकर्तालाई बन्धनकारी हुनेछन् ।",
    "ख) हाल ऋणी वा जमानीकर्तामाथि कुनै मुद्दा चलिरहेको छैन ।",
    "ग) मैले कुनै कानून वा इजाजतपत्रको विपरीत कार्य गरेको छैन ।",
    "घ) मैले उपलब्ध गराएका सबै विवरण, प्रतिबद्धता, आवेदन, वित्तीय विवरण तात्त्विक रूपमा असत्य, गलत वा झुटो छैनन् ।",
    "ङ) मेरो एकाघर परिवार, संस्थापक शेयरधनी, प्रमुख कार्यकारी, कर्मचारी र सो को एकाघर परिवार, प्रबन्धक एजेन्ट, लेखापरीक्षक, सल्लाहकार, आधिकारिक मूल्याङ्कनकर्ता वा तिनको परिवार सदस्य नरहेको र यस वित्तीय संस्थासँग कुनै वित्तीय स्वार्थ नरहेको घोषणा गर्दछु ।",
    "च) मेरो एकाघर परिवार तथा जमानीदाताका नजिकका नातेदार यस वित्तीय संस्थामा प्रमुख कार्यकारी अधिकृत वा कर्मचारी नरहेको घोषणा गर्दछु ।",
  ];

  const listHtml = (items: string[]) =>
    items.map((c) => `<p class="clause">${c}</p>`).join("");

  const remarksSection = remarks?.trim()
    ? `<h3>थप शर्त / कैफियत (Additional Remarks)</h3>
       <div class="remarks-box">${remarks}</div>`
    : "";

  const statusBadge = data.status
    ? `<span class="status-badge status-${data.status.toLowerCase()}">${data.status.replaceAll("_", " ")}</span>`
    : "";

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
  <title>कर्जा प्रस्ताव पत्र — ${studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    @page { size: A4; margin: 18mm 20mm; }
    body{padding:20px}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Noto Sans Devanagari", "Mangal", "Times New Roman", serif; font-size: 10.5pt; color: #111; line-height: 1.75; }
    .header { border-bottom: 2.5px solid #000000; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 13pt; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 1px; font-family: "Times New Roman", Times, serif; }
    .brand-sub { font-size: 8pt; color: #6b7280; margin-top: 2px; font-family: "Times New Roman", Times, serif; }
    .meta { text-align: right; font-size: 9pt; color: #374151; }
    .meta div { margin-bottom: 2px; }
    .status-badge { display: inline-block; margin-left: 8px; padding: 1px 9px; border-radius: 999px; font-size: 7.5pt; font-weight: 700; background: #F3F4F6; color: #374151; font-family: "Times New Roman", Times, serif; }
    .status-signed, .status-active { background: #DCFCE7; color: #166534; }
    .status-pending_signature { background: #FEF3C7; color: #92400E; }
    .title-box { text-align: center; margin: 6px 0 16px; }
    .title-box h1 { font-size: 15pt; font-weight: 700; color: #1f2937; letter-spacing: 1px; }
    .addressee { font-size: 10pt; margin-bottom: 12px; line-height: 1.9; }
    .body-text { font-size: 10pt; margin-bottom: 12px; text-align: justify; }
    h2.section { font-size: 10.5pt; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; color: #1f2937; }
    h3 { font-size: 10pt; font-weight: 700; margin: 14px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt; }
    td, th { padding: 6px 10px; border: 1px solid #d1d5db; vertical-align: top; }
    .clause { font-size: 9.8pt; margin-bottom: 6px; text-align: justify; }
    .remarks-box { font-size: 9.5pt; white-space: pre-wrap; background: #f9fafb; border-left: 3px solid #4F46E5; padding: 9px 13px; border-radius: 0 4px 4px 0; margin-bottom: 10px; }
    .amount-note { font-size: 8.5pt; color: #6b7280; font-family: "Times New Roman", Times, serif; }
    .sig-section-title { font-weight: 700; font-size: 10pt; margin: 22px 0 10px; }
    .sig-row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 10px; }
    .sig-col { width: 48%; font-size: 9.5pt; }
    .sig-line { border-top: 1px solid #9ca3af; margin: 34px 0 6px; }
    .borrower-block, .guarantor-block { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 9.8pt; }
    .footer { text-align: center; font-size: 7.5pt; color: #9ca3af; margin-top: 20px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${institutionName}</div>
      <div class="brand-sub">${institutionName} Finance Company Limited — Credit Manager Issued</div>
    </div>
    <div class="meta">
      <div><strong>च.नं.:</strong> ${documentNumber || "Not yet assigned"}${statusBadge}</div>
      <div><strong>मितिः</strong> ${bsDate} (BS) &nbsp;/&nbsp; ${formatDate(generatedAt) !== "—" ? formatDate(generatedAt) : formatDate(new Date().toISOString())} (AD)</div>
    </div>
  </div>

  <div class="title-box">
    <h1>कर्जा प्रस्ताव पत्र</h1>
  </div>

  <div class="addressee">
    ध्यानाकर्षणः श्री <strong>${studentName}</strong><br>
    ठेगानाः ${addressLine}<br>
    आवेदन नं.: <strong>${applicationNumber}</strong>
  </div>

  <div class="body-text">
    महोदय,<br><br>
    श्री <strong>${studentName}</strong> (यस पछि ऋणी भनिएको) ले यस वित्तीय संस्थामा दिएको कर्जा आवेदन पत्र (आवेदन नं. ${applicationNumber}) र सो साथ संलग्न विवरणहरुको आधारमा र यस ${institutionName} (यस पछि वित्तीय संस्था भनिएको) विच सम्पन्न विभिन्न चरणको छलफल, वार्तालाप तथा तपाईंबाट कर्जा प्राप्त गर्न उपलब्ध गराइएका विभिन्न कागजातहरु समेतको आधारमा निम्न बमोजिमको कर्जा सुविधा निम्न शर्त बन्देजहरुको अधिनमा रहनेगरी स्वीकृत गरिएको व्यहोरा अनुरोध छ ।
  </div>

  <h2 class="section">१. कर्जा तथा सुविधाको विवरण</h2>
  <table>
    <tbody>
      <tr><td style="width:32%;font-weight:600">कर्जा सुविधाको किसिम</td><td>${data.loanProduct || "शैक्षिक कर्जा (Education Loan)"}</td></tr>
      <tr><td style="font-weight:600">कर्जा सीमा</td><td>${loanAmountWords} <span class="amount-note">(${loanAmountEnglish})</span></td></tr>
      <tr><td style="font-weight:600">उद्देश्य</td><td>शैक्षिक प्रयोजनका लागि${purposeText ? ` — ${purposeText}` : ""} ।</td></tr>
      <tr><td style="font-weight:600">व्याजदर</td><td>वार्षिक ${interestRateNp} — ब्याजको गणना वार्षिक रूपमा हुनेछ, भुक्तानी मासिक सममासिक किस्ता (EMI) अनुसार गर्नु पर्नेछ ।</td></tr>
      <tr><td style="font-weight:600">समयावधि</td><td>${tenureNp} ।</td></tr>
      <tr><td style="font-weight:600">Moratorium अवधि</td><td>${moratoriumNp} ।</td></tr>
      <tr><td style="font-weight:600">कर्जा प्रवाह गर्ने तरीका</td><td>वुँदा नं. ३ मा उल्लेख गरिए अनुसारको सम्पूर्ण सुरक्षण लिखतमा सहिछाप गर्ने कार्य सम्पन्न भए पश्चात ऋणीले कर्जा रकम खातामा राखिदिन अनुरोध गरे बमोजिम कर्जाका सम्पूर्ण शर्तहरु नियमित परिपालना गर्ने गरी स्वीकृत कर्जा रकमको हदसम्म कर्जा प्रवाह गरिनेछ ।</td></tr>
    </tbody>
  </table>

  <h2 class="section">२. शुल्क तथा दस्तुरहरु</h2>
  <p class="body-text">कर्जा प्रशासनिक÷नविकरण दस्तुर वापत स्वीकृत कर्जा रकमको वित्तीय संस्थाले तोकेको दरमा यस वित्तीय संस्थामा रहेको तपाईंको खाताबाट कट्टा गरिनेछ । कर्जा सूचना शुल्क वास्तविक खर्च भए बमोजिम लाग्नेछ । कर्जा सम्बन्धी अन्य फि, शुल्क, दै–दस्तुर समय समयमा वित्तीय संस्थाले तोके अनुसार र वित्तीय संस्थाको Standard Tariff of Charges (STC) बमोजिम हुनेछन् ।</p>

  <h2 class="section">३. धितो सुरक्षण</h2>
  <p class="body-text">ऋणीले उपभोग गर्ने कर्जाको सुरक्षणका लागि निम्नानुसार सुरक्षण वित्तीय संस्थाको नाममा कायम गरिनेछ:</p>
  <p class="clause">१) ${guarantorLine} ।</p>
  <p class="clause">२) जग्गा/धितो धितोपत्र (लागू भएमा) — जग्गाधनीको हकवालाहरुको सहमती पत्र र मञ्जुरीनामा (लागू भएमा) ।</p>

  <h2 class="section">४. भुक्तानी विधि</h2>
  <p class="body-text">वुँदा नं. ३ मा उल्लेख गरिएनुसारको सम्पूर्ण सुरक्षण लिखतहरुमा सहिछाप÷पारित भए पश्चात ऋणीले कर्जा रकम खातामा राखिदिन अनुरोध गरे बमोजिम तथा कर्जाका सम्पूर्ण शर्तहरु नियमित परिपालना गर्ने गरी स्वीकृत कर्जा रकमको हदसम्म कर्जा रकम ऋणीको खातामा जम्मा हुनेछ । मासिक किस्ता/ब्याज चुक्ता गर्नका लागि तपाईंको खातामा रकम व्यवस्था/जम्मा गरेको हुनुपर्ने छ । (Moratorium भएको खण्डमा) तत्पश्चात् ${moratoriumNp} सम्म ऋणीलाई प्रवाहित कर्जाको साँवामा दैनिक आधारमा ब्याज गणना गरी प्रत्येक अङ्ग्रेजी महिनाको तोकिएको मितिमा उक्त ब्याज भुक्तानी गर्नुपर्नेछ । तपाईंको कुनै पनि किस्ता/ब्याज बाँकी रहेमा वा कर्जा चुक्ता गर्न असफल भएमा, वित्तीय संस्थाले तपाईंको तथा तपाईंको एकाघर परिवारको वित्तीय संस्था वा अन्य कुनै पनि बैंक तथा वित्तीय संस्थामा जम्मा रहेको निक्षेपबाट रकम कट्टा गरी गराइ बाँकी लेना असुल गर्न सकिनेछ ।</p>

  <h2 class="section">५. ब्याज गणनाको तरिका</h2>
  <p class="body-text">कर्जामा लाग्ने ब्याजदर वित्तीय संस्थाको प्रचलित आधार दरमा स्वीकृत प्रिमियम थप गरी निर्धारण गरिनेछ (हाल वार्षिक ${interestRateNp})। वित्तीय संस्थाको आधार दरमा हुने परिवर्तनका कारण लागू ब्याजदर समय–समयमा परिवर्तन हुन सक्नेछ । प्रत्येक महिना बाँकी रहेको साँवामा सोही दरले ब्याज लाग्नेछ र उक्त ब्याज मासिक किस्तामा समावेश गरी भुक्तानी लिइन्छ। तर यस ऋण प्रस्ताब पत्रमा उल्लेखित शर्तहरुको बर्खिलाप हुने गरी तोकिएको समयमा साँवा तथा व्याज भुक्तानी नगरेमा सम्पूर्ण कर्जा रकममा (वक्यौता समेत) निर्धारण गरेको व्याजदरमा भाखा नाघेको साँवा रकममा २ प्रतिशत वा नेपाल राष्ट्र बैंकले तोकिदिए बमोजिम थप गरी हर्जाना व्याज पूर्व सूचना नदिइकनै लगाउन सकिनेछ ।</p>

  <h2 class="section">६. बिमा</h2>
  <p class="body-text">वित्तीय संस्थाको कर्जा वापत धितो सुरक्षणमा रहेको सम्पत्ति (लागू भएमा) कर्जा बक्यौता रहेसम्म ऋणी स्वयम्ले आफ्नै खर्चमा वित्तीय संस्थाले तोकेको शर्त अन्तर्गतका जोखिम बहन हुने गरी बीमा गराउनुपर्नेछ । बीमा गराई सकेपछि वित्तीय संस्थाको नाममा दरपिठ गरिएको सक्कल बीमा अभिलेख वित्तीय संस्थामा बुझाउनु पर्नेछ । तोकिएको समयमा बीमा अभिलेख नबुझाएमा वा नविकरण गर्न नसकेको खण्डमा वित्तीय संस्था स्वयंले बीमा वा बीमा नविकरण व्यवस्था गर्न सक्नेछ र त्यस वापत लाग्ने खर्च ऋणीको खाताबाट कट्टा गरिनेछ ।</p>

  <h2 class="section">७. कालोसूची</h2>
  <p class="body-text">कर्जा समयमा भुक्तानी नगरेमा वा भाका नाघेमा वा अन्य कुनै शर्त उल्लङ्घन गरेमा, वित्तीय संस्थाले तपाईंको नाम नेपाल राष्ट्र बैंकको निर्देशन अनुसार कर्जा सूचना केन्द्रको कालोसूचीमा राख्न सक्नेछ ।</p>

  <h2 class="section">८. कर्जा असुली प्रक्रिया</h2>
  <p class="body-text">कुनै पनि किस्ता नबुझाएमा, वा कुनै शर्त उल्लङ्घन गरेमा वित्तीय संस्थाले बाँकी सम्पूर्ण सावाँ, ब्याज, हर्जाना, प्रशासनिक खर्च, कानुनी खर्च, असुली खर्च आदि एकमुष्ट माग गर्नेछ । धितो कब्जामा लिई प्रचलित कानून बमोजिम लिलाम बिक्री गरिनेछ । लिलाम बिक्री हुन नसकेमा वा लिलाम बिक्रीबाट लेना नपुगेमा तपाईंको अन्य सम्पत्तिबाट असुल गरिनेछ ।</p>

  <h2 class="section">९. परिवर्तन तथा संशोधन</h2>
  <p class="body-text">यस प्रस्ताव पत्रको कुनै शर्त वित्तीय संस्थाले समय–समयमा परिमार्जन गर्न सक्नेछ । परिमार्जनको सूचना वेबसाइट वा अन्य सञ्चार माध्यमबाट दिइनेछ ।</p>

  <h2 class="section">१०. शर्तबन्देजहरू</h2>
  ${listHtml(termsClauses)}

  <h2 class="section">११. कर्जा चुक्ता गर्न असफल भएको घोषणा</h2>
  <p class="body-text">तलको कुनै एक अवस्था आएमा ऋणीलाई कर्जा तिर्न असफल भएको घोषणा गरी तुरुन्त कर्जा असुली प्रक्रिया थालिनेछ:</p>
  ${listHtml(defaultClauses)}
  <p class="body-text">ऋणीले कर्जाको सावाँ व्याज नतिरेमा वा कर्जाको शर्त उलङ्घन गरेमा वित्तीय संस्थाले निम्न कार्य गर्न सक्नेछ:</p>
  ${listHtml(defaultActions)}

  <h2 class="section">१२. लागू हुने पूर्व शर्त</h2>
  ${listHtml(precedentClauses)}

  <h2 class="section">१३. स्वघोषणा</h2>
  <p class="body-text">ऋणीले तलका विवरण सही र सत्य भएको विना शर्त घोषणा गर्दछ:</p>
  ${listHtml(selfDeclarationClauses)}

  ${remarksSection}

  <div class="sig-section-title">वित्तीय संस्थाको तर्फबाट</div>
  <div class="sig-row">
    <div class="sig-col">
      <div class="sig-line"></div>
      <div><strong>अधिकार प्राप्त श्री ${generatedByName}</strong></div>
      <div>पद सम्वन्ध व्यवस्थापक (Relationship Manager)</div>
      <div>दस्तखतः</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div><strong>श्री ${branchManagerLine}</strong></div>
      <div>पद शाखा प्रवन्धक (Branch Manager)</div>
      <div>दस्तखतः</div>
    </div>
  </div>

  <div class="borrower-block">
    <div class="sig-section-title">ऋणीको तर्फबाट</div>
    <p class="body-text">
      तपाई ${institutionName} बाट मिति ${bsDate} मा मेरो नाममा जारी गरेको यस ऋण प्रस्ताव पत्रमा उल्लेखित कर्जा तथा बैंकिङ सुविधा सीमा र सो ऋण प्रस्ताव पत्रमा वर्णित शर्त बन्देजहरु विना शर्त स्वीकार गरी पूर्ण परिपालना गर्दछु भनि सहिछाप गर्ने ऋणी श्री <strong>${studentName}</strong> (आवेदन नं. ${applicationNumber}, ना.प्र.नं. ${citizenshipNoLine}, जि.प्र.का. ${citizenshipOfficeLine})
    </p>
    <div class="sig-row">
      <div class="sig-col"><div class="sig-line"></div><div>हस्ताक्षरः</div></div>
      <div class="sig-col"><div class="sig-line"></div><div>मितिः ${bsDate}</div></div>
    </div>
  </div>

  <div class="guarantor-block">
    <div class="sig-section-title">जमानीकर्ताको स्वीकृति</div>
    <p class="body-text">
      म देहायमा उल्लिखित तथा हस्ताक्षरित जमानीकर्ताले यो स्वीकार वा मन्जुर गर्दछु कि मैले दिएको व्यक्तिगत जमानीको सुरक्षणले तपाई धनि ${institutionName} बाट ऋणी श्री <strong>${studentName}</strong> को नाममा जारी गरेको यस ऋण प्रस्ताव पत्र वा सो को सट्टामा प्रतिस्थापन हुने अर्को पत्रमा उल्लिखित कर्जाको वर्तमान् तथा भविष्यमा उत्पन्न÷सृजना हुने थप दायित्व समेत खाम्ने सम्मको लागि सुरक्षण कायम रहने कुरामा मेरो पूर्ण मञ्जुरी रहेको छ ।
    </p>
    <div class="sig-row">
      <div class="sig-col">
        <div>जमानीकर्ताको नामः श्री ${guarantor?.name ?? BLANK}</div>
        <div>(ना.प्र.नं. ${guarantorCitizenshipNo}, जारि मिति ${guarantorCitizenshipIssueDate}, जिल्ला प्रशासन कार्यालय ${guarantorCitizenshipOffice})</div>
        <div>ठेगानाः ${guarantorAddress}</div>
      </div>
      <div class="sig-col">
        <div class="sig-line"></div>
        <div>हस्ताक्षरः</div>
        <div>मितिः ${BLANK}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Generated via Unnati Digital Platform · This is a system-generated preview and does not replace a notarized legal instrument.
  </div>
  ${printScript}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared helpers for the Nepali document family — GUARANTEE_DEED (व्यक्तिगत
// जमानत), PROMISSORY_NOTE (कर्जा तमसुक), and HYPOTHECATION (कर्जा रकम निकासा
// अनुरोध पत्र) all follow the same letterhead/footer/witness-table chrome as
// LOAN_AGREEMENT, so it's factored out once instead of copy-pasted three times.
// ---------------------------------------------------------------------------

function loanAmountWordsOrBlank(amount: number | null): string {
  return amount != null ? formatNepaliRupeeWords(amount) : `रू.${BLANK} (रकम अद्यावधि तोकिएको छैन)`;
}

function interestRateOrBlank(rate: number | null): string {
  return rate != null ? `${toDevanagariNumeral(rate)}%` : BLANK;
}

function statusBadgeHtml(status?: LegalDocumentTemplateData["status"]): string {
  return status
    ? `<span class="status-badge status-${status.toLowerCase()}">${status.replaceAll("_", " ")}</span>`
    : "";
}

function printScriptHtml(autoPrint?: boolean): string {
  return autoPrint
    ? `<script>
    window.onload = function () {
      setTimeout(function () { window.print(); window.onfocus = function () { window.close(); }; }, 200);
    };
  </script>`
    : "";
}

/** "इति सम्वत् २०८२ साल जेठ महिना ८ गते रोज ४ शुभम्।" — the traditional BS
 *  execution-date line these documents close with. "रोज" is the 1-indexed
 *  weekday (आइतबार = १), which is the AD JS weekday index + 1. */
function formatBsLegalDateLine(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) {
    return `इति सम्वत् ${BLANK} साल ${BLANK} महिना ${BLANK} गते रोज ${BLANK} शुभम्।`;
  }
  try {
    const bs = NepaliDate.fromAD(d);
    const year = bs.format("YYYY", "np");
    const month = bs.format("MMMM", "np");
    const day = bs.format("DD", "np");
    const weekday = toDevanagariNumeral(d.getDay() + 1);
    return `इति सम्वत् ${year} साल ${month} महिना ${day} गते रोज ${weekday} शुभम्।`;
  } catch {
    return `इति सम्वत् ${BLANK} साल ${BLANK} महिना ${BLANK} गते रोज ${BLANK} शुभम्।`;
  }
}

function nepaliLegalStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    @page { size: A4; margin: 18mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Noto Sans Devanagari", "Mangal", "Times New Roman", serif; font-size: 10.5pt; color: #111; line-height: 1.75; }
    .header { border-bottom: 2.5px solid #000000; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 13pt; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 1px; font-family: "Times New Roman", Times, serif; }
    .brand-sub { font-size: 8pt; color: #6b7280; margin-top: 2px; font-family: "Times New Roman", Times, serif; }
    .meta { text-align: right; font-size: 9pt; color: #374151; }
    .meta div { margin-bottom: 2px; }
    .status-badge { display: inline-block; margin-left: 8px; padding: 1px 9px; border-radius: 999px; font-size: 7.5pt; font-weight: 700; background: #F3F4F6; color: #374151; font-family: "Times New Roman", Times, serif; }
    .status-signed, .status-active { background: #DCFCE7; color: #166534; }
    .status-pending_signature { background: #FEF3C7; color: #92400E; }
    .title-box { text-align: center; margin: 6px 0 16px; }
    .title-box h1 { font-size: 15pt; font-weight: 700; color: #1f2937; letter-spacing: 1px; }
    .title-box p.subtitle { font-size: 9.5pt; color: #4b5563; margin-top: 4px; font-style: italic; }
    .body-text { font-size: 10pt; margin-bottom: 12px; text-align: justify; }
    h2.section { font-size: 10.5pt; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; color: #1f2937; }
    h3 { font-size: 10pt; font-weight: 700; margin: 14px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt; }
    td, th { padding: 6px 10px; border: 1px solid #d1d5db; vertical-align: top; }
    .clause { font-size: 9.8pt; margin-bottom: 6px; text-align: justify; }
    .remarks-box { font-size: 9.5pt; white-space: pre-wrap; background: #f9fafb; border-left: 3px solid #4F46E5; padding: 9px 13px; border-radius: 0 4px 4px 0; margin-bottom: 10px; }
    .amount-note { font-size: 8.5pt; color: #6b7280; font-family: "Times New Roman", Times, serif; }
    .sig-section-title { font-weight: 700; font-size: 10pt; margin: 22px 0 10px; }
    .sig-row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 10px; }
    .sig-col { width: 48%; font-size: 9.5pt; }
    .sig-line { border-top: 1px solid #9ca3af; margin: 34px 0 6px; }
    .borrower-block, .guarantor-block { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 9.8pt; }
    .footer { text-align: center; font-size: 7.5pt; color: #9ca3af; margin-top: 20px; }
    .legal-date { text-align: center; font-size: 10pt; font-style: italic; margin: 22px 0 8px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;
}

function nepaliDocHeader(opts: {
  institutionName: string;
  documentNumber?: string | null;
  status?: LegalDocumentTemplateData["status"];
  bsDate: string;
  generatedAt?: string | null;
}): string {
  const { institutionName, documentNumber, status, bsDate, generatedAt } = opts;
  const adDate = formatDate(generatedAt) !== "—" ? formatDate(generatedAt) : formatDate(new Date().toISOString());
  return `<div class="header">
    <div>
      <div class="brand">${institutionName}</div>
      <div class="brand-sub">${institutionName} Finance Company Limited — Credit Manager Issued</div>
    </div>
    <div class="meta">
      <div><strong>च.नं.:</strong> ${documentNumber || "Not yet assigned"}${statusBadgeHtml(status)}</div>
      <div><strong>मितिः</strong> ${bsDate} (BS) &nbsp;/&nbsp; ${adDate} (AD)</div>
    </div>
  </div>`;
}

function witnessTableHtml(rows = 2): string {
  const blankRows = Array.from({ length: rows })
    .map(() => `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`)
    .join("");
  return `<h2 class="section">रोहबर साक्षी</h2>
  <table>
    <thead><tr><th>नाम</th><th>उमेर</th><th>ठेगाना</th><th>दस्तखत</th></tr></thead>
    <tbody>${blankRows}</tbody>
  </table>`;
}

function docHtmlShell(opts: {
  titleTag: string;
  headHtml: string;
  bodyHtml: string;
  printScript: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${opts.titleTag}</title>
  <style>${nepaliLegalStyles()}</style>
</head>
<body>
  ${opts.headHtml}
  ${opts.bodyHtml}
  ${opts.printScript}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// GUARANTEE_DEED — व्यक्तिगत जमानत (personal guarantee)
// ---------------------------------------------------------------------------

function buildGuaranteeDeedHtml(
  data: LegalDocumentTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  const {
    documentNumber,
    status,
    studentName,
    finalDisbursementAmount,
    guarantor,
    remarks,
    generatedAt,
    institutionName: institutionNameInput,
    studentAddress,
    studentCitizenshipNo,
    studentCitizenshipOffice,
    studentFatherOrHusbandName,
    studentGrandfatherName,
    studentPermanentDistrict,
    studentPermanentMunicipality,
    studentPermanentWardNo,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  const bsDate = formatBsDate(generatedAt);
  const loanAmountWords = loanAmountWordsOrBlank(finalDisbursementAmount);

  const guarantorName = guarantor?.name?.trim() || BLANK;
  const guarantorAddress = guarantor?.address?.trim() || BLANK;
  const guarantorCitizenshipNo = guarantor?.citizenshipNo?.trim() || BLANK;
  const guarantorCitizenshipIssueDate = guarantor?.citizenshipIssueDate?.trim() || BLANK;
  const guarantorCitizenshipOffice = guarantor?.citizenshipOffice?.trim() || BLANK;
  const guarantorFatherOrHusbandName = guarantor?.fatherOrHusbandName?.trim() || BLANK;
  const guarantorGrandfatherName = guarantor?.grandfatherName?.trim() || BLANK;
  const guarantorPermanentDistrict = guarantor?.permanentDistrict?.trim() || BLANK;
  const guarantorPermanentMunicipality = guarantor?.permanentMunicipality?.trim() || BLANK;
  const guarantorPermanentWardNo = guarantor?.permanentWardNo?.trim() || BLANK;
  const guarantorAge = guarantor?.age?.trim() || BLANK;
  const borrowerAddress = studentAddress?.trim() || BLANK;
  const borrowerCitizenshipNo = studentCitizenshipNo?.trim() || BLANK;
  const borrowerCitizenshipOffice = studentCitizenshipOffice?.trim() || BLANK;
  const borrowerFatherOrHusbandName = studentFatherOrHusbandName?.trim() || BLANK;
  const borrowerGrandfatherName = studentGrandfatherName?.trim() || BLANK;
  const borrowerPermanentDistrict = studentPermanentDistrict?.trim() || BLANK;
  const borrowerPermanentMunicipality = studentPermanentMunicipality?.trim() || BLANK;
  const borrowerPermanentWardNo = studentPermanentWardNo?.trim() || BLANK;

  const termsClauses = [
    "१) मेरो दायित्व मूल ऋणी सरह प्राथमिक दायित्व (Primary Liability) को रूपमा रहनेछ र कर्जा पूर्ण चुक्ता नभएसम्म निरन्तर रहनेछ।",
    "२) वित्तीय संस्थाले माग गरेको मितिले ७ दिनभित्र मैले रकम तिर्नेछु ।",
    "३) ऋणीले किस्ता वा आंशिक भुक्तानी गरेकोमा मेरो प्राथमिक दायित्वमा कुनै असर पर्दैन; बाँकी रकम मैले तिर्नुपर्छ भन्ने मैले बुझेको छु ।",
    "४) वित्तीय संस्थाले ऋणीलाई सहुलियत, थप समय, सहमति, धितो फुकुवा, अदलबदल गरे पनि मेरो दायित्व समाप्त हुँदैन।",
    "५) अन्य धितो वा अर्को जमानत भए पनि वित्तीय संस्थाले उक्त कर्जा असुली प्रयोजनका लागि मैले जमानत लेखिदीएको सीमा सम्म मसँग व्यक्तिगत रूपमा असुल गर्न सक्छ; मेरो दायित्व व्यक्तिगत र साझा (Joint & Several) हुनेछ।",
    "६) मेरो मृत्यु भएमा मेरो उत्तराधिकारी/अंशियारले यो दायित्व वहन गर्नुपर्नेछ।",
    "७) ऋणी टाट पल्टेमा पनि मेरो दायित्व समाप्त हुँदैन भन्ने मैले बुझेको छु ।",
    "८) अदालतको फैसला, वित्तीय संस्थाको सूचना, वा खातावही/स्टेटमेन्टमा देखिएको रकम नै अन्तिम प्रमाण मानी मैले त्यति रकम तिर्नुपर्छ भन्ने बुझेको छु । पछि मैले कुनै उजुर गर्ने छैन ।",
    `९) मेरो दायित्व कर्जाको ${loanAmountWords} र त्यसमा लाग्ने ब्याज, पेनाल र अन्य दै-दस्तुर सम्म सीमित रहनेछ।`,
    "१०) वित्तीय संस्थासँग ऋणीलाई कर्जा चुक्ता गर्न समय दिने वा अन्य सम्झौता गर्ने अधिकार सुरक्षित रहनेछ।",
    "११) जमानीको हदसम्म मेरो नामको वा मेरो अंशको सम्पत्तिको मूल्य घटाउने वा हक हस्तान्तरण, धितो, दान गर्ने छैन।",
    "१२) वित्तीय संस्थाको सूचना मेरो अन्तिम ठेगानामा व्यक्ति वा फोन मेसेज वा इमेल वा कुरियर सर्भिस वा हुलाक मार्फत दिन सकिनेछ । रजिष्टर्ड गरिएको मितिले १५ दिन भित्रमा सूचना/पत्र प्राप्त भएको मानिनेछ। वित्तीय संस्थाको कर्मचारीले लिखित प्रमाण दिएमा त्यो अकाट्य प्रमाण हुनेछ।",
    "१३) वित्तीय संस्थाले मलाई लिखित सूचना नदिएसम्म मेरो जमानत बहाल रहनेछ। सूचना पाएपछि पनि सूचना अघिको अवधिको बाँकी दायित्व मैले तिर्नुपर्नेछ ।",
    "१४) यसमा नपरेका विषय मुलुकी देवानी संहिता (जमानत करार), बैंक तथा वित्तीय संस्था ऐन, र ऋण असुली ऐन बमोजिम हुनेछ।",
  ];

  const remarksSection = remarks?.trim()
    ? `<h3>थप शर्त / कैफियत (Additional Remarks)</h3><div class="remarks-box">${remarks}</div>`
    : "";

  const bodyHtml = `
  <div class="title-box">
    <h1>व्यक्तिगत जमानत</h1>
    <p class="subtitle">(जमानी दिनेको नामः श्री/श्रीमती ${guarantorName})</p>
  </div>

  <div class="body-text">
    लिखितम् लिखत गरी लिने धनीका नाम ${institutionName} (यसपछि "वित्तीय संस्था" भनिएको छ) । लिखत गरिदिनेका नाम ${guarantorGrandfatherName} को नाति/नातिनी, ${guarantorFatherOrHusbandName} को छोरा/छोरी/पति/पत्नि जिल्ला ${guarantorPermanentDistrict}, ${guarantorPermanentMunicipality}, वडा नं. ${guarantorPermanentWardNo} स्थायी ठेगाना भई हाल ठेगाना ${guarantorAddress} बस्ने बर्ष ${guarantorAge} को श्री/श्रीमती <strong>${guarantorName}</strong> (ना.प्र.नं.${guarantorCitizenshipNo}, जारि मिति ${guarantorCitizenshipIssueDate}, जिल्ला प्रशासन कार्यालय ${guarantorCitizenshipOffice}) (जसलाई यसपछि जमानीकर्ता भनिएको छ) आगे वित्तीय संस्थाले ${borrowerGrandfatherName} को नाति/नातिनी, ${borrowerFatherOrHusbandName} को छोरा/छोरी/पति/पत्नि जिल्ला ${borrowerPermanentDistrict}, ${borrowerPermanentMunicipality}, वडा नं. ${borrowerPermanentWardNo} स्थायी ठेगाना भई हाल ठेगाना ${borrowerAddress} बस्ने श्री/श्रीमती <strong>${studentName}</strong> (ना.प्र.नं.${borrowerCitizenshipNo}, जिल्ला प्रशासन कार्यालय ${borrowerCitizenshipOffice}) (जसलाई यसपछि ऋणी भनिएको छ) लाई वित्तीय संस्थाले मिति ${bsDate} मा जारि गरेको कर्जा प्रस्ताब पत्र बमोजिम स्वीकृत कर्जा ${loanAmountWords} सम्मको रकम तथा त्यसमा लाग्ने साँवा, ब्याज, कमिसन, फि, मार्जिन, थप दायित्व समेतका लागि म जमानी दिनेले यो जमानत दिएको छु। ऋणीले कर्जा नतिरेपछि वित्तीय संस्थाले मलाई कर्जा चुक्ता गर्न गराउन माग गरेको रकम मैले पनि नतिरेमा मेरो घर घरानाको चल–अचल सम्पत्तिबाट असुल गर्नुहोला। मैले माथि उल्लेखित कर्जा नतिरे नतिराएमा नेपाल राष्ट्र बैंकले बैंक तथा वित्तीय संस्थाहरुलाई जारी गरेको कालो सूची सम्बन्धि निर्देशनको ब्यवस्था वा सो को सट्टामा प्रतिस्थापन हुने अन्य निर्देशन अनुसार मेरो नाम कर्जा सूचना केन्द्रको कालो सूचीमा समावेश गरेमा समेत मेरो पूर्ण मञ्जुरी छ । पछि कुनै उजुर वाजुर गर्ने छैन ।
  </div>

  <h2 class="section">तपसिल</h2>
  ${termsClauses.map((c) => `<p class="clause">${c}</p>`).join("")}

  ${remarksSection}

  ${witnessTableHtml()}

  <div class="legal-date">${formatBsLegalDateLine(generatedAt)}</div>

  <div class="footer">
    Generated via Unnati Digital Platform · This is a system-generated preview and does not replace a notarized legal instrument.
  </div>`;

  return docHtmlShell({
    titleTag: `व्यक्तिगत जमानत — ${studentName}`,
    headHtml: nepaliDocHeader({ institutionName, documentNumber, status, bsDate, generatedAt }),
    bodyHtml,
    printScript: printScriptHtml(opts.autoPrint),
  });
}

// ---------------------------------------------------------------------------
// PROMISSORY_NOTE — कर्जा तमसुक (loan promissory note)
// ---------------------------------------------------------------------------

function buildPromissoryNoteHtml(
  data: LegalDocumentTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  const {
    documentNumber,
    status,
    studentName,
    loanProduct,
    finalDisbursementAmount,
    interestRate,
    remarks,
    generatedAt,
    institutionName: institutionNameInput,
    studentAddress,
    studentCitizenshipNo,
    studentCitizenshipOffice,
    studentCitizenshipIssueDate,
    studentFatherOrHusbandName,
    studentGrandfatherName,
    studentPermanentDistrict,
    studentPermanentMunicipality,
    studentPermanentWardNo,
    collateralOwnerName,
    collateralAddress,
    collateralPlotNo,
    collateralArea,
    collateralRemarks,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  const bsDate = formatBsDate(generatedAt);
  const loanAmountWords = loanAmountWordsOrBlank(finalDisbursementAmount);
  const interestRateNp = interestRateOrBlank(interestRate);
  const borrowerAddress = studentAddress?.trim() || BLANK;
  const borrowerCitizenshipNo = studentCitizenshipNo?.trim() || BLANK;
  const borrowerCitizenshipOffice = studentCitizenshipOffice?.trim() || BLANK;
  const borrowerCitizenshipIssueDate = studentCitizenshipIssueDate?.trim() || BLANK;
  const borrowerFatherOrHusbandName = studentFatherOrHusbandName?.trim() || BLANK;
  const borrowerGrandfatherName = studentGrandfatherName?.trim() || BLANK;
  const borrowerPermanentDistrict = studentPermanentDistrict?.trim() || BLANK;
  const borrowerPermanentMunicipality = studentPermanentMunicipality?.trim() || BLANK;
  const borrowerPermanentWardNo = studentPermanentWardNo?.trim() || BLANK;
  const collateralOwnerNameLine = collateralOwnerName?.trim() || "&nbsp;";
  const collateralAddressLine = collateralAddress?.trim() || "&nbsp;";
  const collateralPlotNoLine = collateralPlotNo?.trim() || "&nbsp;";
  const collateralAreaLine = collateralArea?.trim() || "&nbsp;";
  const collateralRemarksLine = collateralRemarks?.trim() || "&nbsp;";

  const remarksSection = remarks?.trim()
    ? `<h3>थप शर्त / कैफियत (Additional Remarks)</h3><div class="remarks-box">${remarks}</div>`
    : "";

  const bodyHtml = `
  <div class="title-box">
    <h1>कर्जा तमसुक</h1>
  </div>

  <div class="body-text">
    लिखितम् लिखत गरी लिने धनीका नाम ${institutionName} (यसपछि "वित्तीय संस्था" भनिएको छ) । लिखत गरिदिनेका नाम ${borrowerGrandfatherName} को नाति/नातिनी, ${borrowerFatherOrHusbandName} को छोरा/छोरी/पति/पत्नि जिल्ला ${borrowerPermanentDistrict}, ${borrowerPermanentMunicipality}, वडा नं. ${borrowerPermanentWardNo} स्थायी ठेगाना भई हाल ठेगाना ${borrowerAddress} बस्ने श्री/श्रीमती <strong>${studentName}</strong> (ना.प्र.नं.${borrowerCitizenshipNo}, जारी मिति ${borrowerCitizenshipIssueDate}, जिल्ला प्रशासन कार्यालय ${borrowerCitizenshipOffice}) (जसलाई यसपछि ऋणी भनिएको छ) आगे मिति ${bsDate} मा जारी भएको कर्जा प्रस्ताब पत्र अनुसार मेरो नाममा स्वीकृत तपसिल बमोजिमको कुल कर्जा रकम ${loanAmountWords} को अधीनमा रही उपभोग गर्ने गरी यो कर्जा तमसुक गरी दिएको ठीक साँचो हो। यस कर्जामा लाग्ने ब्याज, फि, शुल्क आदि दैदस्तुर तपाईं धनी वित्तीय संस्थाले म ऋणीको नाममा जारी गरेको प्रस्ताब पत्रमा उल्लेख भएको शर्त, दर तथा सोमा निर्धारित प्रक्रिया बमोजिम तोकिएकै भाखाभित्र तिर्ने बुझाउने छु। म ऋणीको नाउँमा स्वीकृत कर्जा उपभोग गर्दा तपाईं धनी वित्तीय संस्था उपर कुनै थप दायित्वहरू सृजना भएमा त्यस्तो थप दायित्वहरू, बिमा प्रिमियम दस्तुर, कानूनी खर्चहरू, धनी वित्तीय संस्थाबाट समय–समयमा हुने निरीक्षण गर्दा लाग्ने खर्च, प्राप्त कर्जासँग सम्बन्धित सूचना प्रकाशित खर्चहरू आदि समेत तिर्ने बुझाउने छु ।
  </div>

  <div class="body-text">
    यदि साँवा, ब्याज, थप ब्याज, फि, कमिसन, शुल्क आदि ऋण प्रस्ताब पत्र (वा संशोधन/प्रतिस्थापन पत्र) बमोजिम नतिरेमा, तिर्न आलटाल गरेमा, किस्ता खिलाफी गरेमा, वा प्रस्ताब पत्र वा यस लिखतको कुनै शर्त उल्लंघन गरेमा – धनी वित्तीय संस्थाले मेरो तथा मेरो एकाघर परिवारको (कसैको पनि) धनी वित्तीय संस्था वा अन्य कुनै बैंक/वित्तीय संस्थाको शाखामा रहेको/रहने निक्षेप कट्टा गरी गराइ लिएमा, धितो सम्पत्ति बैंक तथा वित्तीय संस्था ऐन, प्रचलित नेपाल कानून वा धनी वित्तीय संस्थाको आफ्नै नीति नियमानुसार लिलाम बिक्री वा अन्य व्यवस्था गरी मबाट लिन बाँकी साँवा, ब्याज, हर्जाना ब्याज, दैदस्तुर, असुली खर्च, कानूनी खर्च लगायत सम्पूर्ण लेना असुलउपर गरेमा मेरो मञ्जुरी रहेको छ। सोबाट लेना रकम असुल नभएमा धनी वित्तीय संस्थाले म उपर बैंक तथा वित्तीय संस्थाको ऋण असुली ऐन, नियमावली, प्रचलित कानून वा आफ्नै नीति नियमानुसार कारवाही गर्न सक्नेछ – जसमा मेरो पूर्ण मञ्जुरी छ। कथंकदाचित धितो सम्पत्ति कच्चा नकरा भई लिलाम बिक्री हुन नसकेमा वा बिक्री हुँदा पनि लेना नपुगेमा, मेरो तथा मेरो एकाघर परिवारको (जो सुकैको) नाममा रहेको घर–घरानाको सम्पत्तिबाट तपाईं धनी वित्तीय संस्थाले असुलउपर गर्न सक्नु हुनेछ । नेपाल राष्ट्र बैंकको कालोसूची निर्देशनमा भएको व्यवस्था बमोजिम मेरो वा यस कर्जासगँ सम्बद्ध अन्य पक्षको नाम कर्जा सूचना केन्द्रको कालोसूचीमा समावेश गरेमा पनि मेरो पूर्ण मञ्जुरी छ । भनी यो लिखत अद्योपान्त पढी, बाचि, सुनी लिखतमा लेखिएको व्यहोराको अर्थ र परिणाम समेत बुझी तपसिलका साक्षीहरूका रोहबरमा यो कर्जा तमसुकको लिखतमा सहीछाप गरी तपाईं धनी वित्तीय संस्थालाई दिएँ ।
  </div>

  <h2 class="section">तपसिल</h2>
  <h3>(क) स्वीकृत कर्जाको विवरण</h3>
  <table>
    <thead><tr><th>क्र.सं.</th><th>स्वीकृत कर्जाको किसिम</th><th>कर्जा रकम (अंक र अक्षरमा)</th><th>ब्याज/कमिशन</th></tr></thead>
    <tbody>
      <tr><td>१</td><td>${loanProduct || "शैक्षिक कर्जा (Education Loan)"}</td><td>${loanAmountWords}</td><td>वार्षिक ${interestRateNp}</td></tr>
    </tbody>
  </table>

  <h3>(ख) धितो सुरक्षणको विवरण</h3>
  <table>
    <thead><tr><th>जग्गाधनिको नाम</th><th>ठेगाना</th><th>कित्ता नं.</th><th>क्षेत्रफल</th><th>कैफियत</th></tr></thead>
    <tbody>
      <tr><td>${collateralOwnerNameLine}</td><td>${collateralAddressLine}</td><td>${collateralPlotNoLine}</td><td>${collateralAreaLine}</td><td>${collateralRemarksLine}</td></tr>
    </tbody>
  </table>

  ${remarksSection}

  ${witnessTableHtml()}

  <div class="legal-date">${formatBsLegalDateLine(generatedAt)}</div>

  <div class="footer">
    Generated via Unnati Digital Platform · This is a system-generated preview and does not replace a notarized legal instrument.
  </div>`;

  return docHtmlShell({
    titleTag: `कर्जा तमसुक — ${studentName}`,
    headHtml: nepaliDocHeader({ institutionName, documentNumber, status, bsDate, generatedAt }),
    bodyHtml,
    printScript: printScriptHtml(opts.autoPrint),
  });
}

// ---------------------------------------------------------------------------
// HYPOTHECATION — कर्जा रकम निकासा अनुरोध पत्र (loan amount disbursement
// request letter)
// ---------------------------------------------------------------------------

function buildDisbursementRequestHtml(
  data: LegalDocumentTemplateData,
  opts: { autoPrint?: boolean } = {},
): string {
  const {
    documentNumber,
    status,
    studentName,
    collegeName,
    courseName,
    loanProduct,
    finalDisbursementAmount,
    remarks,
    generatedAt,
    institutionName: institutionNameInput,
    approvalLetterDate,
    loanExpiryDate,
    borrowerPosition,
    bankAccountName,
    bankAccountNumber,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  const bsDate = formatBsDate(generatedAt);
  const loanAmountWords = loanAmountWordsOrBlank(finalDisbursementAmount);
  const purposeText = [courseName, collegeName].filter(Boolean).join(", ") || "शैक्षिक प्रयोजनका लागि";
  const approvalLetterDateLine = approvalLetterDate?.trim() || BLANK;
  const loanExpiryDateLine = loanExpiryDate?.trim() || BLANK;
  const borrowerPositionLine = borrowerPosition?.trim() || BLANK;
  const bankAccountNameLine = bankAccountName?.trim() || "&nbsp;";
  const bankAccountNumberLine = bankAccountNumber?.trim() || "&nbsp;";

  const remarksSection = remarks?.trim()
    ? `<h3>थप शर्त / कैफियत (Additional Remarks)</h3><div class="remarks-box">${remarks}</div>`
    : "";

  const bodyHtml = `
  <div class="title-box">
    <h1>कर्जा रकम निकासा अनुरोध पत्र</h1>
  </div>

  <div class="body-text">
    मितिः ${bsDate}<br>
    श्री ${institutionName}<br>
    मुख्य शाखा
  </div>

  <div class="body-text"><strong>विषयः</strong> कर्जा रकम निकासा गरिदिने बारे ।</div>

  <div class="body-text">
    त्यस वित्तीय संस्थाले मलाई निम्नानुसारको कर्जा स्वीकृत गरी मिति ${approvalLetterDateLine} मा प्रेषित कर्जा स्वीकृति पत्रमा उल्लेख गरिएका शर्त र अवस्थाहरु पढि बाँची बुझी स्वीकार गरी तहाँलाई मिति ${approvalLetterDateLine} मा पठाइ सकिएको व्यहोरा अनुरोध गर्दछु ।
  </div>

  <table>
    <thead><tr><th>कर्जाको किसिम</th><th>कर्जा सीमा</th><th>कर्जाको उद्देश्य</th><th>कर्जाको अवधी समाप्ति</th></tr></thead>
    <tbody>
      <tr><td>${loanProduct || "शैक्षिक कर्जा (Education Loan)"}</td><td>${loanAmountWords}</td><td>${purposeText}</td><td>${loanExpiryDateLine}</td></tr>
    </tbody>
  </table>

  <div class="body-text">
    मलाई स्वीकृत गरेको निम्नानुसारको कर्जाका लागि आवश्यक पर्ने सुरक्षण त्यस संस्थाको नाममा लेखिदिने र सुरक्षण कागजातमा हस्ताक्षर गर्ने कार्य सम्पन्न गरिसकेको व्यहोरा अनुरोध गर्दै उक्त स्वीकृत कर्जा रकम मेरो खातामा जम्मा गरिदिनु हुन हार्दिक अनुरोध गर्दछु । यसमा फरक पर्ने छैन । फरक परेमा सहुँला/बुझाउँला ।
  </div>

  <div class="body-text">धन्यवाद !</div>

  ${remarksSection}

  <div class="borrower-block">
    <div>भवदीय,</div>
    <div class="sig-line" style="width:220px"></div>
    <div>नामः <strong>${studentName}</strong></div>
    <div>पदः ${borrowerPositionLine}</div>
  </div>

  <h2 class="section">खाता विवरण</h2>
  <table>
    <thead><tr><th>खाताको नाम</th><th>खाता नं.</th></tr></thead>
    <tbody>
      <tr><td>${bankAccountNameLine}</td><td>${bankAccountNumberLine}</td></tr>
    </tbody>
  </table>

  <div class="footer">
    Generated via Unnati Digital Platform · This is a system-generated preview and does not replace a notarized legal instrument.
  </div>`;

  return docHtmlShell({
    titleTag: `कर्जा रकम निकासा अनुरोध पत्र — ${studentName}`,
    headHtml: nepaliDocHeader({ institutionName, documentNumber, status, bsDate, generatedAt }),
    bodyHtml,
    printScript: printScriptHtml(opts.autoPrint),
  });
}

// ---------------------------------------------------------------------------
// Download — no backend PDF pipeline exists, so "download" opens the same
// print-ready HTML in a new tab with auto-print enabled (same pattern as
// lib/documentTemplates/agreementTemplate.ts's BonafideGenerator flow), and
// the browser's own print dialog handles "Save as PDF".
// ---------------------------------------------------------------------------

/** Reconstructs LegalDocumentTemplateData from a persisted GeneratedAgreementRecord's
 *  templateSnapshot — null when the record has no snapshot (documents generated
 *  before this feature existed, or a request that failed mid-way). */
export function templateDataFromRecord(
  doc: Pick<GeneratedAgreementRecord, "documentNumber" | "agreementType" | "status" | "templateSnapshot" | "generatedByName">,
): LegalDocumentTemplateData | null {
  const snapshot = doc.templateSnapshot;
  if (!snapshot) return null;

  return {
    documentNumber: doc.documentNumber,
    agreementType: doc.agreementType,
    status: doc.status,
    studentName: snapshot.studentName ?? "—",
    applicationNumber: snapshot.applicationNumber ?? "—",
    collegeName: snapshot.collegeName,
    courseName: snapshot.courseName,
    loanProduct: snapshot.loanProduct,
    finalDisbursementAmount: snapshot.finalDisbursementAmount,
    interestRate: snapshot.interestRate,
    tenureMonths: snapshot.tenureMonths,
    gracePeriodMonths: snapshot.gracePeriodMonths,
    repaymentFrequency: snapshot.repaymentFrequency,
    emiAmount: snapshot.emiAmount,
    totalRepayment: snapshot.totalRepayment,
    guarantor: snapshot.guarantor,
    remarks: snapshot.remarks,
    generatedByName: snapshot.generatedByName ?? doc.generatedByName ?? "Credit Manager",
    generatedAt: snapshot.generatedAt,
    institutionName: snapshot.institutionName,
    studentAddress: snapshot.studentAddress,
    studentCitizenshipNo: snapshot.studentCitizenshipNo,
    studentCitizenshipOffice: snapshot.studentCitizenshipOffice,
    branchManagerName: snapshot.branchManagerName,
    studentCitizenshipIssueDate: snapshot.studentCitizenshipIssueDate,
    studentFatherOrHusbandName: snapshot.studentFatherOrHusbandName,
    studentGrandfatherName: snapshot.studentGrandfatherName,
    studentPermanentDistrict: snapshot.studentPermanentDistrict,
    studentPermanentMunicipality: snapshot.studentPermanentMunicipality,
    studentPermanentWardNo: snapshot.studentPermanentWardNo,
    collateralOwnerName: snapshot.collateralOwnerName,
    collateralAddress: snapshot.collateralAddress,
    collateralPlotNo: snapshot.collateralPlotNo,
    collateralArea: snapshot.collateralArea,
    collateralRemarks: snapshot.collateralRemarks,
    approvalLetterDate: snapshot.approvalLetterDate,
    loanExpiryDate: snapshot.loanExpiryDate,
    borrowerPosition: snapshot.borrowerPosition,
    bankAccountName: snapshot.bankAccountName,
    bankAccountNumber: snapshot.bankAccountNumber,
  };
}

/** Opens a print-ready copy of the document in a new tab and triggers the
 *  browser's print dialog — the "Download" action. Returns false (does
 *  nothing) if the record has no templateSnapshot to render, or the popup
 *  was blocked, so callers can show an appropriate toast. */
export function downloadGeneratedAgreement(
  doc: Pick<GeneratedAgreementRecord, "documentNumber" | "agreementType" | "status" | "templateSnapshot" | "generatedByName">,
): boolean {
  const data = templateDataFromRecord(doc);
  if (!data) return false;

  const html = buildLegalDocumentHtml(data, { autoPrint: true });
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}
