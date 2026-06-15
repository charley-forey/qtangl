import { redirect } from "next/navigation";

import DashboardLoginUnavailable from "@/components/dashboard/DashboardLoginUnavailable";
import {
  legacyKeyAuthEnabled,
  workosAuthEnabled,
  workosAuthKitReady,
} from "@/lib/auth/workos";

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string; invite?: string }>;
}) {
  const params = await searchParams;
  if (!workosAuthEnabled()) {
    if (legacyKeyAuthEnabled()) {
      redirect(`/dashboard${params.onboarding ? `?onboarding=${params.onboarding}` : ""}`);
    }
    redirect("/dashboard");
  }

  if (!workosAuthKitReady()) {
    return <DashboardLoginUnavailable />;
  }

  const { getSignInUrl } = await import("@workos-inc/authkit-nextjs");
  const returnPath = params.onboarding
    ? `/dashboard?onboarding=${encodeURIComponent(params.onboarding)}`
    : "/dashboard";
  const signInUrl = await getSignInUrl({ redirectUri: undefined, state: returnPath });
  redirect(signInUrl);
}
