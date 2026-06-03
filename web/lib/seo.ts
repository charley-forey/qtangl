import type { Metadata } from "next";

import { accessPageCopy } from "@/lib/copy/access";
import { siteMetadata } from "@/lib/copy/product";
import { getAllDocsHrefs } from "@/lib/docs/nav";

export type OpenGraphType = "website" | "article";

export type PageMetadataOptions = {
  path: string;
  title: string;
  description: string;
  type?: OpenGraphType;
  image?: string | { url: string; width?: number; height?: number; alt?: string };
  absoluteTitle?: boolean;
  noIndex?: boolean;
};

export function absoluteUrl(path: string): string {
  if (path === "" || path === "/") {
    return siteMetadata.url;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteMetadata.url}${normalized}`;
}

function resolveImage(
  image: PageMetadataOptions["image"],
  fallbackAlt: string,
): { url: string; width: number; height: number; alt: string } {
  if (typeof image === "object" && image) {
    return {
      url: image.url,
      width: image.width ?? 1200,
      height: image.height ?? 630,
      alt: image.alt ?? fallbackAlt,
    };
  }

  return {
    url: image ?? "/opengraph-image",
    width: 1200,
    height: 630,
    alt: fallbackAlt,
  };
}

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const url = absoluteUrl(options.path);
  const image = resolveImage(options.image, `${options.title} | ${siteMetadata.name}`);

  return {
    title: options.absoluteTitle ? { absolute: options.title } : options.title,
    description: options.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: siteMetadata.name,
      locale: "en_US",
      type: options.type ?? "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image.url],
    },
    ...(options.noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}

export function buildSiteMetadata(): Metadata {
  const verificationToken = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(siteMetadata.url),
    title: {
      default: siteMetadata.title,
      template: `%s | ${siteMetadata.name}`,
    },
    description: siteMetadata.description,
    applicationName: siteMetadata.name,
    robots: {
      index: true,
      follow: true,
    },
    ...(verificationToken
      ? {
          verification: {
            google: verificationToken,
          },
        }
      : {}),
    openGraph: {
      title: siteMetadata.title,
      description: siteMetadata.description,
      url: siteMetadata.url,
      siteName: siteMetadata.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Qtangl social preview image",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteMetadata.title,
      description: siteMetadata.description,
      images: ["/opengraph-image"],
    },
    icons: {
      icon: "/logo-mark.svg",
      shortcut: "/logo-mark.svg",
      apple: "/logo-mark.svg",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteMetadata.url}/#organization`,
        name: siteMetadata.name,
        url: siteMetadata.url,
        email: siteMetadata.contactEmail,
        description: siteMetadata.description,
      },
      {
        "@type": "WebSite",
        "@id": `${siteMetadata.url}/#website`,
        url: siteMetadata.url,
        name: siteMetadata.name,
        description: siteMetadata.description,
        publisher: {
          "@id": `${siteMetadata.url}/#organization`,
        },
      },
    ],
  };
}

export function buildBlogPostingJsonLd(options: {
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
}) {
  const url = absoluteUrl(options.path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: options.headline,
        description: options.description,
        url,
        mainEntityOfPage: url,
        author: {
          "@type": "Organization",
          name: siteMetadata.name,
          url: siteMetadata.url,
        },
        publisher: {
          "@type": "Organization",
          name: siteMetadata.name,
          url: siteMetadata.url,
        },
        ...(options.datePublished ? { datePublished: options.datePublished } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteMetadata.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: absoluteUrl("/blog"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: options.headline,
            item: url,
          },
        ],
      },
    ],
  };
}

export function buildContactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Request pilot access",
        description: accessPageCopy.metadataDescription,
        url: absoluteUrl("/access"),
        isPartOf: {
          "@id": `${siteMetadata.url}/#website`,
        },
        about: {
          "@type": "Organization",
          name: siteMetadata.name,
          url: siteMetadata.url,
          email: siteMetadata.contactEmail,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteMetadata.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Access",
            item: absoluteUrl("/access"),
          },
        ],
      },
    ],
  };
}

export function buildFrameworkJsonLd(guide: {
  slug: string;
  metadata: { title: string; description: string };
  summary: string;
  deadline: string;
}) {
  const url = absoluteUrl(`/q-day/frameworks/${guide.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: guide.metadata.title,
        description: guide.metadata.description,
        url,
        about: { "@type": "Thing", name: guide.summary },
        isPartOf: { "@id": `${siteMetadata.url}/#website` },
        publisher: {
          "@type": "Organization",
          name: siteMetadata.name,
          url: siteMetadata.url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteMetadata.url },
          { "@type": "ListItem", position: 2, name: "Q-Day", item: absoluteUrl("/q-day") },
          { "@type": "ListItem", position: 3, name: guide.metadata.title, item: url },
        ],
      },
    ],
  };
}

export function buildFaqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildSoftwareApplicationJsonLd(options: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Contact for enterprise pricing",
    },
    provider: {
      "@type": "Organization",
      name: siteMetadata.name,
      url: siteMetadata.url,
    },
  };
}

export function buildHospitalDemoJsonLd(options: { description: string; videoUrl?: string }) {
  const url = absoluteUrl("/demo/hospital");
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      name: "Hospital re-staffing demo",
      description: options.description,
      url,
      isPartOf: {
        "@id": `${siteMetadata.url}/#website`,
      },
    },
  ];

  if (options.videoUrl) {
    graph.push({
      "@type": "VideoObject",
      name: "Hospital re-staffing demo walkthrough",
      description: options.description,
      contentUrl: options.videoUrl,
      embedUrl: options.videoUrl,
      uploadDate: "2026-01-01",
      publisher: {
        "@type": "Organization",
        name: siteMetadata.name,
        url: siteMetadata.url,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function buildEvFleetDemoJsonLd(options: { description: string; videoUrl?: string }) {
  const url = absoluteUrl("/demo/ev-fleet");
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      name: "EV fleet depot charging demo",
      description: options.description,
      url,
      isPartOf: {
        "@id": `${siteMetadata.url}/#website`,
      },
    },
  ];

  if (options.videoUrl) {
    graph.push({
      "@type": "VideoObject",
      name: "EV fleet depot charging walkthrough",
      description: options.description,
      contentUrl: options.videoUrl,
      embedUrl: options.videoUrl,
      uploadDate: "2026-01-01",
      publisher: {
        "@type": "Organization",
        name: siteMetadata.name,
        url: siteMetadata.url,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function buildPqcDemoJsonLd(options: { description: string; videoUrl?: string; url?: string }) {
  const pageUrl = options.url ?? absoluteUrl("/assess");
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      name: "Q-Day readiness scanner",
      description: options.description,
      url: pageUrl,
      isPartOf: {
        "@id": `${siteMetadata.url}/#website`,
      },
    },
  ];

  if (options.videoUrl) {
    graph.push({
      "@type": "VideoObject",
      name: "Q-Day readiness scanner walkthrough",
      description: options.description,
      contentUrl: options.videoUrl,
      embedUrl: options.videoUrl,
      uploadDate: "2026-01-01",
      publisher: {
        "@type": "Organization",
        name: siteMetadata.name,
        url: siteMetadata.url,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function buildAirlineDemoJsonLd(options: { description: string; videoUrl?: string }) {
  const url = absoluteUrl("/demo/airline");
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      name: "Airline crew recovery demo",
      description: options.description,
      url,
      isPartOf: {
        "@id": `${siteMetadata.url}/#website`,
      },
    },
  ];

  if (options.videoUrl) {
    graph.push({
      "@type": "VideoObject",
      name: "Airline OCC recovery walkthrough",
      description: options.description,
      contentUrl: options.videoUrl,
      embedUrl: options.videoUrl,
      uploadDate: "2026-01-01",
      publisher: {
        "@type": "Organization",
        name: siteMetadata.name,
        url: siteMetadata.url,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

const docsLinks = getAllDocsHrefs()
  .map((href) => `- ${siteMetadata.url}${href}`)
  .join("\n");

export const llmsTxtContent = `# Qtangl

> Post-quantum readiness platform: Assess quantum-vulnerable cryptography, Monitor drift, Convert with auditable evidence.

Qtangl helps CISOs and compliance teams inventory quantum-vulnerable crypto, track drift, and prove remediation with signed reports.

## Primary pages

- Home: ${siteMetadata.url}/
- Platform: ${siteMetadata.url}/platform
- Q-Day readiness hub: ${siteMetadata.url}/q-day
- Assess / live scanner: ${siteMetadata.url}/assess
- Free mini-assessment: ${siteMetadata.url}/assess/mini
- Monitor tier: ${siteMetadata.url}/monitor
- Convert tier: ${siteMetadata.url}/convert
- Pricing: ${siteMetadata.url}/pricing
- Verify signed reports: ${siteMetadata.url}/verify
- Blog: ${siteMetadata.url}/blog
- Blog RSS (readiness): ${siteMetadata.url}/blog/feed.xml
- Learn library: ${siteMetadata.url}/learn
- Request access: ${siteMetadata.url}/access

## Lead magnets

- Crypto agility checklist: ${siteMetadata.url}/q-day/checklist
- Executive briefing: ${siteMetadata.url}/q-day/briefing
- Sample CBOM: ${siteMetadata.url}/samples/sample-cbom-bank-tls-inventory.json
- Sample report: ${siteMetadata.url}/q-day/sample-report

## Documentation index

${docsLinks}

## Contact

- Email: ${siteMetadata.contactEmail}

## Optional

- Sitemap: ${siteMetadata.url}/sitemap.xml
- Robots: ${siteMetadata.url}/robots.txt
- Docs changelog RSS: ${siteMetadata.url}/docs/resources/changelog/rss.xml
- Learn library RSS: ${siteMetadata.url}/learn/feed.xml
`;
