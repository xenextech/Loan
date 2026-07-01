import { z } from "zod";
import type { PillOption } from "@/components/ui/pill-selector";
import type {
  CollegeOperation,
  CreditFacilitySize,
  DSGIR,
  IncomeSource,
  InstitutionPerformance,
  ParentBorrowing,
} from "../types/initiator";

export const CREDIT_FACILITY_SIZE_OPTIONS: PillOption<CreditFacilitySize>[] = [
  { value: "BELOW_1_LAKH", label: "Below Rs 1 Lakh" },
  { value: "ONE_LAKH_TO_2_5_LAKH", label: "Rs 1 Lakh – Rs 2.5 Lakh" },
  { value: "ABOVE_2_5_LAKH", label: "Above Rs 2.5 Lakh" },
];

export const DSGIR_OPTIONS: PillOption<DSGIR>[] = [
  { value: "BELOW_40_PERCENT", label: "Below 40%" },
  { value: "RANGE_40_TO_45_PERCENT", label: "40% – 45%" },
  { value: "ABOVE_45_PERCENT", label: "Above 45%" },
];

export const COLLEGE_OPERATION_OPTIONS: PillOption<CollegeOperation>[] = [
  { value: "MORE_THAN_10_YEARS", label: "More than 10 Years" },
  { value: "FIVE_TO_10_YEARS", label: "5 – 10 Years" },
  { value: "LESS_THAN_5_YEARS", label: "Less than 5 Years" },
];

export const INSTITUTION_PERFORMANCE_OPTIONS: PillOption<InstitutionPerformance>[] = [
  { value: "ABOVE_3_YEARS", label: "Above 3 Years" },
  { value: "ONE_TO_3_YEARS", label: "1 – 3 Years" },
  { value: "LESS_THAN_1_YEAR", label: "Less than 1 Year / New" },
];

export const PARENT_BORROWING_OPTIONS: PillOption<ParentBorrowing>[] = [
  { value: "BORROWING_FROM_US", label: "Borrowing from our bank" },
  { value: "BORROWING_FROM_ONE_OTHER_BFI", label: "Borrowing from one other BFI" },
  { value: "BORROWING_FROM_MULTIPLE_BFIS", label: "Borrowing from multiple BFIs" },
];

export const INCOME_SOURCE_OPTIONS: PillOption<IncomeSource>[] = [
  { value: "FIXED_INCOME", label: "Fixed Income" },
  { value: "SALARY", label: "Salary" },
  { value: "RENT", label: "Rent" },
  { value: "BUSINESS_INCOME", label: "Business Income" },
  { value: "MIXED_INCOME", label: "Mixed Income" },
];

const valuesOf = <T extends string>(options: PillOption<T>[]) =>
  options.map((o) => o.value) as [T, ...T[]];

export const initiatorVerificationSchema = z.object({
  creditFacilitySize: z.enum(valuesOf(CREDIT_FACILITY_SIZE_OPTIONS), {
    error: "Select a credit facility size",
  }),
  dsgir: z.enum(valuesOf(DSGIR_OPTIONS), {
    error: "Select a DSGIR range",
  }),
  collegeOperation: z.enum(valuesOf(COLLEGE_OPERATION_OPTIONS), {
    error: "Select the college's operation duration",
  }),
  institutionPerformance: z.enum(valuesOf(INSTITUTION_PERFORMANCE_OPTIONS), {
    error: "Select the institution's performance history",
  }),
  parentsBorrowings: z.enum(valuesOf(PARENT_BORROWING_OPTIONS), {
    error: "Select the parents' borrowing status",
  }),
  sourceOfIncome: z.enum(valuesOf(INCOME_SOURCE_OPTIONS), {
    error: "Select a source of income",
  }),
  remarks: z.string().max(1000, "Remarks must be under 1000 characters").optional(),
});

export type InitiatorVerificationFormValues = z.infer<typeof initiatorVerificationSchema>;
