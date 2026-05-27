import { getLibraryIndex } from "@/lib/library";
import { siteMetadata } from "@/lib/copy/product";
import { getAllDocsHrefs } from "@/lib/docs/nav";

export async function GET() {
  const [entries, docsHrefs] = await Promise.all([
    getLibraryIndex(),
    Promise.resolve(getAllDocsHrefs()),
  ]);

  const docsLinks = docsHrefs.map((href) => `- ${siteMetadata.url}${href}`).join("\n");
  const libraryLinks = entries
    .map((entry) => `- ${entry.title}: ${siteMetadata.url}/learn/library/${entry.slug}`)
    .join("\n");

  const content = `# Qtangl

> Quantum Planning API: hold every option in superposition, rank the field, collapse to an executable plan.

Qtangl helps operations teams explore feasible schedules, routes, and staffing plans, rank them, and collapse to the plan their team runs.

## Primary pages

- Home: ${siteMetadata.url}/
- Technology: ${siteMetadata.url}/technology
- API reference (concise): ${siteMetadata.url}/api
- Documentation hub: ${siteMetadata.url}/docs
- API sandbox: ${siteMetadata.url}/sandbox
- Hospital re-staffing demo: ${siteMetadata.url}/demo/hospital
- Request access: ${siteMetadata.url}/access
- Blog: ${siteMetadata.url}/blog
- Learn (quantum software library): ${siteMetadata.url}/learn
- Learn library catalog: ${siteMetadata.url}/learn/library
- Learn compare: ${siteMetadata.url}/learn/compare
- Learn map: ${siteMetadata.url}/learn/map

## Documentation index

${docsLinks}

## Learn library (${entries.length} entries)

${libraryLinks}

## Contact

- Email: ${siteMetadata.contactEmail}

## Optional

- Sitemap: ${siteMetadata.url}/sitemap.xml
- Robots: ${siteMetadata.url}/robots.txt
- Learn RSS: ${siteMetadata.url}/learn/feed.xml
- Learn data export: ${siteMetadata.url}/learn/data.json
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
