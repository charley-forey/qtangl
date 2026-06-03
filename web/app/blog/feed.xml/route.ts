import { blogPosts } from "@/lib/constants";
import { loadReadinessMarkdown } from "@/lib/readiness-content";
import { getReadinessBlogEntry } from "@/lib/copy/readiness-content-registry";
import { siteMetadata } from "@/lib/copy/product";

export async function GET() {
  const readinessPosts = blogPosts.filter(
    (post): post is typeof post & { readiness: true } =>
      "readiness" in post && post.readiness === true,
  );

  const items = await Promise.all(
    readinessPosts.map(async (post) => {
      const registry = getReadinessBlogEntry(post.slug);
      let pubDate = new Date().toUTCString();
      let description = post.description;

      if (registry) {
        try {
          const content = await loadReadinessMarkdown(
            registry.kind,
            post.slug,
            registry.markdownFile,
          );
          pubDate = new Date(content.datePublished).toUTCString();
          description = content.description;
        } catch {
          // static TSX posts fall back to marketing metadata
        }
      }

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteMetadata.url}${post.href}</link>
      <guid>${siteMetadata.url}${post.href}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Qtangl Q-Day Readiness Blog</title>
    <link>${siteMetadata.url}/blog</link>
    <description>Post-quantum cryptography readiness articles from Qtangl.</description>
    <language>en-us</language>${items.join("")}
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
