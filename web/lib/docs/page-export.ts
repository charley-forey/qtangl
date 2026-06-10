import { siteMetadata } from "@/lib/copy/product";

export type DocsExportMeta = {
  title: string;
  description: string;
  pathname: string;
  lastUpdated?: string;
};

function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (tag === "button" || element.getAttribute("aria-hidden") === "true") {
    return "";
  }

  if (tag === "a") {
    const href = element.getAttribute("href") ?? "";
    const label = Array.from(element.childNodes).map(inlineText).join("").trim();
    if (!label) return "";
    if (href.startsWith("/") || href.startsWith("http")) {
      const url = href.startsWith("/") ? `${siteMetadata.url}${href}` : href;
      return `[${label}](${url})`;
    }
    return label;
  }

  if (tag === "code") {
    const text = element.textContent ?? "";
    return text.includes("\n") ? `\n\`\`\`\n${text}\n\`\`\`\n` : `\`${text}\``;
  }

  if (tag === "br") {
    return "\n";
  }

  return Array.from(element.childNodes).map(inlineText).join("");
}

function blockFromElement(element: HTMLElement): string | null {
  const tag = element.tagName.toLowerCase();

  if (tag === "button" || element.classList.contains("docs-page-actions")) {
    return null;
  }

  if (tag === "h2") {
    return `## ${element.textContent?.trim() ?? ""}\n`;
  }

  if (tag === "h3") {
    return `### ${element.textContent?.trim() ?? ""}\n`;
  }

  if (tag === "p") {
    const text = inlineText(element).trim();
    return text ? `${text}\n` : null;
  }

  if (tag === "ul") {
    const items = Array.from(element.querySelectorAll(":scope > li"))
      .map((li) => `- ${inlineText(li).trim()}`)
      .filter(Boolean);
    return items.length ? `${items.join("\n")}\n` : null;
  }

  if (tag === "ol") {
    const items = Array.from(element.querySelectorAll(":scope > li")).map(
      (li, index) => `${index + 1}. ${inlineText(li).trim()}`,
    );
    return items.length ? `${items.join("\n")}\n` : null;
  }

  if (tag === "pre") {
    const code = element.textContent ?? "";
    return `\`\`\`\n${code.trimEnd()}\n\`\`\`\n`;
  }

  if (tag === "aside") {
    const label =
      element.querySelector(".text-label")?.textContent?.trim() ?? "Note";
    const body = Array.from(element.childNodes)
      .filter(
        (node) =>
          node.nodeType !== Node.ELEMENT_NODE ||
          !(node as HTMLElement).classList.contains("text-label"),
      )
      .map((node) => inlineText(node).trim())
      .join("\n")
      .trim();
    return body ? `> **${label}:** ${body}\n` : null;
  }

  if (tag === "table") {
    const rows = Array.from(element.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("th, td"))
        .map((cell) => inlineText(cell).trim())
        .join(" | "),
    );
    if (!rows.length) return null;
    const [header, ...body] = rows;
    const divider = header.split(" | ").map(() => "---").join(" | ");
    return `${header}\n${divider}\n${body.join("\n")}\n`;
  }

  if (element.classList.contains("docs-section") || element.classList.contains("docs-content")) {
    return Array.from(element.children)
      .map((child) => blockFromElement(child as HTMLElement))
      .filter(Boolean)
      .join("\n");
  }

  const nested = Array.from(element.children)
    .map((child) => blockFromElement(child as HTMLElement))
    .filter(Boolean)
    .join("\n");
  if (nested) return nested;

  const text = inlineText(element).trim();
  return text ? `${text}\n` : null;
}

export function docsContentToMarkdown(root: HTMLElement, meta: DocsExportMeta): string {
  const exportedAt = new Date().toISOString().slice(0, 10);
  const sourceUrl = `${siteMetadata.url}${meta.pathname}`;
  const frontmatter = [
    "---",
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `description: "${meta.description.replace(/"/g, '\\"')}"`,
    `source: ${sourceUrl}`,
    meta.lastUpdated ? `last_updated: ${meta.lastUpdated}` : null,
    `exported: ${exportedAt}`,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const body =
    blockFromElement(root)?.trim() ??
    Array.from(root.querySelectorAll("h2, h3, p, ul, ol, pre, aside, table"))
      .map((node) => blockFromElement(node as HTMLElement))
      .filter(Boolean)
      .join("\n");

  return `${frontmatter}# ${meta.title}\n\n${meta.description}\n\n${body}\n\n---\n\nSource: ${sourceUrl}\n`;
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^---[\s\S]*?---\n/m, "")
    .replace(/^#+ /gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, "").trim())
    .replace(/^> /gm, "")
    .replace(/\| --- \|/g, "")
    .replace(/\|/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function slugifyExportFilename(pathname: string): string {
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\//g, "-") || "index";
  return slug.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
