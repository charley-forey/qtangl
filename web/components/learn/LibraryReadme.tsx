"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type LibraryReadmeProps = {
  markdown: string;
  owner: string;
  name: string;
  branch: string;
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

export default function LibraryReadme({
  markdown,
  owner,
  name,
  branch,
}: LibraryReadmeProps) {
  const headings = useMemo(() => {
    const matches = [...markdown.matchAll(/^#{2,3}\s+(.+)$/gm)];
    return matches.map((match, index) => ({
      id: `section-${index}`,
      text: match[1].replace(/[`*_]/g, "").trim(),
      level: match[0].startsWith("###") ? 3 : 2,
    }));
  }, [markdown]);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <article className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-white prose-code:text-[var(--color-gray-200)] prose-pre:bg-black/50">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            img: ({ src, alt }) =>
              src ? (
                <img
                  src={rewriteImageUrl(String(src), owner, name, branch)}
                  alt={alt ?? ""}
                  className="rounded-[var(--radius-xl)] border border-[var(--border)]"
                />
              ) : null,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                {children}
              </a>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>

      {headings.length ? (
        <nav
          aria-label="README sections"
          className="hidden xl:block xl:sticky xl:top-24 xl:self-start"
        >
          <p className="text-label">On this page</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-gray-400)]">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={heading.level === 3 ? "pl-3" : undefined}
              >
                <span className="hover:text-white">{heading.text}</span>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
