import LandingNav from "@/components/landing/LandingNav";
import SiteFooter from "@/components/landing/SiteFooter";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold text-zinc-900 mb-8 tracking-tight">
          Terms of Service
        </h1>
        <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
          <p>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using the GenZ Loan Education Loan Platform, you
            agree to be bound by these Terms of Service. If you disagree with
            any part of the terms, you may not access the service.
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            2. Description of Service
          </h2>
          <p>
            GenZ Loan acts as an intermediary platform connecting students in
            Nepal with NRB-regulated partner banks. We are not a lender or a
            financial institution. All final loan decisions, sanctions, and
            terms are determined solely by the partner banks.
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            3. User Responsibilities
          </h2>
          <p>
            You agree to provide accurate, current, and complete information
            during the application process. You are responsible for maintaining
            the confidentiality of your account and all activities that occur
            under your account.
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            4. Limitation of Liability
          </h2>
          <p>
            GenZ Loan shall not be liable for any indirect, incidental, special,
            consequential or punitive damages, resulting from your access to or
            use of, or inability to access or use the service, or any decisions
            made by our partner banks.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
