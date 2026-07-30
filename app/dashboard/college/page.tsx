import { Suspense } from "react";
import { CollegeMarketplace } from "@/components/student/college-marketplace/CollegeMarketplace";

export const metadata = {
  title: "College Marketplace — Unnati Edu Loan",
  description: "Browse colleges and courses, then apply for a loan directly.",
};

export default function CollegeMarketplacePage() {
  return (
    <Suspense>
      <CollegeMarketplace />
    </Suspense>
  );
}
