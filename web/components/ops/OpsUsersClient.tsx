"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import OpsShell from "@/components/ops/OpsShell";
import { formatUtcDateTime } from "@/lib/format";

type UserRow = {
  userId: string;
  email: string;
  name?: string | null;
  lastLoginAt?: string | null;
  memberships?: Array<{ tenantId: string; tenantName: string; role: string }>;
};

export default function OpsUsersClient() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    params.set("limit", "100");
    const response = await fetch(`/api/ops/users?${params}`);
    if (!response.ok) {
      setError("Unable to load users.");
      return;
    }
    const payload = await response.json();
    setUsers(payload.users ?? []);
    setTotal(payload.total ?? 0);
    setError(null);
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <OpsShell title="Users" subtitle={`${total} platform user(s)`}>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
          placeholder="Search email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="text-sm underline" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      <Card tone="panel">
        <Eyebrow>Accounts</Eyebrow>
        <ul className="mt-4 space-y-4 text-sm">
          {users.map((user) => (
            <li key={user.userId} className="border-b border-[var(--border-subtle)] pb-3">
              <p className="text-white">{user.email}</p>
              <p className="text-xs text-[var(--color-gray-500)]">
                Last login: {user.lastLoginAt ? formatUtcDateTime(user.lastLoginAt) : "—"}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--color-gray-400)]">
                {(user.memberships ?? []).map((membership) => (
                  <li key={`${user.userId}-${membership.tenantId}`}>
                    {membership.tenantName} ({membership.tenantId}) · {membership.role}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>
    </OpsShell>
  );
}
