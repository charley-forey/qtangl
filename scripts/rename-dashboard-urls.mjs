#!/usr/bin/env node
/**
 * One-off: rename frontend page URLs /dashboard -> /command-center.
 * Skips /api/dashboard and /tenant/dashboard API paths.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIRS = ["web", "backend", "sdk/typescript/tests"];

const REPLACEMENTS = [
  [/href="\/dashboard/g, 'href="/command-center'],
  [/href='\/dashboard/g, "href='/command-center"],
  [/goto\("\/dashboard/g, 'goto("/command-center'],
  [/redirect\("\/dashboard/g, 'redirect("/command-center'],
  [/"\/dashboard\/login"/g, '"/command-center/login"'],
  [/'\/dashboard\/login'/g, "'/command-center/login'"],
  [/window\.location\.href = "\/dashboard/g, 'window.location.href = "/command-center'],
  [/basePath="\/dashboard"/g, 'basePath="/command-center"'],
  [/path: "\/dashboard"/g, 'path: "/command-center"'],
  [/returnPathname: "\/dashboard/g, 'returnPathname: "/command-center'],
  [/`\/dashboard\?/g, "`/command-center?"],
  [/"\/dashboard\?/g, '"/command-center?'],
  [/deep_link="\/dashboard/g, 'deep_link="/command-center'],
  [/deepLink: "\/dashboard/g, 'deepLink: "/command-center'],
  [/upgradeUrl: "\/dashboard/g, 'upgradeUrl: "/command-center'],
  [/"\{base\}\/dashboard"/g, '"{base}/command-center"'],
  [/f"\{base\}\/dashboard"/g, 'f"{base}/command-center"'],
  [/dashboard_url=f"\{base\}\/dashboard"/g, 'dashboard_url=f"{base}/command-center"'],
  [/report_url=f"\{base\}\/dashboard"/g, 'report_url=f"{base}/command-center"'],
  [/evidence_zip_url=f"\{base\}\/dashboard"/g, 'evidence_zip_url=f"{base}/command-center"'],
  [/startsWith\("\/dashboard"\)/g, 'startsWith("/command-center")'],
  [/page\.goto\("\/dashboard/g, 'page.goto("/command-center'],
  [/Location: "\/dashboard/g, 'Location: "/command-center'],
  [/deepLink: '\/dashboard/g, "deepLink: '/command-center"],
  [/\/dashboard#/g, "/command-center#"],
  [/href: "\/dashboard"/g, 'href: "/command-center"'],
  [/href: '\/dashboard'/g, "href: '/command-center'"],
  [/"\{siteMetadata\.url\}\/dashboard"/g, '"{siteMetadata.url}/command-center"'],
  [/https:\/\/www\.qtangl\.com\/dashboard/g, "https://www.qtangl.com/command-center"],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next" || ent.name === "generated") continue;
      walk(p, files);
    } else if (/\.(ts|tsx|mjs|py|md)$/.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

let changed = 0;
for (const dir of DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    let text = fs.readFileSync(file, "utf8");
    const orig = text;
    for (const [re, rep] of REPLACEMENTS) {
      text = text.replace(re, rep);
    }
    if (text !== orig) {
      fs.writeFileSync(file, text);
      changed++;
      console.log("updated:", path.relative(ROOT, file));
    }
  }
}
console.log(`Done. ${changed} files updated.`);
