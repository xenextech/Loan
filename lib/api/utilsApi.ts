import { baseApi } from "./baseApi";
import type { EmiResult, EligibilityResult, EligibilityRequest, EmiScheduleEntry } from "@/types/api";

export interface EmiRequest {
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
}

interface EmiCalculatorResponse {
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  numberOfInstallments: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
}

interface EligibilityCheckerResponse {
  result: "ELIGIBLE" | "POSSIBLY_ELIGIBLE" | "NOT_ELIGIBLE";
  explanation: string;
  details: {
    maxLoanForStudyType: number;
    estimatedMonthlyEmi: number;
    maxAffordableEmi: number;
    salaryToEmiRatioUsed: number;
    assumedTenureMonths: number;
    assumedInterestRate: string;
  };
}

// The backend doesn't return a month-by-month schedule, so derive it here
// from the figures it does return (same amortization math as the backend).
function buildAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  tenureMonths: number,
  monthlyEmi: number,
): EmiScheduleEntry[] {
  const r = interestRate / 12 / 100;
  let balance = loanAmount;
  const schedule: EmiScheduleEntry[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * r;
    const principal = Math.min(monthlyEmi - interest, balance);
    balance = Math.max(balance - principal, 0);
    schedule.push({
      month,
      emi: Math.round(monthlyEmi * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
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
      transformResponse: (response: EmiCalculatorResponse): EmiResult => ({
        principal: response.loanAmount,
        annualRate: response.interestRate,
        tenureMonths: response.tenureMonths,
        monthlyEmi: response.monthlyEmi,
        totalInterest: response.totalInterest,
        totalPayable: response.totalPayment,
        schedule: buildAmortizationSchedule(
          response.loanAmount,
          response.interestRate,
          response.tenureMonths,
          response.monthlyEmi,
        ),
      }),
    }),

    checkEligibility: builder.mutation<EligibilityResult, EligibilityRequest>({
      query: (body) => ({
        url: "/utils/eligibility-checker",
        method: "POST",
        body,
      }),
      transformResponse: (response: EligibilityCheckerResponse): EligibilityResult => ({
        eligible: response.result === "ELIGIBLE",
        maxLoanAmount: response.details.maxLoanForStudyType,
        reasons: [response.explanation],
        estimatedEmi: response.details.estimatedMonthlyEmi,
      }),
    }),
  }),
});

export const { useCalculateEmiMutation, useCheckEligibilityMutation } = utilsApi;
