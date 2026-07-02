"use client";

import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileStack, GraduationCap, School, Users } from "lucide-react";
import { ApplicantSummary } from "./ApplicantSummary";
import { DocumentGrid } from "./DocumentSection";
import { DocumentModal } from "./DocumentModal";
import StudentInfoCard from "../components/StudentInfoCard";
import FamilyInfoCard from "../components/FamilyInfoCard";
import CollegeReviewCard from "../components/CollegeReviewCard";
import type { DocumentItem, InitiatorApplicationDetail } from "../types/initiator";

const DOCUMENT_TABS = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "parent", label: "Parent", icon: Users },
  { value: "college", label: "College", icon: School },
] as const;

export function DocumentReviewPanel({ detail }: { detail: InitiatorApplicationDetail }) {
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = useCallback((doc: DocumentItem) => {
    setActiveDocument(doc);
    setModalOpen(true);
  }, []);

  const documentCounts = useMemo(
    () => ({
      student: detail.documents.student.length,
      parent: detail.documents.parent.length,
      college: detail.documents.college.length,
    }),
    [detail.documents],
  );

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Application Summary</h2>
        <ApplicantSummary
          studentName={detail.studentName}
          applicationNumber={detail.applicationNumber}
          course={detail.program}
          college={detail.collegeName}
          loanAmount={detail.loanAmount}
          submittedAt={detail.submittedAt}
          workflowStage={detail.workflowStage}
        />
      </div>

      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Application Review</h2>
        <Tabs defaultValue="student" className="gap-0">
          <TabsList className="w-full h-auto p-1">
            {DOCUMENT_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 py-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
                <Badge variant="outline" className="text-[10px] font-semibold ml-0.5">
                  {documentCounts[value]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="rounded-xl border border-border bg-card p-4 mt-3 space-y-5">
            <TabsContent value="student" className="mt-0 space-y-5">
              <TabSubheading label="Student Details" />
              <StudentInfoCard student={detail.studentInfo} />
              <Separator />
              <TabSubheading label="Student Documents" count={documentCounts.student} />
              <DocumentGrid documents={detail.documents.student} onOpen={handleOpen} emptyLabel="No student documents uploaded yet." />
            </TabsContent>

            <TabsContent value="parent" className="mt-0 space-y-5">
              <TabSubheading label="Parent Details" />
              <FamilyInfoCard student={detail.studentInfo} />
              <Separator />
              <TabSubheading label="Parent Documents" count={documentCounts.parent} />
              <DocumentGrid documents={detail.documents.parent} onOpen={handleOpen} emptyLabel="No parent documents uploaded yet." />
            </TabsContent>

            <TabsContent value="college" className="mt-0 space-y-5">
              <TabSubheading label="College Details" />
              <CollegeReviewCard verification={detail.collegeVerification} />
              <Separator />
              <TabSubheading label="College Documents" count={documentCounts.college} />
              <DocumentGrid documents={detail.documents.college} onOpen={handleOpen} emptyLabel="No college documents uploaded yet." />
            </TabsContent>
          </div>
        </Tabs>
        <p className="text-[11px] text-muted-foreground mt-2">
          {documentCounts.student + documentCounts.parent + documentCounts.college} documents total —{" "}
          {documentCounts.student} student, {documentCounts.parent} parent, {documentCounts.college} college.
        </p>
      </div>

      <DocumentModal document={activeDocument} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

function TabSubheading({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <FileStack className="w-3.5 h-3.5 text-muted-foreground" />
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</h3>
      {count !== undefined && (
        <Badge variant="outline" className="text-[10px] font-semibold">
          {count}
        </Badge>
      )}
    </div>
  );
}
