"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";

type LogRoot = {
  seq?: number;
  rootHash?: string;
  merkleRoot?: string;
  entryCount?: number;
  anchor?: {
    witnessId?: string;
    anchoredAt?: string;
    method?: string;
    git?: { commitSha?: string; url?: string };
    tsa?: { tsaTime?: string };
    merkleRoot?: string;
  };
};

type SigningKey = {
  fingerprint?: string;
  algorithm?: string;
  publicKeyPem?: string;
  active?: boolean;
  createdAt?: string;
};

type Witness = {
  witnessId?: string;
  rootHash?: string;
  seq?: number;
  alg?: string;
  observedAt?: string;
};

export default function TrustTransparencyLive() {
  const [root, setRoot] = useState<LogRoot | null>(null);
  const [keys, setKeys] = useState<SigningKey[]>([]);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rootResponse, keysResponse, witnessResponse] = await Promise.all([
          fetch(`${qtanglApiBaseUrl}/pqc/transparency/root`, { cache: "no-store" }),
          fetch(`${qtanglApiBaseUrl}/pqc/transparency/keys`, { cache: "no-store" }),
          fetch(`${qtanglApiBaseUrl}/pqc/transparency/witnesses`, { cache: "no-store" }),
        ]);
        if (!rootResponse.ok || !keysResponse.ok) {
          throw new Error("Transparency endpoints unavailable.");
        }
        const rootPayload = (await rootResponse.json()) as { log?: LogRoot };
        const keysPayload = (await keysResponse.json()) as { keys?: SigningKey[] };
        const witnessPayload = witnessResponse.ok
          ? ((await witnessResponse.json()) as { witnesses?: Witness[] })
          : { witnesses: [] };
        if (!cancelled) {
          setRoot(rootPayload.log ?? null);
          setKeys(keysPayload.keys ?? []);
          setWitnesses(witnessPayload.witnesses ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load transparency data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const anchor = root?.anchor;
  const cliSnippet = `curl -s "${qtanglApiBaseUrl}/pqc/transparency/root" | jq '.log.merkleRoot'
curl -s "${qtanglApiBaseUrl}/pqc/transparency/keys" | jq '.keys[] | {fingerprint, algorithm, active}'
python scripts/qtangl_verify.py report.json --api-base ${qtanglApiBaseUrl}`;

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Live transparency log</Eyebrow>
      <p className="mt-3 text-sm text-[var(--color-gray-400)]">
        Append-only hash log, Merkle root, Git + RFC 3161 anchors — fetched live from{" "}
        <span className="font-mono text-[var(--color-gray-300)]">{qtanglApiBaseUrl}</span>.
      </p>

      {loading ? <p className="mt-4 text-sm text-[var(--color-gray-500)]">Loading…</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {!loading && !error ? (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Log root hash</dt>
            <dd className="mt-1 break-all font-mono text-sm text-white">{root?.rootHash ?? "—"}</dd>
            <dt className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Merkle root</dt>
            <dd className="mt-1 break-all font-mono text-sm text-white">{root?.merkleRoot ?? "—"}</dd>
            <p className="mt-1 text-xs text-[var(--color-gray-500)]">
              seq {root?.seq ?? "—"} · {root?.entryCount ?? 0} entries
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">External anchor</dt>
            <dd className="mt-2 space-y-1 text-xs text-[var(--color-gray-300)]">
              {anchor ? (
                <>
                  <div>Method: {anchor.method ?? "—"}</div>
                  {anchor.git?.url ? (
                    <a href={anchor.git.url} className="text-[var(--color-accent)] underline" target="_blank" rel="noreferrer">
                      Git witness ({anchor.git.commitSha?.slice(0, 8) ?? "…"})
                    </a>
                  ) : null}
                  {anchor.tsa?.tsaTime ? <div>TSA: {anchor.tsa.tsaTime}</div> : null}
                </>
              ) : (
                <p className="text-[var(--color-gray-500)]">No external anchor published yet.</p>
              )}
            </dd>
            <dt className="mt-4 text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Signing keys</dt>
            <dd className="mt-2 space-y-2">
              {keys.length === 0 ? (
                <p className="text-sm text-[var(--color-gray-500)]">No keys published.</p>
              ) : (
                keys.slice(0, 5).map((key) => (
                  <div key={key.fingerprint ?? key.publicKeyPem} className="text-xs text-[var(--color-gray-300)]">
                    <span className="font-mono text-white">{key.fingerprint?.slice(0, 16) ?? "key"}…</span>
                    {" · "}
                    {key.algorithm ?? "unknown"}
                    {key.active ? " · active" : " · retired"}
                  </div>
                ))
              )}
            </dd>
          </div>
          {witnesses.length > 0 ? (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Third-party witnesses</dt>
              <dd className="mt-2 space-y-1">
                {witnesses.slice(0, 5).map((w) => (
                  <div key={`${w.witnessId}-${w.seq}`} className="text-xs text-[var(--color-gray-300)]">
                    {w.witnessId} · seq {w.seq} · {w.alg}
                  </div>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">CLI quick-start</p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-black/50 p-3 text-xs text-[var(--color-gray-300)]">
          {cliSnippet}
        </pre>
      </div>
    </Card>
  );
}
