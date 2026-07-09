import { Suspense } from "react";
import InitiatorApplications from "@/components/initiator/Applications";

export const metadata = {
  title: "Applications — Unnati Initiator Portal",
  description: "Browse applications verified by the college.",
};

export default function ApplicationsPage() {
  return (
    <Suspense>
      <InitiatorApplications />
    </Suspense>
  );
}
