import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNPR } from "@/lib/formatters";
import type { InitiatorStudentInfo } from "../types/initiator";
import { User, MapPin, BookOpen, Phone } from "lucide-react";

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

/**
 * Read-only display of the student's own application information — the
 * Student tab's "Details" section. Family/parent info lives in
 * `FamilyInfoCard` under the Parent tab instead.
 */
export default function StudentInfoCard({ student }: { student: InitiatorStudentInfo }) {
  return (
    <div className="space-y-5">
      <SectionCard icon={Phone} title="Contact Information">
        <InfoRow label="Full Name" value={student.fullName} />
        <InfoRow label="Email" value={student.email} />
        <InfoRow label="Phone" value={student.phoneNumber} />
      </SectionCard>

      <SectionCard icon={User} title="Personal Details">
        <InfoRow label="Full Name (Identity)" value={student.identityName} />
        <InfoRow
          label="Date of Birth"
          value={
            student.dob
              ? new Date(student.dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : undefined
          }
        />
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Marital Status" value={student.maritalStatus} />
        <InfoRow label="Occupation" value={student.occupation} />
        <InfoRow label="Identity Type" value={student.identityType?.replace("_", " ")} />
        <InfoRow label="Identity No." value={student.identityNumber} />
        <InfoRow label="Issued District" value={student.issuedDistrict} />
      </SectionCard>

      {(student.province || student.district) && (
        <SectionCard icon={MapPin} title="Address">
          <InfoRow label="Province" value={student.province} />
          <InfoRow label="District" value={student.district} />
          <InfoRow label="Municipality" value={student.municipality} />
          <InfoRow label="Ward" value={student.ward} />
        </SectionCard>
      )}

      <SectionCard icon={BookOpen} title="Study & Loan">
        <InfoRow label="Course / Program" value={student.courseName} />
        <InfoRow label="Institution" value={student.boardUniversity} />
        <InfoRow label="Study Type" value={student.studyType?.replace("_", " ")} />
        <InfoRow label="Duration" value={student.courseDuration} />
        <InfoRow
          label="Loan Amount"
          value={student.loanAmount ? formatNPR(student.loanAmount) : undefined}
        />
        <InfoRow
          label="Expected Salary"
          value={student.expectedSalary ? formatNPR(student.expectedSalary) : undefined}
        />
      </SectionCard>
    </div>
  );
}
