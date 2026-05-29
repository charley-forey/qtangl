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

const docsLinks = getAllDocsHrefs()
  .map((href) => `- ${siteMetadata.url}${href}`)
  .join("\n");

export const llmsTxtContent = `# Qtangl

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

## Documentation index

${docsLinks}

## Contact

- Email: ${siteMetadata.contactEmail}

## Optional

- Sitemap: ${siteMetadata.url}/sitemap.xml
- Robots: ${siteMetadata.url}/robots.txt
- Docs changelog RSS: ${siteMetadata.url}/docs/resources/changelog/rss.xml
`;
