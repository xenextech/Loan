import type { InsurancePolicy, InsuranceTrackerDetail } from "./types";

/**
 * Standing in for a future insurance-tracking backend module (policy attachment,
 * expiry monitoring, NRB sum-insured compliance) — none of that exists on the API yet.
 * Swap `useInsuranceTrackerDetail` for a real RTK Query hook once it does; the call
 * signature already matches.
 */

const POLICIES: InsurancePolicy[] = [
  {
    id: "pol-1",
    borrowerName: "Sharada Sah Godh",
    loanRef: "LN-20260624-093727",
    insuranceType: "Crop insurance",
    policyNo: "NIC-CROP-2081-441",
    sumInsuredLabel: "Rs 7.1L",
    sumInsuredMissing: false,
    expiryStatusLabel: "25 Jun 2027",
    tone: "success",
  },
  {
    id: "pol-2",
    borrowerName: "Sunita Shrestha",
    loanRef: "LN-2081-0148",
    insuranceType: "Property insurance",
    policyNo: "—",
    sumInsuredLabel: "Not attached",
    sumInsuredMissing: true,
    expiryStatusLabel: "Missing",
    tone: "destructive",
  },
  {
    id: "pol-3",
    borrowerName: "Sita Devi",
    loanRef: "LN-2081-0089",
    insuranceType: "Property insurance",
    policyNo: "IMG-PROP-2080-092",
    sumInsuredLabel: "Rs 12L",
    sumInsuredMissing: false,
    expiryStatusLabel: "Exp: 8 days",
    tone: "warning",
  },
  {
    id: "pol-4",
    borrowerName: "Krishna Yadav",
    loanRef: "LN-2081-0071",
    insuranceType: "Property insurance",
    policyNo: "NLG-2080-771",
    sumInsuredLabel: "Rs 25L",
    sumInsuredMissing: false,
    expiryStatusLabel: "12 months",
    tone: "success",
  },
  {
    id: "pol-5",
    borrowerName: "Bikash Rai",
    loanRef: "LN-2081-0139",
    insuranceType: "Education loan cover",
    policyNo: "AIM-EDU-2081-041",
    sumInsuredLabel: "Rs 6.37L",
    sumInsuredMissing: false,
    expiryStatusLabel: "Jun 2028",
    tone: "success",
  },
  {
    id: "pol-6",
    borrowerName: "Ram Saran Yadav",
    loanRef: "LN-2081-0133",
    insuranceType: "Property insurance",
    policyNo: "GIC-2079-214",
    sumInsuredLabel: "Rs 8.5L",
    sumInsuredMissing: false,
    expiryStatusLabel: "Expired 45d",
    tone: "destructive",
  },
];

export const MOCK_INSURANCE_TRACKER: InsuranceTrackerDetail = {
  activePoliciesCount: 186,
  activePoliciesSubLabel: "Covering Rs 14.2Cr",
  expiring30DaysCount: 12,
  expiring30DaysSubLabel: "Action required",
  expiredLapsedCount: 3,
  expiredLapsedSubLabel: "Loan hold triggered",
  sumInsuredVsLoansLabel: "104%",
  sumInsuredVsLoansSubLabel: "Adequately covered",
  nrbRequirementNote:
    "NRB Requirement: All collateral (real estate) must be insured for at least the loan outstanding amount. Property insurance mandatory per Unified Directive 2081 Clause 7.4.",
  policies: POLICIES,
};

export function getMockInsuranceTracker(): InsuranceTrackerDetail {
  return MOCK_INSURANCE_TRACKER;
}
