import { z } from "zod";
import { isValidBsDateString } from "@/lib/bsDate";

// ─── Option lists — values match the backend enums exactly (Step1/2/3Dto via
// CreateInitiatorNewApplicationDto), since this form's payload is sent as-is,
// with no lowercase/uppercase transform layer like the student "apply" wizard has.

export const NA_STUDY_TYPE_OPTIONS = [
  { value: "PROGRAM", label: "Program" },
  { value: "COURSE", label: "Course" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "CERTIFICATION", label: "Certification" },
] as const;

export const NA_IDENTITY_TYPE_OPTIONS = [
  { value: "CITIZENSHIP", label: "Citizenship" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "PAN_NUMBER", label: "PAN Number" },
] as const;

export const NA_GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

export const NA_OCCUPATION_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self-Employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
] as const;

export const NA_MARITAL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
] as const;

export const NA_FEE_STRUCTURE_METHOD_OPTIONS = [
  { value: "DOCUMENT", label: "Document Upload" },
  { value: "LINK", label: "Website Link" },
  { value: "MANUAL", label: "Manual Entry" },
] as const;

const optionalText = (max = 300) => z.string().max(max).optional().or(z.literal(""));

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") return undefined;
    const num = typeof val === "number" ? val : Number(val);
    return Number.isNaN(num) ? undefined : num;
  });

export const newApplicationDetailsSchema = z
  .object({
    // Personal
    fullName: z.string().min(1, "Full name is required").max(200),
    email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^(\+977)?[0-9]{10}$/, "Enter a valid Nepal phone number"),

    // Study & loan
    studyType: z.enum(["PROGRAM", "COURSE", "DIPLOMA", "CERTIFICATION"]).optional(),
    courseName: optionalText(200),
    boardUniversity: optionalText(200),
    courseDuration: optionalText(60),
    loanAmount: optionalNumber,

    // Identity
    identityType: z.enum(["CITIZENSHIP", "PASSPORT", "DRIVING_LICENSE", "NATIONAL_ID", "PAN_NUMBER"]).optional(),
    identityNumber: optionalText(60),
    identityName: optionalText(200),
    dobAd: optionalText(20),
    dobBs: optionalText(20).refine((val) => !val || isValidBsDateString(val), {
      message: "Enter a valid BS date (YYYY-MM-DD, 2000-2090)",
    }),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    occupation: z.enum(["STUDENT", "EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED"]).optional(),
    issuedDistrict: optionalText(120),
    issuedDate: optionalText(20),

    // Address
    province: optionalText(60),
    district: optionalText(60),
    municipality: optionalText(120),
    ward: optionalText(20),

    // Family
    fatherName: optionalText(200),
    motherName: optionalText(200),
    grandfatherName: optionalText(200),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional(),
    spouseName: optionalText(200),
    expectedSalary: optionalNumber,

    // Fee structure
    feeStructureMethod: z.enum(["DOCUMENT", "LINK", "MANUAL"]).optional(),
    feeStructureUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    feeStructureText: optionalText(500),
  })
  .refine((data) => data.maritalStatus !== "MARRIED" || !!data.spouseName, {
    message: "Spouse name is required when married",
    path: ["spouseName"],
  });

export type NewApplicationDetailsValues = z.input<typeof newApplicationDetailsSchema>;
export type NewApplicationDetailsSubmitValues = z.output<typeof newApplicationDetailsSchema>;

export const DEFAULT_NEW_APPLICATION_DETAILS: NewApplicationDetailsValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  studyType: undefined,
  courseName: "",
  boardUniversity: "",
  courseDuration: "",
  loanAmount: "",
  identityType: undefined,
  identityNumber: "",
  identityName: "",
  dobAd: "",
  dobBs: "",
  gender: undefined,
  occupation: undefined,
  issuedDistrict: "",
  issuedDate: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  fatherName: "",
  motherName: "",
  grandfatherName: "",
  maritalStatus: undefined,
  spouseName: "",
  expectedSalary: "",
  feeStructureMethod: undefined,
  feeStructureUrl: "",
  feeStructureText: "",
};
