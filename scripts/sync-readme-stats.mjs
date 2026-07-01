#!/usr/bin/env node
/**
 * Verify (and optionally update) auto-generated stats in README.md.
 * Run: node scripts/sync-readme-stats.mjs
 * Write: node scripts/sync-readme-stats.mjs --write
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = join(root, "README.md");
const mainPy = join(root, "backend", "app", "main.py");
const writeMode = process.argv.includes("--write");

const START = "<!-- AUTO-STATS:START -->";
const END = "<!-- AUTO-STATS:END -->";

function countFiles(dir, suffix) {
  let count = 0;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) count += countFiles(full, suffix);
      else if (entry.name.endsWith(suffix)) count += 1;
    }
  } catch {
    /* missing */
  }
  return count;
}

function extractVersion(source) {
  const m = source.match(/version\s*=\s*["']([^"']+)["']/);
  if (!m) throw new Error("Could not parse version from backend/app/main.py");
  return m[1];
}

function buildStatsBlock({ version, backendTests, e2eTests, alembicVersions }) {
  const today = new Date().toISOString().slice(0, 10);
  return `${START}
| Metric | Value |
|--------|-------|
| **API version** | \`${version}\` (from \`backend/app/main.py\`) |
| **Backend test modules** | ~${backendTests} |
| **Playwright E2E specs** | ~${e2eTests} |
| **Alembic migrations** | ${alembicVersions}+ |
| **Stats refreshed** | ${today} |

_Run \`node scripts/sync-readme-stats.mjs --write\` to refresh this block._
${END}`;
}

const mainSource = readFileSync(mainPy, "utf8");
const version = extractVersion(mainSource);
const backendTests = countFiles(join(root, "backend", "tests"), ".py");
const e2eTests = countFiles(join(root, "web", "tests", "e2e"), ".ts");
const alembicVersions = countFiles(join(root, "backend", "alembic", "versions"), ".py");

const statsBlock = buildStatsBlock({ version, backendTests, e2eTests, alembicVersions });
let readme = readFileSync(readmePath, "utf8");

if (!readme.includes(START) || !readme.includes(END)) {
  console.error("README.md missing AUTO-STATS markers");
  process.exit(1);
}

const errors = [];

const versionBadgePattern = /!\[API version\]\(https:\/\/img\.shields\.io\/badge\/API%20version-[^)]+\)/;
if (!versionBadgePattern.test(readme)) {
  errors.push("README.md missing API version shields.io badge");
} else {
  const badgeMatch = readme.match(/API%20version-([\d.]+)-/);
  if (badgeMatch && badgeMatch[1] !== version) {
    errors.push(`README badge version ${badgeMatch[1]} != main.py version ${version}`);
  }
}

if (!readme.includes(`\`${version}\``)) {
  errors.push(`README.md missing API version ${version} in metadata table`);
}

const existingBlock = readme.match(new RegExp(`${START}[\\s\\S]*?${END}`))?.[0] ?? "";
if (existingBlock !== statsBlock) {
  if (writeMode) {
    readme = readme.replace(new RegExp(`${START}[\\s\\S]*?${END}`), statsBlock);
    readme = readme.replace(
      /!\[API version\]\(https:\/\/img\.shields\.io\/badge\/API%20version-[\d.]+-blue\)/,
      `![API version](https://img.shields.io/badge/API%20version-${version}-blue)`,
    );
    writeFileSync(readmePath, readme, "utf8");
    console.log(`Updated README auto-stats — API v${version}`);
  } else {
    errors.push("AUTO-STATS block is stale (run with --write to update)");
  }
}

if (errors.length) {
  console.error("README stats check failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `README stats OK — API v${version}, ~${backendTests} backend tests, ~${e2eTests} E2E specs`,
);
