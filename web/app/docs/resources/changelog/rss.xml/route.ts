import { changelog } from "@/lib/docs/changelog";
import { siteMetadata } from "@/lib/copy/product";

export function GET() {
  const items = changelog
    .map(
      (entry) => `
    <item>
      <title>${entry.version}: ${entry.title}</title>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <guid>${siteMetadata.url}/docs/resources/changelog#${entry.version}</guid>
      <description><![CDATA[${entry.items.join(" ")}]]></description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Qtangl Changelog</title>
    <link>${siteMetadata.url}/docs/resources/changelog</link>
    <description>Qtangl API and documentation releases</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
