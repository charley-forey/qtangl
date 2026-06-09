"use client";

type HostRow = {
  agentId: string;
  hostname: string;
  findingsCount: number;
  status: string;
};

type HostInventoryHeatmapProps = {
  agents: HostRow[];
  onSelectHost?: (agentId: string) => void;
};

export default function HostInventoryHeatmap({ agents, onSelectHost }: HostInventoryHeatmapProps) {
  if (!agents.length) {
    return <p className="text-sm text-[var(--muted)]">No host inventory yet.</p>;
  }
  const max = Math.max(1, ...agents.map((a) => a.findingsCount));
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => {
        const intensity = agent.findingsCount / max;
        return (
          <button
            key={agent.agentId}
            type="button"
            className="rounded-lg border border-[var(--border)] p-3 text-left transition hover:border-[var(--accent)]"
            style={{
              backgroundColor: `rgba(var(--accent-rgb, 99, 102, 241), ${0.08 + intensity * 0.25})`,
            }}
            onClick={() => onSelectHost?.(agent.agentId)}
          >
            <p className="font-medium text-sm">{agent.hostname}</p>
            <p className="text-xs text-[var(--muted)]">
              {agent.findingsCount} findings · {agent.status}
            </p>
          </button>
        );
      })}
    </div>
  );
}
