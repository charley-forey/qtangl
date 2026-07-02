import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const METHODS = [
  { id: "tls", label: "TLS handshake", coverage: "full" as const },
  { id: "jwks", label: "JWKS / JWT", coverage: "full" as const },
  { id: "ssh", label: "SSH host keys", coverage: "full" as const },
  { id: "email", label: "STARTTLS", coverage: "partial" as const },
  { id: "upload", label: "PEM upload", coverage: "full" as const },
];

const COVERAGE_CLASS = {
  full: "bg-emerald-500/50",
  partial: "bg-amber-500/40",
  none: "bg-white/[0.06]",
};

export default function AssessDiscoveryTeaser() {
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Multi-method discovery</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        No single discovery method covers your full estate. Qtangl combines TLS, JWKS, SSH, and upload paths —
        illustrative coverage for Assess tier.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left text-xs">
          <caption className="sr-only">Qtangl discovery method coverage</caption>
          <thead>
            <tr className="text-[var(--color-gray-500)]">
              <th className="py-2 pr-4">Method</th>
              <th className="py-2">Assess coverage</th>
            </tr>
          </thead>
          <tbody>
            {METHODS.map((method) => (
              <tr key={method.id} className="border-t border-[var(--border-subtle)]">
                <th scope="row" className="py-3 pr-4 font-medium text-white">
                  {method.label}
                </th>
                <td className="py-3">
                  <span
                    className={`inline-block h-3 w-16 rounded ${COVERAGE_CLASS[method.coverage]}`}
                    title={method.coverage === "full" ? "Supported" : "Partial / scenario-dependent"}
                  />
                  <span className="ml-2 capitalize text-[var(--color-gray-400)]">{method.coverage}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
