// Use 'en-US' everywhere — it has identical output on Node.js server and browsers.
// ne-NP produces Devanagari digits on the browser but standard digits on Node,
// causing React hydration mismatches.

// Prisma serializes Decimal fields as { d: number[], e: number, s: number } (decimal.js format).
// `Number()` on that object returns NaN. This helper handles all cases safely.
export function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  if (typeof v === "object" && "d" in (v as object) && "e" in (v as object)) {
    const dec = v as { d: number[]; e: number; s: number };
    const digits = String(dec.d[0]);
    return dec.s * parseInt(digits, 10) * Math.pow(10, dec.e + 1 - digits.length);
  }
  return 0;
}

// Same as toNumber, but preserves "absent" as undefined instead of coercing to 0 —
// for optional fields where callers hide the row entirely when there's no value.
export function toOptionalNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  return toNumber(v);
}

export function formatNPR(amount: number): string {
  return `NPR ${new Intl.NumberFormat("en-US").format(Math.round(amount))}`;
}

export function formatNPRShort(amount: number): string {
  if (amount >= 10_000_000) return `NPR ${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000)    return `NPR ${(amount / 100_000).toFixed(1)} L`;
  if (amount >= 1_000)      return `NPR ${(amount / 1_000).toFixed(0)}K`;
  return `NPR ${amount}`;
}

export function calculateEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

// "SELF_EMPLOYED" -> "Self Employed"
export function humanizeEnum(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
