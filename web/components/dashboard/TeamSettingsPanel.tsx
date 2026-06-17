"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { roleLabel, normalizeDashboardRole } from "@/lib/dashboard-persona";
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

const ROLE_OPTIONS = [
  { value: "executive", label: "Executive" },
  { value: "operator", label: "Operator" },
  { value: "admin", label: "Admin" },
] as const;

function roleSelectValue(role: string): string {
  const normalized = normalizeDashboardRole(role);
  return normalized === "viewer" ? "executive" : normalized;
}

export default function TeamSettingsPanel({
  role,
  canInvite = true,
  tier = "monitor",
  maxTeamInvites = 3,
}: {
  role?: string;
  canInvite?: boolean;
  tier?: string;
  maxTeamInvites?: number | null;
}) {
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

  const seatLimit = maxTeamInvites ?? (tier === "free" ? 3 : 10);
  const seatsUsed = members.length + invites.length;
  const invitesBlocked = !canInvite || (seatLimit !== null && seatsUsed >= seatLimit);

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>Team members</Eyebrow>
        {seatLimit != null ? (
          <span className="text-xs text-[var(--color-gray-500)]">
            {seatsUsed} / {seatLimit} seats
          </span>
        ) : null}
      </div>
      {tier === "free" && seatLimit != null ? (
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Free workspaces include up to {seatLimit} team members. Upgrade to Monitor for larger teams.
        </p>
      ) : null}
      {invitesBlocked && canInvite ? (
        <p className="mt-2 text-sm text-amber-200/90">
          Seat limit reached. Upgrade under Workspace settings to invite more colleagues.
        </p>
      ) : null}
      {!canInvite ? (
        <p className="mt-2 text-sm text-amber-200/90">
          Team invites are not available on your current plan.
        </p>
      ) : null}
      <ul className="mt-3 space-y-2 text-sm">
        {members.map((member) => (
          <li key={member.membershipId} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2">
            <span>{member.email}</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-xs"
                value={roleSelectValue(member.role)}
                onChange={async (event) => {
                  await patchDashboardJson(`/tenant/members/${member.membershipId}`, {
                    role: event.target.value,
                  });
                  await reload();
                }}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
          {invites.length === 0 ? (
            <li className="text-[var(--color-gray-500)]">No pending invites.</li>
          ) : null}
          {invites.map((invite) => (
            <li key={invite.inviteId} className="flex justify-between gap-2">
              <span>
                {invite.email} · {roleLabel(invite.role)}
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
          disabled={invitesBlocked}
        />
        <select
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
          disabled={invitesBlocked}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={invitesBlocked || !email.trim()}
          className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
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
