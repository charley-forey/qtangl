import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DashboardLoginUnavailable from "@/components/dashboard/DashboardLoginUnavailable";
import {
  legacyKeyAuthEnabled,
  workosAuthEnabled,
  workosAuthKitReady,
} from "@/lib/auth/workos";

const ONBOARDING_COOKIE = "qtangl_onboarding";

function searchParamsHasInvite(params: { invite?: string; welcome?: string }): boolean {
  return params.invite === "1" || params.welcome === "invite";
}

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string; invite?: string; welcome?: string; signup?: string }>;
}) {
  const params = await searchParams;

  if (params.signup === "success" && !params.onboarding) {
    const DashboardSignupSuccess = (await import("@/components/dashboard/DashboardSignupSuccess")).default;
    return <DashboardSignupSuccess />;
  }

  if (!workosAuthEnabled()) {
    if (legacyKeyAuthEnabled()) {
      redirect(`/dashboard${params.onboarding ? `?onboarding=${params.onboarding}` : ""}`);
    }
    redirect("/command-center");
  }

  if (!workosAuthKitReady()) {
    return <DashboardLoginUnavailable />;
  }

  if (params.onboarding) {
    const cookieStore = await cookies();
    cookieStore.set(ONBOARDING_COOKIE, params.onboarding, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 3600,
    });
  }

  const { getSignInUrl } = await import("@workos-inc/authkit-nextjs");
  const returnPath = params.onboarding
    ? `/command-center?onboarding=${encodeURIComponent(params.onboarding)}&session=refresh`
    : params.signup === "success"
      ? "/command-center?signup=success&checkout=monitor&session=refresh"
      : params.invite === "1" || searchParamsHasInvite(params)
        ? "/command-center?welcome=invite&session=refresh"
        : "/command-center?session=refresh";
  const signInUrl = await getSignInUrl({ redirectUri: undefined, state: returnPath });
  redirect(signInUrl);
}
