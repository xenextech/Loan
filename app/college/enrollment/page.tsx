import EnrollmentCertificateGenerator from "@/components/college/EnrollmentCertificateGenerator";

export const metadata = {
  title: "Enrollment Certificate — Unnati College Portal",
  description:
    "Generate NRB-compliant enrollment certificates for student education loan applications.",
};

export default function EnrollmentCertificatePage() {
  return <EnrollmentCertificateGenerator />;
}
