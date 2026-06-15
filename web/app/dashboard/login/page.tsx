import { redirect } from "next/navigation";

import { getSignInUrl } from "@workos-inc/authkit-nextjs";

import { legacyKeyAuthEnabled, workosAuthEnabled } from "@/lib/auth/workos";

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

  const returnPath = params.onboarding
    ? `/dashboard?onboarding=${encodeURIComponent(params.onboarding)}`
    : "/dashboard";
  const signInUrl = await getSignInUrl({ redirectUri: undefined, state: returnPath });
  redirect(signInUrl);
}
