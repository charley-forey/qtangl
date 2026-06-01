"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { setStoredTenantApiKey } from "@/lib/tenant-api";

type SessionInfo = {
  email: string;
  tenantId: string;
  role: string;
};

export default function DashboardAuthGate({
  children,
  ssoConfigured,
  requireSso,
}: {
  children: React.ReactNode;
  ssoConfigured: boolean;
  requireSso: boolean;
}) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((payload) => {
        if (payload.authenticated && payload.session) {
          setSession(payload.session as SessionInfo);
        }
      })
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/auth/provision-key")
      .then((r) => r.json())
      .then((payload) => {
        if (payload.apiKey) {
          setStoredTenantApiKey(payload.apiKey);
          window.dispatchEvent(new Event("qtangl-api-key-updated"));
        }
      })
      .catch(() => undefined);
  }, [session]);

  if (!checked) {
    return <p className="text-sm text-[var(--color-gray-500)]">Checking session…</p>;
  }

  if (requireSso && !session) {
    return (
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Sign in required</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-300)]">
          This deployment requires enterprise SSO for dashboard access. API keys remain available for automation
          via the REST API.
        </p>
        {ssoConfigured ? (
          <Link
            href="/api/auth/oidc/login"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
          >
            Sign in with SSO
          </Link>
        ) : (
          <p className="mt-4 text-xs text-[var(--color-gray-500)]">
            SSO is not configured. Set AUTH_OIDC_ISSUER, AUTH_OIDC_CLIENT_ID, and AUTH_OIDC_CLIENT_SECRET — see{" "}
            <Link href="/docs/guides/sso-setup" className="text-white underline">
              SSO setup guide
            </Link>
            .
          </p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ssoConfigured ? (
        <Card tone="ghost" className="border border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Eyebrow>Dashboard session</Eyebrow>
              {session ? (
                <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                  {session.email} · tenant {session.tenantId} · role {session.role}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-gray-400)]">
                  Optional SSO — or connect with your tenant API key below for full Monitor features.
                </p>
              )}
            </div>
            {session ? (
              <button
                type="button"
                className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs text-white"
                onClick={() => {
                  fetch("/api/auth/session", { method: "DELETE" }).then(() => setSession(null));
                }}
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/api/auth/oidc/login"
                className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-medium text-black"
              >
                Sign in with SSO
              </Link>
            )}
          </div>
        </Card>
      ) : null}
      {children}
    </div>
  );
}
