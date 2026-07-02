import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/formatters";
import { formatDate } from "@/lib/formatters";
import { GraduationCap, Wallet, Calendar, Workflow, User, FileText } from "lucide-react";

interface ApplicantSummaryProps {
  studentName: string;
  applicationNumber: string;
  course: string;
  college: string;
  loanAmount: number;
  submittedAt: string;
  workflowStage: string;
}

const ROWS: Array<{ key: "studentName" | "applicationNumber" | "course" | "college"; label: string; icon: React.ElementType }> = [
  { key: "studentName", label: "Student Name", icon: User },
  { key: "applicationNumber", label: "Application Number", icon: FileText },
  { key: "course", label: "Course", icon: GraduationCap },
  { key: "college", label: "College", icon: GraduationCap },
];

export function ApplicantSummary(props: ApplicantSummaryProps) {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {ROWS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-start gap-2 min-w-0">
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-xs font-semibold text-foreground truncate">{String(props[key])}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-2 min-w-0">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Loan Amount</p>
              <p className="text-xs font-semibold text-foreground truncate">{formatNPR(props.loanAmount)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Submitted Date</p>
              <p className="text-xs font-semibold text-foreground truncate">{formatDate(props.submittedAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/70 flex items-center gap-2">
          <Workflow className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground">Workflow Stage</span>
          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold ml-auto">
            {props.workflowStage}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
