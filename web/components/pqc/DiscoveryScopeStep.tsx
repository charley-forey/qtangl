"use client";

type DiscoveryScope = {
  external: boolean;
  hostFleet: boolean;
  codeRepos: boolean;
  containerImages: boolean;
};

type DiscoveryScopeStepProps = {
  scope: DiscoveryScope;
  onChange: (scope: DiscoveryScope) => void;
};

const OPTIONS: { key: keyof DiscoveryScope; label: string; detail: string }[] = [
  { key: "external", label: "External scan", detail: "TLS, JWKS, SSH, email — agentless baseline" },
  { key: "hostFleet", label: "Host fleet", detail: "Qtangl Unified Sensor on enrolled endpoints" },
  { key: "codeRepos", label: "Source code", detail: "CryptoScan + dependency reachability on repos" },
  { key: "containerImages", label: "Container images", detail: "Binary CBOM via CBOMkit-theia" },
];

export default function DiscoveryScopeStep({ scope, onChange }: DiscoveryScopeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-gray-400)]">
        Choose discovery surfaces for this assessment. External is always recommended; enable others when
        fleet or CI integrations are configured.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)]/50"
          >
            <input
              type="checkbox"
              checked={scope[opt.key]}
              onChange={(e) => onChange({ ...scope, [opt.key]: e.target.checked })}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-white">{opt.label}</span>
              <span className="text-xs text-[var(--color-gray-500)]">{opt.detail}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export type { DiscoveryScope };
