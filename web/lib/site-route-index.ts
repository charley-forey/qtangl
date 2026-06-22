import { competitorCompareHref, competitorSlugs } from "@/lib/copy/competitors";
import { libraryTopicTeasers } from "@/lib/copy/library-topics";
import { footerNav, legalNav, nav } from "@/lib/copy/nav";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";
import { readinessBlogRegistry } from "@/lib/copy/readiness-content-registry";
import { qDayArticles } from "@/lib/copy/readiness-qday-hub";
import { flattenDocsNav } from "@/lib/docs/nav";

export type SiteRouteEntry = {
  href: string;
  title: string;
  description?: string;
  section?: string;
  keywords?: string[];
};

export type RouteSuggestion = SiteRouteEntry & {
  score: number;
  reason?: string;
};

export type LegacyRouteRedirect = {
  source: string;
  destination: string;
  label: string;
  prefix?: boolean;
};

export const legacyRouteRedirects: readonly LegacyRouteRedirect[] = [
  { source: "/pqc", destination: "/platform", label: "PQC pages moved to Platform" },
  { source: "/demo/pqc/methodology", destination: "/assess/methodology", label: "Demo methodology moved to Assess" },
  { source: "/demo/pqc", destination: "/assess", label: "PQC demo moved to Assess", prefix: true },
  { source: "/demo", destination: "/assess", label: "Demos moved to Assess", prefix: true },
  { source: "/labs", destination: "/platform", label: "Labs moved to Platform" },
  { source: "/platform/optimize", destination: "/platform", label: "Optimize merged into Platform" },
  { source: "/sandbox", destination: "/docs/quickstart", label: "Sandbox moved to Quickstart" },
  { source: "/technology", destination: "/platform", label: "Technology pages moved to Platform" },
  { source: "/api", destination: "/docs/api", label: "API docs moved to /docs/api" },
  { source: "/docs/labs", destination: "/docs", label: "Docs labs merged into overview" },
  { source: "/docs/reference/optimize", destination: "/docs/api", label: "Optimize reference moved to API" },
  { source: "/try", destination: "/assess", label: "Try Qtangl moved to Assess" },
];

const coreMarketingRoutes: SiteRouteEntry[] = [
  { href: "/", title: "Home", section: "Product", keywords: ["qtangl", "home"] },
  { href: "/platform", title: "Platform", section: "Product", keywords: ["pqc", "cpm"] },
  { href: "/platform/coverage", title: "Framework coverage", section: "Product" },
  { href: "/assess", title: "Assess", section: "Product", keywords: ["scan", "demo", "inventory"] },
  { href: "/assess/mini", title: "Mini-assessment", section: "Product", keywords: ["free", "score"] },
  { href: "/assess/start", title: "Start authorized workspace", section: "Product" },
  { href: "/assess/methodology", title: "Assessment methodology", section: "Product" },
  { href: "/monitor", title: "Monitor", section: "Product", keywords: ["drift", "alerts"] },
  { href: "/convert", title: "Convert", section: "Product", keywords: ["remediation", "migration"] },
  { href: "/pricing", title: "Pricing", section: "Evaluate" },
  { href: "/q-day", title: "Q-Day hub", section: "Learn", keywords: ["hndl", "quantum", "readiness"] },
  { href: "/q-day/checklist", title: "Q-Day checklist", section: "Learn" },
  { href: "/q-day/briefing", title: "Executive briefing", section: "Learn" },
  { href: "/q-day/sample-report", title: "Sample report", section: "Learn" },
  { href: "/solutions", title: "Solutions", section: "Product" },
  { href: "/solutions/banking", title: "Banking solutions", section: "Product" },
  { href: "/solutions/government", title: "Government solutions", section: "Product" },
  { href: "/solutions/healthcare", title: "Healthcare solutions", section: "Product" },
  { href: "/trust", title: "Trust center", section: "Trust" },
  { href: "/trust/security", title: "Security", section: "Trust" },
  { href: "/trust/subprocessors", title: "Sub-processors", section: "Trust" },
  { href: "/status", title: "System status", section: "Trust" },
  { href: "/verify", title: "Verify report", section: "Product", keywords: ["signature", "evidence"] },
  { href: "/journey", title: "Customer journey", section: "Product" },
  { href: "/resources", title: "Resources", section: "Learn" },
  { href: "/resources/roi", title: "ROI calculator", section: "Learn" },
  { href: "/resources/faq", title: "FAQ", section: "Learn" },
  { href: "/resources/readiness-index", title: "Readiness index", section: "Learn" },
  { href: "/compare", title: "Compare vendors", section: "Evaluate" },
  { href: "/compare/guide", title: "Comparison guide", section: "Evaluate" },
  { href: "/partners", title: "Partners", section: "Evaluate" },
  { href: "/about", title: "About Qtangl", section: "Company" },
  { href: "/access", title: "Request access", section: "Evaluate" },
  { href: "/blog", title: "Blog", section: "Learn" },
  { href: "/learn", title: "Learn hub", section: "Learn" },
  { href: "/learn/quantum-crypto", title: "Quantum crypto curriculum", section: "Learn", keywords: ["pqc", "course"] },
  { href: "/learn/quantum-crypto/guide", title: "Quantum crypto learning guide", section: "Learn" },
  { href: "/learn/library", title: "Library", section: "Learn" },
  { href: "/learn/compare", title: "Learn compare", section: "Learn" },
  { href: "/learn/map", title: "Ecosystem map", section: "Learn" },
  { href: "/learn/whats-new", title: "What's new in Learn", section: "Learn" },
  { href: "/dashboard", title: "Dashboard", section: "Product", keywords: ["monitor", "workspace"] },
];

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }
  const trimmed = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  return trimmed.endsWith("/") && trimmed.length > 1 ? trimmed.slice(0, -1) : trimmed;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, " ")
    .split(/[\s/]+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, (_, row) =>
    Array.from({ length: b.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0))
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row]![col] = Math.min(
        matrix[row - 1]![col]! + 1,
        matrix[row]![col - 1]! + 1,
        matrix[row - 1]![col - 1]! + cost
      );
    }
  }

  return matrix[a.length]![b.length]!;
}

function upsertRoute(map: Map<string, SiteRouteEntry>, entry: SiteRouteEntry) {
  const existing = map.get(entry.href);
  if (!existing) {
    map.set(entry.href, entry);
    return;
  }

  map.set(entry.href, {
    ...existing,
    title: existing.title || entry.title,
    description: existing.description ?? entry.description,
    section: existing.section ?? entry.section,
    keywords: [...new Set([...(existing.keywords ?? []), ...(entry.keywords ?? [])])],
  });
}

export function buildSiteRouteIndex(): SiteRouteEntry[] {
  const map = new Map<string, SiteRouteEntry>();

  for (const entry of coreMarketingRoutes) {
    upsertRoute(map, entry);
  }

  for (const item of nav) {
    upsertRoute(map, { href: item.href, title: item.name, section: "Product" });
  }

  for (const item of footerNav) {
    upsertRoute(map, { href: item.href, title: item.name, section: "More" });
  }

  for (const item of legalNav) {
    upsertRoute(map, { href: item.href, title: item.name, section: "Legal" });
  }

  for (const item of flattenDocsNav()) {
    upsertRoute(map, {
      href: item.href,
      title: item.name,
      section: "Documentation",
      keywords: ["docs", "api"],
    });
  }

  for (const entry of readinessBlogRegistry) {
    upsertRoute(map, {
      href: `/blog/${entry.slug}`,
      title: entry.title,
      description: entry.description,
      section: "Blog",
      keywords: [entry.category, entry.kind],
    });
  }

  for (const [slug, article] of Object.entries(qDayArticles)) {
    upsertRoute(map, {
      href: `/q-day/${slug}`,
      title: article.title,
      description: article.description,
      section: "Q-Day",
      keywords: ["q-day", "hndl", "mosca"],
    });
  }

  for (const guide of frameworkGuideList) {
    upsertRoute(map, {
      href: `/q-day/frameworks/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      section: "Q-Day frameworks",
    });
  }

  for (const slug of competitorSlugs) {
    upsertRoute(map, {
      href: competitorCompareHref(slug),
      title: `Compare: ${slug}`,
      section: "Compare",
    });
  }

  for (const topic of libraryTopicTeasers) {
    upsertRoute(map, {
      href: `/learn/topics/${topic.slug}`,
      title: topic.title,
      description: topic.description,
      section: "Learn topics",
    });
  }

  for (const redirect of legacyRouteRedirects) {
    const destination = map.get(redirect.destination);
    if (destination) {
      upsertRoute(map, {
        ...destination,
        keywords: [...new Set([...(destination.keywords ?? []), redirect.source.replace(/^\//, "")])],
      });
    }
  }

  return [...map.values()].sort((a, b) => a.href.localeCompare(b.href));
}

export const siteRouteIndex = buildSiteRouteIndex();

function scoreRouteAgainstQuery(entry: SiteRouteEntry, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 0;
  }

  let score = 0;
  const href = entry.href.toLowerCase();
  const title = entry.title.toLowerCase();
  const description = entry.description?.toLowerCase() ?? "";
  const section = entry.section?.toLowerCase() ?? "";
  const tokens = tokenize(q);

  if (href === q || href === `/${q}`) {
    score += 120;
  } else if (href.includes(q)) {
    score += 40;
  }

  if (title === q) {
    score += 80;
  } else if (title.includes(q)) {
    score += 35;
  }

  if (description.includes(q)) {
    score += 20;
  }

  if (section.includes(q)) {
    score += 12;
  }

  for (const keyword of entry.keywords ?? []) {
    const normalized = keyword.toLowerCase();
    if (normalized === q) {
      score += 30;
    } else if (normalized.includes(q) || q.includes(normalized)) {
      score += 14;
    }
  }

  for (const token of tokens) {
    if (!token) {
      continue;
    }
    if (href.includes(token)) {
      score += 18;
    }
    if (title.includes(token)) {
      score += 12;
    }
    for (const segment of href.split("/").filter(Boolean)) {
      const distance = levenshtein(token, segment);
      if (distance === 0) {
        score += 16;
      } else if (distance === 1) {
        score += 10;
      } else if (distance === 2) {
        score += 4;
      }
    }
  }

  return score;
}

export function resolveLegacyRedirect(pathname: string): RouteSuggestion | null {
  const path = normalizePath(pathname);

  const exact = legacyRouteRedirects.find((redirect) => redirect.source === path);
  if (exact) {
    const destination = siteRouteIndex.find((entry) => entry.href === exact.destination);
    return {
      href: exact.destination,
      title: destination?.title ?? exact.destination,
      description: destination?.description,
      section: destination?.section,
      keywords: destination?.keywords,
      score: 1000,
      reason: exact.label,
    };
  }

  const prefixMatches = legacyRouteRedirects
    .filter((redirect) => redirect.prefix && path.startsWith(redirect.source))
    .sort((a, b) => b.source.length - a.source.length);

  const prefix = prefixMatches[0];
  if (prefix) {
    const destination = siteRouteIndex.find((entry) => entry.href === prefix.destination);
    return {
      href: prefix.destination,
      title: destination?.title ?? prefix.destination,
      description: destination?.description,
      section: destination?.section,
      keywords: destination?.keywords,
      score: 900,
      reason: prefix.label,
    };
  }

  return null;
}

export function suggestRoutesForPath(pathname: string, limit = 3): RouteSuggestion[] {
  const path = normalizePath(pathname);
  const legacy = resolveLegacyRedirect(path);
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";

  const scored = siteRouteIndex
    .map((entry) => {
      let score = scoreRouteAgainstQuery(entry, path);
      score += scoreRouteAgainstQuery(entry, lastSegment);

      for (const segment of segments) {
        score += scoreRouteAgainstQuery(entry, segment) * 0.6;
        if (entry.href.includes(segment)) {
          score += 10;
        }
      }

      if (entry.href !== path && path.startsWith(entry.href) && entry.href !== "/") {
        score += 8;
      }

      return { ...entry, score };
    })
    .filter((entry) => entry.href !== path && entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const results: RouteSuggestion[] = [];
  if (legacy) {
    results.push(legacy);
  }

  for (const entry of scored) {
    if (results.some((item) => item.href === entry.href)) {
      continue;
    }
    results.push(entry);
    if (results.length >= limit) {
      break;
    }
  }

  return results.slice(0, limit);
}

export function searchSiteRoutes(query: string, limit = 8): RouteSuggestion[] {
  const q = query.trim();
  if (!q) {
    return siteRouteIndex.slice(0, limit).map((entry) => ({ ...entry, score: 1 }));
  }

  return siteRouteIndex
    .map((entry) => ({ ...entry, score: scoreRouteAgainstQuery(entry, q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
