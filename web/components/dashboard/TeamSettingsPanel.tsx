"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  deleteDashboardJson,
  fetchDashboardJson,
  patchDashboardJson,
  postDashboardJson,
} from "@/lib/dashboard-bff";

type Member = {
  membershipId: string;
  email: string | null;
  name: string | null;
  role: string;
  joinedAt: string;
};

type Invite = {
  inviteId: string;
  email: string;
  role: string;
  status: string;
};

export default function TeamSettingsPanel({ role }: { role?: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("operator");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [membersPayload, invitesPayload] = await Promise.all([
      fetchDashboardJson<{ members: Member[] }>("/tenant/members"),
      fetchDashboardJson<{ invites: Invite[] }>("/tenant/invites"),
    ]);
    setMembers(membersPayload.members);
    setInvites(invitesPayload.invites.filter((i) => i.status === "pending"));
  }, []);

  useEffect(() => {
    if (role === "admin") {
      reload().catch(() => undefined);
    }
  }, [reload, role]);

  if (role !== "admin") {
    return (
      <Card tone="ghost">
        <Eyebrow>Team</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">Admin role required to manage team members.</p>
      </Card>
    );
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Team members</Eyebrow>
      <ul className="mt-3 space-y-2 text-sm">
        {members.map((member) => (
          <li key={member.membershipId} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2">
            <span>{member.email}</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-xs"
                value={member.role}
                onChange={async (event) => {
                  await patchDashboardJson(`/tenant/members/${member.membershipId}`, {
                    role: event.target.value,
                  });
                  await reload();
                }}
              >
                <option value="admin">admin</option>
                <option value="operator">operator</option>
                <option value="viewer">viewer</option>
              </select>
              <button
                type="button"
                className="text-xs text-red-300 underline"
                onClick={async () => {
                  await deleteDashboardJson(`/tenant/members/${member.membershipId}`);
                  await reload();
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Eyebrow>Pending invites</Eyebrow>
        <ul className="mt-2 space-y-2 text-sm">
          {invites.map((invite) => (
            <li key={invite.inviteId} className="flex justify-between gap-2">
              <span>
                {invite.email} · {invite.role}
              </span>
              <button
                type="button"
                className="text-xs text-red-300 underline"
                onClick={async () => {
                  await deleteDashboardJson(`/tenant/invites/${invite.inviteId}`);
                  await reload();
                }}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
        />
        <select
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
        >
          <option value="admin">admin</option>
          <option value="operator">operator</option>
          <option value="viewer">viewer</option>
        </select>
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
          onClick={async () => {
            setError(null);
            try {
              await postDashboardJson("/tenant/invites", { email, role: inviteRole });
              setEmail("");
              await reload();
            } catch (exc) {
              setError(exc instanceof Error ? exc.message : "Invite failed.");
            }
          }}
        >
          Send invite
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </Card>
  );
}
