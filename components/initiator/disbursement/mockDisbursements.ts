import type { DisbursementDetail, DisbursementListRow, DisbursementMonthlyStats, TrancheRecord } from "./types";

/**
 * Standing in for a future disbursement-tracking backend module (conditions checklist,
 * commission accrual, tranche history) — none of that exists on the API yet. Swap
 * `useDisbursementDetail` for a real RTK Query hook once it does; the call signature
 * already matches.
 */

const PENDING_ROWS: DisbursementListRow[] = [
  {
    id: "ln-20260624-093727",
    loanRef: "LN-20260624-093727",
    borrowerName: "Sharada Sah Godh",
    amountLabel: "Rs 7.1L",
    conditionsLabel: "6/6 done",
    status: "Ready",
  },
  {
    id: "ln-2081-0148",
    loanRef: "LN-2081-0148",
    borrowerName: "Sunita Shrestha",
    amountLabel: "Rs 45L",
    conditionsLabel: "4/6 done",
    status: "Conditions",
  },
  {
    id: "ln-2081-0133",
    loanRef: "LN-2081-0133",
    borrowerName: "Ram Saran Yadav",
    amountLabel: "Rs 8.5L",
    conditionsLabel: "2/5 done",
    status: "Blocked",
  },
];

const TRACKER: TrancheRecord[] = [
  {
    dateLabel: "25 Jun",
    loanRef: "LN-20260624-093727",
    borrowerName: "Sharada Sah",
    tranche: "1 of 1",
    amountLabel: "Rs 7.1L",
    accountCredited: "College A/C",
    status: "Confirmed",
  },
  {
    dateLabel: "22 Jun",
    loanRef: "LN-2081-0139",
    borrowerName: "Priya Tamang",
    tranche: "1 of 4",
    amountLabel: "Rs 2.0L",
    accountCredited: "College A/C",
    status: "Confirmed",
  },
  {
    dateLabel: "20 Jun",
    loanRef: "LN-2081-0127",
    borrowerName: "Bikash Rai",
    tranche: "Tranche 2",
    amountLabel: "Rs 1.9L",
    accountCredited: "College A/C",
    status: "Pending ack",
  },
];

const MONTHLY_STATS: DisbursementMonthlyStats = {
  totalDisbursedLabel: "Rs 1.84Cr",
  loanCount: 24,
  toCollegeAccountLabel: "Rs 84L",
  directToBorrowerLabel: "Rs 1.0Cr",
};

export const MOCK_DISBURSEMENTS: DisbursementDetail[] = [
  {
    id: "ln-20260624-093727",
    loanRef: "LN-20260624-093727",
    borrowerName: "Sharada Sah Godh",
    amountLabel: "Rs 7.1L",
    amountValue: 710000,
    statusHeaderLabel: "Approved — conditions pending",
    conditions: [
      { label: "Property registration deed executed and submitted", done: true },
      { label: "Lalpurja original deposited with bank", done: true },
      { label: "Loan agreement signed by borrower + guarantor", done: true },
      { label: "Citizenship + NID copies obtained", done: true },
      { label: "Agriculture plan sheet attached and verified", done: true },
      { label: "Insurance policy (crop): NPR 7.1L sum insured", done: true },
    ],
    commissionLabel: "Commission: Rs 710 (0.1% of Rs 7.1L per MOU) → credited to Unnati on disbursement",
    otherPending: PENDING_ROWS,
    tracker: TRACKER,
    monthlyStats: MONTHLY_STATS,
  },
  {
    id: "ln-2081-0148",
    loanRef: "LN-2081-0148",
    borrowerName: "Sunita Shrestha",
    amountLabel: "Rs 45L",
    amountValue: 4500000,
    statusHeaderLabel: "Conditions pending",
    conditions: [
      { label: "Property registration deed executed and submitted", done: true },
      { label: "Land ownership certificate deposited with bank", done: true },
      { label: "Loan agreement signed by borrower + guarantor", done: true },
      { label: "Citizenship + NID copies obtained", done: true },
      { label: "College offer letter re-verified", done: false },
      { label: "Insurance policy: NPR 45L sum insured", done: false },
    ],
    commissionLabel: "Commission: Rs 4,500 (0.1% of Rs 45L per MOU) → credited to Unnati on disbursement",
    otherPending: PENDING_ROWS,
    tracker: TRACKER,
    monthlyStats: MONTHLY_STATS,
  },
  {
    id: "ln-2081-0133",
    loanRef: "LN-2081-0133",
    borrowerName: "Ram Saran Yadav",
    amountLabel: "Rs 8.5L",
    amountValue: 850000,
    statusHeaderLabel: "Blocked — outstanding conditions",
    conditions: [
      { label: "Property registration deed executed and submitted", done: true },
      { label: "Lalpurja original deposited with bank", done: true },
      { label: "Loan agreement signed by borrower + guarantor", done: false },
      { label: "Citizenship + NID copies obtained", done: false },
      { label: "Insurance policy: NPR 8.5L sum insured", done: false },
    ],
    commissionLabel: "Commission: Rs 850 (0.1% of Rs 8.5L per MOU) → credited to Unnati on disbursement",
    otherPending: PENDING_ROWS,
    tracker: TRACKER,
    monthlyStats: MONTHLY_STATS,
  },
];

export function getMockDisbursements(): DisbursementListRow[] {
  return PENDING_ROWS;
}

export function getMockDisbursementById(id: string): DisbursementDetail | undefined {
  return MOCK_DISBURSEMENTS.find((d) => d.id === id);
}

export function getMockTrancheHistory(): TrancheRecord[] {
  return TRACKER;
}

export function getMockMonthlyStats(): DisbursementMonthlyStats {
  return MONTHLY_STATS;
}
