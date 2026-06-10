/**
 * Build docs-corpus.md and qtangl-agent-bundle.zip for agent/GRC consumption.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const repoRoot = join(webRoot, "..");
const siteUrl = "https://qtangl.com";
const exportedAt = new Date().toISOString().slice(0, 10);

function parseNavSections(navSource) {
  const sections = [];
  const sectionRe =
    /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*items:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
  let match;
  while ((match = sectionRe.exec(navSource)) !== null) {
    const [, , title, itemsBlock] = match;
    const items = [];
    const itemRe = /\{\s*name:\s*"([^"]+)",\s*href:\s*"([^"]+)"/g;
    let itemMatch;
    while ((itemMatch = itemRe.exec(itemsBlock)) !== null) {
      items.push({ name: itemMatch[1], href: itemMatch[2] });
    }
    sections.push({ title, items });
  }
  return sections;
}

function parseEndpointSummaries(endpointsSource) {
  const entries = [];
  const blockRe = /"([a-zA-Z0-9_-]+)":\s*\{([\s\S]*?)\n  \},?\n/g;
  let match;
  while ((match = blockRe.exec(endpointsSource)) !== null) {
    const id = match[1];
    const block = match[2];
    const titleMatch = block.match(/title:\s*"([^"]+)"/);
    const summaryMatch = block.match(/summary:\s*\n?\s*"([^"]+)"/) ?? block.match(/summary:\s*"([^"]+)"/);
    const pathMatch = block.match(/path:\s*"([^"]+)"/);
    const methodMatch = block.match(/method:\s*"([^"]+)"/);
    if (!pathMatch) continue;
    entries.push({
      id,
      title: titleMatch?.[1] ?? id,
      summary: summaryMatch?.[1] ?? "",
      path: pathMatch[1],
      method: (methodMatch?.[1] ?? "GET").toUpperCase(),
    });
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

function readUtf8(relativePath) {
  return readFileSync(join(webRoot, relativePath), "utf8");
}

function readRepoUtf8(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i++) {
    crc = crc32Table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (~crc) >>> 0;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const dataBuffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const checksum = crc32(dataBuffer);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, dataBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + dataBuffer.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localBlob = Buffer.concat(localParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localBlob.length, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([localBlob, centralDirectory, endRecord]);
}

function sha256Hex(content) {
  return createHash("sha256").update(content).digest("hex");
}

const navSource = readUtf8("lib/docs/nav.ts");
const endpointFiles = [
  "lib/docs/endpoints.ts",
  "lib/docs/endpoints/tenant.ts",
  "lib/docs/endpoints/pqc-extended.ts",
  "lib/docs/endpoints/admin-public-health.ts",
];
const endpointsSource = endpointFiles.map((rel) => readUtf8(rel)).join("\n");
const sections = parseNavSections(navSource);
const endpoints = parseEndpointSummaries(endpointsSource);
const openapi = JSON.parse(readUtf8("public/openapi.json"));
const apiVersion = openapi.info?.version ?? "0.9.0";

const agentsMd = readUtf8("content/docs-export/AGENTS.md");
const verifySpec = readRepoUtf8("docs/verify-spec.md");

const schemaDir = join(webRoot, "lib/docs/contracts");
const schemaFiles = readdirSync(schemaDir).filter((name) => name.endsWith(".schema.json"));

const docIndexLines = sections.flatMap((section) => [
  `### ${section.title}`,
  ...section.items.map((item) => `- [${item.name}](${siteUrl}${item.href})`),
  "",
]);

const endpointLines = endpoints.map(
  (entry) =>
    `- **${entry.method} ${entry.path}** — ${entry.title}${entry.summary ? `: ${entry.summary}` : ""}`,
);

const schemaSections = schemaFiles.map((filename) => {
  const content = readFileSync(join(schemaDir, filename), "utf8");
  return `### ${filename}\n\n\`\`\`json\n${content.trim()}\n\`\`\`\n`;
});

const corpus = `# Qtangl Documentation Corpus

> Generated ${exportedAt} | API v${apiVersion} | ${siteUrl}/docs

${agentsMd.trim()}

---

## Documentation index

${docIndexLines.join("\n")}

---

## API endpoint summary

${endpointLines.join("\n")}

---

## JSON schemas (canonical contracts)

${schemaSections.join("\n")}

---

## Verify specification

${verifySpec.trim()}

---

## Bundled artifacts

| Artifact | URL |
|----------|-----|
| OpenAPI JSON | ${siteUrl}/openapi.json |
| Postman collection | ${siteUrl}/postman/qtangl-api.json |
| Agent bundle (zip) | ${siteUrl}/downloads/qtangl-agent-bundle.zip |
| Sample CBOM | ${siteUrl}/samples/sample-cbom-bank-tls-inventory.json |
| llms.txt index | ${siteUrl}/llms.txt |

Source: ${siteUrl}/downloads/docs-corpus.md
`;

const downloadsDir = join(webRoot, "public/downloads");
mkdirSync(downloadsDir, { recursive: true });

const corpusPath = join(downloadsDir, "docs-corpus.md");
writeFileSync(corpusPath, corpus, "utf8");
console.log(`Wrote ${corpusPath}`);

const bundleFiles = [
  { name: "AGENTS.md", data: agentsMd },
  { name: "docs-corpus.md", data: corpus },
  { name: "openapi.json", data: readUtf8("public/openapi.json") },
  { name: "postman/qtangl-api.json", data: readUtf8("public/postman/qtangl-api.json") },
  {
    name: "examples/sample-cbom-bank-tls-inventory.json",
    data: readUtf8("public/samples/sample-cbom-bank-tls-inventory.json"),
  },
  { name: "verify-spec.md", data: verifySpec },
];

for (const filename of schemaFiles) {
  bundleFiles.push({
    name: `schemas/${filename}`,
    data: readFileSync(join(schemaDir, filename), "utf8"),
  });
}

const manifest = {
  name: "qtangl-agent-bundle",
  version: apiVersion,
  generated: exportedAt,
  site: siteUrl,
  files: bundleFiles.map((file) => ({
    path: file.name,
    sha256: sha256Hex(file.data),
    bytes: Buffer.byteLength(file.data, "utf8"),
  })),
};

bundleFiles.push({
  name: "MANIFEST.json",
  data: `${JSON.stringify(manifest, null, 2)}\n`,
});

const zipBuffer = createZip(bundleFiles);
const zipPath = join(downloadsDir, "qtangl-agent-bundle.zip");
writeFileSync(zipPath, zipBuffer);
console.log(`Wrote ${zipPath} (${zipBuffer.length} bytes, ${bundleFiles.length} files)`);
