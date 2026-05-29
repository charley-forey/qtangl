"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type LibraryReadmeProps = {
  markdown: string;
  owner: string;
  name: string;
  branch: string;
  repoUrl: string;
};

function rewriteImageUrl(
  src: string,
  owner: string,
  name: string,
  branch: string
): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  const cleaned = src.replace(/^\.\//, "").replace(/^\//, "");
  return `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${cleaned}`;
}

/** Drop broken badge fragments left after README header stripping. */
function cleanReadmeMarkdown(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return true;
      }
      if (/^\[!\[[^\]]*$/.test(trimmed)) {
        return false;
      }
      if (/^\[!\[.*\]\($/.test(trimmed)) {
        return false;
      }
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function estimateReadLength(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
}

export default function LibraryReadme({
  markdown,
  owner,
  name,
  branch,
  repoUrl,
}: LibraryReadmeProps) {
  const [expanded, setExpanded] = useState(false);
  const cleaned = useMemo(() => cleanReadmeMarkdown(markdown), [markdown]);
  const { words, minutes } = useMemo(() => estimateReadLength(cleaned), [cleaned]);
  const isLong = cleaned.length > 2400 || cleaned.split("\n").length > 40;

  const githubReadmeUrl = `${repoUrl}/blob/${branch}/README.md`;

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-gray-400)]">
        <span>
          ~{words.toLocaleString()} words · about {minutes} min read
        </span>
        <a
          href={githubReadmeUrl}
          target="_blank"
          rel="noreferrer"
          className="text-white underline-offset-4 hover:underline"
        >
          Open on GitHub
        </a>
      </div>

      <div
        className={[
          "learn-readme-panel relative min-w-0 overflow-hidden rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/50",
          expanded ? "learn-readme-panel--expanded" : "learn-readme-panel--collapsed",
        ].join(" ")}
      >
        <div
          className={[
            "learn-readme-scroll min-w-0 overflow-y-auto overflow-x-hidden",
            expanded ? "max-h-none" : "max-h-[min(70vh,480px)]",
          ].join(" ")}
        >
          <article className="learn-readme min-w-0 p-5 sm:p-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                h1: ({ children }) => <h1 className="learn-readme-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="learn-readme-h2">{children}</h2>,
                h3: ({ children }) => <h3 className="learn-readme-h3">{children}</h3>,
                h4: ({ children }) => <h4 className="learn-readme-h4">{children}</h4>,
                p: ({ children }) => <p className="learn-readme-p">{children}</p>,
                ul: ({ children }) => <ul className="learn-readme-ul">{children}</ul>,
                ol: ({ children }) => <ol className="learn-readme-ol">{children}</ol>,
                li: ({ children }) => <li className="learn-readme-li">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="learn-readme-blockquote">{children}</blockquote>
                ),
                hr: () => <hr className="learn-readme-hr" />,
                table: ({ children }) => (
                  <div className="learn-readme-table-wrap">
                    <table className="learn-readme-table">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead>{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => <th>{children}</th>,
                td: ({ children }) => <td>{children}</td>,
                pre: ({ children }) => <pre className="learn-readme-pre">{children}</pre>,
                code: ({ className, children }) => {
                  const isBlock = Boolean(className);
                  if (isBlock) {
                    return <code className={className}>{children}</code>;
                  }
                  return <code className="learn-readme-code-inline">{children}</code>;
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="learn-readme-link"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) =>
                  src ? (
                    <img
                      src={rewriteImageUrl(String(src), owner, name, branch)}
                      alt={alt ?? ""}
                      loading="lazy"
                      className="learn-readme-img"
                    />
                  ) : null,
              }}
            >
              {cleaned}
            </ReactMarkdown>
          </article>
        </div>

        {!expanded && isLong ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent"
          />
        ) : null}
      </div>

      {isLong ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.12]"
          >
            {expanded ? "Show preview window" : "Expand full README"}
          </button>
          <a
            href={githubReadmeUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
          >
            Read on GitHub
          </a>
        </div>
      ) : null}
    </div>
  );
}
