import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Qtangl",
  description: "Terms governing use of Qtangl cryptographic inventory and Q-Day readiness services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="2026-06-08"
      sections={[
        {
          heading: "1. Acceptance",
          body: "By creating an account, using the API, or accessing the dashboard, you agree to these Terms. Enterprise customers may be governed by a separate Master Services Agreement.",
        },
        {
          heading: "2. Service description",
          body: "Qtangl provides cryptographic inventory discovery, Q-Day readiness scoring, signed evidence reports, and optional aggregate benchmarking. Outputs are advisory and do not constitute legal, audit, or compliance certification.",
        },
        {
          heading: "3. Accounts and API keys",
          body: "You are responsible for safeguarding tenant API keys and ensuring scans target only systems you own or are authorized to assess. Do not embed keys in client-side code or public repositories.",
        },
        {
          heading: "4. Acceptable use",
          body: "You may not scan without authorization, attempt to bypass rate limits or tenant isolation, or interfere with signature verification or transparency log integrity.",
        },
        {
          heading: "5. Free trial and paid tiers",
          body: "Feature limits follow the published pricing page. Qtangl may modify trial limits with reasonable notice.",
        },
        {
          heading: "6. Intellectual property",
          body: "Qtangl retains platform intellectual property. You retain ownership of your data and generated reports.",
        },
        {
          heading: "7. Privacy",
          body: "Processing of personal data is described in our Privacy Policy and, where applicable, the Data Processing Addendum.",
        },
        {
          heading: "8. Disclaimers",
          body: 'Services are provided "as is" without warranty of uninterrupted or error-free operation.',
        },
        {
          heading: "9. Limitation of liability",
          body: "To the maximum extent permitted by law, Qtangl's aggregate liability is limited to fees paid in the twelve months preceding the claim. Counsel may adjust caps in enterprise MSAs.",
        },
        {
          heading: "10. Changes",
          body: "Material changes will be notified via email or in-product notice at least 30 days before taking effect.",
        },
        {
          heading: "11. Contact",
          body: "support@qtangl.com · https://www.qtangl.com/access",
        },
      ]}
    />
  );
}
