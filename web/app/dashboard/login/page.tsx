import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DashboardLoginUnavailable from "@/components/dashboard/DashboardLoginUnavailable";
import {
  legacyKeyAuthEnabled,
  workosAuthEnabled,
  workosAuthKitReady,
} from "@/lib/auth/workos";

const ONBOARDING_COOKIE = "qtangl_onboarding";

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
    ? `/dashboard?onboarding=${encodeURIComponent(params.onboarding)}&session=refresh`
    : "/dashboard?session=refresh";
  const signInUrl = await getSignInUrl({ redirectUri: undefined, state: returnPath });
  redirect(signInUrl);
}
