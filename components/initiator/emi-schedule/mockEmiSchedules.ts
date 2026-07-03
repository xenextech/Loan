import { calculateEMI } from "@/lib/formatters";
import type { EmiRow, EmiScheduleDetail, OverdueAccount } from "./types";

/**
 * Standing in for a future EMI-schedule/repayment backend module (amortization,
 * overdue tracking, NRB reclassification buckets) — none of that exists on the API yet.
 * Swap `useEmiScheduleDetail` for a real RTK Query hook once it does; the call signature
 * already matches.
 */

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDueDate = (date: Date): string => `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

export function buildAmortizationSchedule(principal: number, annualRatePercent: number, months: number, start: Date): EmiRow[] {
  const emi = calculateEMI(principal, annualRatePercent, months);
  const monthlyRate = annualRatePercent / 12 / 100;
  let balance = principal;
  const rows: EmiRow[] = [];

  for (let i = 1; i <= months; i++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPortion = emi - interest;
    balance = Math.max(0, balance - principalPortion);
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    rows.push({
      installmentNo: i,
      dueDateLabel: formatDueDate(dueDate),
      principal: principalPortion,
      interest,
      emi,
      balance,
      status: i === 1 ? "Upcoming" : "—",
    });
  }
  return rows;
}

const OVERDUE_ACCOUNTS: OverdueAccount[] = [
  {
    id: "ln-2081-0089",
    loanRef: "LN-2081-0089",
    borrowerName: "Sita Devi",
    emiLabel: "Rs 8,200",
    overdueDays: 3,
    penalInterestLabel: "Rs 45",
    bucket: "1-30d bucket",
    actionLabel: "Remind",
  },
  {
    id: "ln-2081-0071",
    loanRef: "LN-2081-0071",
    borrowerName: "Krishna Yadav",
    emiLabel: "Rs 18,720",
    overdueDays: 12,
    penalInterestLabel: "Rs 748",
    bucket: "1-30d bucket",
    actionLabel: "Call",
  },
  {
    id: "ln-2081-0055",
    loanRef: "LN-2081-0055",
    borrowerName: "Sunita BK",
    emiLabel: "Rs 7,850",
    overdueDays: 29,
    penalInterestLabel: "Rs 3,805",
    bucket: "Near NPA",
    actionLabel: "Escalate",
  },
];

export const SHARED_FIELDS = {
  emiDueTodayLabel: "Rs 3.2L",
  emiDueTodayAccounts: 42,
  overdue1to30Label: "Rs 1.8L",
  overdue1to30Accounts: 18,
  overdueAccounts: OVERDUE_ACCOUNTS,
};

export const MOCK_EMI_SCHEDULES: EmiScheduleDetail[] = [
  {
    id: "ln-20260624-093727",
    loanRef: "LN-20260624-093727",
    borrowerName: "Sharada Sah Godh",
    amountLabel: "Rs 7.1L",
    termMonths: 96,
    emiLabel: "Rs 10,439",
    rateLabel: "9.10%",
    startDateLabel: "25 Jul 2026",
    endDateLabel: "25 Jun 2034",
    schedule: buildAmortizationSchedule(710_000, 9.1, 96, new Date(2026, 6, 25)),
    ...SHARED_FIELDS,
  },
  {
    id: "ln-2081-0148",
    loanRef: "LN-2081-0148",
    borrowerName: "Sunita Shrestha",
    amountLabel: "Rs 45L",
    termMonths: 120,
    emiLabel: "Rs 57,032",
    rateLabel: "8.75%",
    startDateLabel: "10 Jul 2026",
    endDateLabel: "10 Jun 2036",
    schedule: buildAmortizationSchedule(4_500_000, 8.75, 120, new Date(2026, 6, 10)),
    ...SHARED_FIELDS,
  },
  {
    id: "ln-2081-0133",
    loanRef: "LN-2081-0133",
    borrowerName: "Ram Saran Yadav",
    amountLabel: "Rs 8.5L",
    termMonths: 84,
    emiLabel: "Rs 13,624",
    rateLabel: "9.35%",
    startDateLabel: "5 Jul 2026",
    endDateLabel: "5 Jun 2033",
    schedule: buildAmortizationSchedule(850_000, 9.35, 84, new Date(2026, 6, 5)),
    ...SHARED_FIELDS,
  },
];

export function getMockEmiScheduleById(id: string): EmiScheduleDetail | undefined {
  return MOCK_EMI_SCHEDULES.find((s) => s.id === id);
}

export function getMockOverdueAccounts(): OverdueAccount[] {
  return OVERDUE_ACCOUNTS;
}
