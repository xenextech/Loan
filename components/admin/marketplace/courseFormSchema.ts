import { z } from "zod";
import { DURATIONS } from "@/components/student/college-marketplace/constants";

const categoryValues = [
  "ENGINEERING",
  "MANAGEMENT",
  "IT_COMPUTER_SCIENCE",
  "MEDICINE_HEALTH_SCIENCE",
  "SCIENCE",
  "HUMANITIES_SOCIAL_SCIENCE",
  "LAW",
  "EDUCATION",
  "HOSPITALITY_TOURISM",
  "AGRICULTURE",
  "OTHER",
] as const;

const degreeLevelValues = ["CERTIFICATE", "DIPLOMA", "BACHELOR", "MASTER", "PHD"] as const;

// Numeric inputs stay as strings in RHF state while the user types; these
// transform to a clean number on validate/submit — matches the loan-assessment
// form's schema.ts `optionalNumber` convention.
const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") return undefined;
    const num = typeof val === "number" ? val : Number(val);
    return Number.isNaN(num) ? undefined : num;
  });

const requiredNumber = (message: string) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : Number(val)))
    .pipe(z.number({ message }).min(0, message));

export const courseFormSchema = z.object({
  collegeId: z.string().min(1, "College is required"),
  name: z.string().min(2, "Course name is required"),
  category: z.enum(categoryValues, { message: "Category is required" }),
  degreeLevel: z.enum(degreeLevelValues, { message: "Degree level is required" }),
  // Constrained to the same fixed vocabulary as the /apply wizard's Course
  // Duration <Select> — an admin-typed arbitrary string would silently break
  // that flow's prefill matching.
  duration: z.enum(DURATIONS as [string, ...string[]], { message: "Duration is required" }),
  durationMonths: optionalNumber,
  description: z.string().optional(),
  aboutContent: z.string().optional(),
  eligibility: z.string().optional(),
  seatsAvailable: optionalNumber,
  tuitionFee: requiredNumber("Tuition fee is required"),
  admissionFee: optionalNumber,
  totalFee: requiredNumber("Total fee is required"),
  bannerUrl: z.string().optional(),
  learningOutcomes: z.array(z.object({ value: z.string().min(1, "Required") })),
  careerOutcomes: z.array(
    z.object({
      title: z.string().min(1, "Required"),
      description: z.string().optional(),
      salaryRange: z.string().optional(),
    }),
  ),
  curriculum: z.array(
    z.object({
      semester: z.string().min(1, "Required"),
      subjects: z.string().min(1, "Comma-separated subjects"),
    }),
  ),
  feeBreakdown: z.array(
    z.object({
      label: z.string().min(1, "Required"),
      amount: requiredNumber("Required"),
    }),
  ),
  industryDemand: z.string().optional(),
  intake: z.string().optional(),
  credits: optionalNumber,
  medium: z.string().optional(),
  attendanceType: z.string().optional(),
  isFeatured: z.boolean(),
  isPopular: z.boolean(),
  isActive: z.boolean(),
});

export type CourseFormValues = z.input<typeof courseFormSchema>;
export type CourseSubmitValues = z.output<typeof courseFormSchema>;

export const courseFormDefaults: CourseFormValues = {
  collegeId: "",
  name: "",
  category: "IT_COMPUTER_SCIENCE",
  degreeLevel: "BACHELOR",
  duration: DURATIONS[0],
  durationMonths: "",
  description: "",
  aboutContent: "",
  eligibility: "",
  seatsAvailable: "",
  tuitionFee: 0,
  admissionFee: "",
  totalFee: 0,
  bannerUrl: "",
  learningOutcomes: [],
  careerOutcomes: [],
  curriculum: [],
  feeBreakdown: [],
  industryDemand: "",
  intake: "",
  credits: "",
  medium: "",
  attendanceType: "",
  isFeatured: false,
  isPopular: false,
  isActive: true,
};
