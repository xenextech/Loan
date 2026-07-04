export type PolicyStatusTone = "success" | "warning" | "destructive";

export interface InsurancePolicy {
  id: string;
  borrowerName: string;
  loanRef: string;
  insuranceType: string;
  policyNo: string;
  sumInsuredLabel: string;
  sumInsuredMissing: boolean;
  expiryStatusLabel: string;
  tone: PolicyStatusTone;
}

export interface InsuranceTrackerDetail {
  activePoliciesCount: number;
  activePoliciesSubLabel: string;
  expiring30DaysCount: number;
  expiring30DaysSubLabel: string;
  expiredLapsedCount: number;
  expiredLapsedSubLabel: string;
  sumInsuredVsLoansLabel: string;
  sumInsuredVsLoansSubLabel: string;
  nrbRequirementNote: string;
  policies: InsurancePolicy[];
}
