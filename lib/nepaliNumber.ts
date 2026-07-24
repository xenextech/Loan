// Devanagari digit + Nepali number-to-words helpers, used by the Loan
// Agreement legal document template to render amounts the way Nepali
// financial institutions do on paper: "रू.५०,००,०००÷- (अक्षरेपी पचास लाख मात्र)".

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** Converts an integer's decimal digits to Devanagari numerals (no grouping). */
export function toDevanagariDigits(n: number): string {
  const s = Math.trunc(Math.abs(n)).toString();
  return s.replace(/\d/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

/** Converts any number (incl. decimals) to Devanagari numerals, preserving the decimal point. */
export function toDevanagariNumeral(n: number | string): string {
  return String(n).replace(/\d/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

/**
 * Formats an integer using the Nepali digit-grouping convention (last 3
 * digits, then groups of 2) in Devanagari numerals, e.g. 5000000 -> "५०,००,०००".
 */
export function toNepaliGroupedDigits(n: number): string {
  const abs = Math.trunc(Math.abs(n));
  const s = abs.toString();
  if (s.length <= 3) return toDevanagariDigits(abs);
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const groups = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = `${groups},${last3}`;
  return grouped.replace(/\d/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

// Nepali number words 0-99 — irregular (not composed from tens+units like
// English), so a full lookup table is used.
const ONES_TO_NINETY_NINE = [
  "सुन्ना", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ",
  "दश", "एघार", "बाह्र", "तेह्र", "चौध", "पन्ध्र", "सोह्र", "सत्र", "अठार", "उन्नाइस",
  "बीस", "एक्काइस", "बाइस", "तेइस", "चौबिस", "पच्चिस", "छब्बिस", "सत्ताइस", "अठ्ठाइस", "उनन्तिस",
  "तीस", "एकतीस", "बत्तीस", "तेत्तीस", "चौँतीस", "पैँतीस", "छत्तीस", "सैँतीस", "अठतीस", "उनन्चालीस",
  "चालीस", "एकचालीस", "बयालीस", "त्रिचालीस", "चवालीस", "पैँतालीस", "छयालीस", "सतचालीस", "अठचालीस", "उनन्चास",
  "पचास", "एकाउन्न", "बाउन्न", "त्रिपन्न", "चवन्न", "पचपन्न", "छपन्न", "सन्ताउन्न", "अन्ठाउन्न", "उनन्साठी",
  "साठी", "एकसठ्ठी", "बयसठ्ठी", "त्रिसठ्ठी", "चौंसठ्ठी", "पैंसठ्ठी", "छैसठ्ठी", "सतसठ्ठी", "अठसठ्ठी", "उनन्सत्तरी",
  "सत्तरी", "एकहत्तर", "बहत्तर", "त्रिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उनासी",
  "असी", "एकासी", "बयासी", "त्रियासी", "चौरासी", "पचासी", "छयासी", "सतासी", "अठासी", "उनान्नब्बे",
  "नब्बे", "एकान्नब्बे", "बयान्नब्बे", "त्रियान्नब्बे", "चौरान्नब्बे", "पन्चान्नब्बे", "छयान्नब्बे", "सन्तान्नब्बे", "अन्ठान्नब्बे", "उनान्सय",
];

function twoDigitWords(n: number): string {
  if (n <= 0) return "";
  return ONES_TO_NINETY_NINE[n] ?? "";
}

/** Converts a non-negative integer to Nepali words using the lakh/crore system. */
export function nepaliNumberToWords(value: number): string {
  let n = Math.trunc(Math.abs(value));
  if (n === 0) return "सुन्ना";

  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;

  if (crore > 0) parts.push(`${twoDigitWords(crore)} करोड`);
  if (lakh > 0) parts.push(`${twoDigitWords(lakh)} लाख`);
  if (thousand > 0) parts.push(`${twoDigitWords(thousand)} हजार`);
  if (hundred > 0) parts.push(`${twoDigitWords(hundred)} सय`);
  if (remainder > 0) parts.push(twoDigitWords(remainder));

  return parts.join(" ");
}

/**
 * Formats a rupee amount the way Nepali loan documents do, e.g.
 * formatNepaliRupeeWords(5000000) -> 'रू.५०,००,०००÷- (अक्षरेपी पचास लाख मात्र)'
 */
export function formatNepaliRupeeWords(amount: number): string {
  const rounded = Math.round(amount);
  return `रू.${toNepaliGroupedDigits(rounded)}÷- (अक्षरेपी ${nepaliNumberToWords(rounded)} मात्र)`;
}
