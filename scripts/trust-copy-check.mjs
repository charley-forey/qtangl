#!/usr/bin/env node
/**
 * Trust copy consistency gate — contacts, SLAs, security.txt expiry.
 * Run: node scripts/trust-copy-check.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const issues = [];

const trustTsPath = join(root, "web/lib/copy/trust.ts");
const trustTs = readFileSync(trustTsPath, "utf8");
const primaryMatch = trustTs.match(/primaryContactEmail\s*=\s*"([^"]+)"/);
const primaryEmail = primaryMatch?.[1] ?? "charley@qtangl.com";
const ackDaysMatch = trustTs.match(/disclosureAckSlaBusinessDays\s*=\s*(\d+)/);
const ackDays = ackDaysMatch ? Number(ackDaysMatch[1]) : 2;

const securityTxtPath = join(root, "web/public/.well-known/security.txt");
const securityTxt = readFileSync(securityTxtPath, "utf8");

// security.txt must use primary contact
if (securityTxt.includes("security@qtangl.com") && primaryEmail === "charley@qtangl.com") {
  issues.push("security.txt still references security@ but trust.ts primary is charley@");
}
if (!securityTxt.includes(primaryEmail)) {
  issues.push(`security.txt missing Contact for ${primaryEmail}`);
}

const expiresMatch = securityTxt.match(/Expires:\s*(.+)/);
if (expiresMatch) {
  const expires = new Date(expiresMatch[1].trim());
  const warnMs = 30 * 24 * 60 * 60 * 1000;
  if (expires.getTime() - Date.now() < warnMs) {
    issues.push(`security.txt Expires within 30 days: ${expiresMatch[1].trim()}`);
  }
}

// Ack SLA: flag "3 business days" in trust-facing paths when canonical is 2
const trustPaths = [
  "web/app/trust",
  "web/app/docs/trust",
  "web/public/.well-known/security.txt",
];
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|txt|md)$/.test(name)) acc.push(p);
  }
  return acc;
}
for (const base of trustPaths.map((p) => join(root, p))) {
  try {
    const files = statSync(base).isDirectory() ? walk(base) : [base];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      if (content.includes("3 business days") && ackDays === 2) {
        issues.push(`${relative(root, file)}: uses "3 business days" but trust.ts SLA is ${ackDays}`);
      }
    }
  } catch {
    /* path optional */
  }
}

// Banned SOC 2 claims outside trust.ts (marketing must stay honest)
const soc2Forbidden = ["SOC 2 certified", "SOC 2 compliant"];
const scanDirs = ["web/app", "web/lib/copy"];
for (const dir of scanDirs) {
  walk(join(root, dir)).forEach((file) => {
    if (file.includes("trust.ts")) return;
    const content = readFileSync(file, "utf8");
    for (const phrase of soc2Forbidden) {
      if (content.includes(phrase)) {
        issues.push(`${relative(root, file)}: forbidden phrase "${phrase}"`);
      }
    }
  });
}

// Dogfood honesty: if dogfoodLiveEnabled false, widget must not claim daily live scans
if (trustTs.includes("dogfoodLiveEnabled = false")) {
  const widget = readFileSync(join(root, "web/components/trust/TrustDogfoodSelfScan.tsx"), "utf8");
  if (/daily live scans of qtangl\.com/i.test(widget)) {
    issues.push("TrustDogfoodSelfScan claims daily live scans but dogfoodLiveEnabled is false");
  }
}

if (issues.length) {
  console.error("Trust copy issues:\n" + issues.map((i) => `  - ${i}`).join("\n"));
  process.exit(1);
}
console.log("Trust copy check passed.");
