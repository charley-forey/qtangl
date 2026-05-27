import type { DocsSearchEntry } from "@/lib/docs/types";
import { docsSections, flattenDocsNav } from "@/lib/docs/nav";
import { docsEndpoints } from "@/lib/docs/endpoints";
import { endpointDocsHref } from "@/lib/docs/endpoint-paths";

/** Static fallback when public/docs-search-index.json is not yet built. */
export function buildStaticDocsSearchIndex(): DocsSearchEntry[] {
  const fromNav = flattenDocsNav().map((item) => {
    const section = docsSections.find((s) =>
      s.items.some((entry) => entry.href === item.href),
    );
    return {
      href: item.href,
      title: item.name,
      section: section?.title,
    };
  });

  const fromEndpoints = Object.values(docsEndpoints).map((endpoint) => ({
    href: endpointDocsHref(endpoint.id),
    title: endpoint.title,
    section: "API Reference",
    description: endpoint.summary,
  }));

  const merged = new Map<string, DocsSearchEntry>();
  for (const entry of [...fromNav, ...fromEndpoints]) {
    merged.set(entry.href, entry);
  }
  return Array.from(merged.values());
}

let cachedIndex: DocsSearchEntry[] | null = null;

export async function getDocsSearchIndex(): Promise<DocsSearchEntry[]> {
  if (cachedIndex) {
    return cachedIndex;
  }

  try {
    const mod = await import("@/public/docs-search-index.json");
    cachedIndex = (mod.default ?? mod) as DocsSearchEntry[];
    return cachedIndex;
  } catch {
    cachedIndex = buildStaticDocsSearchIndex();
    return cachedIndex;
  }
}
