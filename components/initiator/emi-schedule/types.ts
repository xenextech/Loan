export type OverdueBucket = "1-30d bucket" | "31-90d bucket" | "Near NPA";

export type EmiRowStatus = "Upcoming" | "Paid" | "Overdue" | "—";

export interface EmiRow {
  installmentNo: number;
  dueDateLabel: string;
  principal: number;
  interest: number;
  emi: number;
  balance: number;
  status: EmiRowStatus;
}

export interface OverdueAccount {
  id: string;
  loanRef: string;
  borrowerName: string;
  emiLabel: string;
  overdueDays: number;
  penalInterestLabel: string;
  bucket: OverdueBucket;
  actionLabel: string;
}

export interface EmiScheduleDetail {
  id: string;
  loanRef: string;
  borrowerName: string;
  amountLabel: string;
  termMonths: number;
  emiLabel: string;
  rateLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  emiDueTodayLabel: string;
  emiDueTodayAccounts: number;
  overdue1to30Label: string;
  overdue1to30Accounts: number;
  schedule: EmiRow[];
  overdueAccounts: OverdueAccount[];
}
