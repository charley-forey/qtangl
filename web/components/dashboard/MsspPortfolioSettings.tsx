"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

type Child = { childTenantId: string; label: string; childTenantName?: string };

export default function MsspPortfolioSettings({ canAdmin }: { canAdmin: boolean }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const payload = await fetchDashboardJson<{ children: Child[] }>("/tenant/partner/children");
    setChildren(payload.children ?? []);
  }, []);

  useEffect(() => {
    if (canAdmin) void reload();
  }, [canAdmin, reload]);

  if (!canAdmin) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>MSSP portfolio</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Link customer tenant workspaces to aggregate readiness in the Portfolio tab.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {children.map((child) => (
          <li key={child.childTenantId} className="flex justify-between border-t border-[var(--border-subtle)] pt-2">
            <span>{(child.childTenantName ?? child.label) || child.childTenantId}</span>
            <span className="text-[var(--color-gray-500)]">{child.childTenantId}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          placeholder="child-tenant-id"
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
        />
        <input
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          placeholder="Customer label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            try {
              await postDashboardJson("/tenant/partner/children", {
                childTenantId: childId.trim(),
                label: label.trim(),
              });
              setChildId("");
              setLabel("");
              await reload();
              setMessage("Customer tenant linked.");
            } catch (exc) {
              setMessage(exc instanceof Error ? exc.message : "Unable to link tenant.");
            }
          }}
        >
          Link customer
        </Button>
      </div>
      {message ? <p className="mt-2 text-xs text-[var(--color-gray-400)]">{message}</p> : null}
    </Card>
  );
}
