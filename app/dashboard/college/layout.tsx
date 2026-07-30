import { Suspense } from "react";
import CollegeSidebar from "@/components/student/college-marketplace/CollegeSidebar";

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-muted/30 min-h-screen lg:h-screen lg:overflow-hidden">
      <Suspense fallback={<div className="hidden lg:block w-72 shrink-0 border-r border-border bg-card" />}>
        <CollegeSidebar />
      </Suspense>
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
