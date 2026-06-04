#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, and other participating engines).
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs --priority
 *   node scripts/submit-indexnow.mjs --sitemap
 *   node scripts/submit-indexnow.mjs --urls https://qtangl.com/assess,https://qtangl.com/q-day
 *
 * Env:
 *   SITE_URL      Origin, default https://qtangl.com
 *   INDEXNOW_KEY  Override key (default matches web/public/{key}.txt)
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = (process.env.SITE_URL ?? "https://qtangl.com").replace(/\/$/, "");
const siteHost = new URL(siteOrigin).host;
const defaultKey = "445fb84b6a2047b68ba52b7ead7c1b18";
const key = process.env.INDEXNOW_KEY ?? defaultKey;
const keyLocation = `${siteOrigin}/${key}.txt`;

const priorityPaths = [
  "/",
  "/platform",
  "/assess",
  "/assess/mini",
  "/monitor",
  "/convert",
  "/pricing",
  "/q-day",
  "/q-day/checklist",
  "/q-day/sample-report",
  "/q-day/briefing",
  "/q-day/what-is-q-day",
  "/q-day/hndl",
  "/q-day/deadlines",
  "/q-day/frameworks/nsm-10",
  "/q-day/frameworks/cmmc",
  "/q-day/frameworks/hipaa-hndl",
  "/q-day/frameworks/pci-dss-4",
  "/q-day/frameworks/ml-kem",
  "/q-day/frameworks/nist-ir-8547",
  "/q-day/frameworks/cnsa-2.0",
  "/q-day/frameworks/eu-cra",
  "/blog",
  "/blog/q-day-readiness",
  "/blog/q-day-readiness-90-day-playbook",
  "/blog/spreadsheet-crypto-inventory-wrong",
  "/blog/mosca-inequality-for-cisos",
  "/blog/cmmc-crypto-inventory-evidence",
  "/access",
];

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const urlsArg = argv.find((arg) => arg.startsWith("--urls="));
  return {
    priority: flags.has("--priority"),
    sitemap: flags.has("--sitemap"),
    customUrls: urlsArg ? urlsArg.slice("--urls=".length).split(",").map((u) => u.trim()).filter(Boolean) : [],
  };
}

function verifyKeyFile() {
  const keyPath = join(root, "web", "public", `${key}.txt`);
  if (!existsSync(keyPath)) {
    console.error(`Missing key file: web/public/${key}.txt`);
    process.exit(1);
  }
  const contents = readFileSync(keyPath, "utf-8").trim();
  if (contents !== key) {
    console.error(`Key file contents do not match INDEXNOW_KEY (${keyPath}).`);
    process.exit(1);
  }
}

async function fetchSitemapUrls() {
  const response = await fetch(`${siteOrigin}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap (${response.status}): ${siteOrigin}/sitemap.xml`);
  }
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  if (urls.length === 0) {
    throw new Error("No URLs found in sitemap.xml");
  }
  return urls;
}

function toAbsoluteUrls(paths) {
  return paths.map((path) => (path === "/" ? siteOrigin : `${siteOrigin}${path}`));
}

async function submitUrls(urlList) {
  const uniqueUrls = [...new Set(urlList)].filter((url) => {
    try {
      return new URL(url).host === siteHost;
    } catch {
      return false;
    }
  });

  if (uniqueUrls.length === 0) {
    console.error("No valid URLs to submit.");
    process.exit(1);
  }

  const payload = {
    host: siteHost,
    key,
    keyLocation,
    urlList: uniqueUrls,
  };

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  if (response.status === 200 || response.status === 202) {
    console.log(`IndexNow accepted ${uniqueUrls.length} URL(s) (${response.status}).`);
    console.log(`Key location: ${keyLocation}`);
    return;
  }

  console.error(`IndexNow failed (${response.status}): ${body || response.statusText}`);
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  verifyKeyFile();

  let urls;
  if (args.customUrls.length > 0) {
    urls = args.customUrls;
  } else if (args.sitemap) {
    urls = await fetchSitemapUrls();
  } else {
    urls = toAbsoluteUrls(priorityPaths);
  }

  console.log(`Submitting ${urls.length} URL(s) for ${siteHost}...`);
  await submitUrls(urls);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
