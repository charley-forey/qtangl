import type { MetadataRoute } from "next";

import { libraryTopicTeasers } from "@/lib/copy/library-topics";
import { siteMetadata } from "@/lib/copy/product";
import { getLibraryCategories, getLibraryIndex } from "@/lib/library";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [libraryEntries, libraryCategories] = await Promise.all([
    getLibraryIndex(),
    getLibraryCategories(),
  ]);

  const routes = [
    "",
    "/try",
    "/about",
    "/technology",
    "/access",
    "/docs",
    "/docs/data-formats",
    "/docs/quickstart",
    "/docs/concepts",
    "/docs/api",
    "/api",
    "/blog",
    "/blog/quantum-optimization",
    "/blog/scheduling-use-cases",
    "/blog/routing-optimization",
    "/learn",
    "/learn/library",
    ...libraryCategories.map((category) => `/learn/category/${category.slug}`),
    ...libraryEntries.map((entry) => `/learn/library/${entry.slug}`),
    ...libraryTopicTeasers.map((topic) => `/learn/topics/${topic.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteMetadata.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
