import type { MetadataRoute } from "next";

import { siteMetadata } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/docs",
    "/docs/quickstart",
    "/docs/concepts",
    "/docs/api",
    "/api",
    "/blog",
    "/blog/quantum-optimization",
    "/blog/scheduling-use-cases",
    "/blog/routing-optimization",
  ];

  return routes.map((route) => ({
    url: `${siteMetadata.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
