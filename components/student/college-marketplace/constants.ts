import type { CourseCategory, DegreeLevel } from "@/types/college-marketplace";

// Same 7-province list already hardcoded in Step2Identity.tsx — duplicated
// locally rather than extracting a shared constant, to avoid touching that
// unrelated, working file.
export const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

// Same fixed vocabulary as Step1AboutYou.tsx's course duration dropdown, so a
// course selected here maps straight onto that field with no translation.
export const DURATIONS = [
  "6 Months",
  "1 Year",
  "1.5 Years",
  "2 Years",
  "2.5 Years",
  "3 Years",
  "4 Years",
  "5 Years",
  "6 Years",
];

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  ENGINEERING: "Engineering",
  MANAGEMENT: "Management",
  IT_COMPUTER_SCIENCE: "IT & Computer Science",
  MEDICINE_HEALTH_SCIENCE: "Medicine & Health Science",
  SCIENCE: "Science",
  HUMANITIES_SOCIAL_SCIENCE: "Humanities & Social Science",
  LAW: "Law",
  EDUCATION: "Education",
  HOSPITALITY_TOURISM: "Hospitality & Tourism",
  AGRICULTURE: "Agriculture",
  OTHER: "Other",
};

export const DEGREE_LABELS: Record<DegreeLevel, string> = {
  CERTIFICATE: "Certificate",
  DIPLOMA: "Diploma",
  BACHELOR: "Bachelor",
  MASTER: "Master",
  PHD: "PhD",
};
