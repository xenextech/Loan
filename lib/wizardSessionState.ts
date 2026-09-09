// Temporary, refresh-only wizard state — scoped per application so multiple
// in-progress applications never bleed into each other. This is deliberately
// NOT a substitute for the backend draft: it only survives a same-tab
// refresh (sessionStorage clears on tab close) and only exists so a refresh
// lands the student back on the same page with the same typing, without
// that ever turning the application into a saved DRAFT (only the explicit
// Save as Draft button does that — see ApplicationWizard).
//
// Text fields only. Uploaded identity/KYC documents are never put in browser
// storage at any point: they are uploaded to (and re-read from) the backend,
// keyed by applicationId + identityType, which stays the single source of
// truth for them.
import type {
  ApplicationFormData,
  Step1Data,
  Step2Data,
  Step3Data,
} from "@/types/application";

type PersistedFragment = {
  step1?: Partial<Step1Data>;
  step2?: Partial<Step2Data>;
  step3?: Partial<Step3Data>;
};

// Which application this tab's wizard is currently working on. This is what
// makes a refresh reuse the same application instead of creating another
// one — Redux is memory-only, so without it every refresh would look like
// "no application exists yet" and start a new one.
const ACTIVE_ID_KEY = "wizard:activeApplicationId";

const stepKey = (applicationId: string) => `application:${applicationId}:currentStep`;
const formKey = (applicationId: string) => `application:${applicationId}:wizardFormData`;

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable/full — non-fatal, this is a best-effort convenience.
  }
}

function safeRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Non-fatal.
  }
}

export function readActiveApplicationId(): string | null {
  return safeGet(ACTIVE_ID_KEY);
}

export function writeActiveApplicationId(applicationId: string): void {
  safeSet(ACTIVE_ID_KEY, applicationId);
}

export function clearActiveApplicationId(): void {
  safeRemove(ACTIVE_ID_KEY);
}

export function readStoredStep(applicationId: string): number | null {
  const raw = safeGet(stepKey(applicationId));
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 4 ? n : null;
}

export function writeStoredStep(applicationId: string, step: number): void {
  safeSet(stepKey(applicationId), String(step));
}

export function readStoredFormFragment(applicationId: string): PersistedFragment {
  const raw = safeGet(formKey(applicationId));
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const { step1, step2, step3 } = parsed as PersistedFragment;
    return { step1, step2, step3 };
  } catch {
    return {};
  }
}

export function writeStoredFormFragment(
  applicationId: string,
  step: "step1" | "step2" | "step3",
  data:
    | ApplicationFormData["step1"]
    | ApplicationFormData["step2"]
    | ApplicationFormData["step3"],
): void {
  const existing = readStoredFormFragment(applicationId);
  safeSet(formKey(applicationId), JSON.stringify({ ...existing, [step]: data }));
}

// Drops everything this tab remembers about one application — its typing and
// its wizard position, plus the active pointer if it happens to point here.
// Called when the application is submitted, deleted, or replaced by a newly
// started one, so its data can never resurface under a different application.
export function clearWizardSessionState(applicationId: string): void {
  safeRemove(stepKey(applicationId));
  safeRemove(formKey(applicationId));
  if (readActiveApplicationId() === applicationId) clearActiveApplicationId();
}
