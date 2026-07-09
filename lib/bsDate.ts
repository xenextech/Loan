import NepaliDate from "nepali-date-converter";

// Mirrors edu-loan-backend/src/common/utils/bs-ad-date.util.ts so the frontend
// derives the exact same AD date the backend would — nepali-date-converter
// supports BS years 2000-2090 (see its dateConfigMap).
export const BS_MIN_YEAR = 2000;
export const BS_MAX_YEAR = 2090;

const BS_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBsDateString(value: string): boolean {
  if (!BS_DATE_REGEX.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 32) return false;

  try {
    const nepaliDate = new NepaliDate(value);
    return (
      nepaliDate.getYear() === year &&
      nepaliDate.getMonth() === month - 1 &&
      nepaliDate.getDate() === day
    );
  } catch {
    return false;
  }
}

// Converts a BS date string ("YYYY-MM-DD") to the equivalent AD date string,
// or undefined if the input isn't a complete, valid BS date yet.
export function convertBsToAdString(bsDate: string): string | undefined {
  if (!isValidBsDateString(bsDate)) return undefined;
  const ad = new NepaliDate(bsDate).getAD();
  const adDate = new Date(Date.UTC(ad.year, ad.month, ad.date));
  return adDate.toISOString().slice(0, 10);
}
