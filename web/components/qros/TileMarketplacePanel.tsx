"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchMarketplaceTiles, installMarketplaceTile, uninstallMarketplaceTile } from "@/lib/qros-api";
import { useQrosQuery } from "@/lib/qros-hooks";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function TileMarketplacePanel() {
  const { data: tiles, loading, error, reload } = useQrosQuery(fetchMarketplaceTiles, []);

  const toggle = async (tileId: string, installed: boolean) => {
    if (installed) {
      await uninstallMarketplaceTile(tileId);
    } else {
      await installMarketplaceTile(tileId);
      trackDashboardEvent({ event: "cc_qros_marketplace_install", properties: { tileId } });
    }
    reload();
  };

  if (loading) {
    return (
      <Card tone="panel" className="animate-pulse p-6" aria-busy="true">
        <div className="h-4 w-32 rounded bg-white/10" />
      </Card>
    );
  }

  if (error || !tiles?.length) {
    return <EmptyState title="No tiles available" description="Partner extensions will appear in the marketplace catalog." />;
  }

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Tile marketplace</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">Install partner and MSSP extension tiles into your workspace.</p>
      <ul className="mt-4 space-y-3" aria-label="Marketplace tiles">
        {tiles.map((tile) => (
          <li
            key={tile.id}
            className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-white">{tile.name}</p>
              <p className="text-xs text-[var(--color-gray-400)]">
                {tile.publisher} · {tile.category}
              </p>
              <p className="mt-1 text-xs text-[var(--color-gray-500)]">{tile.description}</p>
            </div>
            <Button
              type="button"
              variant={tile.installed ? "ghost" : "secondary"}
              onClick={() => void toggle(tile.id, tile.installed)}
            >
              {tile.installed ? "Uninstall" : "Install"}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
