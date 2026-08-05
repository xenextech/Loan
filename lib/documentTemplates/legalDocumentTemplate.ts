import NepaliDate from "nepali-date-converter";
import {
  formatNepaliRupeeWords,
  nepaliNumberToWords,
  toDevanagariNumeral,
  toNepaliGroupedDigits,
} from "@/lib/nepaliNumber";
import type { GeneratedAgreementRecord } from "@/types/dashboard";

export type LegalDocumentType =
  | "LOAN_AGREEMENT"
  | "GUARANTEE_DEED"
  | "HYPOTHECATION"
  | "PROMISSORY_NOTE";

// Nepali titles, matching the bank's own paper documents verbatim (as
// uploaded): कर्जा प्रस्ताव पत्र, व्यक्तिगत जमानत, कर्जा तमसुक, and कर्जा रकम
// निकासा अनुरोध पत्र — shown as-is in the Document Type picker and on each
// generated document.
export const LEGAL_DOCUMENT_TYPE_LABEL: Record<LegalDocumentType, string> = {
  LOAN_AGREEMENT: "कर्जा प्रस्ताव पत्र",
  GUARANTEE_DEED: "व्यक्तिगत जमानत",
  PROMISSORY_NOTE: "कर्जा तमसुक",
  HYPOTHECATION: "कर्जा रकम निकासा अनुरोध पत्र",
};

/**
 * Municipality tier. The paper deeds print all four abbreviations for the
 * scrivener to circle; supplying one here prints just that tier instead.
 */
export type MunicipalityType = "MAHANAGARPALIKA" | "UPAMAHANAGARPALIKA" | "NAGARPALIKA" | "GAUNPALIKA";

export const MUNICIPALITY_TYPE_ABBR: Record<MunicipalityType, string> = {
  MAHANAGARPALIKA: "म.न.पा.",
  UPAMAHANAGARPALIKA: "उ.म.न.पा.",
  NAGARPALIKA: "न.पा.",
  GAUNPALIKA: "गा.पा.",
};

export const MUNICIPALITY_TYPE_LABEL: Record<MunicipalityType, string> = {
  MAHANAGARPALIKA: "महानगरपालिका (म.न.पा.)",
  UPAMAHANAGARPALIKA: "उपमहानगरपालिका (उ.म.न.पा.)",
  NAGARPALIKA: "नगरपालिका (न.पा.)",
  GAUNPALIKA: "गाउँपालिका (गा.पा.)",
};

/**
 * One party to a deed — the borrower or the guarantor. The paper forms
 * (कर्जा तमसुक, व्यक्तिगत जमानत) describe each party with the same fixed
 * sentence: four generations of parentage, a permanent and a current address,
 * age, name and citizenship. Both parties use identical wording, so they share
 * one shape.
 */
export interface DeedParty {
  name?: string | null;
  age?: string | null;
  grandfatherName?: string | null;
  grandmotherName?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  /** Father-in-law — the "………को बुहारी" clause. */
  fatherInLawName?: string | null;
  spouseName?: string | null;
  permanentDistrict?: string | null;
  permanentMunicipality?: string | null;
  permanentMunicipalityType?: MunicipalityType | null;
  permanentWardNo?: string | null;
  permanentTole?: string | null;
  /** Second permanent-address blank on the paper — house/tole detail. */
  permanentToleDetail?: string | null;
  currentDistrict?: string | null;
  currentMunicipality?: string | null;
  currentMunicipalityType?: MunicipalityType | null;
  currentWardNo?: string | null;
  currentTole?: string | null;
  citizenshipNo?: string | null;
  citizenshipIssueDate?: string | null;
  citizenshipOffice?: string | null;
}

/**
 * The lending institution as the deeds name it: "<province, district,
 * municipality, ward, locality> स्थित प्रधान कार्यालय भएको <name> को <branch>".
 * Defaults reproduce the uploaded Best Finance forms but stay editable, since
 * the platform also issues documents on behalf of other partner banks/NBFCs.
 */
export interface LenderIdentity {
  name?: string | null;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  municipalityType?: MunicipalityType | null;
  wardNo?: string | null;
  locality?: string | null;
  branch?: string | null;
}

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
  /** Lender address/branch detail used by the deed preambles. */
  lender?: LenderIdentity | null;
  /** Date the borrower filed the loan application (BS or ISO); printed in the
   *  कर्जा प्रस्ताब पत्र's opening recital. */
  applicationDate?: string | null;
  /** Institution's published Standard Tariff of Charges page, cited in §2. */
  tariffUrl?: string | null;
  /** Borrower parentage/address detail the deeds require beyond the flat
   *  `student*` fields kept for backwards compatibility with older snapshots. */
  borrowerParty?: DeedParty | null;
  /** Guarantor parentage/address detail, same shape as the borrower's. */
  guarantorParty?: DeedParty | null;
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
  /** The following have no source elsewhere in the application data — the
   *  Credit Manager fills them in by hand in the generator form. All
   *  optional; rendered as a ruled blank line (never as dummy text) in the
   *  document when not provided, so the form can be completed in ink. */
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

// ---------------------------------------------------------------------------
// Escaping and blank-field rendering
//
// Every interpolated value is user- or operator-supplied and lands inside an
// HTML string, so it is escaped at the point of use. Un-escaped input was
// previously able to inject stray markup into the rendered document, which is
// one of the ways "random text" ended up on printed pages.
// ---------------------------------------------------------------------------

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** Width of the ruled line drawn in place of an unfilled field. */
type RuleWidth = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Renders a value, or — when it is missing — a ruled blank line of the given
 * width so the document stays a completable legal form rather than printing
 * literal placeholder text such as "...................." or an em dash.
 */
function fill(value: unknown, width: RuleWidth = "md"): string {
  const text = value === null || value === undefined ? "" : String(value).trim();
  if (text) return esc(text);
  return `<span class="rule rule-${width}"></span>`;
}

/** Same as `fill`, but stretches to the full width of its table cell. */
function fillCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value).trim();
  if (text) return esc(text);
  return `<span class="rule rule-cell"></span>`;
}

/** Value in Devanagari numerals, or a ruled blank when missing. */
function fillNum(value: unknown, width: RuleWidth = "sm"): string {
  const text = value === null || value === undefined ? "" : String(value).trim();
  if (!text) return `<span class="rule rule-${width}"></span>`;
  return esc(toDevanagariNumeral(text));
}

// ---------------------------------------------------------------------------
// Value formatting — Devanagari numerals throughout the Nepali body text, with
// Nepali lakh/crore digit grouping. The Latin figure survives only inside the
// parenthetical note beside an amount, where it exists as an audit aid.
//
// The two system reference codes (च.नं. / document number and the application
// number) are deliberately left in their stored Latin form so the printed
// document can be matched back to the record character-for-character.
// ---------------------------------------------------------------------------

function formatNprLatin(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return `NPR ${v.toLocaleString("en-IN")}`;
}

function formatAdDate(v?: string | null): string {
  const d = v ? new Date(v) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Best-effort AD -> BS conversion; returns "" (a ruled blank) if out of range. */
function formatBsDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  try {
    return NepaliDate.fromAD(d).format("YYYY-MM-DD", "np");
  } catch {
    return "";
  }
}

/**
 * "रू.५०,००,०००÷- (अक्षरेपी पचास लाख मात्र)" — the कर्जा प्रस्ताब पत्र's own
 * amount style, distinct from the two deeds (see amountMatra/amountAkshare).
 */
function amountRupeeWords(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return `रू.<span class="rule rule-md"></span>÷- (अक्षरेपी <span class="rule rule-lg"></span> मात्र)`;
  }
  return esc(formatNepaliRupeeWords(amount));
}

// The two Nepali deeds punctuate amounts differently from one another, and
// both differ from the Loan Agreement. Reproduced exactly as printed:
//   कर्जा तमसुक     — "रु. १,१२,५०० (एक लाख बाह्र हजार पाँच सय मात्र)"
//   व्यक्तिगत जमानत — "रु. ……… (अक्षरेपी ………)"   [no "मात्र"]

/** "रु. १,१२,५०० (एक लाख बाह्र हजार पाँच सय मात्र)" — कर्जा तमसुक style. */
function amountMatra(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return `रु. <span class="rule rule-md"></span> (<span class="rule rule-lg"></span>)`;
  }
  const rounded = Math.round(amount);
  return esc(
    `रु. ${toNepaliGroupedDigits(rounded)} (${nepaliNumberToWords(rounded)} मात्र)`,
  );
}

/** "रु. १,१२,५०० (अक्षरेपी एक लाख बाह्र हजार पाँच सय)" — व्यक्तिगत जमानत style. */
function amountAkshare(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return `रु. <span class="rule rule-md"></span> (अक्षरेपी <span class="rule rule-lg"></span>)`;
  }
  const rounded = Math.round(amount);
  return esc(
    `रु. ${toNepaliGroupedDigits(rounded)} (अक्षरेपी ${nepaliNumberToWords(rounded)})`,
  );
}

/** BS date as the deeds write it — "२०८६/०२/०८" — or a ruled blank. */
function formatBsDateSlashed(iso?: string | null): string {
  const ymd = formatBsDate(iso);
  if (!ymd) return `<span class="rule rule-sm"></span>`;
  return esc(ymd.replace(/-/g, "/"));
}

/**
 * BS date as the कर्जा प्रस्ताब पत्र writes it — "२०८२÷०२÷०८". That form uses
 * the division sign as its separator, not a slash or hyphen; the two Nepali
 * deeds use "/" instead, so the separator is per-document rather than global.
 */
function formatBsDateDiv(iso?: string | null): string {
  // Unlike the document's own issue date, a missing date here means "not
  // recorded" rather than "today" — so it stays a blank in the paper's own
  // "२०.....÷ .....÷ ....." shape instead of silently printing the current date.
  if (!iso) {
    return `२०<span class="rule rule-xs"></span>÷<span class="rule rule-xs"></span>÷<span class="rule rule-xs"></span>`;
  }
  const ymd = formatBsDate(iso);
  if (!ymd) {
    return `२०<span class="rule rule-xs"></span>÷<span class="rule rule-xs"></span>÷<span class="rule rule-xs"></span>`;
  }
  return esc(ymd.replace(/-/g, "÷"));
}

/**
 * Municipality tier as printed on the deed. With no tier recorded the paper
 * lists all four for the scrivener to circle, so that is what is printed;
 * once a tier is known only that one appears.
 */
function municipalityTier(type?: MunicipalityType | null): string {
  if (type && MUNICIPALITY_TYPE_ABBR[type]) return esc(MUNICIPALITY_TYPE_ABBR[type]);
  // Spacing reproduced from the paper form, which sets the four options apart
  // so one can be circled in ink.
  return "म.न.पा. /उ.म.न.पा. /न.पा. /गा.पा.";
}

const DEFAULT_LENDER: Required<Omit<LenderIdentity, "name">> = {
  province: "बागमती प्रदेश",
  district: "काठमाडौँ",
  municipality: "काठमाडौँ",
  municipalityType: "MAHANAGARPALIKA",
  wardNo: "1",
  locality: "कमलादी",
  branch: "मुख्य शाखा कार्यालय",
};

/**
 * The deed's opening description of the lender, verbatim from the paper form:
 * "बागमती प्रदेश, काठमाडौँ जिल्ला, काठमाडौँ म.न.पा., वडा नं. १, कमलादी स्थित
 *  प्रधान कार्यालय भएको बेष्ट फाइनान्स कम्पनी लि. को मुख्य शाखा कार्यालय"
 */
function lenderDescriptor(lender: LenderIdentity | null | undefined, fallbackName: string): string {
  const l = lender ?? {};
  const province = firstNonEmpty(l.province, DEFAULT_LENDER.province);
  const district = firstNonEmpty(l.district, DEFAULT_LENDER.district);
  const municipality = firstNonEmpty(l.municipality, DEFAULT_LENDER.municipality);
  const tier = municipalityTier(l.municipalityType ?? DEFAULT_LENDER.municipalityType);
  const ward = firstNonEmpty(l.wardNo, DEFAULT_LENDER.wardNo);
  const locality = firstNonEmpty(l.locality, DEFAULT_LENDER.locality);
  const branch = firstNonEmpty(l.branch, DEFAULT_LENDER.branch);
  const name = firstNonEmpty(l.name, fallbackName);

  return (
    `${fill(province, "sm")}, ${fill(district, "sm")} जिल्ला, ${fill(municipality, "sm")} ${tier}, ` +
    `वडा नं. ${fillNum(ward, "xs")}, ${fill(locality, "sm")} स्थित प्रधान कार्यालय भएको ` +
    `${fill(name, "md")} को ${fill(branch, "sm")}`
  );
}

function firstNonEmpty(...values: (string | null | undefined)[]): string | null {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return null;
}

/**
 * Builds the borrower's deed party from `borrowerParty` where present, falling
 * back to the flat `student*` fields. The flat fields predate the expanded
 * party block and still populate documents generated before it existed, so
 * both are consulted rather than migrating stored snapshots.
 */
function resolveBorrowerParty(data: LegalDocumentTemplateData): DeedParty {
  const p = data.borrowerParty ?? {};
  return {
    ...p,
    name: firstNonEmpty(p.name, data.studentName),
    // `studentFatherOrHusbandName` was a single combined slot before the deed
    // separated father from spouse; it seeds the father position.
    fatherName: firstNonEmpty(p.fatherName, data.studentFatherOrHusbandName),
    grandfatherName: firstNonEmpty(p.grandfatherName, data.studentGrandfatherName),
    permanentDistrict: firstNonEmpty(p.permanentDistrict, data.studentPermanentDistrict),
    permanentMunicipality: firstNonEmpty(p.permanentMunicipality, data.studentPermanentMunicipality),
    permanentWardNo: firstNonEmpty(p.permanentWardNo, data.studentPermanentWardNo),
    citizenshipNo: firstNonEmpty(p.citizenshipNo, data.studentCitizenshipNo),
    citizenshipIssueDate: firstNonEmpty(p.citizenshipIssueDate, data.studentCitizenshipIssueDate),
    citizenshipOffice: firstNonEmpty(p.citizenshipOffice, data.studentCitizenshipOffice),
    // The old free-text address maps to the current-address tole slot, which is
    // where a single-line address reads most naturally on the deed.
    currentTole: firstNonEmpty(p.currentTole, data.studentAddress),
  };
}

/** Same for the guarantor, falling back to the legacy `guarantor` object. */
function resolveGuarantorParty(data: LegalDocumentTemplateData): DeedParty {
  const p = data.guarantorParty ?? {};
  const g = data.guarantor ?? null;
  return {
    ...p,
    name: firstNonEmpty(p.name, g?.name),
    age: firstNonEmpty(p.age, g?.age),
    fatherName: firstNonEmpty(p.fatherName, g?.fatherOrHusbandName),
    grandfatherName: firstNonEmpty(p.grandfatherName, g?.grandfatherName),
    permanentDistrict: firstNonEmpty(p.permanentDistrict, g?.permanentDistrict),
    permanentMunicipality: firstNonEmpty(p.permanentMunicipality, g?.permanentMunicipality),
    permanentWardNo: firstNonEmpty(p.permanentWardNo, g?.permanentWardNo),
    citizenshipNo: firstNonEmpty(p.citizenshipNo, g?.citizenshipNo),
    citizenshipIssueDate: firstNonEmpty(p.citizenshipIssueDate, g?.citizenshipIssueDate),
    citizenshipOffice: firstNonEmpty(p.citizenshipOffice, g?.citizenshipOffice),
    currentTole: firstNonEmpty(p.currentTole, g?.address),
  };
}

/**
 * The fixed sentence both Nepali deeds use to describe a party, reproduced
 * verbatim including the paper's own spacing and spelling. `includeAddress`
 * is false for the borrower on व्यक्तिगत जमानत, where the paper names the
 * borrower by parentage and age only. `issueDateLabel` differs by document:
 * कर्जा तमसुक prints "जारी मिति", व्यक्तिगत जमानत prints "जारि मिति".
 */
function partyDescriptor(
  party: DeedParty | null | undefined,
  opts: { includeAddress?: boolean; issueDateLabel?: string } = {},
): string {
  const p = party ?? {};
  const { includeAddress = true, issueDateLabel = "जारी मिति" } = opts;

  const parentage =
    `${fill(p.grandfatherName, "sm")}/${fill(p.grandmotherName, "sm")}को नाति/नातिनी, ` +
    `${fill(p.fatherName, "sm")}/${fill(p.motherName, "sm")}को छोरा/छोरी,` +
    `${fill(p.fatherInLawName, "md")}को बुहारी` +
    `${fill(p.spouseName, "lg")} को पति/पत्नि`;

  const address = includeAddress
    ? ` जिल्ला ${fill(p.permanentDistrict, "sm")},${fill(p.permanentMunicipality, "sm")}, ` +
      `${municipalityTier(p.permanentMunicipalityType)} वडा नं. ${fillNum(p.permanentWardNo, "xs")}, ` +
      // The paper carries two blanks here — locality then house/tole detail.
      `${fill(p.permanentTole, "sm")} ${fill(p.permanentToleDetail, "sm")} स्थायी ठेगाना भई हाल जिल्ला ${fill(p.currentDistrict, "sm")}, ` +
      `${fill(p.currentMunicipality, "sm")}, ${municipalityTier(p.currentMunicipalityType)} ` +
      `वडा नं. ${fillNum(p.currentWardNo, "xs")}, ${fill(p.currentTole, "sm")}`
    : "";

  const identity =
    ` बस्ने बर्ष ${fillNum(p.age, "xs")}को ${fill(p.name, "md")}` +
    `(ना.प्र.नं.${fillNum(p.citizenshipNo, "sm")}, ${issueDateLabel} ${fillNum(p.citizenshipIssueDate, "sm")}, ` +
    `जिल्ला प्रशासन कार्यालय ${fill(p.citizenshipOffice, "sm")})`;

  return `${parentage}${address}${identity}`;
}

/** Devanagari-grouped figure only, e.g. "रू.५०,००,०००÷-". */
function amountFigure(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return `रू.<span class="rule rule-sm"></span>`;
  }
  return esc(`रू.${toNepaliGroupedDigits(Math.round(amount))}÷-`);
}

function interestRateText(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return `<span class="rule rule-xs"></span>`;
  return esc(`${toDevanagariNumeral(rate)}%`);
}

function monthsText(months: number | null | undefined): string {
  if (months === null || months === undefined) return `<span class="rule rule-sm"></span>`;
  return esc(`${toDevanagariNumeral(months)} महिना`);
}

/**
 * Loan products arrive from `application.facility`, which may be a raw enum
 * token such as EDUCATION_LOAN. Printing that verbatim on a legal document
 * reads as stray machine text, so known products map to their Nepali name and
 * anything unrecognised is at least de-tokenised into title case.
 */
const LOAN_PRODUCT_LABEL: Record<string, string> = {
  EDUCATION_LOAN: "शैक्षिक कर्जा (Education Loan)",
  EDUCATIONAL_LOAN: "शैक्षिक कर्जा (Education Loan)",
  STUDENT_LOAN: "शैक्षिक कर्जा (Education Loan)",
  TERM_LOAN: "अवधि कर्जा (Term Loan)",
  OVERDRAFT: "ओभरड्राफ्ट (Overdraft)",
  PERSONAL_LOAN: "व्यक्तिगत कर्जा (Personal Loan)",
};

function formatLoanProduct(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return esc(LOAN_PRODUCT_LABEL.EDUCATION_LOAN);
  const mapped = LOAN_PRODUCT_LABEL[raw.toUpperCase().replace(/[\s-]+/g, "_")];
  if (mapped) return esc(mapped);
  if (/^[A-Z0-9]+(_[A-Z0-9]+)+$/.test(raw)) {
    return esc(
      raw
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" "),
    );
  }
  return esc(raw);
}

/**
 * "इति सम्वत् २०८२ साल जेठ महिना ८ गते रोज ४ शुभम्।" — the traditional BS
 * execution-date line these documents close with. "रोज" is the 1-indexed
 * weekday (आइतबार = १), which is the AD JS weekday index + 1. Unknown parts
 * fall back to ruled blanks rather than dotted placeholder text.
 */
function formatBsLegalDateLine(iso?: string | null): string {
  const blank = (w: RuleWidth) => `<span class="rule rule-${w}"></span>`;
  const unknown = `इति सम्वत् ${blank("sm")} साल ${blank("sm")} महिना ${blank("xs")} गते रोज ${blank("xs")} शुभम्।`;

  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return unknown;
  try {
    const bs = NepaliDate.fromAD(d);
    const year = esc(bs.format("YYYY", "np"));
    const month = esc(bs.format("MMMM", "np"));
    const day = esc(bs.format("DD", "np"));
    const weekday = esc(toDevanagariNumeral(d.getDay() + 1));
    return `इति सम्वत् ${year} साल ${month} महिना ${day} गते रोज ${weekday} शुभम्।`;
  } catch {
    return unknown;
  }
}

// ---------------------------------------------------------------------------
// Print-grade stylesheet — shared by all four documents.
//
// Notes on the choices that matter for Devanagari and for print fidelity:
//  * No `letter-spacing` anywhere. Letter-spacing pulls Devanagari matras and
//    conjuncts away from their base glyph, which is what made headings look
//    scrambled.
//  * Devanagari-capable fonts lead the stack. The previous stack fell through
//    to Times New Roman, which has no Devanagari coverage, leaving glyph
//    selection to arbitrary browser substitution.
//  * Page margins live in `@page` only. Body padding on top of `@page` margins
//    was double-indenting every printed page.
//  * Explicit break control keeps headings with their body, holds table rows
//    and signature blocks together, and repeats table headers across pages.
//  * Ink is true black, not the grey palette, which prints washed out.
// ---------------------------------------------------------------------------

const DEVANAGARI_STACK = `"Noto Sans Devanagari", "Kalimati", "Nirmala UI", "Mangal", "Noto Sans", sans-serif`;
const LATIN_STACK = `"Times New Roman", Times, Georgia, serif`;

function legalStyles(): string {
  return `
    @page { size: A4; margin: 16mm 18mm 20mm; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html { -webkit-text-size-adjust: 100%; }

    body {
      font-family: ${DEVANAGARI_STACK};
      font-size: 10.5pt;
      line-height: 1.85;
      color: #000;
      background: #fff;
      letter-spacing: normal;
      font-variant-ligatures: normal;
      max-width: 190mm;
      margin: 0 auto;
      padding: 14mm 12mm;
    }

    /* Screen preview only — in print the @page margin box supplies the
       padding, so body padding is removed to avoid a doubled margin. */
    @media print {
      body { max-width: none; margin: 0; padding: 0; }
    }

    /* ---- Letterhead ------------------------------------------------ */
    .header {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2pt solid #000;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .header td { border: 0; padding: 0; vertical-align: bottom; }
    .header .meta-cell { text-align: right; white-space: nowrap; }
    .brand {
      font-family: ${LATIN_STACK};
      font-size: 15pt;
      font-weight: 700;
      color: #000;
      line-height: 1.25;
    }
    .brand-np { font-family: ${DEVANAGARI_STACK}; font-size: 9.5pt; color: #000; line-height: 1.5; }
    .meta { font-size: 9pt; color: #000; line-height: 1.6; }
    .meta .ad-date { font-family: ${LATIN_STACK}; font-size: 8.5pt; color: #333; }

    /* ---- Title ----------------------------------------------------- */
    .title-box { text-align: center; margin: 4px 0 18px; }
    .title-box h1 {
      font-size: 16pt;
      font-weight: 700;
      color: #000;
      letter-spacing: normal;
      line-height: 1.5;
      text-decoration: underline;
      text-underline-offset: 5px;
    }
    .title-box p.subtitle { font-size: 10pt; color: #000; margin-top: 6px; }

    /* ---- Body copy -------------------------------------------------- */
    .addressee { font-size: 10pt; margin-bottom: 14px; line-height: 2; }
    .body-text {
      font-size: 10pt;
      margin-bottom: 12px;
      text-align: justify;
      text-align-last: left;
      text-justify: inter-word;
      overflow-wrap: break-word;
      orphans: 3;
      widows: 3;
    }
    h2.section {
      font-size: 11pt;
      font-weight: 700;
      margin: 18px 0 8px;
      padding-bottom: 4px;
      border-bottom: 0.75pt solid #000;
      color: #000;
      letter-spacing: normal;
      break-after: avoid;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10pt;
      font-weight: 700;
      margin: 14px 0 6px;
      break-after: avoid;
      page-break-after: avoid;
    }
    .clause {
      font-size: 9.8pt;
      margin-bottom: 7px;
      padding-left: 1.4em;
      text-indent: -1.4em;
      text-align: justify;
      text-align-last: left;
      orphans: 2;
      widows: 2;
    }

    /* ---- Tables ----------------------------------------------------- */
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt; }
    td, th { padding: 7px 10px; border: 0.75pt solid #000; vertical-align: top; text-align: left; }
    th { font-weight: 700; background: #f2f2f2; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    table.plain, table.plain td, table.plain th { border: 0; padding: 0; background: none; }
    .witness-table td { height: 30pt; }

    /* ---- Ruled blanks for hand-completed fields ---------------------- */
    .rule {
      display: inline-block;
      border-bottom: 0.75pt solid #000;
      vertical-align: baseline;
      height: 0.95em;
      margin: 0 2px;
    }
    .rule-xs { width: 3.5em; }
    .rule-sm { width: 6em; }
    .rule-md { width: 10em; }
    .rule-lg { width: 15em; }
    .rule-xl { width: 22em; }
    .rule-cell { width: 100%; min-width: 4em; margin: 0; }

    /* ---- Remarks ---------------------------------------------------- */
    .remarks-box {
      font-size: 9.5pt;
      white-space: pre-wrap;
      border: 0.75pt solid #000;
      padding: 9px 12px;
      margin-bottom: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .amount-note { font-size: 8.5pt; color: #333; font-family: ${LATIN_STACK}; white-space: nowrap; }

    /* ---- Signatures ------------------------------------------------- */
    .sig-section-title { font-weight: 700; font-size: 10pt; margin: 22px 0 10px; }
    .sig-table { width: 100%; border-collapse: separate; border-spacing: 18px 0; margin: 0 -18px 10px; }
    .sig-table td { border: 0; padding: 0; width: 50%; vertical-align: top; font-size: 9.5pt; line-height: 1.7; }
    .sig-line { border-top: 0.75pt solid #000; margin: 38px 0 6px; }
    .sig-block,
    .borrower-block,
    .guarantor-block,
    .witness-block { break-inside: avoid; page-break-inside: avoid; }
    .borrower-block,
    .guarantor-block { margin-top: 20px; padding-top: 14px; border-top: 0.5pt solid #000; font-size: 9.8pt; }

    .legal-date { text-align: center; font-size: 10pt; font-weight: 600; margin: 24px 0 8px; }
    .letter-meta { font-size: 10pt; margin-bottom: 14px; }
    .letter-meta td { padding: 0; border: 0; }

    /* Yellow marker carried over from the approved paper forms, which flag
       the clauses legal wants re-read before execution. Printed as well as
       shown, since the marking is part of the approved document. */
    .hl { background: #ffff00; padding: 0 1px; }

    /* ---- Screen-only chrome ----------------------------------------- */
    .status-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 1px 9px;
      border-radius: 999px;
      font-size: 7.5pt;
      font-weight: 700;
      background: #f3f4f6;
      color: #374151;
      font-family: ${LATIN_STACK};
    }
    .status-signed, .status-active { background: #dcfce7; color: #166534; }
    .status-pending_signature { background: #fef3c7; color: #92400e; }
    .screen-only { font-family: ${LATIN_STACK}; }
    .draft-note {
      text-align: center;
      font-size: 8pt;
      color: #6b7280;
      margin-top: 24px;
      padding-top: 8px;
      border-top: 0.5pt dashed #9ca3af;
      font-family: ${LATIN_STACK};
    }

    @media print {
      .screen-only, .draft-note, .status-badge { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { background: #f2f2f2 !important; }
    }
  `;
}

function statusBadgeHtml(status?: LegalDocumentTemplateData["status"]): string {
  if (!status) return "";
  return `<span class="status-badge screen-only status-${esc(status.toLowerCase())}">${esc(status.replaceAll("_", " "))}</span>`;
}

/**
 * Waits for the Devanagari webfont to finish loading before opening the print
 * dialog. Printing on a fixed 200ms timer raced the font load, so documents
 * were regularly sent to the printer rendered in a fallback face — the single
 * biggest cause of inconsistent-looking output between one print and the next.
 */
function printScriptHtml(autoPrint?: boolean): string {
  if (!autoPrint) return "";
  return `<script>
  (function () {
    var printed = false;
    function go() {
      if (printed) return;
      printed = true;
      window.print();
      window.onfocus = function () { window.close(); };
    }
    function start() {
      var fonts = document.fonts;
      if (fonts && fonts.ready && typeof fonts.ready.then === "function") {
        fonts.ready.then(function () { setTimeout(go, 120); }).catch(go);
        setTimeout(go, 3000);
      } else {
        setTimeout(go, 600);
      }
    }
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start);
  })();
  </script>`;
}

function docHead(titleTag: string): string {
  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titleTag)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap">
  <style>${legalStyles()}</style>`;
}

function docHeader(opts: {
  institutionName: string;
  documentNumber?: string | null;
  status?: LegalDocumentTemplateData["status"];
  bsDate: string;
  generatedAt?: string | null;
}): string {
  const { institutionName, documentNumber, status, bsDate, generatedAt } = opts;
  const adDate = formatAdDate(generatedAt);
  return `<table class="header">
    <tbody>
      <tr>
        <td>
          <div class="brand">${esc(institutionName)}</div>
          <div class="brand-np">कर्जा विभाग</div>
        </td>
        <td class="meta-cell">
          <div class="meta">
            <div>च.नं.: ${fill(documentNumber, "sm")}${statusBadgeHtml(status)}</div>
            <div>मितिः ${fill(bsDate, "sm")} (वि.सं.)</div>
            ${adDate ? `<div class="ad-date">${esc(adDate)}</div>` : ""}
          </div>
        </td>
      </tr>
    </tbody>
  </table>`;
}

function witnessTableHtml(rows = 2): string {
  const blankRows = Array.from({ length: rows })
    .map(() => `<tr><td></td><td></td><td></td><td></td></tr>`)
    .join("");
  return `<div class="witness-block">
    <h2 class="section">रोहबर साक्षी</h2>
    <table class="witness-table">
      <thead><tr><th>नाम</th><th>उमेर</th><th>ठेगाना</th><th>दस्तखत</th></tr></thead>
      <tbody>${blankRows}</tbody>
    </table>
  </div>`;
}

/** Draft-status advisory — screen preview only, never printed. */
function draftNoteHtml(): string {
  return `<div class="draft-note">On-screen preview. Printed copies carry no status marking; the executed document is the signed original.</div>`;
}

function remarksSectionHtml(remarks?: string | null): string {
  const text = remarks?.trim();
  if (!text) return "";
  return `<h3>थप शर्त / कैफियत</h3><div class="remarks-box">${esc(text)}</div>`;
}

function clauseListHtml(items: string[]): string {
  return items.map((c) => `<p class="clause">${c}</p>`).join("");
}

/** Reproduces a yellow-highlighted span from the approved paper form. */
function hl(text: string): string {
  return `<span class="hl">${esc(text)}</span>`;
}

function docHtmlShell(opts: {
  titleTag: string;
  headerHtml: string;
  bodyHtml: string;
  printScript: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ne">
<head>
  ${docHead(opts.titleTag)}
</head>
<body>
  ${opts.headerHtml}
  ${opts.bodyHtml}
  ${opts.printScript}
</body>
</html>`;
}

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
    status,
    studentName,
    finalDisbursementAmount,
    interestRate,
    tenureMonths,
    remarks,
    generatedByName,
    generatedAt,
    institutionName: institutionNameInput,
    studentAddress,
    studentCitizenshipNo,
    studentCitizenshipOffice,
    studentCitizenshipIssueDate,
    branchManagerName,
    collateralOwnerName,
    collateralAddress,
    collateralPlotNo,
    collateralArea,
    collateralRemarks,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  // The letter's own issue date falls back to today; the application date does
  // not — an unrecorded application date prints as a blank to complete in ink.
  const bsDate = formatBsDateDiv(generatedAt ?? new Date().toISOString());
  const applicationDate = formatBsDateDiv(data.applicationDate ?? null);
  const amount = amountRupeeWords(finalDisbursementAmount);
  const rateNp = interestRateText(interestRate);
  const tenureNp = tenureMonths != null ? esc(toDevanagariNumeral(tenureMonths)) : `<span class="rule rule-sm"></span>`;
  const branchName = fill(data.lender?.branch, "sm");
  const guarantorParty = resolveGuarantorParty(data);

  // The offer letter names the guarantor address-first, then parentage, then
  // age and name — the reverse of the order the two deeds use, so it gets its
  // own sentence rather than reusing partyDescriptor().
  const guaranteeLine =
    `जिल्ला ${fill(guarantorParty.permanentDistrict, "sm")},${fill(guarantorParty.permanentMunicipality, "sm")}, ` +
    `${municipalityTier(guarantorParty.permanentMunicipalityType)} वडा नं. ${fillNum(guarantorParty.permanentWardNo, "xs")}, ` +
    `${fill(guarantorParty.permanentTole, "sm")} ${fill(guarantorParty.permanentToleDetail, "sm")} स्थायी ठेगाना भई हाल जिल्ला ` +
    `${fill(guarantorParty.currentDistrict, "sm")}, ${fill(guarantorParty.currentMunicipality, "sm")}, ` +
    `${municipalityTier(guarantorParty.currentMunicipalityType)} वडा नं. ${fillNum(guarantorParty.currentWardNo, "xs")}, ` +
    `${fill(guarantorParty.currentTole, "sm")} बस्ने ${fill(guarantorParty.grandfatherName, "sm")}/${fill(guarantorParty.grandmotherName, "sm")}को नाति/नातिनी, ` +
    `${fill(guarantorParty.fatherName, "sm")}/${fill(guarantorParty.motherName, "sm")}को छोरा/छोरी,${fill(guarantorParty.fatherInLawName, "md")} ` +
    `बर्ष ${fillNum(guarantorParty.age, "xs")}को ${fill(guarantorParty.name, "md")} श्री÷श्रीमती ${fill(guarantorParty.name, "sm")} को व्यक्तिगत जमानी ।`;

  // Clause letters follow the paper exactly, which skips several Devanagari
  // letters (क, ख, घ, छ, ञ, ट, ठ, ढ, त, द, न, प) rather than running in
  // sequence — reproduced rather than renumbered.
  const termsClauses = [
    "क) कर्जा पूर्णरूपमा चुक्ता नगरेसम्म वा कुनै दायित्व बाँकी रहेसम्म ऋणीले तलका शर्तहरू अविच्छिन्न पालना गर्नुपर्नेछ ।",
    "ख) ऋणीले नेपालको प्रचलित कानून तथा वित्तीय संस्थाको समय–समयमा तोकेको तथा नेपाल राष्ट्र बैंकले जारी गरेको निर्देशन पालना गर्न स्वीकार गर्नुपर्नेछ।",
    "घ) ऋणीको कुनै विवरण परिवर्तन भएमा तुरुन्त वित्तीय संस्थालाई जानकारी दिनुपर्नेछ।",
    "छ) धितो सम्पत्तिमा कसैले अतिक्रमण गरेमा वा चोरी भएमा ऋणीले वित्तीय संस्थालाई जानकारी दिनुपर्नेछ।",
    "ञ) ऋणी तथा एकाघर परिवार, जमानीदाताले वित्तीय संस्थाको ०.५% भन्दा बढी शेयर धारण गर्न पाइने छैन (राष्ट्र बैंकले तोकेको सीमाभन्दा बढी हुन नहुने)।",
    "ट) ऋणीले वित्तीय संस्था विरुद्ध मुद्दा मामिला गरेमा वित्तीय संस्थाले तुरुन्त सम्पूर्ण लेना फिर्ता माग गर्नेछ।",
    "ठ) कर्जा तथा व्याज नतिरेमा वा कालोसूची निर्देशन विपरीत कार्य गरेमा कर्जा सूचना केन्द्रले कालोसूचीमा राखिनेछ ।",
    "ढ) ऋणीको वित्तीय संस्थामा रहेको मुद्दती, चल्ती, बचत खाताको रकम कट्टा गरी व्याज, साँवा, शुल्क असुल गर्ने अधिकार वित्तीय संस्थालाई रहनेछ ।",
    "त) ऋणीले यसै वित्तीय संस्थामा चल्ती/बचत खाता राखी कारोबार गर्नुपर्नेछ,  अन्य संस्थामा कर्जा भए विवरण दिनुपर्नेछ।",
    "द) सूचना, पत्राचार गर्दा खाता खोल्दा दिएको ठेगानामा गरिनेछ ।  ठेगाना परिवर्तन भएमा लिखित जानकारी दिनुपर्नेछ, नदिएमा सोही ठेगानामा गरिएको सञ्चार आधिकारिक मानिनेछ ।",
    "न) चेकबुक, स्टेटमेन्ट, कार्ड, डिजिटल बैंकिङ विवरण गोप्य र सुरक्षित राख्नु ऋणीको जिम्मेवारी हुनेछ ।  ऋणीको कमजोरीबाट भएको हानीको जिम्मेवारी ऋणी स्वयंले लिनु पर्नेछ ।",
    "प) नेपाल राष्ट्र बैंकको ग्राहक संरक्षण निर्देशन बमोजिम वित्तीय संस्था ग्राहकहित संरक्षणमा प्रतिबद्ध रहनेछ।",
  ];

  // The paper runs these as one continuous block, not as separate list items.
  const defaultBlock =
    "क) व्याज तालिका अनुसार भुक्तानी नभएमा वा बीमा प्रिमियम वा अन्य लेना बाँकी रहेमा ।" +
    "ख) कर्जा सम्झौता वा यस प्रस्ताब पत्रको कुनै शर्त उल्लङ्घन भएमा ।" +
    "ग) स्वीकृत कर्जा रकम कानूनद्वारा वर्जित कार्यमा प्रयोग गरेमा ।" +
    "घ) ऋणीले दिएको कुनै विवरण भ्रमपूर्ण, बाँझिने, नबुझिने, झुट्टा वा गलत ठहरिएमा ।" +
    "ङ) ऋणीले दिएको तथ्याङ्क वा सूचना गलत रहेको वित्तीय संस्थालाई थाहा भएमा ।" +
    "च) सुरक्षणको हिनामिना, भुक्तानीका स्रोत बन्द, वा साँवा/व्याज/फि/बीमा आदि तिर्न अस्वीकार गरेमा ।" +
    "छ) धितो सम्पत्तिमा अड्चन, धावा, वा कानूनी आदेश आएमा, वा सम्पत्ति अधिग्रहण भएमा ।" +
    "झ) ऋणीले कर्जा तिर्न असमर्थता प्रकट गरेमा ।" +
    "ञ) ऋणी बेपत्ता भएमा वा ९० दिनसम्म सम्पर्कमा नआएमा ।" +
    "ट) ऋणी कानूनद्वारा बर्जित कार्यमा संलग्न रहेको गम्भीर आरोप वा प्रमाणित भएमा ।" +
    "ठ) ऋणी अपराधिक गतिविधिमा संलग्न प्रमाणित भएमा वा वित्तीय संस्थाबाट कर्जा लिइ खरिद गरिएको मोबाइल गैरकानुनी कार्यमा प्रयोग गरेको पाइएमा ।" +
    "ड) बक्यौता, बीमा शुल्क, लिलाम खर्च, कालोसूची शुल्क, पुनरसंरचना व्याज आदि बापत आधारदरमा अधिकतम ५% प्रिमियम थप गरी व्याज लगाउन सकिनेछ ।";

  const defaultActions = [
    "(१) सम्पूर्ण साँवा/व्याज/लेना फिर्ता माग गर्ने,",
    "(२) हर्जाना ब्याज लगाउने,",
    "(३) धितो कब्जा गरी बिक्री प्रक्रिया थाल्ने,",
    "(४) यस प्रस्ताब पत्रको सबै शर्त भंग मानी कारबाही गर्ने,",
    "(५) अरू कर्जा पनि फिर्ता माग गर्ने,",
    "(६) ऋणीका सबै अधिकार स्वतः निलम्बन गर्ने,",
    "(७) कालोसूचीमा राख्ने । असुलीको क्रममा धितो बिक्री, भोग, चलन, कब्जा, वहाल गर्न पाउनेछ । ऋणीको जुनसुकै खाताबाट रकम कट्टा गर्न सक्नेछ ।",
  ];

  const bodyHtml = `
  <div class="title-box">
    <h1>कर्जा प्रस्ताब पत्र</h1>
  </div>

  <table class="plain letter-meta">
    <tbody><tr>
      <td>च.नं. ${fill(documentNumber, "sm")}${statusBadgeHtml(status)}</td>
      <td style="text-align:right">मितिः ${bsDate}</td>
    </tr></tbody>
  </table>

  <div class="addressee">
    ध्यानाकर्षणः श्री ${fill(studentName, "lg")}<br>
    ठेगानाः ${fill(studentAddress, "xl")}
  </div>

  <div class="body-text">महोदय,</div>

  <div class="body-text">
    श्री ${fill(studentName, "lg")} (यस पछि ऋणी भनिएको) ले यस वित्तीय संस्थामा मिति ${applicationDate} मा दिएको कर्जा आवेदन पत्र र सो साथ संलग्न विवरणहरुको आधारमा र यस ${fill(institutionName, "md")} (यस पछि वित्तीय संस्था भनिएको) विच सम्पन्न विभिन्न चरणको छलफल, वार्तालाप तथा तहाँबाट कर्जा प्राप्त गर्न उपलब्ध गराइएका विभिन्न कागजातहरु समेतको आधारमा निम्न बमोजिमको कर्जा सुविधा निम्न शर्त बन्देजहरुको अधिनमा रहनेगरी स्वीकृत गरिएको व्यहोरा अनुरोध छ ।
  </div>

  <table>
    <tbody>
      <tr><th style="width:6%">१.</th><th colspan="2">कर्जा तथा सुविधाको विवरण</th></tr>
      <tr><td>${hl("क.")}</td><td style="width:26%">${hl("कर्जा सुविधाको किसिम")}</td><td>${hl("शैक्षिक कर्जा")}</td></tr>
      <tr><td></td><td>कर्जा सीमा</td><td>${amount} ।</td></tr>
      <tr><td></td><td>${hl("उद्देश्य")}</td><td>शैक्षिक प्रयोजनका लागि।</td></tr>
      <tr><td></td><td>व्याजदर</td><td>वार्षिक ${rateNp} – ब्याजको गणना वार्षिक रूपमा हुनेछ भुक्तानी मासिक रूपमा सममासिक किस्ता (Equated Monthly Installment) अनुसार गर्नु पर्नेछ ।</td></tr>
      <tr><td></td><td>${hl("समयावधि")}</td><td><span class="hl">${tenureNp} महिना ।</span></td></tr>
      <tr><td></td><td>कर्जा प्रवाह गर्ने तरीका</td><td>वुँदा नं. ३ मा उल्लेख गरिए अनुसारको सम्पूर्ण सुरक्षण लिखतमा सहिछाप गर्ने कार्य सम्पन्न भए पश्चात ऋणीले कर्जा रकम खातामा राखिदिन अनुरोध गरे बमोजिम कर्जाका सम्पूर्ण शर्तहरु नियमित परिपालना गर्ने गरी स्वीकृत कर्जा रकमको हदसम्म कर्जा प्रवाह गरिनेछ ।</td></tr>
    </tbody>
  </table>

  <h2 class="section">२. शुल्क तथा दस्तुरहरु ः</h2>
  <table>
    <tbody>
      <tr><td style="width:6%">क.</td><td style="width:20%">अन्य</td><td>कर्जा प्रशासनिक÷नविकरण दस्तुर वापत स्वीकृत ${fill(null, "sm")}कर्जा रकमको ${fill(null, "sm")} प्रतिशत (जम्मा रू.${fill(null, "sm")}) यस वित्तीय संस्थामा रहेको तपाईको खाताबाट कट्टा गरिनेछ ।कर्जा सूचना शुल्क वास्तविक खर्च भए बमोजिम लाग्नेछ ।कर्जा सम्बन्धी अन्य फि, शुल्क, दै–दस्तुर समय समयमा वित्तीय संस्थाले तोके अनुसार हुनेछ । साथै त्यस्तो शुल्क, दै–दस्तुर आदि वित्तीय संस्थाको Standard Tariff of Charges (STC) बमोजिम हुनेछन् । सो सम्बन्धी जानकारी वित्तीय संस्थाको वेबसाइट ${esc(data.tariffUrl ?? "https://bestfinance.com.np/standard-tariff-charges/")} मा समेत हेर्न सकिनेछ ।</td></tr>
    </tbody>
  </table>

  <h2 class="section">३. धितो सुरक्षण</h2>
  <p class="body-text">ऋणीले उपभोग गर्ने कर्जाको सुरक्षणका लागि निम्नानुसारको घर÷जग्गा वित्तीय संस्थाको नाममा सम्बन्धित मालपोत कार्यालयमा जग्गाधनीले दृस्टिबन्धक लिखत पारीत गरी रोक्का गरिदिनुपर्नेछ ।</p>
  <table>
    <thead><tr><th>जग्गाधनिको नाम</th><th>ठेगाना</th><th>कित्ता नं.</th><th>क्षेत्रफल</th><th>कैफियत</th></tr></thead>
    <tbody>
      <tr>
        <td>${fillCell(collateralOwnerName)}</td>
        <td>${fillCell(collateralAddress)}</td>
        <td>${collateralPlotNo?.trim() ? esc(toDevanagariNumeral(collateralPlotNo.trim())) : `<span class="rule rule-cell"></span>`}</td>
        <td>${collateralArea?.trim() ? esc(toDevanagariNumeral(collateralArea.trim())) : `<span class="rule rule-cell"></span>`}</td>
        <td>${fillCell(collateralRemarks)}</td>
      </tr>
    </tbody>
  </table>
  <p class="clause">जग्गाधनीको हकवालाहरुको सहमती पत्र र जग्गाधनीको मञ्जुरीनामा ।</p>
  <p class="clause">स्वीकृत कर्जा रकम ${amount} को कर्जाको लिखत ।</p>
  <p class="clause">स्वीकृत कर्जा रकम ${amount} का लागि ${guaranteeLine}</p>

  <h2 class="section">४. भुक्तानी विधि</h2>
  <p class="body-text">वुंदा नं. ३ मा उल्लेख गरिएनुसारको सम्पूर्ण सुरक्षण लिखतहरुमा सहिछाप÷पारित भए पश्चात ऋणीले कर्जा रकम खातामा राखिदिन अनुरोध गरे बमोजिम तथा कर्जाका सम्पूर्ण शर्तहरु नियमित परिपालना गर्ने गरी स्वीकृत कर्जा रकमको हदसम्म कर्जा रकम ऋणीको खातामा जम्मा हुनेछ । मासिक किस्ता/ब्याज चुक्ता गर्नका लागि तपाईंको खातामा रकम व्यवस्था/जम्मा गरेको हुनुपर्ने छ . <span class="hl">(In case of the Moratorium)  तत्पश्चात् ${fillNum(data.gracePeriodMonths, "xs")} महिना/वर्षसम्म ऋणीलाई प्रवाहित कर्जाको साँवामा दैनिक आधारमा ब्याज गणना गरी प्रत्येक अङ्ग्रेजी महिनाको १) तारिखमा उक्त ब्याज भुक्तानी गर्नुपर्नेछ । </span>‘सो रकम प्रत्येक अंग्रेजी महिनाको १० तारिखका दिन तपाईंको खाताबाट स्वतः कट्टी हुनेछ । तपाईंको कुनै पनि किस्ता<span class="hl">/ब्याज</span> बाँकी रहेमा वा कर्जा चुक्ता गर्न असफल भएमा, वित्तीय संस्थाले तपाईंको तथा तपाईंको एकाघर परिवारको वित्तीय संस्था वा अन्य कुनै पनि बैंक तथा वित्तीय संस्थामा जम्मा रहेको निक्षेपबाट रकम कट्टा गरी गराइ बाँकी लेना असुल गर्न सकिनेछ ।</p>

  <h2 class="section">५. ब्याज गणनाको तरिका</h2>
  <p class="body-text">कर्जामा लाग्ने ब्याजदर वित्तीय संस्थाको प्रचलित आधार दर मा स्वीकृत प्रिमियम थप गरी निर्धारण गरिनेछ। वित्तीय संस्थाको आधार दरमा हुने परिवर्तनका कारण लागू ब्याजदर समय–समयमा परिवर्तन हुन सक्नेछ । प्रत्येक महिना बाँकी रहेको साँवामा सोही दरले ब्याज लाग्नेछ र उक्त ब्याज मासिक किस्तामा समावेश गरी भुक्तानी लिइन्छ। तर यस ऋण प्रस्ताब पत्रमा उल्लेखित शर्तहरुको बर्खिलाप हुने गरी तोकिएको समयमा साँवा तथा व्याज भुक्तानी नगरेमा सम्पूर्ण कर्जा रकममा (वक्यौता समेत) शर्त नं. १ अनुसार वित्तीय  संस्थाले निर्धारण गरेको व्याजदरमा भाखा नाघेको साँवा रकममा २ प्रतिशत वा नेपाल राष्ट्र बैंकले तोकिदिए बमोजिम थप गरी हर्जाना व्याज यसै शर्तको अधिनमा पूर्व सूचना नदिइकनै लगाउन सकिनेछ ।</p>

  <h2 class="section">६. बिमा</h2>
  <p class="body-text">वित्तीय संस्थाको कर्जा वापत धितो सुरक्षणमा रहेको सम्पत्तिहरु कर्जा बक्यौता रहेसम्म ऋणी स्वयम्ले आफ्नै खर्चमा वित्तीय संस्थाले तोकेको वित्तीय संस्थाको शर्त अन्तर्गतका जोखिम बहन हुने गरी जस्तै दंगा, हड्ताल, आतंकबाद, अग्नी, बाढी, द्वेषपूर्ण क्षति र बीमा अभिलेखमा उल्लेख गरिएको अन्य आवश्यक जोखिम बहन हुने गरी बीमा गराउनुपर्नेछ । त्यसरी बीमा गराई सकेपछि बीमा प्रत्याभूती गर्ने वित्तीय संस्थाको नाममा दरपिठ गरिएको सक्कल बीमा अभिलेख वित्तीय संस्थामा बुझाउनु पर्नेछ । तोकिएको समयमा बीमा प्रत्याभूति गर्ने वित्तीय संस्थाको नाममा दरपिठ गरिएको सक्कल बीमा अभिलेख वित्तीय संस्थामा नबुझाएमा वा बीमा अभिलेख नविकरण गर्नुपर्ने हकमा नविकरण गर्न नसकेको खण्डमा वित्तीय संस्था स्वयंले बीमा वा बीमा नविकरण व्यवस्था गर्न सक्नेछ र त्यस वापत लाग्ने खर्च ऋणीको खाताबाट कट्टा गरिनेछ । सो खर्च ऋणीले नबुझाए सम्मको अवधिका लागि संस्थाले निर्धारण गरेको आधारदरमा अधिकतम ५ प्रतिशत प्रिमियम लगाईनेछ । वित्तीय संस्थाबाट पनि उक्त बीमा नविकरण गराउन छुट हुन गएमा त्यस्को जिम्मेवारी ऋणीको नै हुनेछ ।</p>

  <h2 class="section">७. कालोसूची</h2>
  <p class="body-text">कर्जा समयमा भुक्तानी नगरेमा वा भाका नाघेमा वा अन्य कुनै शर्त उल्लङ्घन गरेमा, वित्तीय संस्थाले तपाईंको नाम नेपाल राष्ट्र बैंकको निर्देशन अनुसार कर्जा सूचना केन्द्रको कालोसूचीमा राख्न सक्नेछ ।</p>

  <h2 class="section">८. कर्जा असुली प्रक्रिया</h2>
  <p class="body-text">कुनै पनि किस्ता नबुझाएमा, वा कुनै शर्त उल्लङ्घन गरेमा वित्तीय संस्थाले बाँकी सम्पूर्ण सावाँ, ब्याज, हर्जाना, प्रशासनिक खर्च, कानुनी खर्च, असुली खर्च आदि एकमुष्ट माग गर्नेछ । धितो कब्जामा लिई प्रचलित कानून बमोजिम लिलाम बिक्री गरिनेछ । लिलाम बिक्री हुन नसकेमा वा लिलाम बिक्रीबाट लेना नपुगेमा तपाईंको घर घराना वा अन्य सम्पत्तिबाट असुल गरिनेछ ।</p>

  <h2 class="section">९. परिवर्तन तथा संशोधन</h2>
  <p class="body-text">यस प्रस्ताव पत्रको कुनै शर्त वित्तीय संस्थाले समय–समयमा परिमार्जन गर्न सक्नेछ । परिमार्जनको सूचना वेबसाइट वा अन्य सञ्चार माध्यमबाट दिइनेछ ।</p>

  <h2 class="section">१०. शर्तबन्देजहरू</h2>
  ${clauseListHtml(termsClauses)}

  <h2 class="section">११. कर्जा चुक्ता गर्न असफल भएको घोषणा</h2>
  <p class="body-text">तलको कुनै एक अवस्था आएमा ऋणीलार्इ कर्जा तिर्न असफल भएको घोषणा गरी तुरुन्त कर्जा असुली प्रक्रिया थालिनेछ :</p>
  <p class="body-text">${defaultBlock}</p>
  <p class="body-text">ढ) ऋणीले कर्जाको सावाँ व्याज नतिरेमा वा कर्जाको शर्त उलङघन गरेमा वित्तीय संस्थाले निम्न कार्य गर्न सक्नेछ :</p>
  ${clauseListHtml(defaultActions)}

  <h2 class="section">१२. लागू हुने पूर्व शर्त</h2>
  <p class="body-text">क) ऋणीलाई यस कर्जा प्रस्ताव पत्रमा उल्लेख गरिएका शर्त स्वीकार्य भएमा मितिले १५ दिनभित्र हस्ताक्षर गरी फिर्ता दिनुपर्नेछ ।ख) प्रस्ताव स्वीकार गर्नुअगावै प्रतिकूल परिस्थिति आएमा वित्तीय संस्थाले कर्जा सुविधा फिर्ता गर्न सक्नेछ ।</p>

  <h2 class="section">१२. स्वघोषणा</h2>
  <p class="body-text">ऋणीले तलका विवरण सही र सत्य भएको विना शर्त घोषणा गर्दछ :क) वित्तीय संस्थासँगको सबै कारोबारसम्बन्धी लिखतहरू कानूनी रूपमा म र जमानतकर्तालार्इ बन्धनकारी हुनेछन् ।ग) हाल ऋणी वा जमानीकर्तामाथि कुनै मुद्दा चलिरहेको छैन ।घ) मैले कुनै कानून वा इजाजतपत्रको विपरीत कार्य गरेको छैन ।ङ) मैले उपलब्ध गराएका सबै विवरण, प्रतिबद्धता, आवेदन, वित्तीय विवरण तात्त्विक रूपमा असत्य, गलत वा झुटो छैनन् ।च) मेरो एकाघर परिवार, संस्थापक शेयरधनी, प्रमुख कार्यकारी, कर्मचारी र सो को] एकाघर परिवार, प्रबन्धक एजेन्ट, लेखापरीक्षक, सल्लाहकार, आधिकारिक मूल्याङ्कनकर्ता वा तिनको परिवार सदस्य नरहेको र यस वित्तीय संस्थासँग कुनै वित्तीय स्वार्थ नरहेको घोषणा गर्दछु ।छ) मेरो एकाघर परिवार तथा जमानीदाताका नजिकका नातेदार यस वित्तीय संस्थामा प्रमुख कार्यकारी अधिकृत वा कर्मचारी नरहेको घोषणा गर्दछु ।</p>

  ${remarksSectionHtml(remarks)}

  <div class="sig-block">
    <div class="sig-section-title">वित्तीय संस्थाको तर्फबाट</div>
    <table class="sig-table">
      <tbody>
        <tr>
          <td>
            <div>अधिकार प्राप्त श्री ${fill(generatedByName, "md")}</div>
            <div>पद सम्वन्ध व्यवस्थापक</div>
            <div>(Relationship Manager)</div>
            <div>दस्तखत ः</div>
          </td>
          <td>
            <div>श्री ${fill(branchManagerName, "md")}</div>
            <div>पद शाखा प्रवन्धक</div>
            <div>(Branch Manager)</div>
            <div>दस्तखत ः</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="borrower-block">
    <div class="sig-section-title">ऋणीको तर्फबाट</div>
    <p class="body-text">
      तपाई ${fill(institutionName, "md")}  ${branchName} शाखाबाट मेरो नाममा जारी गरेको मिति ${bsDate} को ऋण प्रस्ताब पत्रमा उल्लेखित कर्जा तथा बैंकिङ सुविधा सीमा र सो ऋण प्रस्ताब पत्रमा वर्णित शर्त बन्देजहरु विना शर्त स्वीकार गरी  पूर्ण परिपालना गर्दछु भनि सहिछाप गर्ने ऋणी श्री ${fill(studentName, "md")} (ना.प्र.नं. ${fillNum(studentCitizenshipNo, "md")}, जारी मितिः ${formatBsDateDiv(null) && fillNum(studentCitizenshipIssueDate, "sm")}, जि.प्र.का. ${fill(studentCitizenshipOffice, "md")})
    </p>
    <table class="sig-table">
      <tbody>
        <tr>
          <td><div class="sig-line"></div><div>हस्ताक्षरः</div></td>
          <td><div class="sig-line"></div><div>मितिः ${bsDate}</div></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="guarantor-block">
    <div class="sig-section-title">जमानीकर्ताको स्वीकृति</div>
    <p class="body-text">
      म देहायमा उल्लिखित तथा हस्ताक्षरित जमानीकर्ताले यो स्वीकार वा मन्जुर गर्दछु कि मैले दिएको व्यक्तिगत जमानीको सुरक्षणले तपाई धनि ${fill(institutionName, "md")} ${branchName} शाखाबाट ऋणी श्री ${fill(studentName, "md")}को नाममा जारी गरेको मिति ${bsDate} को ऋण प्रस्ताब पत्र वा सो को सट्टामा प्रतिस्थापन हुने अर्को पत्रमा उल्लिखित कर्जाको वर्तमान् तथा भविष्यमा उत्पन्न÷सृजना हुने थप दायित्व समेत खाम्ने सम्मको लागि सुरक्षण कायम रहने कुरामा मेरो पूर्ण मञ्जुरी रहेको छ ।
    </p>
    <table class="sig-table">
      <tbody>
        <tr>
          <td>
            <div>जमानीकर्ताको नामः श्री ${fill(guarantorParty.name, "md")}</div>
            <div>(ना.प्र.नं.${fillNum(guarantorParty.citizenshipNo, "sm")}, जारि मिति ${fillNum(guarantorParty.citizenshipIssueDate, "sm")}, जिल्ला प्रशासन कार्यालय ${fill(guarantorParty.citizenshipOffice, "sm")})</div>
            <div>ठेगानाः ${fill(guarantorParty.currentTole, "lg")}</div>
          </td>
          <td>
            <div>हस्ताक्षरः</div>
            <div class="sig-line"></div>
            <div>मितिः ${formatBsDateDiv(null)}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  ${draftNoteHtml()}`;

  return docHtmlShell({
    titleTag: `कर्जा प्रस्ताब पत्र — ${studentName}`,
    headerHtml: "",
    bodyHtml,
    printScript: printScriptHtml(opts.autoPrint),
  });
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
    remarks,
    generatedAt,
    institutionName: institutionNameInput,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  const bsDate = formatBsDate(generatedAt);
  const bsDateSlashed = formatBsDateSlashed(generatedAt);
  const loanAmount = amountAkshare(finalDisbursementAmount);
  const lender = lenderDescriptor(data.lender, institutionName);

  // व्यक्तिगत जमानत names the guarantor with the full address block and the
  // borrower by parentage and age only — the paper form carries no address
  // for the borrower here. Both use "जारि मिति" (कर्जा तमसुक uses "जारी मिति").
  const guarantorBlock = partyDescriptor(resolveGuarantorParty(data), {
    includeAddress: true,
    issueDateLabel: "जारि मिति",
  });
  const borrowerBlock = partyDescriptor(resolveBorrowerParty(data), {
    includeAddress: false,
    issueDateLabel: "जारि मिति",
  });

  const termsClauses = [
    "१) मेरो दायित्व मूल ऋणी सरह प्राथमिक दायित्व (Primary Liability) को रूपमा रहनेछ र कर्जा पूर्ण चुक्ता नभएसम्म निरन्तर रहनेछ।",
    "२) वित्तीय संस्थाले माग गरेको मितिले ७ दिनभित्र मैले रकम तिर्नेछु ।",
    "३) ऋणीले किस्ता वा आंशिक भुक्तानी गरेकोमा मेरो प्राथमिक दायित्वमा कुनै असर पर्दैन; बाँकी रकम मैले तिर्नुपर्छ भन्ने मैले बुझेको छु ।",
    "४) वित्तीय संस्थाले ऋणीलाई सहुलियत, थप समय, सहमति, धितो फुकुवा, अदलबदल गरे पनि मेरो दायित्व समाप्त हुँदैन।",
    "५) अन्य धितो वा अर्को जमानत भए पनि वित्तीय संस्थाले उक्त कर्जा असुली प्रयोजनका लागि मैले जमानत लेखिदीएको सीमा सम्म मसँग व्यक्तिगत रूपमा असुल गर्न सक्छ; मेरो दायित्व व्यक्तिगत र साझा (Joint &amp; Several) हुनेछ।",
    "६) मेरो मृत्यु भएमा मेरो उत्तराधिकारी/अंशियारले यो दायित्व वहन गर्नुपर्नेछ।",
    "७) ऋणी टाट पल्टेमा पनि मेरो दायित्व समाप्त हुँदैन भन्ने मैले बुझेको छु ।",
    "८) अदालतको फैसला, वित्तीय संस्थाको सूचना, वा खातावही/स्टेटमेन्टमा देखिएको रकम नै अन्तिम प्रमाण मानी मैले त्यति रकम तिर्नुपर्छ भन्ने बुझेको छु । पछि मैले कुनै उजुर गर्ने छैन ।",
    `९) मेरो दायित्व कर्जाको ${loanAmount} र त्यसमा लाग्ने ब्याज, पेनाल र अन्य दै-दस्तुर सम्म सीमित रहनेछ।`,
    "१०) वित्तीय संस्थासँग ऋणीलाई कर्जा चुक्ता गर्न समय दिने वा अन्य सम्झौता गर्ने अधिकार सुरक्षित रहनेछ।",
    "११) जमानीको हदसम्म मेरो नामको वा मेरो अंशको सम्पत्तिको मूल्य घटाउने वा हक हस्तान्तरण, धितो, दान गर्ने छैन।",
    "१२) वित्तीय संस्थाको सूचना मेरो अन्तिम ठेगानामा व्यक्ति वा फोन मेसेज वा इमेल वा कुरियर सर्भिस वा हुलाक मार्फत दिन सकिनेछ । रजिष्टर्ड गरिएको मितिले १५ दिन भित्रमा सूचना/पत्र प्राप्त भएको मानिनेछ। वित्तीय संस्थाको कर्मचारीले लिखित प्रमाण दिएमा त्यो अकाट्य प्रमाण हुनेछ।",
    "१३) वित्तीय संस्थाले मलाई लिखित सूचना नदिएसम्म मेरो जमानत बहाल रहनेछ। सूचना पाएपछि पनि सूचना अघिको अवधिको बाँकी दायित्व मैले तिर्नुपर्नेछ ।",
    "१४) यसमा नपरेका विषय मुलुकी देवानी संहिता (जमानत करार), बैंक तथा वित्तीय संस्था ऐन, र ऋण असुली ऐन बमोजिम हुनेछ।",
  ];

  const guarantorName = resolveGuarantorParty(data).name;

  const bodyHtml = `
  <div class="title-box">
    <h1>व्यक्तिगत जमानत</h1>
    <p class="subtitle">(जमानी दिनेको नाम ${fill(guarantorName, "lg")})</p>
  </div>

  <div class="body-text">
    लिखितम् लिखत गरी लिने धनीका नाम ${lender} (यसपछि "वित्तीय संस्था" भनिएको छ) । लिखत गरिदिनेका नाम ${guarantorBlock} (जसलाई यसपछि जमानीकर्ता भनिएको छ) आगे वित्तीय संस्थाले ${borrowerBlock} (जसलाई यसपछि ऋणी भनिएको छ) लाई वित्तीय संस्थाले मिति ${bsDateSlashed} मा जारि गरेको ${hl("कर्जा प्रस्ताब पत्र")} बमोजिम स्वीकृत कर्जा ${loanAmount} सम्मको रकम तथा त्यसमा लाग्ने साँवा, ब्याज, कमिसन, फि, मार्जिन, थप दायित्व समेतका लागि म जमानी दिनेले यो जमानत दिएको छु। ऋणीले कर्जा नतिरेपछि वित्तीय संस्थाले मलाई कर्जा चुक्ता गर्न गराउन माग गरेको रकम मैले पनि नतिरेमा मेरो घर घरानाको चल–अचल सम्पत्तिबाट असुल गर्नुहोला। ${hl("मैले माथि उल्लेखित कर्जा नतिरे नतिराएमा")} नेपाल राष्ट्र बैंकले बैंक तथा वित्तीय संस्थाहरुलाई जारी गरेको कालो सूची सम्बन्धि निर्देशनको ब्यवस्था वा सो को सट्टामा प्रतिस्थापन हुने अन्य निर्देशन ${hl("अनुसार")} मेरो नाम कर्जा सूचना केन्द्रको कालो सूचीमा समावेश गरेमा समेत मेरो पूर्ण मञ्जुरी छ । पछि कुनै उजुर वाजुर गर्ने छैन ।
  </div>

  <h2 class="section">तपसिल</h2>
  ${clauseListHtml(termsClauses)}

  ${remarksSectionHtml(remarks)}

  ${witnessTableHtml()}

  <div class="legal-date">${formatBsLegalDateLine(generatedAt)}</div>

  ${draftNoteHtml()}`;

  return docHtmlShell({
    titleTag: `व्यक्तिगत जमानत — ${studentName}`,
    headerHtml: docHeader({ institutionName, documentNumber, status, bsDate, generatedAt }),
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
    collateralOwnerName,
    collateralAddress,
    collateralPlotNo,
    collateralArea,
    collateralRemarks,
  } = data;

  const institutionName = institutionNameInput?.trim() || DEFAULT_INSTITUTION_NAME;
  const bsDate = formatBsDate(generatedAt);
  const bsDateSlashed = formatBsDateSlashed(generatedAt);
  const loanAmount = amountMatra(finalDisbursementAmount);
  const interestRateNp = interestRateText(interestRate);
  const lender = lenderDescriptor(data.lender, institutionName);
  const borrower = partyDescriptor(resolveBorrowerParty(data), {
    includeAddress: true,
    issueDateLabel: "जारी मिति",
  });

  const bodyHtml = `
  <div class="title-box">
    <h1>कर्जा तमसुक</h1>
  </div>

  <div class="body-text">
    लिखितम् लिखत गरी लिने धनीका नाम ${lender} (यसपछि "वित्तीय संस्था" भनिएको छ) । लिखत गरिदिनेका नाम ${borrower} (जसलाई यसपछि ऋणी भनिएको छ) आगे मिति ${bsDateSlashed} मा जारी भएको कर्जा प्रस्ताब पत्र अनुसार मेरो नाममा स्वीकृत तपसिल बमोजिमको कुल कर्जा रकम ${loanAmount} को अधीनमा रही उपभोग गर्ने गरी यो कर्जा तमसुक गरी दिएको ठीक साँचो हो। यस कर्जामा लाग्ने ब्याज, फि, शुल्क आदि दैदस्तुर तपाईं धनी वित्तीय संस्थाले म ऋणीको नाममा जारी गरेको प्रस्ताब पत्रमा उल्लेख भएको शर्त, दर तथा सोमा निर्धारित प्रक्रिया बमोजिम तोकिएकै भाखाभित्र तिर्ने बुझाउने छु। म ऋणीको नाउँमा स्वीकृत कर्जा उपभोग गर्दा तपाईं धनी वित्तीय संस्था उपर कुनै थप दायित्वहरू सृजना भएमा त्यस्तो थप दायित्वहरू, बिमा प्रिमियम दस्तुर, कानूनी खर्चहरू, धनी वित्तीय संस्थाबाट समय–समयमा हुने निरीक्षण गर्दा लाग्ने खर्च, प्राप्त कर्जासँग सम्बन्धित सूचना प्रकाशित खर्चहरू आदि समेत तिर्ने बुझाउने छु ।
  </div>

  <div class="body-text">
    यदि साँवा, ब्याज, थप ब्याज, फि, कमिसन, शुल्क आदि ऋण प्रस्ताब पत्र (वा संशोधन/प्रतिस्थापन पत्र) बमोजिम नतिरेमा, तिर्न आलटाल गरेमा, किस्ता खिलाफी गरेमा, वा प्रस्ताब पत्र वा यस लिखतको कुनै शर्त उल्लंघन गरेमा – धनी वित्तीय संस्थाले मेरो तथा मेरो एकाघर परिवारको (कसैको पनि) धनी वित्तीय संस्था वा अन्य कुनै बैंक/वित्तीय संस्थाको शाखामा रहेको/रहने निक्षेप कट्टा गरी गराइ लिएमा, धितो सम्पत्ति बैंक तथा वित्तीय संस्था ऐन, प्रचलित नेपाल कानून वा धनी वित्तीय संस्थाको आफ्नै नीति नियमानुसार लिलाम बिक्री वा अन्य व्यवस्था गरी मबाट लिन बाँकी साँवा, ब्याज, हर्जाना ब्याज, दैदस्तुर, असुली खर्च, कानूनी खर्च लगायत सम्पूर्ण लेना असुलउपर गरेमा मेरो मञ्जुरी रहेको छ। सोबाट लेना रकम असुल नभएमा धनी वित्तीय संस्थाले म उपर बैंक तथा वित्तीय संस्थाको ऋण असुली ऐन, नियमावली, प्रचलित कानून वा आफ्नै नीति नियमानुसार कारवाही गर्न सक्नेछ – जसमा मेरो पूर्ण मञ्जुरी छ। कथंकदाचित धितो सम्पत्ति कच्चा नकरा भई लिलाम बिक्री हुन नसकेमा वा बिक्री हुँदा पनि लेना नपुगेमा, मेरो तथा मेरो एकाघर परिवारको (जो सुकैको) नाममा रहेको घर–घरानाको सम्पत्तिबाट तपाईं धनी वित्तीय संस्थाले असुलउपर गर्न सक्नु हुनेछ । नेपाल राष्ट्र बैंकको कालोसूची निर्देशनमा भएको व्यवस्था बमोजिम मेरो वा यस कर्जासगँ सम्बद्ध अन्य पक्षको नाम कर्जा सूचना केन्द्रको कालोसूचीमा समावेश गरेमा पनि मेरो पूर्ण मञ्जुरी छ । भनी यो लिखत अद्योपान्त पढी, बाचि, सुनी लिखतमा लेखिएको व्यहोराको अर्थ र परिणाम समेत बुझी तपसिलका साक्षीहरूका रोहबरमा यो कर्जा तमसुकको लिखतमा सहीछाप गरी तपाईं धनी वित्तीय संस्थालाई दिएँ ।
  </div>

  <h2 class="section">तपसिल</h2>

  <h3>(क) स्वीकृत कर्जाको विवरण</h3>
  <table>
    <thead><tr><th style="width:8%">क्र.सं.</th><th>स्वीकृत कर्जाको किसिम</th><th>कर्जा रकम (अंक र अक्षरमा)</th><th style="width:18%">ब्याज/कमिशन</th></tr></thead>
    <tbody>
      <tr><td>१</td><td>${formatLoanProduct(loanProduct)}</td><td>${loanAmount}</td><td>वार्षिक ${interestRateNp}</td></tr>
    </tbody>
  </table>

  <h3>(ख) धितो सुरक्षणको विवरण</h3>
  <table>
    <thead><tr><th>जग्गाधनीको नाम</th><th>ठेगाना</th><th>कित्ता नं.</th><th>क्षेत्रफल</th><th>कैफियत</th></tr></thead>
    <tbody>
      <tr>
        <td>${fillCell(collateralOwnerName)}</td>
        <td>${fillCell(collateralAddress)}</td>
        <td>${collateralPlotNo?.trim() ? esc(toDevanagariNumeral(collateralPlotNo.trim())) : `<span class="rule rule-cell"></span>`}</td>
        <td>${collateralArea?.trim() ? esc(toDevanagariNumeral(collateralArea.trim())) : `<span class="rule rule-cell"></span>`}</td>
        <td>${fillCell(collateralRemarks)}</td>
      </tr>
    </tbody>
  </table>

  ${remarksSectionHtml(remarks)}

  ${witnessTableHtml()}

  <div class="legal-date">${formatBsLegalDateLine(generatedAt)}</div>

  ${draftNoteHtml()}`;

  return docHtmlShell({
    titleTag: `कर्जा तमसुक — ${studentName}`,
    headerHtml: docHeader({ institutionName, documentNumber, status, bsDate, generatedAt }),
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
  const loanAmount = amountMatra(finalDisbursementAmount);
  const purposeText = [courseName, collegeName].filter(Boolean).join(", ");
  const approvalDate = fillNum(approvalLetterDate, "sm");

  const bodyHtml = `
  <div class="title-box">
    <h1>कर्जा रकम निकासा अनुरोध पत्र</h1>
  </div>

  <div class="addressee">
    मितिः ${fill(bsDate, "sm")}<br>
    श्री ${fill(institutionName, "md")}<br>
    ${fill(data.lender?.branch, "sm") || "मुख्य शाखा"}
  </div>

  <div class="body-text"><strong>बिषयः</strong> कर्जा रकम निकासा गरिदिने बारे ।</div>

  <div class="body-text">
    त्यस वित्तीय संस्थाले मलाई निम्नानुसारको कर्जा स्वीकृत गरी मिति ${approvalDate} मा प्रेषित कर्जा स्वीकृति पत्रमा उल्लेख गरिएका शर्त र अबस्थाहरु पढि बाँची बुझी स्वीकार गरी तहाँलाई मिति ${approvalDate} मा पठाइ सकिएको व्यहोरा अनुरोध गर्दछु ।
  </div>

  <table>
    <thead><tr><th>कर्जाको किसिम</th><th>कर्जा सीमा</th><th>कर्जाको उद्देश्य</th><th>कर्जाको अबधी समाप्ति</th></tr></thead>
    <tbody>
      <tr>
        <td>${formatLoanProduct(loanProduct)}</td>
        <td>${loanAmount}</td>
        <td>${purposeText ? esc(`शैक्षिक प्रयोजन — ${purposeText}`) : "शैक्षिक प्रयोजनका लागि"}</td>
        <td>${fillNum(loanExpiryDate, "sm")}</td>
      </tr>
      <tr><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <div class="body-text">
    मलाई स्वीकृत गरेको निम्नानुसारको कर्जाका लागि आवश्यक पर्ने सुरक्षण त्यस संस्थाको नाममा लेखिदिने र सुरक्षण कागजातमा हस्ताक्षर गर्ने कार्य सम्पन्न गरिसकेको व्यहोरा अनुरोध गर्दै उक्त स्वीकृत कर्जा रकम मेरो खातामा जम्मा गरिदिनु हुन हार्दिक अनुरोध गर्दछु । यसमा फरक पर्ने छैन । फरक परेमा सहुँला/बुझाउँला ।
  </div>

  <table>
    <thead><tr><th>खाताको नाम</th><th>खाता नं.</th></tr></thead>
    <tbody>
      <tr>
        <td>${fillCell(bankAccountName)}</td>
        <td>${bankAccountNumber?.trim() ? esc(toDevanagariNumeral(bankAccountNumber.trim())) : `<span class="rule rule-cell"></span>`}</td>
      </tr>
      <tr><td></td><td></td></tr>
    </tbody>
  </table>

  <div class="body-text">धन्यवाद !</div>

  ${remarksSectionHtml(remarks)}

  <div class="borrower-block">
    <div>भवदीय,</div>
    <div class="sig-line" style="width:220px"></div>
    <div>नामः ${fill(studentName, "md")}</div>
    <div>पदः ${fill(borrowerPosition, "md")}</div>
  </div>

  ${draftNoteHtml()}`;

  return docHtmlShell({
    titleTag: `कर्जा रकम निकासा अनुरोध पत्र — ${studentName}`,
    headerHtml: docHeader({ institutionName, documentNumber, status, bsDate, generatedAt }),
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
    studentName: snapshot.studentName ?? "",
    applicationNumber: snapshot.applicationNumber ?? "",
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
    generatedByName: snapshot.generatedByName ?? doc.generatedByName ?? "",
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
