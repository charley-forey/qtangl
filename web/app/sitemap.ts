import type { MetadataRoute } from "next";

import { blogPosts } from "@/lib/copy/marketing";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";
import { qDayArticles } from "@/lib/copy/readiness-qday-hub";
import { libraryRecipes } from "@/lib/copy/library-recipes";
import { libraryTopicTeasers } from "@/lib/copy/library-topics";
import { siteMetadata } from "@/lib/copy/product";
import { getAllDocsHrefs } from "@/lib/docs/nav";
import { getLibraryCategories, getLibraryIndex } from "@/lib/library";

const readinessRoutes = [
  "/platform",
  "/platform/coverage",
  "/trust/security",
  "/trust/subprocessors",
  "/partners",
  "/resources/readiness-index",
  "/assess",
  "/assess/mini",
  "/monitor",
  "/convert",
  "/pricing",
  "/q-day",
  ...Object.keys(qDayArticles).map((slug) => `/q-day/${slug}`),
  "/q-day/checklist",
  "/q-day/briefing",
  ...frameworkGuideList.map((guide) => `/q-day/frameworks/${guide.slug}`),
  "/solutions",
  "/solutions/banking",
  "/solutions/government",
  "/solutions/healthcare",
  "/demo/pqc",
  "/demo/pqc/methodology",
  "/trust",
  "/verify",
  "/dashboard",
  "/labs",
  "/journey",
  "/resources",
  "/resources/roi",
  "/resources/faq",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [libraryEntries, libraryCategories] = await Promise.all([
    getLibraryIndex(),
    getLibraryCategories(),
  ]);

  const routes = [
    "",
    ...readinessRoutes,
    "/demo",
    "/sandbox",
    "/demo/hospital",
    "/demo/hospital/methodology",
    "/demo/airline",
    "/demo/airline/methodology",
    "/demo/ev-fleet",
    "/demo/ev-fleet/methodology",
    "/platform/optimize",
    "/about",
    "/technology",
    "/access",
    "/api",
    ...getAllDocsHrefs(),
    "/blog",
    ...blogPosts.map((post) => post.href),
    "/learn",
    "/learn/library",
    "/learn/compare",
    "/learn/map",
    "/learn/whats-new",
    "/learn/saved",
    "/learn/submit",
    "/learn/feed.xml",
    ...libraryCategories.map((category) => `/learn/category/${category.slug}`),
    ...libraryEntries.map((entry) => `/learn/library/${entry.slug}`),
    ...libraryTopicTeasers.map((topic) => `/learn/topics/${topic.slug}`),
    ...libraryRecipes.map((recipe) => `/learn/recipes/${recipe.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteMetadata.url}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route.startsWith("/demo/pqc") || route.startsWith("/q-day")
        ? "weekly"
        : "monthly",
    priority:
      route === "" ||
      route === "/platform" ||
      route === "/assess" ||
      route === "/demo/pqc" ||
      route === "/q-day"
        ? 1
        : route.startsWith("/solutions/") ||
            route === "/monitor" ||
            route === "/convert" ||
            route === "/pricing"
          ? 0.9
          : route === "/demo/hospital" ||
              route === "/demo/airline" ||
              route === "/demo/ev-fleet" ||
              route === "/technology"
            ? 0.5
            : 0.7,
  }));
}
