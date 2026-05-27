import { getLibraryIndex } from "@/lib/library";
import { siteMetadata } from "@/lib/copy/product";

export async function GET() {
  const entries = (await getLibraryIndex())
    .filter((entry) => entry.lastPushedAt)
    .sort(
      (a, b) =>
        new Date(b.lastPushedAt ?? 0).getTime() - new Date(a.lastPushedAt ?? 0).getTime()
    )
    .slice(0, 50);

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${siteMetadata.url}/learn/library/${entry.slug}</link>
      <guid>${siteMetadata.url}/learn/library/${entry.slug}</guid>
      <pubDate>${new Date(entry.lastPushedAt!).toUTCString()}</pubDate>
      <description>${escapeXml(entry.summary)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Qtangl Learn Library Updates</title>
    <link>${siteMetadata.url}/learn</link>
    <description>Recently updated entries in the Qtangl quantum software library.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
