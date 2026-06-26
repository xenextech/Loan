import LandingNav from "@/components/landing/LandingNav";
import SiteFooter from "@/components/landing/SiteFooter";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold text-zinc-900 mb-8 tracking-tight">
          Privacy Policy
        </h1>
        <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
          <p>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us when applying for
            an education loan. This includes personal identification details,
            academic records, and financial information necessary to evaluate
            your eligibility with our partner banks.
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>
            Your information is primarily used to connect you with NRB-regulated
            partner banks. We do not sell your personal data. We only share the
            necessary information with our lending partners to facilitate your
            loan application process.
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            3. Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect your personal
            information from unauthorized access, alteration, or disclosure.
            However, no internet-based service can be 100% secure, so we cannot
            guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">
            4. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or request deletion of your
            personal data. If you wish to exercise these rights or have
            questions about our privacy practices, please contact us at
            support@GenZ Loanedu.com.np.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
