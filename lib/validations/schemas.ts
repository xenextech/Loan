import { z } from "zod";

export const step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .regex(/^\+?977[-\s]?[0-9]{9,10}$|^[0-9]{10}$/, "Enter a valid Nepal phone number"),
  email: z.string().email("Enter a valid email address"),
  studyType: z.enum(["program", "course", "diploma", "certification"]),
  courseName: z.string().min(2, "Course name is required"),
  collegeName: z.string().min(2, "College name is required"),
  boardUniversity: z.string().min(2, "Board or university name is required"),
  courseDuration: z.string().min(1, "Course duration is required"),
  loanAmount: z
    .number()
    .min(50000, "Minimum loan amount is NPR 50,000")
    .max(1500000, "Maximum loan amount is NPR 15,00,000"),
});

export const step2Schema = z.object({
  identityType: z.enum(["citizenship", "passport", "driving_license", "document"]),
  identityNumber: z.string().min(3, "Identity number is required"),
  identityName: z.string().min(2, "Name as on document is required"),
  dob: z.string().min(1, "Date of birth is required"),
  issuedDistrict: z.string().min(1, "Issued district is required"),
  issuedDate: z.string().min(1, "Issued date is required"),
  gender: z.enum(["male", "female", "other"]),
  occupation: z.enum(["student", "employed", "self_employed", "unemployed"]),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  municipality: z.string().min(1, "Municipality is required"),
  ward: z.string().min(1, "Ward number is required"),
});

export const step3Schema = z
  .object({
    fatherName: z.string().min(2, "Father's name is required"),
    motherName: z.string().min(2, "Mother's name is required"),
    grandfatherName: z.string().min(2, "Grandfather's name is required"),
    maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
    spouseName: z.string().optional(),
    expectedSalary: z.string().min(1, "Expected salary is required"),
    feeStructureType: z.enum(["upload", "website", "manual"]),
    feeWebsiteLink: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    feeManualAmount: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.maritalStatus === "married") {
        return data.spouseName && data.spouseName.length >= 2;
      }
      return true;
    },
    { message: "Spouse name is required when married", path: ["spouseName"] }
  );

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
