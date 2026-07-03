"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import NotFoundMoscaCompact from "@/components/not-found/NotFoundMoscaCompact";
import NotFoundPathInventory from "@/components/not-found/NotFoundPathInventory";
import NotFoundRouteSearch from "@/components/not-found/NotFoundRouteSearch";
import StateTransition from "@/components/quantum/StateTransition";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";
import { notFoundCopy } from "@/lib/copy/not-found";
import { suggestRoutesForPath, type RouteSuggestion } from "@/lib/site-route-index";

function DashboardNotFound() {
  const copy = notFoundCopy.dashboard;

  useEffect(() => {
    trackEvent("not_found_view", { variant: "dashboard" });
  }, []);

  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <div className="content-reading">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="heading-display gradient-text mt-4">{copy.title}</h1>
          <p className="text-body-lg mt-6 max-w-3xl text-[var(--color-gray-300)]">{copy.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={copy.actions.primary.href}>{copy.actions.primary.label}</Button>
            <Button href={copy.actions.secondary.href} variant="secondary">
              {copy.actions.secondary.label}
            </Button>
            <Button href={copy.actions.tertiary.href} variant="secondary">
              {copy.actions.tertiary.label}
            </Button>
          </div>
        </div>
      </Section>

      <Section gap="tight">
        <ul className="grid gap-4 sm:grid-cols-2">
          {copy.links.map((link) => (
            <li key={link.href}>
              <Card tone="panel" interactive className="h-full rounded-[var(--radius-feature)]">
                <Link href={link.href} className="block">
                  <p className="text-sm font-semibold text-white">{link.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-gray-400)]">{link.description}</p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </PageShell>
  );
}

function MarketingNotFound() {
  const pathname = usePathname() ?? "/unknown";
  const copy = notFoundCopy.marketing;
  const suggestions = useMemo(() => suggestRoutesForPath(pathname, 3), [pathname]);
  const searchSeed = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "";
  }, [pathname]);

  useEffect(() => {
    trackEvent("not_found_view", {
      variant: "marketing",
      pathname,
      legacy_match: suggestions[0]?.reason ?? null,
      top_suggestion: suggestions[0]?.href ?? null,
    });
  }, [pathname, suggestions]);

  const onSuggestionClick = useCallback(
    (entry: RouteSuggestion) => {
      trackEvent("not_found_suggestion_click", {
        pathname,
        destination: entry.href,
        source: "suggestion",
        score: entry.score,
        reason: entry.reason ?? null,
      });
    },
    [pathname]
  );

  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <StateTransition>
          <div className="content-reading">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="heading-display gradient-text mt-4">{copy.title}</h1>
            <p className="text-body-lg mt-6 max-w-3xl text-[var(--color-gray-300)]">{copy.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={copy.actions.primary.href}>{copy.actions.primary.label}</Button>
              <Button href={copy.actions.secondary.href} variant="secondary">
                {copy.actions.secondary.label}
              </Button>
              <Button href={copy.actions.tertiary.href} variant="secondary">
                {copy.actions.tertiary.label}
              </Button>
            </div>
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <NotFoundPathInventory
          pathname={pathname}
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
        />
      </Section>

      {suggestions.length > 0 ? (
        <Section gap="tight">
          <StateTransition delay={0.05}>
            <div>
              <h2 className="text-sm font-semibold text-white">{copy.suggestions.heading}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {suggestions.map((entry) => (
                  <li key={entry.href}>
                    <Card tone="panel" interactive className="h-full rounded-[var(--radius-feature)]">
                      <Link href={entry.href} onClick={() => onSuggestionClick(entry)} className="block">
                        <p className="text-sm font-semibold text-white">{entry.title}</p>
                        <code className="mt-2 block font-mono text-[0.7rem] text-[var(--color-gray-500)]">
                          {entry.href}
                        </code>
                        {entry.reason ? (
                          <p className="mt-2 text-xs text-sky-200/90">
                            {copy.suggestions.legacyNote}: {entry.reason}
                          </p>
                        ) : entry.description ? (
                          <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">
                            {entry.description}
                          </p>
                        ) : null}
                      </Link>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </StateTransition>
        </Section>
      ) : null}

      <Section gap="tight">
        <StateTransition delay={0.08}>
          <NotFoundRouteSearch pathname={pathname} initialQuery={searchSeed} />
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition delay={0.1}>
          <div>
            <h2 className="text-sm font-semibold text-white">{copy.intents.heading}</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              {copy.intents.groups.map((group) => (
                <Card key={group.id} tone="panel" className="rounded-[var(--radius-feature)]">
                  <p className="text-label text-[var(--color-gray-500)]">{group.label}</p>
                  <ul className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() =>
                            trackEvent("not_found_intent_click", {
                              pathname,
                              intent: group.id,
                              destination: link.href,
                            })
                          }
                          className="group block rounded-xl px-2 py-1 transition hover:bg-white/[0.04]"
                        >
                          <p className="text-sm font-medium text-white group-hover:underline group-hover:underline-offset-4">
                            {link.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-gray-400)]">
                            {link.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition delay={0.12}>
          <NotFoundMoscaCompact />
        </StateTransition>
      </Section>
    </PageShell>
  );
}

export default function NotFoundRecovery() {
  const pathname = usePathname() ?? "";
  const isDashboard = pathname.startsWith("/command-center") && !pathname.startsWith("/command-center/login");

  if (isDashboard) {
    return <DashboardNotFound />;
  }

  return <MarketingNotFound />;
}
