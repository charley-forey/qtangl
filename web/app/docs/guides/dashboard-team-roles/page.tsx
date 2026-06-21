import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/dashboard-team-roles",
  title: "Dashboard team, invites, and roles",
  description:
    "How tenant admins invite colleagues, assign admin/operator/viewer roles, and manage dashboard access.",
});

export default function DashboardTeamRolesGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/dashboard-team-roles"
      title="Dashboard team, invites, and roles"
      description="Tenant admins manage people under Settings → Team members. Roles apply to WorkOS dashboard sign-in, not automation API keys."
      lastUpdated="2026-06-14"
    >
      <DocsSection>
        <DocsHeading>Roles at a glance</DocsHeading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm text-[var(--color-gray-300)]">
            <thead>
              <tr className="border-b border-[var(--color-gray-700)] text-[var(--color-gray-400)]">
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Typical use</th>
                <th className="py-2 font-medium">Dashboard access</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-gray-800)]">
                <td className="py-2 pr-4 font-mono text-white">admin</td>
                <td className="py-2 pr-4">Workspace owner, IT or security lead</td>
                <td className="py-2">Full settings, team, API keys, SSO, all tabs and exports</td>
              </tr>
              <tr className="border-b border-[var(--color-gray-800)]">
                <td className="py-2 pr-4 font-mono text-white">operator</td>
                <td className="py-2 pr-4">Engineers running scans and remediation</td>
                <td className="py-2">Scans, monitor, remediate; no team or key admin</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-white">viewer</td>
                <td className="py-2 pr-4">Executives, auditors, read-only stakeholders</td>
                <td className="py-2">Overview and scans; compliance widgets; PDF exports only</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          Backend APIs enforce the same boundaries. The UI hides tabs and widgets using tenant{" "}
          <strong className="font-medium text-white">role policies</strong> (see below).
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Who can manage the team</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Only users with the <code className="font-mono text-white">admin</code> role see the full{" "}
          <strong className="font-medium text-white">Team members</strong> panel under{" "}
          <strong className="font-medium text-white">Settings</strong>. Operators and viewers see a notice that admin
          role is required. Your role appears in the workspace header and in{" "}
          <code className="font-mono text-white">GET /api/dashboard/me</code> →{" "}
          <code className="font-mono text-white">session.role</code> and{" "}
          <code className="font-mono text-white">capabilities</code>.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Inviting a teammate</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Sign in at{" "}
            <Link href="/dashboard" className="text-white underline underline-offset-4">
              qtangl.com/dashboard
            </Link>{" "}
            as an <code className="font-mono text-white">admin</code>.
          </li>
          <li>Open the <strong className="font-medium text-white">Settings</strong> tab.</li>
          <li>Scroll to <strong className="font-medium text-white">Team members</strong>.</li>
          <li>Enter the colleague&apos;s work email and choose a role (default: operator).</li>
          <li>
            Click <strong className="font-medium text-white">Send invite</strong> — WorkOS emails a sign-in link.
          </li>
        </ol>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          After the invitee signs in, Qtangl links them to your tenant with the role you selected. Admins can change
          roles with the dropdown next to each member, or use <strong className="font-medium text-white">Remove</strong>{" "}
          to revoke access. Pending invites can be cancelled with <strong className="font-medium text-white">Revoke</strong>.
        </p>
        <DocsCallout variant="warning">
          Admins cannot change their own role (prevents accidental lockout). Only admins can promote or demote others.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Capabilities by role</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Computed server-side on login via{" "}
          <code className="font-mono text-white">GET /api/dashboard/me</code>:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <code className="font-mono text-white">canAdmin</code> — settings, team, SSO, audit (admin only)
          </li>
          <li>
            <code className="font-mono text-white">canWrite</code> — run scans, remediation (admin + operator)
          </li>
          <li>
            <code className="font-mono text-white">canViewCompliance</code> — all three roles
          </li>
          <li>
            <code className="font-mono text-white">canManageKeys</code> — automation API keys (admin only)
          </li>
          <li>
            <code className="font-mono text-white">canInvite</code> — send team invites (admin only, Monitor tier+)
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Dashboard visibility (role policies)</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Tenant settings include <code className="font-mono text-white">rolePolicies</code> that filter tabs, widgets,
          and export formats in the UI. Defaults:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <code className="font-mono text-white">viewer</code> — Overview and Scans tabs; PDF exports
          </li>
          <li>
            <code className="font-mono text-white">operator</code> — Overview, Scans, Monitor, Remediate; PDF, board,
            bundle exports
          </li>
          <li>
            <code className="font-mono text-white">admin</code> — all tabs and export formats
          </li>
        </ul>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          Admins can override defaults via{" "}
          <code className="font-mono text-white">PATCH /tenant/settings</code> with a{" "}
          <code className="font-mono text-white">rolePolicies</code> object. There is no Settings form for this yet —
          contact Qtangl support or use the API for customizations. The persona toggle (Operator vs Executive in
          the header) adjusts layout emphasis only; it does not change security boundaries.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Automation API keys (not human login)</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Under <strong className="font-medium text-white">Settings → Automation API keys</strong> (admin only), create
          keys for CI, Terraform, and scripts. Each key has its own role. Secrets are shown once at creation. Humans
          should sign in with WorkOS, not share API keys. See{" "}
          <Link href="/docs/authentication" className="text-white underline underline-offset-4">
            Authentication &amp; RBAC
          </Link>
          .
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Tier requirements</DocsHeading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm text-[var(--color-gray-300)]">
            <thead>
              <tr className="border-b border-[var(--color-gray-700)] text-[var(--color-gray-400)]">
                <th className="py-2 pr-4 font-medium">Feature</th>
                <th className="py-2 pr-4 font-medium">Free (Assess)</th>
                <th className="py-2 font-medium">Monitor+</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-gray-800)]">
                <td className="py-2 pr-4">Dashboard sign-in</td>
                <td className="py-2 pr-4">✓</td>
                <td className="py-2">✓</td>
              </tr>
              <tr className="border-b border-[var(--color-gray-800)]">
                <td className="py-2 pr-4">Self-serve first workspace</td>
                <td className="py-2 pr-4">✓</td>
                <td className="py-2">✓</td>
              </tr>
              <tr className="border-b border-[var(--color-gray-800)]">
                <td className="py-2 pr-4">Team invites</td>
                <td className="py-2 pr-4">✗</td>
                <td className="py-2">✓</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">SSO Admin Portal</td>
                <td className="py-2 pr-4">Enterprise</td>
                <td className="py-2">Enterprise</td>
              </tr>
            </tbody>
          </table>
        </div>
        <DocsCallout variant="tip">
          If <strong className="font-medium text-white">Send invite</strong> fails with a tier or upgrade message, upgrade
          to Monitor (or contact Qtangl for enterprise provisioning). Monitor tier allows up to 10 pending/active invites per
          tenant by default.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Invite linking (technical)</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Invites flow through <code className="font-mono text-white">POST /tenant/invites</code> → WorkOS organization
          invitation → pending <code className="font-mono text-white">TenantInvite</code> row. On first login after
          accept, membership is created via:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            WorkOS webhook <code className="font-mono text-white">organization_membership.created</code>
          </li>
          <li>Pending invite matched by email on dashboard bootstrap</li>
          <li>
            WorkOS webhook <code className="font-mono text-white">invitation.accepted</code>
          </li>
        </ol>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          Ensure the API receives WorkOS webhooks at{" "}
          <code className="font-mono text-white">POST /public/workos/webhook</code> with{" "}
          <code className="font-mono text-white">WORKOS_WEBHOOK_SECRET</code> configured.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Troubleshooting</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <strong className="font-medium text-white">No workspace linked</strong> — invitee email must match the
            invite; re-send invite and verify webhooks.
          </li>
          <li>
            <strong className="font-medium text-white">Send invite fails / 402</strong> — tenant is on free tier; upgrade
            to Monitor.
          </li>
          <li>
            <strong className="font-medium text-white">Wrong role after invite</strong> — admin updates the role dropdown
            in Team panel.
          </li>
          <li>
            <strong className="font-medium text-white">Removed user still has access</strong> — they must sign out;
            membership delete revokes server-side session keys.
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>API reference</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/reference/tenant/invites-create" className="text-white underline underline-offset-4">
              POST /tenant/invites
            </Link>{" "}
            ·{" "}
            <Link href="/docs/reference/tenant/members-list" className="text-white underline underline-offset-4">
              GET /tenant/members
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/tenant/api-keys-create" className="text-white underline underline-offset-4">
              POST /tenant/api-keys
            </Link>{" "}
            ·{" "}
            <Link href="/docs/reference/tenant/sso-portal-link" className="text-white underline underline-offset-4">
              POST /tenant/sso/portal-link
            </Link>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Related</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          <Link href="/docs/authentication" className="text-white underline underline-offset-4">
            Authentication &amp; RBAC
          </Link>{" "}
          ·{" "}
          <Link href="/docs/guides/sso-setup" className="text-white underline underline-offset-4">
            Dashboard SSO
          </Link>{" "}
          ·{" "}
          <Link href="/docs/guides/billing-onboarding" className="text-white underline underline-offset-4">
            Billing &amp; onboarding
          </Link>{" "}
          ·{" "}
          <Link href="/dashboard" className="text-white underline underline-offset-4">
            Dashboard
          </Link>
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
