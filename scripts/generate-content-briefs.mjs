#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "roadmap/quantum-readiness/content-briefs");
mkdirSync(dir, { recursive: true });

const briefs = [
  ["video-companion-shors-algorithm-minutephysics", "Shor minutephysics companion", "lvTqbM5Dq4Q", "video-minutephysics-shor, postquantum-shor-article, nist-pqc-overview, pennylane-period-finding", "/q-day/what-is-q-day"],
  ["video-companion-quantum-power-veritasium", "Veritasium PQC companion", "-UrdExQW0cs", "video-veritasium-quantum-power, nist-pqc-overview, nsm-10, google-2029-ars", "/q-day/deadlines"],
  ["video-companion-pbs-shor-period-finding", "PBS Shor companion", "wUwZZaI5u0c", "video-pbs-shor, video-minutephysics-shor, postquantum-shor-article, nist-pqc-overview", "/q-day/what-is-q-day"],
  ["video-companion-physics-world-shor", "Physics World Shor companion", "hOlOY7NyMfs", "video-physics-world-shor, nist-pqc-overview, fips-203, nist-ir-8547", "/q-day/what-is-q-day"],
  ["video-companion-dustin-moody-nist-strategy", "Dustin Moody companion", "-_QiWSTud7I", "video-dustin-moody-nist, nist-ir-8547, nccoe-migration-pqc, cisa-pqc-initiative", "/q-day/deadlines"],
  ["video-companion-nist-pqc-update-rwpqc-2026", "RWPQC 2026 companion", "pbPoUE7MmQw", "video-rwpqc-nist-2026, fips-203, fips-204, fips-205, nist-ir-8547", "/q-day/frameworks/ml-kem"],
  ["video-companion-mosca-intel-quantum-security", "Mosca lecture companion", "vWP4LF2hz80", "video-mosca-public-lecture, mosca-inequality, postquantum-hndl-article, nist-pqc-overview", "/q-day/mosca-inequality"],
  ["video-companion-root-causes-moody-pqc", "Root Causes Moody companion", "-_QiWSTud7I", "video-root-causes-moody-pqc, video-dustin-moody-nist, nist-pqc-overview, fips-204, fips-205", "/q-day/frameworks/ml-kem"],
  ["video-companion-cloudflare-pq-roadmap", "Cloudflare PQ companion", "pbPoUE7MmQw", "cloudflare-pq-roadmap, fips-203, nist-ir-8547, big-tech-q-day-ars", "/q-day/deadlines"],
  ["video-companion-cisa-quantum-readiness", "CISA PQC companion", "z85LaInxjrg", "cisa-pqc-initiative, cisa-quantum-readiness-factsheet, nsm-10, nsa-cnsa-2", "/q-day/deadlines"],
  ["video-companion-kyber-dilithium-menezes", "Menezes Kyber companion", "9NKm84vKALc", "video-menezes-kyber-dilithium, cryptography101-kyber-dilithium, fips-203, fips-204, video-pq-algorithms", "/q-day/frameworks/ml-kem"],
  ["video-companion-open-quantum-safe-liboqs", "OQS liboqs companion", "9NKm84vKALc", "open-quantum-safe, ibm-quantum-safe-openssl, fips-203, video-pq-algorithms, video-menezes-kyber-dilithium", "/learn/topics/post-quantum-crypto-libraries"],
  ["shors-algorithm-explained-for-cisos", "Shor for CISOs pillar", "lvTqbM5Dq4Q", "video-minutephysics-shor, postquantum-shor-article, nist-pqc-overview, ibm-shor-tutorial, pennylane-period-finding", "/q-day/what-is-q-day"],
  ["grovers-algorithm-and-aes", "Grover AES pillar", "-UrdExQW0cs", "video-veritasium-quantum-power, nist-pqc-overview, fips-203, postquantum-shor-article", "/q-day/what-is-q-day"],
  ["qkd-vs-post-quantum-cryptography", "QKD vs PQC pillar", "CJqJCpSxadE", "nist-pqc-overview, cisa-pqc-initiative, cisa-quantum-readiness-factsheet, nccoe-migration-pqc, nist-pqc-videos", "/q-day/what-is-q-day"],
  ["mosca-inequality-worked-examples", "Mosca examples pillar", "vWP4LF2hz80", "mosca-inequality, postquantum-hndl-article, gqi-q-day-summary, nist-pqc-overview, video-mosca-public-lecture", "/q-day/mosca-inequality"],
  ["nist-fips-203-204-205-primer", "FIPS primer pillar", "3lCLvfv-XoY", "fips-203, fips-204, fips-205, nist-pqc-overview, nist-ir-8547, video-pq-algorithms", "/q-day/frameworks/ml-kem"],
  ["hybrid-tls-migration-guide", "Hybrid TLS pillar", "pbPoUE7MmQw", "fips-203, cloudflare-pq-roadmap, nist-ir-8547, open-quantum-safe, video-rwpqc-nist-2026", "/q-day/hybrid-tls"],
  ["hndl-collection-vectors-deep-dive", "HNDL vectors pillar", "u4mVljNQnBw", "video-jeremy-allison-hndl, unit42-exfil-timeline, palo-alto-q-day, postquantum-hndl-article, cisa-pqc-initiative", "/q-day/hndl"],
  ["crypto-attack-surface-map", "Attack surface pillar", "-UrdExQW0cs", "nist-ir-8547, nist-pqc-overview, palo-alto-q-day, nccoe-migration-pqc, video-veritasium-quantum-power", "/q-day/cbom"],
  ["pqc-migration-phases-explained", "Migration phases pillar", "-_QiWSTud7I", "nist-ir-8547, nsm-10, nsa-cnsa-2, video-dustin-moody-nist, cisa-quantum-readiness-factsheet", "/q-day/deadlines"],
  ["learning-quantum-crypto-4-week-path", "4-week path index", "lvTqbM5Dq4Q", "video-minutephysics-shor, video-veritasium-quantum-power, mosca-inequality, fips-203, nist-ir-8547, cisa-pqc-initiative, open-quantum-safe, nist-pqc-overview", "/learn/topics/quantum-crypto-foundations"],
];

let index = "# Content briefs index\n\n| Slug | videoId | sourceIds | hubLink |\n|------|---------|-------------|---------|\n";

for (const [slug, title, vid, sources, hub] of briefs) {
  const kind = slug.startsWith("video-companion") ? "video-companion" : "blog";
  const body = `# Content brief: ${title}

| Field | Value |
|-------|-------|
| **Slug** | ${slug} |
| **videoId** | ${vid} |
| **sourceIds** | ${sources} |
| **hubLink** | ${hub} |
| **Kind** | ${kind} |
| **Journey** | assess |

## Inline links to cite

- https://www.nist.gov/pqc
- https://csrc.nist.gov/pubs/ir/8547/final
- https://www.cisa.gov/topics/risk-management/quantum

## Review gates

- [ ] videoId + 4+ sourceIds
- [ ] Registered in readiness-content-registry.ts
- [ ] check:readiness-content passes
`;
  writeFileSync(join(dir, `${slug}.md`), body);
  index += `| ${slug} | ${vid} | ${sources.split(", ").length} sources | ${hub} |\n`;
}

writeFileSync(join(dir, "README.md"), index);
console.log(`Wrote ${briefs.length} briefs to ${dir}`);
