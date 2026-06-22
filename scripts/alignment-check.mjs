#!/usr/bin/env node
/**
 * Marketing alignment gate: tier liveToday footnotes and coverage matrix vs shipped capabilities.
 * Run: node scripts/alignment-check.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pricingPath = join(root, "web/lib/copy/readiness-pricing.ts");
const coveragePath = join(root, "web/lib/copy/readiness-coverage.ts");
const capabilitiesPath = join(root, "scripts/shipped-capabilities.json");

const pricing = readFileSync(pricingPath, "utf8");
const coverage = readFileSync(coveragePath, "utf8");
const shipped = JSON.parse(readFileSync(capabilitiesPath, "utf8"));

const issues = [];

/** Extract liveToday string arrays from readiness-pricing.ts */
function extractTierLiveToday(source) {
  const tiers = [];
  const tierBlocks = source.matchAll(
    /name:\s*"([^"]+)"[\s\S]*?liveToday:\s*\[([\s\S]*?)\]/g
  );
  for (const match of tierBlocks) {
    const name = match[1];
    const items = [...match[2].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    tiers.push({ name, items });
  }
  return tiers;
}

/** Extract coverage rows with status from readiness-coverage.ts */
function extractCoverageRows(source) {
  const rows = [];
  const blocks = source.matchAll(
    /name:\s*"([^"]+)"[\s\S]*?status:\s*"(live|beta|roadmap)"/g
  );
  for (const match of blocks) {
    rows.push({ name: match[1], status: match[2] });
  }
  return rows;
}

const tierLiveToday = extractTierLiveToday(pricing);
const coverageRows = extractCoverageRows(coverage);

// Validate tier liveToday matches shipped-capabilities.json registry
for (const [tierName, expectedItems] of Object.entries(shipped.tierLiveToday)) {
  const found = tierLiveToday.find((t) => t.name === tierName);
  if (!found) {
    issues.push(`Missing pricing tier "${tierName}" with liveToday footnote`);
    continue;
  }
  const expectedSet = new Set(expectedItems);
  const foundSet = new Set(found.items);
  for (const item of expectedItems) {
    if (!foundSet.has(item)) {
      issues.push(`Tier "${tierName}" missing liveToday item: "${item}"`);
    }
  }
  for (const item of found.items) {
    if (!expectedSet.has(item)) {
      issues.push(
        `Tier "${tierName}" has undocumented liveToday item "${item}" — update scripts/shipped-capabilities.json`
      );
    }
  }
}

// Coverage matrix must use status labels (not liveToday booleans)
if (!coverage.includes('status: "live"') && !coverage.includes("status: \"live\"")) {
  issues.push("readiness-coverage.ts missing status: live rows");
}
for (const row of coverageRows) {
  if (!["live", "beta", "roadmap"].includes(row.status)) {
    issues.push(`Coverage row "${row.name}" has invalid status "${row.status}"`);
  }
}

// Coverage row status must match shipped-capabilities registry when mapped
const coverageByName = new Map(coverageRows.map((row) => [row.name, row.status]));
for (const cap of Object.values(shipped.capabilities)) {
  const rowName = cap.coverageRow;
  if (!rowName) continue;
  const coverageStatus = coverageByName.get(rowName);
  if (!coverageStatus) {
    issues.push(`Coverage matrix missing row for capability "${rowName}"`);
    continue;
  }
  if (coverageStatus !== cap.status) {
    issues.push(
      `Coverage row "${rowName}" is "${coverageStatus}" but shipped-capabilities.json expects "${cap.status}"`
    );
  }
}

// Beta rows must not claim "PAT required" full repo scan without snippet caveat
if (
  coverage.includes("Repository scan for weak crypto patterns (PAT required)") &&
  !coverage.includes("snippet") &&
  !coverage.includes("dependency")
) {
  issues.push(
    'GitHub coverage row overclaims PAT repo scan — use snippet/dependency language until full scan ships'
  );
}

// Banned phrases across pricing + coverage
const scanSources = [pricing, coverage];
for (const phrase of shipped.bannedPhrases) {
  for (const source of scanSources) {
    if (source.includes(phrase)) {
      issues.push(`Banned marketing phrase found: "${phrase}"`);
    }
  }
}

// Pricing must include core tiers
for (const tier of ["Assess", "Monitor", "Convert", "Enterprise"]) {
  if (!pricing.includes(tier)) {
    issues.push(`readiness-pricing.ts missing ${tier} tier reference`);
  }
}

console.log(`Tiers with liveToday footnotes: ${tierLiveToday.length}`);
console.log(`Coverage rows: ${coverageRows.length}`);

if (issues.length) {
  console.error("Alignment issues:\n" + issues.map((i) => `  - ${i}`).join("\n"));
  process.exit(1);
}
console.log("Alignment check passed.");
