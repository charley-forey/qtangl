import { createHmac } from "node:crypto";

import { bffSessionSecret } from "@/lib/auth/workos";

export const BFF_SESSION_TTL_SECONDS = 8 * 3600;

/** Mirror backend sign_bff_session — sign on Vercel when Railway omits the assertion. */
export function signBffSession(params: {
  tenantId: string;
  userId: string;
  role: string;
  email: string;
}): string | null {
  const secret = bffSessionSecret();
  if (!secret) {
    return null;
  }
  const exp = Math.floor(Date.now() / 1000) + BFF_SESSION_TTL_SECONDS;
  const payload = {
    tenantId: params.tenantId,
    userId: params.userId,
    role: params.role,
    email: params.email,
    exp,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("hex");
  return `${payloadB64}.${sig}`;
}

export function resolveBootstrapCredentials(bootstrap: {
  sessionAssertion: string | null;
  sessionKey?: { sessionKey?: string } | null;
  tenantId: string;
  userId: string;
  role: string;
  email: string;
}): { assertion: string | null; sessionKey: string | null; ready: boolean } {
  const sessionKey = bootstrap.sessionKey?.sessionKey ?? null;
  const assertion =
    bootstrap.sessionAssertion ??
    signBffSession({
      tenantId: bootstrap.tenantId,
      userId: bootstrap.userId,
      role: bootstrap.role,
      email: bootstrap.email,
    });
  return {
    assertion,
    sessionKey,
    ready: Boolean(assertion || sessionKey),
  };
}
