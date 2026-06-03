import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

import type {
  LoadedReadinessContent,
  ReadinessContentFrontmatter,
  ReadinessContentKind,
} from "@/lib/readiness-content-types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "readiness");

function parseYamlValue(raw: string): string | string[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return inner.split(",").map((item) => item.trim().replace(/^["']|["']$/g, ""));
  }
  return trimmed.replace(/^["']|["']$/g, "");
}

export function parseFrontmatter(source: string): {
  data: Record<string, string | string[]>;
  content: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Markdown file must start with YAML frontmatter delimited by ---");
  }

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1);
    data[key] = parseYamlValue(value);
  }

  return { data, content: match[2].trim() };
}

function requireString(data: Record<string, string | string[]>, key: string): string {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Frontmatter missing required string field: ${key}`);
  }
  return value.trim();
}

function requireStringArray(data: Record<string, string | string[]>, key: string): string[] {
  const value = data[key];
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  throw new Error(`Frontmatter missing required array field: ${key}`);
}

function toFrontmatter(data: Record<string, string | string[]>): ReadinessContentFrontmatter {
  const optionalString = (key: string) => {
    const value = data[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    title: requireString(data, "title"),
    description: requireString(data, "description"),
    keyword: requireString(data, "keyword"),
    journeyStage: requireString(data, "journeyStage") as ReadinessContentFrontmatter["journeyStage"],
    hubLink: requireString(data, "hubLink"),
    hubLabel: requireString(data, "hubLabel"),
    ctaPrimary: requireString(data, "ctaPrimary"),
    datePublished: requireString(data, "datePublished"),
    eyebrow: requireString(data, "eyebrow"),
    intro: requireString(data, "intro"),
    sourceIds: requireStringArray(data, "sourceIds"),
    videoId: optionalString("videoId"),
    videoTitle: optionalString("videoTitle"),
  };
}

async function readMarkdownFile(relativePath: string): Promise<{ frontmatter: ReadinessContentFrontmatter; body: string }> {
  const filePath = path.join(CONTENT_ROOT, relativePath);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = parseFrontmatter(raw);
  return { frontmatter: toFrontmatter(data), body: content };
}

export const loadReadinessMarkdown = cache(
  async (kind: ReadinessContentKind, slug: string, markdownFile: string): Promise<LoadedReadinessContent> => {
    const { frontmatter, body } = await readMarkdownFile(markdownFile);
    return {
      slug,
      kind,
      markdownBody: body,
      ...frontmatter,
    };
  },
);

export async function readinessMarkdownExists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(CONTENT_ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}
