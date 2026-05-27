import JsonLd from "@/components/seo/JsonLd";
import { getBreadcrumbs } from "@/lib/docs/nav";
import { siteMetadata } from "@/lib/copy/product";
import { absoluteUrl } from "@/lib/seo";

type DocsJsonLdProps = {
  pathname: string;
  title: string;
  description: string;
};

export default function DocsJsonLd({
  pathname,
  title,
  description,
}: DocsJsonLdProps) {
  const url = absoluteUrl(pathname);
  const crumbs = getBreadcrumbs(pathname);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "TechArticle",
            headline: title,
            description,
            url,
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
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((crumb, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: crumb.name,
              item: absoluteUrl(crumb.href),
            })),
          },
        ],
      }}
    />
  );
}
