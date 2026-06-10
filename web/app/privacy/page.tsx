import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";
import { primaryContactEmail, privacyContactEmail } from "@/lib/copy/trust";

export const metadata: Metadata = {
  title: "Privacy Policy | Qtangl",
  description: "How Qtangl collects, uses, and protects data for inventory and readiness services.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="2026-06-08"
      sections={[
        {
          heading: "1. Scope",
          body: "This policy covers data processed when you use Qtangl web properties, API, dashboard, and self-serve Monitor tier.",
        },
        {
          heading: "2. Data we collect",
          body: "Account email, billing identifiers (via Stripe), scan targets and inventory metadata, API usage logs, and optional benchmark opt-in aggregates (k-anonymized readiness scores only — no raw host lists in cohort data).",
        },
        {
          heading: "3. How we use data",
          body: "To deliver scans, signed reports, transparency log inclusion, scheduled monitoring, onboarding emails, and — when opted in — anonymized industry benchmarks.",
        },
        {
          heading: "4. Readiness Index consent",
          body: "Benchmark participation requires explicit opt-in in dashboard settings. You may withdraw consent at any time; historical aggregates may retain k-anonymized statistics that cannot identify your tenant.",
        },
        {
          heading: "5. Subprocessors",
          body: "Infrastructure providers (hosting, email, payments) are listed on the Trust Center at /trust/subprocessors. Enterprise DPAs cover additional subprocessors on request.",
        },
        {
          heading: "6. Retention",
          body: "Scan artifacts and signed reports are retained per your tier and evidence retention settings. Audit logs follow the SOC2 program retention schedule.",
        },
        {
          heading: "7. Security",
          body: "Reports are cryptographically signed. Tenant isolation, encryption in transit, and optional KMS envelope key custody are described at /trust.",
        },
        {
          heading: "8. Your rights",
          body: `Contact ${privacyContactEmail} (subject [PRIVACY]) for access, correction, or deletion requests. EU/UK requests processed within applicable statutory timelines.`,
        },
        {
          heading: "9. Contact",
          body: `${primaryContactEmail} · Qtangl, Inc.`,
        },
      ]}
    />
  );
}
