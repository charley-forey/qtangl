/** Gate internal /ops pages to Qtangl employees (and optional allowlist). */

export function isQtanglOpsEmail(email?: string | null): boolean {
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.endsWith("@qtangl.com")) return true;
  const allowlist = (process.env.QTANGL_OPS_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(normalized);
}
