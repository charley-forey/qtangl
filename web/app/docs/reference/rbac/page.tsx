import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/rbac",
  title: "RBAC scopes",
  description: "Role-based access matrix for viewer, operator, and admin capabilities by endpoint group.",
});

const roleDefinitions: DocsFieldRow[] = [
  {
    name: "viewer",
    type: "read-only",
    required: true,
    description: "Read scan outputs, dashboards, and compliance evidence without mutating tenant state.",
  },
  {
    name: "operator",
    type: "read-write operations",
    required: true,
    description: "Run scans, manage schedules, and execute remediation workflows within assigned tenant scope.",
  },
  {
    name: "admin",
    type: "tenant administration",
    required: true,
    description: "Full tenant control, including audit, billing controls, identity settings, and integration governance.",
  },
];

export default function RbacReferencePage() {
  return (
    <GuidePageLayout
      pathname="/docs/reference/rbac"
      title="RBAC scopes"
      description="Map API keys and user roles to least-privilege capabilities across operational domains."
    >
      <DocsSection>
        <DocsHeading>Role definitions</DocsHeading>
        <DocsFieldTable fields={roleDefinitions} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>Capability matrix by endpoint group</DocsHeading>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="bg-[var(--color-gray-950)]">
              <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
                <th className="px-4 py-3 font-medium">Endpoint group</th>
                <th className="px-4 py-3 font-medium">Viewer</th>
                <th className="px-4 py-3 font-medium">Operator</th>
                <th className="px-4 py-3 font-medium">Admin</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Scans</td>
                <td className="px-4 py-3">Read scan status, findings, and reports.</td>
                <td className="px-4 py-3">Create, cancel, and rerun scans.</td>
                <td className="px-4 py-3">Full scan administration.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Schedules</td>
                <td className="px-4 py-3">Read schedule definitions.</td>
                <td className="px-4 py-3">Create, update, pause, resume schedules.</td>
                <td className="px-4 py-3">Override org-level schedule policies.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Remediation</td>
                <td className="px-4 py-3">Read remediation queue and ticket links.</td>
                <td className="px-4 py-3">Assign, annotate, transition remediation items.</td>
                <td className="px-4 py-3">Change remediation policy defaults and automations.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Audit</td>
                <td className="px-4 py-3">No access by default.</td>
                <td className="px-4 py-3">No access by default.</td>
                <td className="px-4 py-3">Read export and investigate tenant audit events.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Billing</td>
                <td className="px-4 py-3">No access.</td>
                <td className="px-4 py-3">No access.</td>
                <td className="px-4 py-3">Manage billing profile, plan controls, and invoices.</td>
              </tr>
              <tr className="align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">OIDC / SSO</td>
                <td className="px-4 py-3">No access.</td>
                <td className="px-4 py-3">Read identity status where exposed.</td>
                <td className="px-4 py-3">Configure identity provider settings and enforcement.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Least-privilege recommendations</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Use viewer keys for dashboards, exports, and read-only BI or SIEM ingestion.</li>
          <li>Use operator keys for pipeline automation that must trigger scans or update remediation.</li>
          <li>Reserve admin keys for break-glass actions and controlled platform administration paths.</li>
        </ul>
        <DocsCallout variant="warning" title="Operational safety">
          Do not share admin API keys across multiple services. Issue service-specific credentials so revocation and
          incident response remain targeted.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
