#!/usr/bin/env node
import fs from "fs";
import path from "path";

const STALE_DAYS = 180;
const editorialPath = path.join(process.cwd(), "web", "lib", "copy", "library-editorial.ts");
const entriesDir = path.join(process.cwd(), "web", "content", "library", "entries");

const editorialText = fs.readFileSync(editorialPath, "utf8");
const slugs = [...editorialText.matchAll(/"([a-z0-9-]+)":\s*\{/g)].map((m) => m[1]);
const verifiedMatches = [...editorialText.matchAll(/lastVerifiedAt:\s*"([^"]+)"/g)];
const verifiedDates = verifiedMatches.map((m) => m[1]);

const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
const entryFiles = fs.readdirSync(entriesDir).filter((f) => f.endsWith(".json"));

let stale = 0;
let missing = 0;

for (const file of entryFiles) {
  const slug = file.replace(/\.json$/, "");
  if (!slugs.includes(slug)) {
    missing += 1;
    console.log(`MISSING EDITORIAL: ${slug}`);
    continue;
  }
}

for (const date of verifiedDates) {
  if (new Date(date).getTime() < cutoff) {
    stale += 1;
    console.log(`STALE VERIFIED: ${date}`);
  }
}

console.log(`\nEntries: ${entryFiles.length}, hand editorial: ${slugs.length}, missing: ${missing}, stale verified: ${stale}`);
