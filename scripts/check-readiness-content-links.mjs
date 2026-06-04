#!/usr/bin/env node
/**
 * Validates readiness blog registry entries have hubLink + ctaPrimary in frontmatter.
 * Validates framework registry slugs match frameworkGuides and markdown files exist.
 * Run: node scripts/check-readiness-content-links.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = join(root, "web", "lib", "copy", "readiness-content-registry.ts");
const frameworksPath = join(root, "web", "lib", "copy", "readiness-frameworks.ts");
const contentRoot = join(root, "web", "content", "readiness");

const registrySource = readFileSync(registryPath, "utf-8");
const frameworksSource = readFileSync(frameworksPath, "utf-8");

const frameworkBlock = registrySource.split("readinessFrameworkRegistry")[1]?.split("] as const")[0] ?? "";

const frameworkEntries = [
  ...frameworkBlock.matchAll(/\{\s*slug:\s*"([^"]+)",\s*markdownFile:\s*"frameworks\/([^"]+)"/g),
];

const frameworkRegistrySlugs = frameworkEntries.map((m) => m[1]);

const guidesBlock =
  frameworksSource.split("export const frameworkGuides")[1]?.split("};")[0] ?? "";

const frameworkGuideSlugs = [...guidesBlock.matchAll(/^  "?([a-z0-9.-]+)"?: \{/gm)].map(
  (m) => m[1],
);

let failed = false;

for (const [, slug, file] of frameworkEntries) {
  const fullPath = join(contentRoot, "frameworks", file);
  if (!existsSync(fullPath)) {
    console.error(`MISSING framework: frameworks/${file} (slug ${slug})`);
    failed = true;
  }
}

const blogFiles = [
  ...registrySource.matchAll(/markdownFile:\s*"blog\/([^"]+)"/g),
].map((m) => `blog/${m[1]}`);

for (const file of blogFiles) {
  const fullPath = join(contentRoot, file);
  if (!existsSync(fullPath)) {
    console.error(`MISSING blog: ${file}`);
    failed = true;
    continue;
  }
  const raw = readFileSync(fullPath, "utf-8");
  for (const field of ["hubLink", "ctaPrimary", "sourceIds", "title", "description"]) {
    if (!raw.includes(`${field}:`)) {
      console.error(`${file}: missing frontmatter field ${field}`);
      failed = true;
    }
  }
}

for (const slug of frameworkRegistrySlugs) {
  if (!frameworkGuideSlugs.includes(slug)) {
    console.error(`Framework registry slug "${slug}" missing from readiness-frameworks.ts`);
    failed = true;
  }
}

for (const slug of frameworkGuideSlugs) {
  if (!frameworkRegistrySlugs.includes(slug)) {
    console.error(`Framework guide "${slug}" missing from readinessFrameworkRegistry`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`OK: ${blogFiles.length} blogs, ${frameworkRegistrySlugs.length} frameworks validated.`);
