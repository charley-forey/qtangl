/** Derive algorithm family counts from remediation backlog titles (e.g. "RSA-2048 @ api.example.com"). */

const ALGO_PATTERN =
  /\b(RSA(?:-\d+)?|ECDSA|ECDH|Ed25519|DSA|AES(?:-\d+)?|SHA(?:-\d+)?|ML-KEM(?:-\d+)?|ML-DSA(?:-\d+)?|P-256|P-384|ChaCha20|3DES)\b/i;

export function algorithmFamiliesFromItems(
  items: Array<{ title?: string; severity?: string }>
): Array<{ family: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    const title = String(item.title ?? "");
    const match = title.match(ALGO_PATTERN);
    const family = match ? match[1].toUpperCase() : "Other";
    map.set(family, (map.get(family) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([family, count]) => ({ family, count }))
    .sort((a, b) => b.count - a.count);
}

export function severityBreakdown(
  items: Array<{ severity?: string }>
): Array<{ name: string; value: number }> {
  const levels = ["critical", "high", "medium", "low"] as const;
  return levels.map((level) => ({
    name: level,
    value: items.filter((i) => String(i.severity ?? "").toLowerCase() === level).length,
  }));
}
