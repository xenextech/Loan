import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { InitiatorStudentInfo } from "../types/initiator";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/50 last:border-0 gap-6">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{String(value)}</span>
    </div>
  );
}

/** Read-only display of parent/guardian & family details — the Parent tab's "Details" section. */
export default function FamilyInfoCard({ student }: { student: InitiatorStudentInfo }) {
  if (!student.fatherName && !student.motherName && !student.grandfatherName && !student.spouseName) {
    return <p className="text-xs text-muted-foreground py-4">No parent/family details on record.</p>;
  }

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="px-5 py-3.5 border-b border-border">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          Parent & Family Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-1">
        <InfoRow label="Father's Name" value={student.fatherName} />
        <InfoRow label="Mother's Name" value={student.motherName} />
        <InfoRow label="Grandfather's Name" value={student.grandfatherName} />
        <InfoRow label="Spouse Name" value={student.spouseName} />
      </CardContent>
    </Card>
  );
}
