import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type ReadinessMarkdownProps = {
  markdown: string;
  className?: string;
};

export default function ReadinessMarkdown({ markdown, className }: ReadinessMarkdownProps) {
  return (
    <div className={className ?? "content-reading readiness-markdown space-y-4 text-sm leading-7 text-[var(--color-gray-300)]"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h2: ({ children }) => (
            <h2 className="heading-section mt-8 text-xl font-semibold text-white first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-lg font-semibold text-white">{children}</h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => {
            const url = href ?? "#";
            if (url.startsWith("http://") || url.startsWith("https://")) {
              return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
                  {children}
                </a>
              );
            }
            return (
              <Link href={url} className="text-white underline underline-offset-4">
                {children}
              </Link>
            );
          },
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          table: ({ children }) => (
            <div className="my-6 w-full overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border)]">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm [&_tr:last-child_td]:border-0">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.04]">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children, style }) => (
            <th
              style={style}
              className="border-b border-[var(--border-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white"
            >
              {children}
            </th>
          ),
          td: ({ children, style }) => (
            <td
              style={style}
              className="border-b border-[var(--border)] px-4 py-3 align-top text-[var(--color-gray-300)]"
            >
              {children}
            </td>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
