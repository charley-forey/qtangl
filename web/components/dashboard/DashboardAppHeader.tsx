"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import NavbarAccountMenu from "@/components/dashboard/NavbarAccountMenu";
import TenantSwitcher from "@/components/dashboard/TenantSwitcher";
import ReadinessCopilotDrawer from "@/components/dashboard/ReadinessCopilotDrawer";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DashboardCommandPalette from "@/components/dashboard/DashboardCommandPalette";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import { useDashboardHeaderExtras } from "@/components/dashboard/dashboard-header-extras";
import { useMenuDismissal } from "@/hooks/useMenuDismissal";
import { roleLabel } from "@/lib/dashboard-persona";
import { isQtanglOpsFromSessionEmail } from "@/lib/ops-auth";

/** Slim app header for signed-in dashboard routes (no marketing nav). */
export default function DashboardAppHeader() {
  const extras = useDashboardHeaderExtras();

  return (
    <>
      <header className="header-shell header-hairline fixed inset-x-0 top-0 z-50 bg-black/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[var(--container-wide)] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link href="/command-center" className="flex shrink-0 items-center gap-3">
              <Image src="/logo-mark.svg" alt="Qtangl" width={28} height={28} />
              <span className="brand-wordmark text-sm">Qtangl</span>
            </Link>
            {extras ? <DashboardWorkspaceCluster extras={extras} /> : null}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/docs/guides/monitor-workflow"
              className="hidden text-xs text-[var(--color-gray-400)] hover:text-white sm:inline"
            >
              Help
            </Link>
            {extras ? <DashboardActionCluster extras={extras} /> : <NavbarAccountMenu />}
          </div>
        </div>
      </header>
      <div aria-hidden className="h-14 sm:h-[3.75rem]" />
    </>
  );
}

type HeaderExtras = NonNullable<ReturnType<typeof useDashboardHeaderExtras>>;

function DashboardWorkspaceCluster({ extras }: { extras: HeaderExtras }) {
  const { session } = useDashboardSession();
  if (!session) return null;

  const roleText = roleLabel(extras.sessionRole ?? session.role);
  const combinedLabel = extras.tier ? `${extras.tier} · ${roleText}` : roleText;

  return (
    <div className="hidden min-w-0 items-center gap-2 md:flex">
      <span className="h-5 w-px shrink-0 bg-[var(--border-subtle)]" aria-hidden />
      <TenantSwitcher
        session={session}
        membershipHealth={extras.membershipHealth}
        onSwitched={(next) => {
          if (next) extras.onSessionChange(next);
        }}
      />
      <span className="inline-flex shrink-0 items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[0.65rem] font-medium capitalize text-sky-200">
        {combinedLabel}
      </span>
    </div>
  );
}

function DashboardActionCluster({ extras }: { extras: HeaderExtras }) {
  const { session, signOut } = useDashboardSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const overflowButtonRef = useRef<HTMLButtonElement>(null);

  const closeAccount = useCallback(() => {
    setAccountOpen(false);
    accountButtonRef.current?.focus();
  }, []);
  const closeOverflow = useCallback(() => {
    setOverflowOpen(false);
    overflowButtonRef.current?.focus();
  }, []);

  const accountMenuRef = useMenuDismissal(accountOpen, closeAccount);
  const overflowMenuRef = useMenuDismissal(overflowOpen, closeOverflow);

  if (!session) return null;

  const showOps = isQtanglOpsFromSessionEmail(session.email);

  return (
    <div className="flex items-center gap-1.5">
      <div className="hidden items-center gap-1.5 md:flex">
        <ReadinessCopilotDrawer persona={extras.persona === "executive" ? "executive" : "operator"} />
        <NotificationCenter
          alerts={extras.alerts}
          onMarkRead={extras.onMarkAlertsRead}
          onNavigateTab={extras.onTabChange}
          onRefresh={extras.onRefreshAlerts}
          notificationReadIds={extras.notificationReadIds}
        />
        <DashboardCommandPalette actions={extras.commandActions} />

        <div ref={accountMenuRef} className="relative">
          <button
            ref={accountButtonRef}
            type="button"
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--color-gray-300)] hover:text-white"
            onClick={() => setAccountOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
          >
            Account
          </button>
          {accountOpen ? (
            <div
              role="menu"
              aria-label="Account menu"
              className="absolute right-0 top-full z-30 mt-2 min-w-[12rem] rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-2 shadow-lg"
            >
              <p className="truncate px-2 py-1 text-xs text-[var(--color-gray-400)]">{session.email}</p>
              {showOps ? (
                <a
                  role="menuitem"
                  href="/ops"
                  className="block rounded-lg px-2 py-1.5 text-xs text-white hover:bg-white/5"
                  onClick={closeAccount}
                >
                  Ops console
                </a>
              ) : null}
              <button
                role="menuitem"
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
                onClick={() => {
                  extras.onTabChange("settings");
                  closeAccount();
                }}
              >
                Settings & admin
              </button>
              <button
                role="menuitem"
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-[var(--color-gray-400)] hover:bg-white/5"
                onClick={() => {
                  extras.onDensityToggle();
                  closeAccount();
                }}
              >
                {extras.density === "compact" ? "Comfortable" : "Compact"} density
              </button>
              <button
                role="menuitem"
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
                onClick={() => {
                  closeAccount();
                  signOut();
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:hidden">
        <ReadinessCopilotDrawer persona={extras.persona === "executive" ? "executive" : "operator"} />
        <NotificationCenter
          alerts={extras.alerts}
          onMarkRead={extras.onMarkAlertsRead}
          onNavigateTab={extras.onTabChange}
          onRefresh={extras.onRefreshAlerts}
          notificationReadIds={extras.notificationReadIds}
        />
      </div>

      <div ref={overflowMenuRef} className="relative md:hidden">
        <button
          ref={overflowButtonRef}
          type="button"
          className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-xs text-white"
          onClick={() => setOverflowOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={overflowOpen}
          aria-label="More actions"
        >
          ···
        </button>
        {overflowOpen ? (
          <div
            role="menu"
            aria-label="More actions"
            className="absolute right-0 top-full z-30 mt-2 min-w-[12rem] rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-2 shadow-lg"
          >
            <p className="truncate px-2 py-1 text-xs text-[var(--color-gray-400)]">{session.email}</p>
            <p className="truncate px-2 pb-1 text-[0.65rem] capitalize text-[var(--color-gray-500)]">
              {extras.tier ? `${extras.tier} · ` : ""}
              {roleLabel(extras.sessionRole ?? session.role)}
            </p>
            {(session.memberships?.length ?? 0) > 1 ? (
              <div className="px-2 pb-1">
                <TenantSwitcher
                  session={session}
                  membershipHealth={extras.membershipHealth}
                  onSwitched={(next) => {
                    if (next) extras.onSessionChange(next);
                  }}
                />
              </div>
            ) : null}
            {showOps ? (
              <a
                role="menuitem"
                href="/ops"
                className="block rounded-lg px-2 py-1.5 text-xs text-white hover:bg-white/5"
                onClick={closeOverflow}
              >
                Ops console
              </a>
            ) : null}
            <button
              role="menuitem"
              type="button"
              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
              onClick={() => {
                extras.onTabChange("settings");
                closeOverflow();
              }}
            >
              Settings & admin
            </button>
            <button
              role="menuitem"
              type="button"
              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-[var(--color-gray-400)] hover:bg-white/5"
              onClick={() => {
                extras.onDensityToggle();
                closeOverflow();
              }}
            >
              {extras.density === "compact" ? "Comfortable" : "Compact"} density
            </button>
            <button
              role="menuitem"
              type="button"
              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
              onClick={() => {
                closeOverflow();
                signOut();
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
