"use client";

type AlertFeedProps = {
  alerts: Array<Record<string, unknown>>;
  chaosEnabled?: boolean;
  onToggleChaos?: (enabled: boolean) => void | Promise<void>;
};

export default function AlertFeed({ alerts, chaosEnabled, onToggleChaos }: AlertFeedProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Alert feed</p>
        {onToggleChaos ? (
          <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
            <input
              type="checkbox"
              checked={Boolean(chaosEnabled)}
              onChange={(event) => void onToggleChaos(event.target.checked)}
            />
            Chaos mode
          </label>
        ) : null}
      </div>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs">
        {alerts.length === 0 ? (
          <li className="text-[var(--color-gray-500)]">No alerts in the latest snapshot.</li>
        ) : (
          alerts.map((alert, index) => (
            <li
              key={`${String(alert.rule)}-${index}`}
              className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-[var(--color-gray-300)]"
            >
              <span className="mr-2 uppercase text-amber-300">{String(alert.severity || "info")}</span>
              {String(alert.message || alert.rule || "Alert")}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
