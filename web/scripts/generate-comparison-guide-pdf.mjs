import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "downloads");
const outPath = path.join(outDir, "qtangl-pqc-vendor-comparison.pdf");

const lines = [
  "Qtangl — PQC Vendor Comparison Guide",
  "",
  "Post-quantum readiness vendors compared (June 2026)",
  "",
  "Market category: Cryptographic Posture Management (CPM)",
  "Standard artifact: CycloneDX CBOM",
  "",
  "Qtangl differentiators:",
  "• Signed + publicly verifiable evidence (unique in landscape)",
  "• Mid-market self-serve with transparent pricing",
  "• Agentless external baseline in minutes",
  "• Mosca HNDL board-ready framing",
  "",
  "Tier A — Direct PQC platforms:",
  "SandboxAQ, Keyfactor, QuSecure, IBM Quantum Safe, Fortanix, Palo Alto",
  "",
  "Tier B — Pure-play twins:",
  "Qinsight, ExeQuantum, Encryption Consulting",
  "",
  "Tier C — CLM/PKI incumbents:",
  "DigiCert, AppViewX, Entrust, CyberArk/Venafi",
  "",
  "Also compared: Big 4 consulting, open source/DIY, spreadsheet status quo",
  "",
  "Full interactive matrix and per-vendor pages:",
  "https://www.qtangl.com/compare",
  "",
  "Run a free Q-Day scan: https://www.qtangl.com/assess",
  "Verify a report: https://www.qtangl.com/verify",
  "",
  "Comparison based on public vendor positioning. Confirm in your evaluation.",
];

async function main() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([612, 792]);
  let y = 750;
  const margin = 50;
  const size = 11;
  const titleSize = 16;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (y < 60) {
      page = doc.addPage([612, 792]);
      y = 750;
    }
    const isTitle = i === 0;
    page.drawText(line, {
      x: margin,
      y,
      size: isTitle ? titleSize : size,
      font: isTitle ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 512,
    });
    y -= isTitle ? 28 : line === "" ? 10 : 16;
  }

  await mkdir(outDir, { recursive: true });
  const bytes = await doc.save();
  await writeFile(outPath, bytes);
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
