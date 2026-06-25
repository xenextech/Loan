import { baseApi } from "./baseApi";
import type { EmiResult, EligibilityResult, EligibilityRequest } from "@/types/api";

export interface EmiRequest {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export const utilsApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV === 'development',
  endpoints: (builder) => ({
    calculateEmi: builder.mutation<EmiResult, EmiRequest>({
      query: (body) => ({
        url: "/utils/emi-calculator",
        method: "POST",
        body,
      }),
    }),

    checkEligibility: builder.mutation<EligibilityResult, EligibilityRequest>({
      query: (body) => ({
        url: "/utils/eligibility-checker",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCalculateEmiMutation, useCheckEligibilityMutation } = utilsApi;
