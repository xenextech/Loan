import type {
  BankCommissionRow,
  CollegeCommissionRow,
  CommissionDetail,
  FollowUpCommissionRow,
  NrbCapExposureRow,
} from "./types";

/**
 * Standing in for a future commission-tracking backend module (bank/college MOU
 * commission, repayment follow-up commission, NRB digital-lending-cap exposure) — none
 * of that exists on the API yet. Swap `useCommissionDetail` for a real RTK Query hook
 * once it does; the call signature already matches.
 */

const BANK_COMMISSIONS: BankCommissionRow[] = [
  { bank: "Best Finance Co. (BFCL)", mouType: "% of loan", rate: "0.10%", loansFY: 142, totalEarnedLabel: "Rs 3.2L", status: "Active" },
  { bank: "NIC Asia Bank", mouType: "Flat fee", rate: "Rs 1,500/loan", loansFY: 84, totalEarnedLabel: "Rs 1.26L", status: "Active" },
  { bank: "NMB Bank", mouType: "% of loan", rate: "0.15%", loansFY: 51, totalEarnedLabel: "Rs 1.02L", status: "Active" },
  { bank: "Laxmi Sunrise", mouType: "Flat fee", rate: "Rs 800/loan", loansFY: 38, totalEarnedLabel: "Rs 30,400", status: "Invoice due" },
  { bank: "Kumari Bank", mouType: "% of loan", rate: "0.10%", loansFY: 29, totalEarnedLabel: "Rs 21,750", status: "Pending" },
];

const FOLLOW_UP_COMMISSIONS: FollowUpCommissionRow[] = [
  { loanRef: "LN-2081-0089", emiNo: "EMI 6", emiPaidLabel: "Rs 8,200", followUpCommLabel: "Rs 82 (1%)", status: "Credited" },
  { loanRef: "LN-2081-0071", emiNo: "EMI 12", emiPaidLabel: "Rs 18,720", followUpCommLabel: "Rs 187", status: "Pending" },
  { loanRef: "LN-2081-0139", emiNo: "EMI 3", emiPaidLabel: "Rs 10,439", followUpCommLabel: "Rs 104", status: "Credited" },
];

const COLLEGE_COMMISSIONS: CollegeCommissionRow[] = [
  { college: "Ace Institute of Mgmt", model: "SaaS + per doc", rate: "Rs 15K/yr + Rs 50/doc", thisMonthLabel: "Rs 3,850", fyTotalLabel: "Rs 41,200", status: "Active" },
  { college: "Kathmandu Model College", model: "SaaS", rate: "Rs 20,000/year", thisMonthLabel: "Rs 1,667", fyTotalLabel: "Rs 20,000", status: "Active" },
  { college: "NCIT College", model: "Per student", rate: "Rs 200/student", thisMonthLabel: "Rs 2,400", fyTotalLabel: "Rs 18,600", status: "Active" },
  { college: "Stamford College", model: "Per loan", rate: "Rs 500/loan disbursed", thisMonthLabel: "Rs 4,500", fyTotalLabel: "Rs 32,500", status: "Active" },
  { college: "Thames Int'l College", model: "SaaS", rate: "Rs 25,000/year", thisMonthLabel: "Rs 2,083", fyTotalLabel: "—", status: "Onboarding" },
];

const NRB_CAP_EXPOSURE: NrbCapExposureRow[] = [
  { borrowerLabel: "Bikash Rai — BBA loan", percentUsed: 64, exposureLabel: "Rs 6.37L / Rs 10L", tone: "success" },
  { borrowerLabel: "Priya Tamang — MBA loan", percentUsed: 80, exposureLabel: "Rs 8.0L / Rs 10L", tone: "warning" },
  { borrowerLabel: "Birgunj Traders — above digital cap", percentUsed: 100, exposureLabel: "Rs 1.2Cr — physical required", tone: "destructive" },
];

export const MOCK_COMMISSION: CommissionDetail = {
  totalEarnedFYLabel: "Rs 8.4L",
  totalEarnedFYSubLabel: "↑22% vs FY 2080",
  fromBanksLabel: "Rs 6.1L",
  fromBanksSubLabel: "72% of total",
  fromCollegesLabel: "Rs 2.3L",
  fromCollegesSubLabel: "28% of total",
  pendingPaymentLabel: "Rs 1.2L",
  pendingPaymentSubLabel: "3 invoices",
  nrbReferenceNote:
    "NRB reference: Digital lending platform service fee is governed by agreement between BFI and platform. NRB caps total digital loan at Rs 10L. Commission is 0.1%–1% per MOU (typically Rs 500–Rs 10,000 per loan depending on size and MOU terms).",
  bankCommissions: BANK_COMMISSIONS,
  totalFromBanksLabel: "Rs 6,10,150",
  followUpNote: "Unnati earns commission not just on disbursement but also on successful repayment milestones — per MOU terms.",
  followUpCommissions: FOLLOW_UP_COMMISSIONS,
  collegeCommissions: COLLEGE_COMMISSIONS,
  totalFromCollegesLabel: "Rs 2,32,800",
  nrbCapNote: "Tracking digital lending per-borrower exposure against NRB Rs 10L cap.",
  nrbCapExposure: NRB_CAP_EXPOSURE,
};

export function getMockCommission(): CommissionDetail {
  return MOCK_COMMISSION;
}
