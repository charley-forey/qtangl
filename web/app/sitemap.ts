import type { MetadataRoute } from "next";

import { blogPosts } from "@/lib/copy/marketing";
import { libraryTopicTeasers } from "@/lib/copy/library-topics";
import { siteMetadata } from "@/lib/copy/product";
import { getAllDocsHrefs } from "@/lib/docs/nav";
import { getLibraryCategories, getLibraryIndex } from "@/lib/library";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [libraryEntries, libraryCategories] = await Promise.all([
    getLibraryIndex(),
    getLibraryCategories(),
  ]);

  const routes = [
    "",
    "/demo",
    "/sandbox",
    "/demo/hospital",
    "/demo/hospital/methodology",
    "/about",
    "/technology",
    "/access",
    "/api",
    ...getAllDocsHrefs(),
    "/blog",
    ...blogPosts.map((post) => post.href),
    "/learn",
    "/learn/library",
    ...libraryCategories.map((category) => `/learn/category/${category.slug}`),
    ...libraryEntries.map((entry) => `/learn/library/${entry.slug}`),
    ...libraryTopicTeasers.map((topic) => `/learn/topics/${topic.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteMetadata.url}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route === "/demo/hospital" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/demo/hospital" ? 0.9 : 0.7,
  }));
}
