import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNPR, formatDate } from "@/lib/formatters";
import { Landmark, ShieldCheck, Users2, FileWarning, ScrollText, Leaf } from "lucide-react";
import type { InitiatorApplicationRecord } from "@/types/api";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/50 last:border-0 gap-6">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{String(value)}</span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-3.5 border-b border-border">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-1">{children}</CardContent>
    </Card>
  );
}

const hasAny = (...values: unknown[]) => values.some((v) => v !== undefined && v !== null && v !== "");
const boolLabel = (v?: boolean | null) => (v === undefined || v === null ? undefined : v ? "Yes" : "No");
const dateOrUndefined = (v?: string | null) => (v ? formatDate(v) : undefined);
const nprOrUndefined = (v?: number | null) => (v === undefined || v === null ? undefined : formatNPR(v));
const percentOrUndefined = (v?: number | null) => (v === undefined || v === null ? undefined : `${v}%`);

/** True if `application` carries any credit-appraisal field this component
 *  would render — lets callers skip the section heading/separator entirely
 *  when there's nothing to show. */
export function hasAppraisalData(application: InitiatorApplicationRecord): boolean {
  return (
    hasAny(
      application.customerName,
      application.relationshipStartDate,
      application.customerGroup,
      application.obligorNumber,
      application.profession,
      application.repaymentSource,
      application.permanentAddress,
      application.correspondenceAddress,
      application.citizenshipNumber,
      application.nidNumber,
      application.panNumber,
      application.licenseNumber,
      application.bankingRelationship,
      application.existingBankingRelationship,
      application.baselClassification,
      application.baselRiskWeight,
      application.nrb93SectorCode,
      application.nrb93KaProductCode,
      application.nrb94SecurityTypeCode,
      application.sis0IndustrialClassification,
      application.sis1ProductType,
      application.sis2Sector,
      application.sis3Security,
      application.sis4InstitutionalGroupingOfBorrower,
      application.sis9PriorityLending,
      application.greenFinanceEconomicSector,
      application.greenFinanceSubSector,
      application.greenFinanceTaxonomyTag,
      application.securityDetails,
      application.fmv,
      application.proposedLoan,
      application.financeAgainstFmv,
      application.personalGuarantee?.nameOfGuarantor,
      application.insurance?.insuredAssets,
      application.insurance?.valueOfAssets,
      application.insurance?.sumOfInsurance,
      application.insurance?.insuranceCoverage,
      application.insurance?.insuranceRemarks,
      application.blacklistStatus,
      application.blacklistReason,
      application.blacklistDate,
      application.blacklistReferenceNumber,
      application.pepStatus,
      application.pepRemarks,
      application.pepCheckedAt,
      application.moneyLaunderingRisk,
      application.amlRisk,
      application.waiver,
      application.termsAndConditions,
      application.bankingRelationshipRemarks,
      application.keyCreditRiskMitigation,
      application.justificationOfLoan,
      application.accountStrategy,
      application.disbursementSection,
      application.utilizationOfFund,
      application.conclusionAndRecommendation,
    ) || (application.familyMember?.length ?? 0) > 0
  );
}

/**
 * Read-only display of the credit-appraisal fields on the LoanApplication
 * record — customer/KYC, NRB/SIS/basel/green-finance classification, family
 * members, security & guarantee, insurance, compliance flags, and the
 * risk/recommendation writeup. All of this ships on the merged
 * `/dashboard/applications/:id/detail` response but previously went unused
 * in the Credit Manager loan detail view.
 */
export default function ApplicationAppraisalDetails({ application }: { application: InitiatorApplicationRecord }) {
  const showCustomer = hasAny(
    application.customerName,
    application.relationshipStartDate,
    application.customerGroup,
    application.obligorNumber,
    application.profession,
    application.repaymentSource,
    application.permanentAddress,
    application.correspondenceAddress,
    application.citizenshipNumber,
    application.nidNumber,
    application.panNumber,
    application.licenseNumber,
    application.bankingRelationship,
    application.existingBankingRelationship,
  );

  const showClassification = hasAny(
    application.baselClassification,
    application.baselRiskWeight,
    application.nrb93SectorCode,
    application.nrb93KaProductCode,
    application.nrb94SecurityTypeCode,
    application.sis0IndustrialClassification,
    application.sis1ProductType,
    application.sis2Sector,
    application.sis3Security,
    application.sis4InstitutionalGroupingOfBorrower,
    application.sis9PriorityLending,
    application.greenFinanceEconomicSector,
    application.greenFinanceSubSector,
    application.greenFinanceTaxonomyTag,
  );

  const showSecurity = hasAny(
    application.securityDetails,
    application.fmv,
    application.proposedLoan,
    application.financeAgainstFmv,
    application.personalGuarantee?.nameOfGuarantor,
  );

  const showInsurance = hasAny(
    application.insurance?.insuredAssets,
    application.insurance?.valueOfAssets,
    application.insurance?.sumOfInsurance,
    application.insurance?.insuranceCoverage,
    application.insurance?.insuranceRemarks,
  );

  const showCompliance = hasAny(
    application.blacklistStatus,
    application.blacklistReason,
    application.blacklistDate,
    application.blacklistReferenceNumber,
    application.pepStatus,
    application.pepRemarks,
    application.pepCheckedAt,
    application.moneyLaunderingRisk,
  );

  const showRisk = hasAny(
    application.amlRisk,
    application.waiver,
    application.termsAndConditions,
    application.bankingRelationshipRemarks,
    application.keyCreditRiskMitigation,
    application.justificationOfLoan,
    application.accountStrategy,
    application.disbursementSection,
    application.utilizationOfFund,
    application.conclusionAndRecommendation,
  );

  const familyMembers = application.familyMember ?? [];

  if (!showCustomer && !showClassification && !showSecurity && !showInsurance && !showCompliance && !showRisk && familyMembers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {showCustomer && (
        <SectionCard icon={Landmark} title="Customer & KYC Information">
          <InfoRow label="Customer Name" value={application.customerName} />
          <InfoRow label="Customer Group" value={application.customerGroup} />
          <InfoRow label="Obligor Number" value={application.obligorNumber} />
          <InfoRow label="Relationship Start Date" value={dateOrUndefined(application.relationshipStartDate)} />
          <InfoRow label="Profession" value={application.profession} />
          <InfoRow label="Repayment Source" value={application.repaymentSource} />
          <InfoRow label="Permanent Address" value={application.permanentAddress} />
          <InfoRow label="Correspondence Address" value={application.correspondenceAddress} />
          <InfoRow label="Citizenship No." value={application.citizenshipNumber} />
          <InfoRow label="Citizenship Issued Date" value={dateOrUndefined(application.citizenshipIssuedDate)} />
          <InfoRow label="Citizenship Issued Place" value={application.citizenshipIssuedPlace} />
          <InfoRow label="NID Number" value={application.nidNumber} />
          <InfoRow label="PAN Number" value={application.panNumber} />
          <InfoRow label="License Number" value={application.licenseNumber} />
          <InfoRow label="Banking Relationship" value={application.bankingRelationship} />
          <InfoRow label="Existing Banking Relationship" value={application.existingBankingRelationship} />
          <InfoRow label="Blacklisted" value={boolLabel(application.isBlacklisted)} />
        </SectionCard>
      )}

      {showClassification && (
        <SectionCard icon={Leaf} title="NRB / SIS / Basel Classification">
          <InfoRow label="Basel Classification" value={application.baselClassification} />
          <InfoRow label="Basel Risk Weight" value={percentOrUndefined(application.baselRiskWeight)} />
          <InfoRow label="NRB 93 Sector Code" value={application.nrb93SectorCode} />
          <InfoRow label="NRB 93-Ka Product Code" value={application.nrb93KaProductCode} />
          <InfoRow label="NRB 94 Security Type Code" value={application.nrb94SecurityTypeCode} />
          <InfoRow label="SIS 0 — Industrial Classification" value={application.sis0IndustrialClassification} />
          <InfoRow label="SIS 1 — Product Type" value={application.sis1ProductType} />
          <InfoRow label="SIS 2 — Sector" value={application.sis2Sector} />
          <InfoRow label="SIS 3 — Security" value={application.sis3Security} />
          <InfoRow label="SIS 4 — Institutional Grouping" value={application.sis4InstitutionalGroupingOfBorrower} />
          <InfoRow label="SIS 9 — Priority Lending" value={application.sis9PriorityLending} />
          <InfoRow label="Green Finance Sector" value={application.greenFinanceEconomicSector} />
          <InfoRow label="Green Finance Sub-Sector" value={application.greenFinanceSubSector} />
          <InfoRow label="Green Finance Taxonomy Tag" value={application.greenFinanceTaxonomyTag} />
        </SectionCard>
      )}

      {familyMembers.length > 0 && (
        <SectionCard icon={Users2} title="Family Members">
          <div className="-mx-5 -my-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs pl-5">Name</TableHead>
                  <TableHead className="text-xs">Age</TableHead>
                  <TableHead className="text-xs">Relationship</TableHead>
                  <TableHead className="text-xs">Qualification</TableHead>
                  <TableHead className="text-xs pr-5">Occupation / Social Involvement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyMembers.map((m) => (
                  <TableRow key={m.id} className="border-border">
                    <TableCell className="py-2.5 text-xs text-foreground pl-5">{m.personName ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{m.age ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{m.relationshipWithBorrower ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{m.qualification ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground pr-5">{m.occupationSocialInvolvement ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {showSecurity && (
        <SectionCard icon={ShieldCheck} title="Security & Guarantee">
          <InfoRow label="Security Details" value={application.securityDetails} />
          <InfoRow label="Fair Market Value (FMV)" value={nprOrUndefined(application.fmv)} />
          <InfoRow label="Proposed Loan" value={nprOrUndefined(application.proposedLoan)} />
          <InfoRow label="Finance Against FMV" value={percentOrUndefined(application.financeAgainstFmv)} />
          {application.personalGuarantee && (
            <>
              <InfoRow label="Guarantor Name" value={application.personalGuarantee.nameOfGuarantor} />
              <InfoRow label="Guarantor Relationship" value={application.personalGuarantee.relationship} />
              <InfoRow label="Guarantor Age" value={application.personalGuarantee.age} />
              <InfoRow label="Guarantor Net Worth" value={nprOrUndefined(application.personalGuarantee.netWorth)} />
              <InfoRow label="Guarantor Consent" value={boolLabel(application.personalGuarantee.guarantorConsent)} />
              <InfoRow label="CICL Status" value={boolLabel(application.personalGuarantee.ciclStatus)} />
              <InfoRow label="CICL Remarks" value={application.personalGuarantee.ciclRemarks} />
              <InfoRow label="Blacklisted Date" value={dateOrUndefined(application.personalGuarantee.blackListedDate)} />
              <InfoRow label="Released Date" value={dateOrUndefined(application.personalGuarantee.releasedDate)} />
            </>
          )}
        </SectionCard>
      )}

      {showInsurance && (
        <SectionCard icon={ShieldCheck} title="Insurance">
          <InfoRow label="Insured Assets" value={application.insurance?.insuredAssets} />
          <InfoRow label="Value of Assets" value={nprOrUndefined(application.insurance?.valueOfAssets)} />
          <InfoRow label="Sum of Insurance" value={nprOrUndefined(application.insurance?.sumOfInsurance)} />
          <InfoRow label="Insurance Coverage" value={percentOrUndefined(application.insurance?.insuranceCoverage)} />
          <InfoRow label="Remarks" value={application.insurance?.insuranceRemarks} />
        </SectionCard>
      )}

      {showCompliance && (
        <SectionCard icon={FileWarning} title="Compliance & Risk Flags">
          <InfoRow label="Blacklist Status" value={application.blacklistStatus} />
          <InfoRow label="Blacklist Reason" value={application.blacklistReason} />
          <InfoRow label="Blacklist Date" value={dateOrUndefined(application.blacklistDate)} />
          <InfoRow label="Blacklist Reference No." value={application.blacklistReferenceNumber} />
          <InfoRow label="PEP Status" value={application.pepStatus} />
          <InfoRow label="PEP Remarks" value={application.pepRemarks} />
          <InfoRow label="PEP Checked At" value={dateOrUndefined(application.pepCheckedAt)} />
          <InfoRow label="Money Laundering Risk" value={application.moneyLaunderingRisk} />
        </SectionCard>
      )}

      {showRisk && (
        <SectionCard icon={ScrollText} title="Risk Assessment & Recommendation">
          <InfoRow label="AML Risk" value={application.amlRisk} />
          <InfoRow label="Waiver" value={application.waiver} />
          <InfoRow label="Terms & Conditions" value={application.termsAndConditions} />
          <InfoRow label="Banking Relationship Remarks" value={application.bankingRelationshipRemarks} />
          <InfoRow label="Key Credit Risk Mitigation" value={application.keyCreditRiskMitigation} />
          <InfoRow label="Justification of Loan" value={application.justificationOfLoan} />
          <InfoRow label="Account Strategy" value={application.accountStrategy} />
          <InfoRow label="Disbursement Section" value={application.disbursementSection} />
          <InfoRow label="Utilization of Fund" value={application.utilizationOfFund} />
          <InfoRow label="Conclusion & Recommendation" value={application.conclusionAndRecommendation} />
        </SectionCard>
      )}
    </div>
  );
}