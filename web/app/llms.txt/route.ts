import { getLibraryIndex } from "@/lib/library";
import { publishedCompetitors, competitorCompareHref } from "@/lib/copy/competitors";
import { readinessMetadata, siteMetadata } from "@/lib/copy/product";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";
import { qDayArticles } from "@/lib/copy/readiness-qday-hub";
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
  const qDayLinks = Object.keys(qDayArticles)
    .map((slug) => `- ${siteMetadata.url}/q-day/${slug}`)
    .join("\n");
  const frameworkLinks = frameworkGuideList
    .map((guide) => `- ${guide.metadata.title}: ${siteMetadata.url}/q-day/frameworks/${guide.slug}`)
    .join("\n");
  const compareLinks = publishedCompetitors()
    .map((c) => `- Qtangl vs ${c.name}: ${siteMetadata.url}${competitorCompareHref(c.slug)}`)
    .join("\n");

  const content = `# Qtangl

> ${readinessMetadata.oneLiner}

Qtangl is a post-quantum readiness platform — Assess quantum-vulnerable cryptography, Monitor crypto drift, and Convert your stack with signed evidence auditors can verify.

## Primary pages — readiness

- Home: ${siteMetadata.url}/
- Platform: ${siteMetadata.url}/platform
- Assess: ${siteMetadata.url}/assess
- Free mini-assessment: ${siteMetadata.url}/assess/mini
- Crypto agility checklist: ${siteMetadata.url}/q-day/checklist
- Executive briefing: ${siteMetadata.url}/q-day/briefing
- Monitor: ${siteMetadata.url}/monitor
- Convert: ${siteMetadata.url}/convert
- Pricing: ${siteMetadata.url}/pricing
- Customer journey: ${siteMetadata.url}/journey
- Resources hub: ${siteMetadata.url}/resources
- ROI calculator: ${siteMetadata.url}/resources/roi
- Readiness FAQ: ${siteMetadata.url}/resources/faq
- Q-Day hub: ${siteMetadata.url}/q-day
- Q-Day scanner: ${siteMetadata.url}/assess
- Verify a report: ${siteMetadata.url}/verify
- Trust center: ${siteMetadata.url}/trust
- Trust security: ${siteMetadata.url}/trust/security
- Coverage matrix: ${siteMetadata.url}/platform/coverage
- Dashboard: ${siteMetadata.url}/dashboard
- Partners: ${siteMetadata.url}/partners
- SIEM webhook v2: ${siteMetadata.url}/docs/integrations/siem-webhook-v2
- Request access: ${siteMetadata.url}/access
- Documentation hub: ${siteMetadata.url}/docs
- PQC demo guide: ${siteMetadata.url}/docs/guides/pqc-demo

## Industry solutions

- Banking: ${siteMetadata.url}/solutions/banking
- Government & defense: ${siteMetadata.url}/solutions/government
- Healthcare: ${siteMetadata.url}/solutions/healthcare

## Q-Day education

${qDayLinks}

## Framework guides

${frameworkLinks}

## HNDL education

- HNDL hub: ${siteMetadata.url}/q-day/hndl
- How encrypted data is harvested: ${siteMetadata.url}/blog/how-encrypted-data-is-harvested
- HNDL myths: ${siteMetadata.url}/blog/hndl-myths-misconceptions
- HNDL for engineers: ${siteMetadata.url}/blog/hndl-for-security-engineers
- Banking HNDL: ${siteMetadata.url}/q-day/frameworks/banking-hndl
- Gov contractor HNDL: ${siteMetadata.url}/q-day/frameworks/gov-hndl
- HIPAA HNDL: ${siteMetadata.url}/q-day/frameworks/hipaa-hndl
- HNDL infographic: ${siteMetadata.url}/downloads/hndl-infographic.svg
- Learn topic — HNDL risk: ${siteMetadata.url}/learn/topics/hndl-risk

## Hybrid optimization (expansion)

- Technology: ${siteMetadata.url}/technology
- Optimization hub: ${siteMetadata.url}/platform/optimize
- API reference (concise): ${siteMetadata.url}/api
- API sandbox: ${siteMetadata.url}/sandbox
- Hospital re-staffing demo: ${siteMetadata.url}/demo/hospital
- Airline crew recovery demo: ${siteMetadata.url}/demo/airline

## Competitive comparisons

- Comparison hub: ${siteMetadata.url}/compare
- Comparison guide (PDF): ${siteMetadata.url}/downloads/qtangl-pqc-vendor-comparison.pdf
- Printable guide: ${siteMetadata.url}/compare/guide
- Vendor roundup blog: ${siteMetadata.url}/blog/pqc-readiness-vendors-compared-2026

${compareLinks}

## Blog & learn

- Blog: ${siteMetadata.url}/blog
- Learn (quantum software library): ${siteMetadata.url}/learn
- Learn library catalog: ${siteMetadata.url}/learn/library
- Learn compare: ${siteMetadata.url}/learn/compare
- Learn map: ${siteMetadata.url}/learn/map

## Documentation index

${docsLinks}

## OpenAPI & tooling

- OpenAPI JSON: ${siteMetadata.url}/openapi.json
- Postman collection: ${siteMetadata.url}/postman/qtangl-api.json
- Verify spec: ${siteMetadata.url}/docs/verify-spec

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
