export type CommissionStatus = "Active" | "Invoice due" | "Pending" | "Credited" | "Onboarding";

export interface BankCommissionRow {
  bank: string;
  mouType: string;
  rate: string;
  loansFY: number;
  totalEarnedLabel: string;
  status: CommissionStatus;
}

export interface FollowUpCommissionRow {
  loanRef: string;
  emiNo: string;
  emiPaidLabel: string;
  followUpCommLabel: string;
  status: CommissionStatus;
}

export interface CollegeCommissionRow {
  college: string;
  model: string;
  rate: string;
  thisMonthLabel: string;
  fyTotalLabel: string;
  status: CommissionStatus;
}

export type CapExposureTone = "success" | "warning" | "destructive";

export interface NrbCapExposureRow {
  borrowerLabel: string;
  percentUsed: number;
  exposureLabel: string;
  tone: CapExposureTone;
}

export interface CommissionDetail {
  totalEarnedFYLabel: string;
  totalEarnedFYSubLabel: string;
  fromBanksLabel: string;
  fromBanksSubLabel: string;
  fromCollegesLabel: string;
  fromCollegesSubLabel: string;
  pendingPaymentLabel: string;
  pendingPaymentSubLabel: string;
  nrbReferenceNote: string;
  bankCommissions: BankCommissionRow[];
  totalFromBanksLabel: string;
  followUpNote: string;
  followUpCommissions: FollowUpCommissionRow[];
  collegeCommissions: CollegeCommissionRow[];
  totalFromCollegesLabel: string;
  nrbCapNote: string;
  nrbCapExposure: NrbCapExposureRow[];
}
